/* ════════════════════════════════════════════════════════════
   Netlify Serverless Function — Caminotich AI Project Analyser
   المسار: netlify/functions/analyse.js

   المتطلب: أضيفي ANTHROPIC_API_KEY في Netlify:
   Site → Environment variables → Add variable
   Key:   ANTHROPIC_API_KEY
   Value: sk-ant-xxxxxxxxxxxxxxxx
════════════════════════════════════════════════════════════ */

exports.handler = async function(event) {

  // ── CORS Headers (تسمح بالاستدعاء من موقعك فقط) ─────────────────────────
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // ── Parse request ─────────────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { company = '', email = '', desc = '', budget = '', lang = 'ar' } = body;

  if (!desc || desc.length < 5) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Project description required' }) };
  }

  // ── Build prompt ──────────────────────────────────────────────────────────
  const prompt = lang === 'en'
    ? `You are a digital consultant at Caminotich Digital Solutions (Saudi Arabia).
Analyse the project below and recommend the best package. Reply in English.

Company: ${company || 'N/A'}
Email:   ${email   || 'N/A'}
Project: ${desc}
Budget:  ${budget  || 'Not specified'}

Reply in this structure:
1. **Project Analysis** (2 sentences)
2. **Recommended Package** (Spark 899 / Glow 1,799 / Pulse 3,299 / Nova 5,999 / Zenith 12,000 SAR/month — with reason)
3. **Next Steps** (3 practical steps)
4. **Note** (one encouraging closing sentence)`

    : `أنت مستشار رقمي في وكالة Caminotich Digital Solutions السعودية.
حلّل المشروع التالي وأعطِ توصية احترافية باللغة العربية.

اسم الشركة: ${company || 'غير محدد'}
البريد: ${email || 'غير محدد'}
وصف المشروع: ${desc}
الميزانية: ${budget || 'غير محددة'}

أجب بهذا الترتيب:
1. **تحليل المشروع** (جملتان)
2. **الباقة المقترحة** (Spark 899 / Glow 1,799 / Pulse 3,299 / Nova 5,999 / Zenith 12,000 ريال شهرياً — مع السبب)
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
