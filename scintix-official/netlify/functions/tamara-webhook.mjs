const BASE_ID = "appkYurrIYGIup8QH";
const CONTRACTS = "tblf6juZ47NPebied";
const AT = "https://api.airtable.com/v0";

function response(status, body = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function safeEqual(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (!x || x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

function numericAmount(value) {
  const amount = Number(value && typeof value === "object" ? value.amount : value);
  return Number.isFinite(amount) ? amount : 0;
}

async function getTamaraOrder(apiBase, apiToken, orderId) {
  const result = await fetch(`${apiBase}/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${apiToken}` }
  });
  if (!result.ok) return {};
  try { return await result.json(); } catch { return {}; }
}

async function markContractPaid(airtable, reference, orderId, amount) {
  if (!/^rec[A-Za-z0-9]{14}$/.test(reference)) {
    throw new Error("Invalid contract reference");
  }

  const current = await fetch(`${AT}/${BASE_ID}/${CONTRACTS}/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${airtable}` }
  });
  if (!current.ok) throw new Error("Contract lookup failed " + current.status);
  const contract = await current.json();
  const expectedAmount = Number(contract.fields && contract.fields["Contract Value"]);
  if (!(amount > 0) || !(expectedAmount > 0) || Math.abs(amount - expectedAmount) > 0.001) {
    throw new Error(`Amount mismatch: expected ${expectedAmount}, received ${amount}`);
  }

  const updated = await fetch(`${AT}/${BASE_ID}/${CONTRACTS}/${encodeURIComponent(reference)}`, {
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
        paid_amount: amount
      },
      typecast: true
    })
  });
  if (!updated.ok) throw new Error("Contract update failed " + updated.status);
}

export default async (req) => {
  if (req.method !== "POST") return response(405, { ok: false });

  const expected = Netlify.env.get("TAMARA_NOTIFICATION_TOKEN") || "";
  const auth = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const urlToken = new URL(req.url).searchParams.get("tamaraToken") || "";
  if (!safeEqual(auth, expected) && !safeEqual(urlToken, expected)) {
    console.warn("Rejected Tamara webhook: invalid notification token");
    return response(401, { ok: false });
  }

  let event;
  try { event = await req.json(); }
  catch { return response(400, { ok: false }); }

  const orderId = String(event.order_id || event.orderId || "").trim();
  const status = String(event.order_status || event.status || event.event_type || "").toLowerCase();
  if (!orderId) return response(400, { ok: false, message: "order_id missing" });

  const apiBase = (Netlify.env.get("TAMARA_API_BASE_URL") || "").replace(/\/+$/, "");
  const apiToken = Netlify.env.get("TAMARA_API_TOKEN") || "";
  const airtable = Netlify.env.get("AIRTABLE_TOKEN") || "";
  if (!apiBase || !apiToken || !airtable) return response(503, { ok: false });

  console.log("Tamara webhook", JSON.stringify({
    order_id: orderId,
    order_reference_id: event.order_reference_id || "",
    status
  }));

  let order = event;
  if (!event.order_reference_id || !numericAmount(event.total_amount)) {
    order = { ...event, ...(await getTamaraOrder(apiBase, apiToken, orderId)) };
  }

  if (status.includes("approved")) {
    const authorised = await fetch(`${apiBase}/orders/${encodeURIComponent(orderId)}/authorise`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiToken,
        "Content-Type": "application/json"
      },
      body: "{}"
    });
    const text = await authorised.text();
    if (!authorised.ok) {
      console.error("Tamara authorise", authorised.status, text.slice(0, 1000));
      return response(502, { ok: false });
    }
    try {
      const authorisedOrder = JSON.parse(text);
      order = { ...order, ...authorisedOrder };
    } catch {}
  }

  if (status.includes("approved") || status.includes("authorised") || status.includes("authorized")) {
    const reference = String(order.order_reference_id || event.order_reference_id || "").trim();
    const amount = numericAmount(order.total_amount || event.total_amount);
    try {
      await markContractPaid(airtable, reference, orderId, amount);
    } catch (error) {
      console.error("Tamara Airtable reconciliation", error && error.message);
      return response(502, { ok: false });
    }
  }

  return response(200, { ok: true });
};

export const config = {
  path: "/api/tamara/webhook",
  method: ["POST"]
};
