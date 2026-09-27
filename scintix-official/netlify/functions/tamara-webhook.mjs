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

  console.log("Tamara webhook", JSON.stringify({
    order_id: orderId,
    order_reference_id: event.order_reference_id || "",
    status
  }));

  if (status.includes("approved")) {
    const apiBase = (Netlify.env.get("TAMARA_API_BASE_URL") || "").replace(/\/+$/, "");
    const apiToken = Netlify.env.get("TAMARA_API_TOKEN") || "";
    if (!apiBase || !apiToken) return response(503, { ok: false });

    const authorised = await fetch(\`\${apiBase}/orders/\${encodeURIComponent(orderId)}/authorise\`, {
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
  }

  return response(200, { ok: true });
};

export const config = {
  path: "/api/tamara/webhook",
  method: ["POST"]
};
