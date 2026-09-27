const BASE_ID = "appkYurrIYGIup8QH";
const CONTRACTS = "tblf6juZ47NPebied";
const AT = "https://api.airtable.com/v0";

function allowedOrigin(origin) {
  return origin === "https://caminotich.sa" ||
    origin === "https://www.caminotich.sa" ||
    origin === "https://scintix-scintix-official.netlify.app" ||
    /^https:\/\/[a-z0-9-]+--scintix-scintix-official\.netlify\.app$/.test(origin);
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
      "Access-Control-Allow-Origin": allowedOrigin(origin) ? origin : "https://caminotich.sa",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin"
    }
  });
}

function money(amount) {
  return { amount: Number(Number(amount).toFixed(2)), currency: "SAR" };
}

export default async (req) => {
  const origin = req.headers.get("origin") || "";
  if (req.method === "OPTIONS") return json(200, {}, origin);
  if (req.method !== "POST") return json(405, { ok: false }, origin);
  if (origin && !allowedOrigin(origin)) return json(403, { ok: false }, origin);

  let body;
  try { body = await req.json(); }
  catch { return json(400, { ok: false, message: "طلب غير صالح" }, origin); }

  const token = String(body.t || "").trim();
  const firstName = String(body.first_name || "").trim().slice(0, 60);
  const lastName = String(body.last_name || "").trim().slice(0, 60);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  let phone = String(body.phone || "").replace(/\D/g, "");

  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) return json(400, { ok: false, message: "رابط العقد غير صالح" }, origin);
  if (!firstName || !lastName) return json(400, { ok: false, message: "أدخلي الاسم الأول والأخير" }, origin);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { ok: false, message: "البريد الإلكتروني غير صالح" }, origin);
  if (phone.startsWith("966")) phone = phone.slice(3);
  if (phone.startsWith("0")) phone = phone.slice(1);
  if (!/^5\d{8}$/.test(phone)) return json(400, { ok: false, message: "رقم الجوال السعودي غير صالح" }, origin);
  phone = "+966" + phone;

  const apiBase = (Netlify.env.get("TAMARA_API_BASE_URL") || "").replace(/\/+$/, "");
  const apiToken = Netlify.env.get("TAMARA_API_TOKEN") || "";
  const airtable = Netlify.env.get("AIRTABLE_TOKEN") || "";
  if (!apiBase || !apiToken || !airtable) {
    console.error("Tamara/Airtable environment variables are missing");
    return json(503, { ok: false, message: "خدمة تمارا غير متاحة مؤقتًا" }, origin);
  }

  try {
    const formula = encodeURIComponent(`{token}="${token}"`);
    const cRes = await fetch(`${AT}/${BASE_ID}/${CONTRACTS}?filterByFormula=${formula}&maxRecords=1`, {
      headers: { Authorization: `Bearer ${airtable}` }
    });
    if (!cRes.ok) throw new Error("Airtable " + cRes.status);
    const contract = ((await cRes.json()).records || [])[0];
    if (!contract) return json(404, { ok: false, message: "لم نجد العقد" }, origin);

    const fields = contract.fields || {};
    if (!fields.signed_at) return json(409, { ok: false, message: "يجب توقيع العقد قبل الدفع" }, origin);
    if (fields.paid_at) return json(409, { ok: false, message: "هذا العقد مدفوع مسبقًا" }, origin);

    const amount = Number(fields["Contract Value"] || 0);
    if (!(amount > 0)) return json(409, { ok: false, message: "قيمة العقد غير متاحة" }, origin);

    const contractName = String(fields["Contract Name"] || fields.package || "خدمة كامينوتك").slice(0, 120);
    const baseUrl = origin || "https://caminotich.sa";
    const resultBase = `${baseUrl}/tamara-result.html?t=${encodeURIComponent(token)}`;
    const reference = contract.id;

    const payload = {
      order_reference_id: reference,
      order_number: reference,
      description: contractName,
      country_code: "SA",
      total_amount: money(amount),
      shipping_amount: money(0),
      tax_amount: money(0),
      payment_type: "PAY_BY_INSTALMENTS",
      items: [{
        reference_id: reference,
        type: "Digital",
        name: contractName,
        sku: String(fields.package || "CAMINOTICH-SERVICE").slice(0, 64),
        quantity: 1,
        unit_price: money(amount),
        total_amount: money(amount),
        tax_amount: money(0),
        discount_amount: money(0)
      }],
      consumer: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        email
      },
      billing_address: {
        first_name: firstName,
        last_name: lastName,
        line1: "Digital service",
        city: "Riyadh",
        country_code: "SA"
      },
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        line1: "Digital service",
        city: "Riyadh",
        country_code: "SA"
      },
      merchant_url: {
        success: resultBase + "&result=success",
        failure: resultBase + "&result=failure",
        cancel: resultBase + "&result=cancel",
        notification: `${baseUrl}/api/tamara/webhook`
      },
      platform: "Caminotich"
    };

    const tRes = await fetch(apiBase + "/checkout", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const raw = await tRes.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!tRes.ok) {
      console.error("Tamara checkout", tRes.status, raw.slice(0, 1000));
      const validation = String(
        data.message ||
        data.error_message ||
        data.error ||
        (Array.isArray(data.errors) ? data.errors.map((x) => x.message || JSON.stringify(x)).join(" | ") : "") ||
        "تعذر إنشاء طلب تمارا"
      ).slice(0, 500);
      return json(502, { ok: false, message: validation, code: tRes.status }, origin);
    }

    const checkoutUrl = data.checkout_url || data.url;
    if (!checkoutUrl) {
      console.error("Tamara response missing checkout_url");
      return json(502, { ok: false, message: "لم يصل رابط الدفع من تمارا" }, origin);
    }

    return json(200, { ok: true, checkout_url: checkoutUrl, order_id: data.order_id || "" }, origin);
  } catch (error) {
    console.error("tamara-checkout", error && error.message);
    return json(503, { ok: false, message: "تعذر فتح تمارا الآن، حاولي بعد قليل" }, origin);
  }
};

export const config = {
  path: "/api/tamara/checkout",
  method: ["POST", "OPTIONS"]
};
