/* ════════════════════════════════════════════════════════════════
   contract-lookup — بيانات الدفع من العقد الموقّع
   ────────────────────────────────────────────────────────────────
   لماذا؟ صفحة الدفع كانت تحسب المبلغ من باراميتر الرابط، فمن يعدّل
   الرابط يدفع ما يشاء. الآن تسأل هذه الدالة، والمبلغ يأتي من قيمة
   العقد المخزّنة في Airtable.

   وتفرض شرطين قبل فتح الدفع:
   · العقد موقّع — لا يُستلم مال بلا مستند
   · العقد غير مدفوع — يمنع الدفع مرتين
   ════════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  'https://caminotich.sa',
  'https://www.caminotich.sa',
  'https://scintix-official.netlify.app'
];

const BASE_ID   = 'appkYurrIYGIup8QH';
const CONTRACTS = 'tblf6juZ47NPebied';

exports.handler = async function (event) {
  const origin  = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowed = ALLOWED_ORIGINS.indexOf(origin) !== -1;

  const headers = {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Cache-Control': 'no-store, max-age=0',
    'Content-Type': 'application/json'
  };
  const reply = (s, o) => ({ statusCode: s, headers, body: JSON.stringify(o) });

  if (event.httpMethod === 'OPTIONS') return reply(200, {});
  if (event.httpMethod !== 'POST')    return reply(405, { ok: false });
  if (origin && !allowed)             return reply(403, { ok: false });

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return reply(400, { ok: false }); }

  const token = String(body.t || '').trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) {
    return reply(400, { ok: false, reason: 'BAD_TOKEN' });
  }

  const AIRTABLE = process.env.AIRTABLE_TOKEN;
  if (!AIRTABLE) { console.error('AIRTABLE_TOKEN غير مضبوط'); return reply(200, { ok: false, reason: 'UNAVAILABLE' }); }

  try {
    const formula = encodeURIComponent(`{token}="${token}"`);
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${CONTRACTS}?filterByFormula=${formula}&maxRecords=1`,
      { headers: { Authorization: `Bearer ${AIRTABLE}` } }
    );
    if (!res.ok) { console.error('Airtable', res.status); return reply(200, { ok: false, reason: 'UNAVAILABLE' }); }

    const rec = ((await res.json()).records || [])[0];
    if (!rec) return reply(404, { ok: false, reason: 'NOT_FOUND' });

    const f = rec.fields || {};

    if (!f['signed_at'])  return reply(200, { ok: false, reason: 'UNSIGNED' });
    if (f['paid_at'])     return reply(200, { ok: false, reason: 'ALREADY_PAID' });

    const dueSAR = Number(f['Contract Value'] || 0);
    if (!(dueSAR > 0)) return reply(200, { ok: false, reason: 'NO_VALUE' });

    return reply(200, {
      ok: true,
      contract_id:   rec.id,
      contract_name: String(f['Contract Name'] || ''),
      package:       String(f['package'] || ''),
      amount_sar:    dueSAR,
      halalas:       Math.round(dueSAR * 100)
    });

  } catch (err) {
    console.error('contract-lookup:', err && err.message);
    return reply(200, { ok: false, reason: 'UNAVAILABLE' });
  }
};
