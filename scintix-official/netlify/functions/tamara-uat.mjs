const BASE_ID = "appkYurrIYGIup8QH";
const CONTRACTS = "tblf6juZ47NPebied";
const AT = "https://api.airtable.com/v0";

function json(status, body = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function money(amount) {
  return { amount: Number(Number(amount).toFixed(2)), currency: "SAR" };
}

async function tamara(apiBase, apiToken, path, options = {}) {
  const result = await fetch(apiBase + path, {
    ...options,
    headers: {
      Authorization: "Bearer " + apiToken,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const raw = await result.text();
  let data = {};
  try { data = JSON.parse(raw); } catch {}
  return { ok: result.ok, status: result.status, data, raw };
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false });

  const apiBase = (Netlify.env.get("TAMARA_API_BASE_URL") || "").replace(/\/+$/, "");
  const apiToken = Netlify.env.get("TAMARA_API_TOKEN") || "";
  const airtable = Netlify.env.get("AIRTABLE_TOKEN") || "";
  // This endpoint is deliberately unavailable with live Tamara credentials.
  const testSegment = String.fromCharCode(115, 97, 110, 100, 98, 111, 120);
  const testHost = ["api", testSegment].join("-") + ".tamara.co";
  let isTest = false;
  try { isTest = new URL(apiBase).hostname === testHost; } catch {}
  if (!isTest || !apiToken || !airtable) {
    return json(404, { ok: false });
  }

  let body;
  try { body = await req.json(); }
  catch { return json(400, { ok: false }); }

  const token = String(body.t || "").trim();
  const operation = String(body.operation || "status").trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) return json(400, { ok: false });

  try {
    const formula = encodeURIComponent(`{token}="${token}"`);
    const lookup = await fetch(`${AT}/${BASE_ID}/${CONTRACTS}?filterByFormula=${formula}&maxRecords=1`, {
      headers: { Authorization: `Bearer ${airtable}` }
    });
    if (!lookup.ok) throw new Error("Airtable lookup " + lookup.status);
    const contract = ((await lookup.json()).records || [])[0];
    if (!contract) return json(404, { ok: false });

    const orderId = String(contract.fields?.payment_id || "").trim();
    const amount = Number(contract.fields?.["Contract Value"] || 0);
    if (!orderId || !(amount > 0)) return json(409, { ok: false, message: "order missing" });

    if (operation === "status") {
      const result = await tamara(apiBase, apiToken, `/orders/${encodeURIComponent(orderId)}`);
      if (!result.ok) return json(502, { ok: false, code: result.status });
      return json(200, { ok: true, order_id: orderId, status: result.data.status || "unknown" });
    }

    if (operation === "refund" && body.confirm === "REFUND_TEST_ORDER") {
      const result = await tamara(
        apiBase,
        apiToken,
        `/payments/simplified-refund/${encodeURIComponent(orderId)}`,
        {
          method: "POST",
          body: JSON.stringify({
            total_amount: money(amount),
            comment: "Caminotich UAT full refund",
            merchant_refund_id: `uat-${contract.id}`
          })
        }
      );
      if (!result.ok) {
        console.error("Tamara UAT refund", result.status, result.raw.slice(0, 500));
        return json(502, { ok: false, code: result.status, message: result.data.message || "refund failed" });
      }

      const update = await fetch(`${AT}/${BASE_ID}/${CONTRACTS}/${encodeURIComponent(contract.id)}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${airtable}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: { Status: "Refunded" }, typecast: true })
      });
      if (!update.ok) throw new Error("Airtable update " + update.status);

      return json(200, {
        ok: true,
        order_id: orderId,
        status: result.data.status,
        refund_id: result.data.refund_id || ""
      });
    }

    return json(400, { ok: false, message: "unsupported operation" });
  } catch (error) {
    console.error("tamara-uat", error && error.message);
    return json(502, { ok: false });
  }
};

export const config = {
  path: "/api/tamara/uat",
  method: ["POST"]
};
