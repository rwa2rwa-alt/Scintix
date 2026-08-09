/* ════════════════════════════════════════════════════════════════
   signoff-lookup — بيانات محضر التسليم
   يستقبل Signoff Token ويُرجع اسم المشروع والعميل وصفته والباقة
   ورقم العقد. لا يقبل أي بيانات عرض من الرابط — المصدر Airtable وحده.
   ════════════════════════════════════════════════════════════════ */
const AIRTABLE  = process.env.AIRTABLE_TOKEN;
const BASE      = 'appkYurrIYGIup8QH';
const T_PROJECT = 'tblehDLoC86e4OuAp';
const T_CLIENT  = 'tbl0Vea3mQxEUM9Ji';
const T_CONTRACT= 'tblf6juZ47NPebied';

const ALLOWED = ['https://caminotich.sa', 'https://www.caminotich.sa'];

function reply(status, body, origin) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

async function at(path, params) {
  const url = new URL(`https://api.airtable.com/v0/${BASE}/${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE}` } });
  if (!r.ok) throw new Error(`Airtable ${r.status}`);
  return r.json();
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || '';
  if (event.httpMethod === 'OPTIONS') return reply(204, {}, origin);
  if (event.httpMethod !== 'POST')    return reply(405, { ok: false, code: 'METHOD' }, origin);

  if (!AIRTABLE) {
    console.error('signoff-lookup: متغير بيئة ناقص AIRTABLE_TOKEN');
    return reply(200, { ok: false, code: 'UNAVAILABLE' }, origin);
  }

  let token = '';
  try { token = String(JSON.parse(event.body || '{}').t || '').trim(); } catch (_) {}
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token))
    return reply(400, { ok: false, code: 'BAD_TOKEN' }, origin);

  try {
    /* ── المشروع بالرمز ── */
    const esc = token.replace(/'/g, "\\'");
    const pr = await at(T_PROJECT, {
      filterByFormula: `{Signoff Token} = '${esc}'`,
      maxRecords: 1
    });
    const proj = pr.records?.[0];
    if (!proj) return reply(404, { ok: false, code: 'NOT_FOUND' }, origin);

    const f = proj.fields;

    /* موقّع مسبقاً — لا يُعاد التوقيع */
    if (f['Signed Off At'])
      return reply(200, { ok: false, code: 'ALREADY_SIGNED',
        signed_at: f['Signed Off At'] }, origin);

    /* ── العميل: الاسم والصفة كما وردا في الطلب ── */
    let clientName = '', clientRole = '', clientCompany = '';
    const cid = (f['Client'] || [])[0];
    if (cid) {
      try {
        const c = await at(`${T_CLIENT}/${cid}`);
        clientName    = c.fields?.['Name'] || '';
        clientCompany = c.fields?.['Company'] || '';
        clientRole    = c.fields?.['Requested Service'] || '';
      } catch (_) {}
    }

    /* ── العقد: الرقم والموقّع وصفته ── */
    let contractNo = '', signer = '';
    const ctid = (f['Contracts'] || [])[0];
    if (ctid) {
      try {
        const ct = await at(`${T_CONTRACT}/${ctid}`);
        contractNo = ct.fields?.['Contract Name'] || '';
        signer     = ct.fields?.['signer'] || '';
      } catch (_) {}
    }

    /* الموقّع الأدق: من العقد إن وُجد، وإلا اسم العميل */
    let signerName = signer, signerRole = '';
    if (signer.includes('—')) {
      const parts = signer.split('—').map(s => s.trim());
      signerName = parts[0] || signer;
      signerRole = parts[1] || '';
    }

    return reply(200, {
      ok: true,
      project:      f['Project Name'] || '',
      client:       clientCompany || clientName || '',
      client_name:  clientName,
      client_role:  signerRole || clientRole,
      signer_name:  signerName || clientName,
      package:      f['Package']?.name || f['Package'] || '',
      contract_no:  contractNo,
      delivery_url: f['Delivery URL'] || ''
    }, origin);

  } catch (e) {
    console.error('signoff-lookup:', e.message);
    return reply(200, { ok: false, code: 'UNAVAILABLE' }, origin);
  }
};
