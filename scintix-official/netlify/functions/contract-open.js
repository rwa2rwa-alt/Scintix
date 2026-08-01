/* ════════════════════════════════════════════════════════════════
   contract-open — فتح صفحة العقد بالرمز
   ────────────────────────────────────────────────────────────────
   لماذا دالة Netlify لا ويبهوك Make؟
   لأن الصفحة تحتاج رداً فورياً قبل العرض. ويبهوك Make يستهلك عملية
   لكل فتح للصفحة — والعميل قد يفتح العقد خمس مرات قبل التوقيع.
   الدالة مجانية على Netlify ولا تستهلك عمليات، وهذا يخدم وضع التوفير.

   الأمان: نفس ضوابط portal.js — المفتاح من متغير بيئة، قائمة بيضاء
   للحقول، مقارنة بزمن ثابت، CORS مقيّد.

   ملاحظة جوهرية: هذه الدالة لا تُرجع الرمز نفسه ولا التوقيع المحفوظ
   ولا أي حقل غير معروض في الصفحة.
   ════════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  'https://caminotich.sa',
  'https://www.caminotich.sa',
  'https://scintix-official.netlify.app'
];

const BASE_ID   = 'appkYurrIYGIup8QH';
const CONTRACTS = 'tblf6juZ47NPebied';

function safeEqual(a, b) {
  const x = String(a || ''), y = String(b || '');
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

exports.handler = async function (event) {
  const origin  = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowed = ALLOWED_ORIGINS.indexOf(origin) !== -1;

  const headers = {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
    'Cache-Control': 'no-store, max-age=0',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (origin && !allowed) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Origin not allowed' }) };
  }

  const token = ((event.queryStringParameters || {}).t || '').trim();
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) {
    return { statusCode: 400, headers, body: JSON.stringify({ state: 'invalid' }) };
  }

  const KEY = process.env.AIRTABLE_TOKEN;
  if (!KEY) {
    console.error('AIRTABLE_TOKEN غير مضبوط');
    return { statusCode: 500, headers, body: JSON.stringify({ state: 'error' }) };
  }

  try {
    const formula = encodeURIComponent(`{token} = "${token}"`);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${CONTRACTS}`
              + `?filterByFormula=${formula}&maxRecords=1`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
    if (!res.ok) {
      console.error('Airtable error', res.status);
      return { statusCode: 502, headers, body: JSON.stringify({ state: 'error' }) };
    }

    const data = await res.json();
    const rec  = (data.records || [])[0];

    if (!rec || !safeEqual(rec.fields['token'], token)) {
      return { statusCode: 404, headers, body: JSON.stringify({ state: 'invalid' }) };
    }

    const f = rec.fields;

    /* الحالة تحكم ما تعرضه الصفحة وما إذا كان التوقيع مسموحاً */
    let state = 'ready';
    if (f['signed_at'])                 state = 'signed';
    if (f['Status'] === 'Expired')      state = 'expired';
    if (f['Status'] === 'Cancelled')    state = 'cancelled';
    if (f['Status'] === 'Paid')         state = 'paid';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        state,
        contract_no: f['Contract Name'] || '',
        package:     f['package'] || '',
        signed_at:   f['signed_at'] || '',
        signer:      f['signer'] || ''
      })
    };

  } catch (err) {
    console.error('contract-open:', err && err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ state: 'error' }) };
  }
};
