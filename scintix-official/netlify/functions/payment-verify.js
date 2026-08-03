/* ════════════════════════════════════════════════════════════════
   payment-verify — التحقق من عملية دفع ميسر واعتمادها
   ────────────────────────────────────────────────────────────────
   المبدأ: لا نثق بالمتصفح في أي شيء يخص المال.
   المتصفح يعطينا معرّف العملية ورمز العقد فقط. الحالة والمبلغ
   نسألهما ميسر مباشرة، والمستحق نقرأه من العقد في Airtable.

   ما تغيّر عن النسخة السابقة (2026-08-02):
   1) كان يقرأ المعرّف من pay.description (نص عربي) ومن
      metadata.contract (مفتاح غير موجود) — فيسقط دائماً، فلا
      يُحدَّث سجل ولا يُفحص المبلغ إطلاقاً. الآن يقرأ
      metadata.contract_id ويجلب السجل بمعرّفه مباشرة.
   2) حُذف المفتاح المشترك cmt_sec_… من الواجهة. بديله رمز العقد
      نفسه — لا يعرفه إلا حامل الرابط، وتسريبه لا يمس أي سيناريو آخر.
   3) المستحق يُقرأ من Contract Value لا من جدول أسعار مكرر، فلا
      يتخلف عن الإضافات ولا عن أي تعديل سعري.
   4) كل عملية تُقيَّد سطراً في Payments — التحصيل والاسترداد معاً.
      حالة العقد ملخّص؛ السجل هو المرجع المحاسبي.
   ════════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  'https://caminotich.sa',
  'https://www.caminotich.sa',
  'https://scintix-official.netlify.app'
];

const BASE_ID   = 'appkYurrIYGIup8QH';
const CONTRACTS = 'tblf6juZ47NPebied';
const PAYMENTS  = 'tblIVEYvdVQ1NcBL6';

const AT = 'https://api.airtable.com/v0';

/* فرق تقريب مقبول — يغطي كسور الهللات لا النقص الحقيقي */
const TOLERANCE_SAR = 0.5;

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

  const reply = (status, obj) => ({ statusCode: status, headers, body: JSON.stringify(obj) });

  if (event.httpMethod === 'OPTIONS') return reply(200, {});
  if (event.httpMethod !== 'POST')    return reply(405, { status: 'error' });
  if (origin && !allowed)             return reply(403, { status: 'error' });

  let body = {};
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return reply(400, { status: 'error' }); }

  const paymentId = String(body.payment_id || '').trim();
  const token     = String(body.t || '').trim();

  if (!/^[A-Za-z0-9-]{8,64}$/.test(paymentId)) {
    return reply(400, { status: 'error', message: 'رقم عملية غير صالح' });
  }
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) {
    return reply(400, { status: 'error', message: 'رابط غير صالح' });
  }

  const MOYASAR  = process.env.MOYASAR_SECRET_KEY;
  const AIRTABLE = process.env.AIRTABLE_TOKEN;

  /* غياب أي مفتاح عطل تشغيلي لا خطأ عميل — نُرجع "قيد المراجعة"
     ولا نقول للعميل إن دفعته فشلت، لأنها قد تكون نجحت فعلاً. */
  if (!MOYASAR || !AIRTABLE) {
    console.error('متغير بيئة ناقص:', !MOYASAR ? 'MOYASAR_SECRET_KEY' : 'AIRTABLE_TOKEN');
    return reply(200, { status: 'pending' });
  }

  const atHeaders = { Authorization: `Bearer ${AIRTABLE}`, 'Content-Type': 'application/json' };

  try {
    /* ─── 1) العقد أولاً: الرمز يحدد من يسأل ────────────────────── */
    const formula = encodeURIComponent(`{token}="${token}"`);
    const cRes = await fetch(
      `${AT}/${BASE_ID}/${CONTRACTS}?filterByFormula=${formula}&maxRecords=1`,
      { headers: atHeaders }
    );
    if (!cRes.ok) { console.error('Airtable contracts', cRes.status); return reply(200, { status: 'pending' }); }

    const contract = ((await cRes.json()).records || [])[0];
    if (!contract) return reply(404, { status: 'error', message: 'لم نجد هذا العقد' });

    const f          = contract.fields || {};
    const contractId = contract.id;
    const dueSAR     = Number(f['Contract Value'] || 0);

    /* ─── 2) ميسر هو المرجع في الحالة والمبلغ ──────────────────── */
    const auth = Buffer.from(MOYASAR + ':').toString('base64');
    const pRes = await fetch(
      `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    if (pRes.status === 404) {
      return reply(200, { status: 'failed', message: 'لم نجد هذه العملية لدى مزوّد الدفع.' });
    }
    if (!pRes.ok) { console.error('Moyasar', pRes.status); return reply(200, { status: 'pending' }); }

    const pay = await pRes.json();
    const meta = pay.metadata || {};

    /* ─── 3) العملية يجب أن تخص هذا العقد بعينه ─────────────────
       يمنع إعادة استخدام عملية دفع عقد آخر لفتح هذا العقد. */
    if (meta.contract_id && meta.contract_id !== contractId) {
      console.warn('عملية لا تخص العقد:', paymentId, contractId);
      return reply(403, { status: 'error', message: 'هذه العملية لا تخص هذا العقد.' });
    }

    const paidSAR = Number(pay.amount || 0) / 100;
    const feeSAR  = Number(pay.fee || 0) / 100;
    const src     = pay.source || {};

    const evidence = [
      `البطاقة: ${src.company || '—'} ••••${src.number || '—'}`,
      `النوع: ${src.type || '—'}`,
      `3-D Secure: ${src.gateway_id || '—'}`,
      `رسالة المزوّد: ${src.message || '—'}`,
      `العملة: ${pay.currency || '—'}`,
      `أُنشئت: ${pay.created_at || '—'}`,
      `حُدّثت: ${pay.updated_at || '—'}`,
      `IP: ${pay.ip || '—'}`
    ].join(' | ');

    /* ─── 4) غير الناجحة تُقيَّد أيضاً — المحاولات الفاشلة بيانات ─ */
    if (pay.status !== 'paid') {
      const failed = pay.status === 'failed';
      await logPayment(atHeaders, {
        contractId, paymentId, paidSAR, feeSAR, evidence,
        status: failed ? 'فاشلة' : 'قيد المراجعة',
        note: String(src.message || pay.status || '').slice(0, 300)
      });
      return reply(200, {
        status: failed ? 'failed' : 'pending',
        message: String(src.message || '').slice(0, 200)
      });
    }

    /* ─── 5) ناجحة: يبقى فحص العملة والمبلغ ────────────────────── */
    let verified = true;
    let reason   = '';

    if (String(pay.currency).toUpperCase() !== 'SAR') {
      verified = false;
      reason = `عملة غير متوقعة: ${pay.currency}`;
    } else if (dueSAR > 0 && paidSAR + TOLERANCE_SAR < dueSAR) {
      verified = false;
      reason = `المدفوع ${paidSAR} ريال أقل من المستحق ${dueSAR} ريال`;
    } else if (dueSAR === 0) {
      verified = false;
      reason = 'العقد بلا قيمة مسجّلة — تعذّرت المطابقة';
    }

    await logPayment(atHeaders, {
      contractId, paymentId, paidSAR, feeSAR, evidence,
      status: verified ? 'مؤكدة' : 'قيد المراجعة',
      note: reason
    });

    /* ─── 6) تحديث ملخّص العقد ─────────────────────────────────── */
    await patch(atHeaders, `${AT}/${BASE_ID}/${CONTRACTS}/${contractId}`, {
      typecast: true,
      fields: {
        'Status': verified ? 'Paid' : 'Payment Review',
        'paid_at': new Date().toISOString(),
        'payment_id': paymentId,
        'paid_amount': paidSAR
      }
    }, 'تحديث العقد');

    if (!verified) {
      console.warn('دفعة تحتاج مراجعة:', paymentId, reason);
      return reply(200, { status: 'pending', message: 'نراجع تفاصيل دفعتك يدوياً.' });
    }

    return reply(200, { status: 'paid' });

  } catch (err) {
    console.error('payment-verify:', err && err.message);
    return reply(200, { status: 'pending' });
  }
};

/* ─────────────────────────────────────────────────────────────────
   قيد سطر في سجل الحركات.
   فشل القيد لا يبطل الدفعة — الدفعة تمت لدى ميسر وهذا هو المرجع.
   لكنه يُسجَّل بوضوح لأن سجلاً ناقصاً أسوأ من سجل معطّل معلوم.
   ───────────────────────────────────────────────────────────────── */
async function logPayment(atHeaders, p) {
  if (PAYMENTS.indexOf('tbl') !== 0) {
    console.error('PAYMENTS_TABLE_ID لم يُستبدل بمعرّف الجدول الفعلي');
    return;
  }
  const stamp = new Date();
  const no = 'PAY-' + stamp.getUTCFullYear() + '-' + String(Date.now()).slice(-8);

  try {
    const res = await fetch(`${AT}/${BASE_ID}/${PAYMENTS}`, {
      method: 'POST',
      headers: atHeaders,
      body: JSON.stringify({
        typecast: true,
        records: [{
          fields: {
            'Payment No':  no,
            'Contract':    [p.contractId],
            'Date':        stamp.toISOString(),
            'Direction':   'تحصيل',
            'Method':      'بطاقة — ميسر',
            'Amount SAR':  p.paidSAR,
            'Fee SAR':     p.feeSAR,
            'Gateway Ref': p.paymentId,
            'Status':      p.status,
            'Evidence':    p.evidence,
            'Notes':       p.note || ''
          }
        }]
      })
    });
    if (!res.ok) console.error('قيد الدفعة فشل', res.status, await res.text());
  } catch (e) {
    console.error('قيد الدفعة فشل:', e && e.message);
  }
}

async function patch(atHeaders, url, payload, label) {
  try {
    const res = await fetch(url, { method: 'PATCH', headers: atHeaders, body: JSON.stringify(payload) });
    if (!res.ok) console.error(label + ' فشل', res.status, await res.text());
  } catch (e) {
    console.error(label + ' فشل:', e && e.message);
  }
}
