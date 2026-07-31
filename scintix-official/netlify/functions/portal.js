/* ════════════════════════════════════════════════════════════════
   بوابة العميل — دالة الوساطة الآمنة
   ────────────────────────────────────────────────────────────────
   الغرض: قراءة بيانات مشروع واحد من Airtable وإرجاعها للواجهة.

   لماذا نحتاجها أصلاً؟
   الواجهة صفحة ثابتة على Netlify. لو استدعت Airtable مباشرة لوجب
   وضع مفتاح القاعدة في JavaScript — وأي زائر يفتح مصدر الصفحة
   يقرأ المفتاح ويصل لقاعدتك كاملة. هذه الدالة تحتفظ بالمفتاح على
   الخادم ولا تُرجع إلا حقولاً محددة لمشروع واحد.

   قواعد أمنية مطبّقة هنا:
   1. المفتاح من متغير بيئة فقط — لا يُكتب في الكود إطلاقاً
   2. الرمز عشوائي مستقل لا معرّف السجل (المعرّفات قابلة للتعداد)
   3. قائمة بيضاء صريحة للحقول المُرجَعة — لا نُرجع السجل كاملاً
   4. مقارنة الرمز بزمن ثابت — تمنع استنتاجه بقياس زمن الرد
   5. CORS مقيّد بنطاقات محددة
   ════════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  'https://caminotich.sa',
  'https://www.caminotich.sa',
  'https://scintix-official.netlify.app'
];

const BASE_ID  = 'appkYurrIYGIup8QH';
const PROJECTS = 'tblehDLoC86e4OuAp';

/* الحقول المسموح بإرجاعها للعميل — قائمة بيضاء صارمة.
   أي حقل غير مذكور هنا لا يغادر الخادم مهما حدث. */
const SAFE_FIELDS = [
  'Project Name', 'Package', 'Status', 'Progress',
  'Delivery URL', 'Deadline', 'Start Date',
  'Discovery Status', 'Scope Approved At',
  'BRD Doc URL', 'Training Pack URL', 'Training Status',
  'Decision Log', 'Open Change Requests',
  'Signed Off At', 'Warranty Ends At'
];

/* مقارنة بزمن ثابت: المقارنة العادية تتوقف عند أول حرف مختلف،
   ما يسمح نظرياً باستنتاج الرمز حرفاً حرفاً بقياس زمن الرد. */
function safeEqual(a, b) {
  const x = String(a || ''), y = String(b || '');
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
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

  /* الرمز يجب أن يكون طويلاً وعشوائياً. الحد الأدنى 24 حرفاً يمنع
     محاولات التخمين العملية. */
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(token)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'رابط غير صالح' }) };
  }

  const KEY = process.env.AIRTABLE_TOKEN;
  if (!KEY) {
    console.error('AIRTABLE_TOKEN غير مضبوط في متغيرات بيئة Netlify');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'الخدمة غير متاحة حالياً' }) };
  }

  try {
    /* نبحث بالرمز. صيغة الفلتر تستخدم الرمز المتحقَّق من نمطه أعلاه
       (حروف وأرقام و _ - فقط) فلا مجال لحقن صيغة. */
    const formula = encodeURIComponent(`{Portal Token} = "${token}"`);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${PROJECTS}`
              + `?filterByFormula=${formula}&maxRecords=1`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });

    if (!res.ok) {
      console.error('Airtable error', res.status);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'تعذّر جلب البيانات' }) };
    }

    const data = await res.json();
    const rec  = (data.records || [])[0];

    /* رد موحّد لعدم الوجود وعدم التطابق — لا نكشف أي فرق بينهما */
    if (!rec || !safeEqual(rec.fields['Portal Token'], token)) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'رابط غير صالح أو منتهي' }) };
    }

    /* ترشيح صارم: لا شيء خارج القائمة البيضاء يخرج من هنا */
    const out = {};
    SAFE_FIELDS.forEach(f => {
      if (rec.fields[f] !== undefined && rec.fields[f] !== null) out[f] = rec.fields[f];
    });

    return { statusCode: 200, headers, body: JSON.stringify({ project: out }) };

  } catch (err) {
    console.error('portal error:', err && err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'خطأ غير متوقع' }) };
  }
};
