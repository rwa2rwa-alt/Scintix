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

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function verifyTamaraToken(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3 || !secret) return false;
  try {
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    if (header.alg !== "HS256") return false;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(parts[0] + "." + parts[1])
    );
  } catch {
    return false;
  }
}

function numericAmount(value) {
  const amount = Number(value && typeof value === "object" ? value.amount : value);
  return Number.isFinite(amount) ? amount : 0;
}

function money(amount) {
  return { amount: Number(Number(amount).toFixed(2)), currency: "SAR" };
}

function normalizedStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[ -]+/g, "_")
    .replace(/^order_/, "");
}

function isCaptured(status) {
  return status === "fully_captured" || status === "captured";
}

function isAuthorised(status) {
  return status === "authorised" || status === "authorized";
}

async function getTamaraOrder(apiBase, apiToken, orderId) {
  const result = await fetch(`${apiBase}/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${apiToken}` }
  });
  if (!result.ok) throw new Error("Tamara order lookup failed " + result.status);
  return await result.json();
}

async function patchContract(airtable, reference, fields) {
  if (!/^rec[A-Za-z0-9]{14}$/.test(reference)) throw new Error("Invalid contract reference");
  const updated = await fetch(`${AT}/${BASE_ID}/${CONTRACTS}/${encodeURIComponent(reference)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${airtable}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields, typecast: true })
  });
  if (!updated.ok) throw new Error("Contract update failed " + updated.status);
}

async function markContractPaid(airtable, reference, orderId, amount) {
  if (!/^rec[A-Za-z0-9]{14}$/.test(reference)) throw new Error("Invalid contract reference");

  const current = await fetch(`${AT}/${BASE_ID}/${CONTRACTS}/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${airtable}` }
  });
  if (!current.ok) throw new Error("Contract lookup failed " + current.status);
  const contract = await current.json();
  const expectedAmount = Number(contract.fields && contract.fields["Contract Value"]);
  if (!(amount > 0) || !(expectedAmount > 0) || Math.abs(amount - expectedAmount) > 0.001) {
    throw new Error(`Amount mismatch: expected ${expectedAmount}, received ${amount}`);
  }

  await patchContract(airtable, reference, {
    Status: "Paid",
    paid_at: new Date().toISOString(),
    payment_id: orderId,
    paid_amount: amount
  });
}

async function authoriseOrder(apiBase, apiToken, orderId) {
  const result = await fetch(`${apiBase}/orders/${encodeURIComponent(orderId)}/authorise`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiToken,
      "Content-Type": "application/json"
    },
    body: "{}"
  });
  const raw = await result.text();
  let data = {};
  try { data = JSON.parse(raw); } catch {}
  if (!result.ok && result.status !== 409) {
    throw new Error(`Tamara authorise failed ${result.status}: ${raw.slice(0, 400)}`);
  }
  return data;
}

function captureItem(item, fallbackAmount, fallbackReference) {
  const amount = numericAmount(item.total_amount) || fallbackAmount;
  return {
    name: String(item.name || "Caminotich digital service").slice(0, 255),
    type: String(item.type || "Digital").slice(0, 64),
    reference_id: String(item.reference_id || fallbackReference).slice(0, 128),
    sku: String(item.sku || "CAMINOTICH-SERVICE").slice(0, 128),
    quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    unit_price: item.unit_price || money(amount),
    total_amount: item.total_amount || money(amount),
    tax_amount: item.tax_amount || money(0),
    discount_amount: item.discount_amount || money(0)
  };
}

async function captureOrder(apiBase, apiToken, order, orderId) {
  const total = numericAmount(order.total_amount) || numericAmount(order.authorized_amount);
  if (!(total > 0)) throw new Error("Tamara capture amount missing");

  const sourceItems = Array.isArray(order.items) && order.items.length ? order.items : [{}];
  const reference = String(order.order_reference_id || orderId);
  const payload = {
    order_id: orderId,
    total_amount: money(total),
    shipping_info: {
      shipped_at: new Date().toISOString(),
      shipping_company: "Caminotich Digital Delivery",
      tracking_number: orderId,
      tracking_url: "https://caminotich.sa"
    },
    items: sourceItems.map((item) => captureItem(item, total, reference)),
    shipping_amount: order.shipping_amount || money(0),
    tax_amount: order.tax_amount || money(0),
    discount_amount: order.discount_amount || money(0)
  };

  const result = await fetch(`${apiBase}/payments/capture`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const raw = await result.text();
  let data = {};
  try { data = JSON.parse(raw); } catch {}
  if (!result.ok && result.status !== 409) {
    throw new Error(`Tamara capture failed ${result.status}: ${raw.slice(0, 400)}`);
  }
  return data;
}

export default async (req) => {
  if (req.method !== "POST") return response(405, { ok: false });

  const expected = Netlify.env.get("TAMARA_NOTIFICATION_TOKEN") || "";
  const auth = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const urlToken = new URL(req.url).searchParams.get("tamaraToken") || "";
  const validToken =
    safeEqual(auth, expected) ||
    safeEqual(urlToken, expected) ||
    await verifyTamaraToken(auth, expected) ||
    await verifyTamaraToken(urlToken, expected);
  if (!validToken) {
    console.warn("Rejected Tamara webhook: invalid notification signature");
    return response(401, { ok: false });
  }

  let event;
  try { event = await req.json(); }
  catch { return response(400, { ok: false }); }

  const orderId = String(event.order_id || event.orderId || "").trim();
  const incomingStatus = normalizedStatus(event.order_status || event.status || event.event_type);
  if (!orderId) return response(400, { ok: false, message: "order_id missing" });

  const apiBase = (Netlify.env.get("TAMARA_API_BASE_URL") || "").replace(/\/+$/, "");
  const apiToken = Netlify.env.get("TAMARA_API_TOKEN") || "";
  const airtable = Netlify.env.get("AIRTABLE_TOKEN") || "";
  if (!apiBase || !apiToken || !airtable) return response(503, { ok: false });

  console.log("Tamara webhook", JSON.stringify({
    order_id: orderId,
    order_reference_id: event.order_reference_id || "",
    status: incomingStatus
  }));

  try {
    let order = await getTamaraOrder(apiBase, apiToken, orderId);
    let status = normalizedStatus(order.status || incomingStatus);

    if (incomingStatus === "approved" || status === "approved") {
      const authorised = await authoriseOrder(apiBase, apiToken, orderId);
      order = { ...order, ...authorised };
      status = normalizedStatus(order.status);
      if (!status || status === "approved") {
        order = await getTamaraOrder(apiBase, apiToken, orderId);
        status = normalizedStatus(order.status);
      }
    }

    if (isAuthorised(status) || isAuthorised(incomingStatus)) {
      const captured = await captureOrder(apiBase, apiToken, order, orderId);
      order = { ...order, ...captured };
      status = normalizedStatus(order.status);
      if (!isCaptured(status)) {
        order = await getTamaraOrder(apiBase, apiToken, orderId);
        status = normalizedStatus(order.status);
      }
    }

    const reference = String(order.order_reference_id || event.order_reference_id || "").trim();

    if (isCaptured(status) || isCaptured(incomingStatus)) {
      const amount =
        numericAmount(order.captured_amount) ||
        numericAmount(event.captured_amount) ||
        numericAmount(order.total_amount) ||
        numericAmount(event.total_amount);
      await markContractPaid(airtable, reference, orderId, amount);
    } else if (status === "approved" || isAuthorised(status)) {
      await patchContract(airtable, reference, {
        Status: "Payment Review",
        payment_id: orderId
      });
    } else if (status === "refunded" || status === "fully_refunded") {
      await patchContract(airtable, reference, { Status: "Refunded", payment_id: orderId });
    } else if (["canceled", "cancelled", "expired", "declined"].includes(status)) {
      await patchContract(airtable, reference, { Status: "Payment Failed", payment_id: orderId });
    }

    return response(200, { ok: true, status });
  } catch (error) {
    console.error("Tamara webhook processing", error && error.message);
    return response(502, { ok: false });
  }
};

export const config = {
  path: "/api/tamara/webhook",
  method: ["POST"]
};
