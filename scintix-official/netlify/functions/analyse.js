/* ════════════════════════════════════════════════════════════
   Netlify Serverless Function — Caminotich AI Project Analyser
   المسار: netlify/functions/analyse.js

   المتطلب: أضيفي ANTHROPIC_API_KEY في Netlify:
   Site → Environment variables → Add variable
   Key:   ANTHROPIC_API_KEY
   Value: sk-ant-xxxxxxxxxxxxxxxx
════════════════════════════════════════════════════════════ */

/* النطاقات المسموح لها بالاستدعاء. أي أصل خارجها يُرفض قبل لمس Anthropic. */
const ALLOWED_ORIGINS = [
  'https://caminotich.sa',
  'https://www.caminotich.sa',
  'https://scintix-official.netlify.app'
];

/* مفتاح مشترك مع نماذج الموقع. ليس مصادقة قوية — يوقف الاستدعاء الآلي العابر
   فقط. الحاجز الحقيقي هو ALLOWED_ORIGINS + سقف الطول أدناه. */
const SEC_KEY = process.env.CMT_WEBHOOK_KEY || '';

const MAX_DESC = 2000;

exports.handler = async function(event) {

  // ── CORS: أصل واحد محدد، لا '*' ───────────────────────────────────────────
  const origin  = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowed = ALLOWED_ORIGINS.indexOf(origin) !== -1;

  const headers = {
    'Access-Control-Allow-Origin':  allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (origin && !allowed) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Origin not allowed' }) };
  }

  // ── Parse request ─────────────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { company = '', email = '', desc = '', budget = '', lang = 'ar', k = '' } = body;

  /* المفتاح لم يعد يُرسل من المتصفح — كان مكشوفاً في View Source فلا يضيف أماناً.
     الحاجز الفعلي هو ALLOWED_ORIGINS + سقف الطول. يبقى الفحص فعّالاً فقط إذا
     ضُبط CMT_WEBHOOK_KEY في بيئة Netlify واستُدعيت الدالة من الخادم. */
  if (SEC_KEY && k && k !== SEC_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (!desc || desc.length < 5) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Project description required' }) };
  }

  /* سقف الطول: يمنع استنزاف الرصيد عبر وصف ضخم. القص أفضل من الرفض للمستخدم الحقيقي. */
  const safe = (v, n) => String(v || '').slice(0, n);
  const sDesc    = safe(desc,    MAX_DESC);
  const sCompany = safe(company, 120);
  const sEmail   = safe(email,   160);
  const sBudget  = safe(budget,  80);

  // ── Build prompt ──────────────────────────────────────────────────────────
  const prompt = lang === 'en'
    ? `You are a digital consultant at Caminotich Digital Solutions (Saudi Arabia).
Analyse the project below and recommend the best package. Reply in English.

Company: ${sCompany || 'N/A'}
Email:   ${sEmail   || 'N/A'}
Project: ${sDesc}
Budget:  ${sBudget  || 'Not specified'}

Reply in this structure:
1. **Project Analysis** (2 sentences)
2. **Recommended Package** (Spark 899 / Glow 1,799 / Pulse 3,299 / Nova 5,999 / Zenith 12,000 SAR — ONE-TIME payment, never monthly — with reason)
3. **Next Steps** (3 practical steps)
4. **Note** (one encouraging closing sentence)`

    : `أنت مستشار رقمي في وكالة Caminotich Digital Solutions السعودية.
حلّل المشروع التالي وأعطِ توصية احترافية باللغة العربية.

اسم الشركة: ${sCompany || 'غير محدد'}
البريد: ${sEmail || 'غير محدد'}
وصف المشروع: ${sDesc}
الميزانية: ${sBudget || 'غير محددة'}

أجب بهذا الترتيب:
1. **تحليل المشروع** (جملتان)
2. **الباقة المقترحة** (Spark 899 / Glow 1,799 / Pulse 3,299 / Nova 5,999 / Zenith 12,000 ريال — دفعة واحدة وليست اشتراكاً شهرياً — مع السبب)
3. **خطوات البدء** (3 خطوات عملية)
4. **ملاحظة** (جملة تشجيعية وختامية)`;

  // ── Call Anthropic API ────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Netlify environment variables' })
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            apiKey,
        'anthropic-version':    '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',   // سريع وبتكلفة منخفضة
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: errText }) };
    }

    const data   = await response.json();
    const result = data.content?.[0]?.text || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
