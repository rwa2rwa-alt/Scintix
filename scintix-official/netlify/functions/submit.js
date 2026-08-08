/* ════════════════════════════════════════════════════════════
   Netlify Serverless Function — Caminotich Form Submit Proxy
   المسار: netlify/functions/submit.js

   لماذا هذه الدالة؟
   كانت نماذج الموقع ترسل مباشرة إلى Make ومعها مفتاح التوقيع
   مكتوباً نصاً في HTML — أي زائر يقرأه من View Source ويزوّر
   الطلبات. الآن المتصفح يرسل إلى هذه الدالة، وهي وحدها التي
   تعرف المفتاح وعناوين الـ webhooks.

   متغيّرات البيئة (اختيارية — للأمان الحقيقي):
     CMT_WEBHOOK_KEY      المفتاح الجديد بعد تدويره في فلاتر Make
     HOOK_QUOTE           رابط webhook نموذج طلب العرض
     HOOK_DISCOVERY       رابط webhook نموذج الاستكشاف
     HOOK_HANDOVER        رابط webhook محضر التسليم
     HOOK_SUPPORT         رابط webhook تذاكر الدعم

   بدون ضبطها تعمل الدالة بالقيم الحالية تماماً كما كان الوضع
   قبل التغيير — لا انقطاع. وبعد ضبطها + تعديل الفلاتر في Make
   يصبح المفتاح القديم بلا قيمة.
════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  'https://caminotich.sa',
  'https://www.caminotich.sa',
  'https://scintix-scintix-official.netlify.app',
  'https://main--scintix-scintix-official.netlify.app'
];

const SEC_KEY = process.env.CMT_WEBHOOK_KEY || 'cmt_sec_9f4Kq7Xw2R';

const HOOKS = {
  quote:     process.env.HOOK_QUOTE     || 'https://hook.eu1.make.com/q9in1wja70ipcqt15dbgkg3gll171dwg',
  discovery: process.env.HOOK_DISCOVERY || 'https://hook.eu1.make.com/6v0u2j08v9v5jl6yxtf9ipx4xrnffd5s',
  handover:  process.env.HOOK_HANDOVER  || 'https://hook.eu1.make.com/h6c6k1y7w8mvkdvc3c64fd9bbk9edrmx',
  support:   process.env.HOOK_SUPPORT   || 'https://hook.eu1.make.com/t329y7jjtzruw0oald5n9bbp9sk1l5t2',
  /* توقيع العقد. مهيّأ ولا يُستخدم بعد: contract.html ما زال ينادي Make
     مباشرة. للتحويل لاحقاً بدّلي SIGN_HOOK هناك إلى هذا المسار مع
     { form:'sign', payload:{...} } — ولا شيء آخر يتغيّر، لأن هذا المسار
     يمرّر رد Make كما هو بحالته ونصّه (راجعي PASSTHROUGH أدناه). */
  sign:      process.env.HOOK_SIGN      || 'https://hook.eu1.make.com/vl81dpaqsuh3jqjut92dblwafv85o9h9'
};

/* نماذج تحتاج رد Make حرفياً لا ملخّصاً. مسار التوقيع يفرّق بين
   «نجح» و«موقّع مسبقاً» و«مرفوض» عبر راوتر، وأي تلخيص يكسر ذلك. */
const PASSTHROUGH = ['sign'];

/* سقف حجم الطلب — يمنع إغراق Airtable بحمولة ضخمة */
const MAX_BODY = 60 * 1024;

/* حدّ معدّل بسيط لكل IP داخل نفس نسخة الدالة. الحاويات مؤقتة
   فهو ليس حاجزاً مطلقاً، لكنه يوقف التكرار الآلي السريع. */
const HITS = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_HITS  = 6;

function rateLimited(ip) {
  const now = Date.now();
  const rec = HITS.get(ip) || { n: 0, t: now };
  if (now - rec.t > WINDOW_MS) { rec.n = 0; rec.t = now; }
  rec.n += 1;
  HITS.set(ip, rec);
  if (HITS.size > 500) {
    for (const [k, v] of HITS) if (now - v.t > WINDOW_MS) HITS.delete(k);
  }
  return rec.n > MAX_HITS;
}

exports.handler = async function (event) {

  const origin  = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowed = ALLOWED_ORIGINS.indexOf(origin) !== -1;

  const headers = {
    'Access-Control-Allow-Origin':  allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (origin && !allowed) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Origin not allowed' }) };
  }

  const raw = event.body || '';
  if (raw.length > MAX_BODY) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: 'Payload too large' }) };
  }

  const ip = (event.headers && (event.headers['x-nf-client-connection-ip'] ||
              (event.headers['x-forwarded-for'] || '').split(',')[0].trim())) || 'unknown';
  if (rateLimited(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests' }) };
  }

  let body;
  try { body = JSON.parse(raw || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const form = String(body.form || '').toLowerCase();
  const url  = HOOKS[form];
  if (!url) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown form' }) };
  }

  const payload = (body.payload && typeof body.payload === 'object') ? body.payload : {};
  /* المفتاح يُحقن هنا فقط — لا يغادر الخادم أبداً */
  const signed = Object.assign({}, payload, { k: SEC_KEY });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signed)
    });
    const text = await res.text();
    if (PASSTHROUGH.indexOf(form) !== -1) {
      const ct = res.headers.get('content-type') || 'application/json';
      return { statusCode: res.status, headers: Object.assign({}, headers, { 'Content-Type': ct }), body: text };
    }
    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream rejected', status: res.status }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, upstream: text.slice(0, 200) }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream unreachable' }) };
  }
};
