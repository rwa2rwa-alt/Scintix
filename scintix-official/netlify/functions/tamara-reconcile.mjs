const BASE_ID = "appkYurrIYGIup8QH";
const CONTRACTS = "tblf6juZ47NPebied";
const AT = "https://api.airtable.com/v0";

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" }
  });
}

function money(amount) {
  return { amount: Number(Number(amount).toFixed(2)), currency: "SAR" };
}

function statusOf(value) {
  return String(value || "").trim().toLowerCase().replace(/[ -]+/g, "_");
}

async function tamaraRequest(url, apiToken, options = {}) {
  const result = await fetch(url, {
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

  let body;
  try { body = await req.json(); }
  catch { return json(400, { ok: false }); }

  const token = String(body.t || "").trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) {
    return json(400, { ok: false, message: "invalid contract token" });
  }

  const apiBase = (Netlify.env.get("TAMARA_API_BASE_URL") || "").replace(/\/+$/, "");
  const apiToken = Netlify.env.get("TAMARA_API_TOKEN") || "";
  const airtable = Netlify.env.get("AIRTABLE_TOKEN") || "";
  if (!apiBase || !apiToken || !airtable) return json(503, { ok: false });

  try {
    const formula = encodeURIComponent(`{token}="${token}"`);
    const contractResult = await fetch(
      `${AT}/${BASE_ID}/${CONTRACTS}?filterByFormula=${formula}&maxRecords=1`,
      { headers: { Authorization: `Bearer ${airtable}` } }
    );
    if (!contractResult.ok) throw new Error("Airtable lookup " + contractResult.status);
    const contract = ((await contractResult.json()).records || [])[0];
    if (!contract) return json(404, { ok: false });

    const fields = contract.fields || {};
    if (fields.paid_at) return json(200, { ok: true, status: "fully_captured" });

    const orderId = String(fields.payment_id || "").trim();
    const amount = Number(fields["Contract Value"] || 0);
    if (!orderId || !(amount > 0)) {
      return json(409, { ok: false, status: "pending", message: "order reference missing" });
    }

    let orderResult = await tamaraRequest(
      `${apiBase}/orders/${encodeURIComponent(orderId)}`,
      apiToken,
      { method: "GET" }
    );
    if (!orderResult.ok) throw new Error("Tamara order lookup " + orderResult.status);
    let order = orderResult.data;
    let status = statusOf(order.status);

    if (status === "approved") {
      const authorised = await tamaraRequest(
        `${apiBase}/orders/${encodeURIComponent(orderId)}/authorise`,
        apiToken,
        { method: "POST", body: "{}" }
      );
      if (!authorised.ok && authorised.status !== 409) {
        throw new Error("Tamara authorise " + authorised.status + " " + authorised.raw.slice(0, 300));
      }
      order = { ...order, ...authorised.data };
      status = statusOf(order.status);
    }

    if (status === "authorised" || status === "authorized") {
      const contractName = String(fields["Contract Name"] || fields.package || "Caminotich digital service").slice(0, 255);
      const item = {
        name: contractName,
        type: "Digital",
        reference_id: contract.id,
        sku: String(fields.package || "CAMINOTICH-SERVICE").slice(0, 128),
        quantity: 1,
        unit_price: money(amount),
        total_amount: money(amount),
        tax_amount: money(0),
        discount_amount: money(0)
      };
      const capture = await tamaraRequest(
        `${apiBase}/payments/capture`,
        apiToken,
        {
          method: "POST",
          body: JSON.stringify({
            order_id: orderId,
            total_amount: money(amount),
            shipping_info: {
              shipped_at: new Date().toISOString(),
              shipping_company: "Caminotich Digital Delivery",
              tracking_number: orderId,
              tracking_url: "https://caminotich.sa"
            },
            items: [item],
            shipping_amount: money(0),
            tax_amount: money(0),
            discount_amount: money(0)
          })
        }
      );
      if (!capture.ok && capture.status !== 409) {
        throw new Error("Tamara capture " + capture.status + " " + capture.raw.slice(0, 300));
      }
      order = { ...order, ...capture.data };
      status = statusOf(order.status);
    }

    if (status !== "fully_captured" && status !== "captured") {
      orderResult = await tamaraRequest(
        `${apiBase}/orders/${encodeURIComponent(orderId)}`,
        apiToken,
        { method: "GET" }
      );
      if (orderResult.ok) {
        order = orderResult.data;
        status = statusOf(order.status);
      }
    }

    if (status === "fully_captured" || status === "captured") {
      const paidAmount = Number(
        (order.captured_amount && order.captured_amount.amount) ||
        (order.total_amount && order.total_amount.amount) ||
        amount
      );
      if (Math.abs(paidAmount - amount) > 0.001) throw new Error("Captured amount mismatch");

      const update = await fetch(
        `${AT}/${BASE_ID}/${CONTRACTS}/${encodeURIComponent(contract.id)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${airtable}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fields: {
              Status: "Paid",
              paid_at: new Date().toISOString(),
              payment_id: orderId,
              paid_amount: paidAmount
            },
            typecast: true
          })
        }
      );
      if (!update.ok) throw new Error("Airtable update " + update.status);
      return json(200, { ok: true, status: "fully_captured" });
    }

    return json(202, { ok: true, status: status || "pending" });
  } catch (error) {
    console.error("tamara-reconcile", error && error.message);
    return json(502, { ok: false, status: "pending" });
  }
};

export const config = {
  path: "/api/tamara/reconcile",
  method: ["POST"]
};
