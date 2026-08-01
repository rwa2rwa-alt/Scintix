/* ════════════════════════════════════════════════════════════════
   payment-verify — التحقق من عملية دفع ميسر
   ────────────────────────────────────────────────────────────────
   لماذا دالة Netlify لا ويبهوك Make؟
   المفتاح السري لميسر يتحكم في تحصيل الأموال واستردادها — وهو أخطر
   مفتاح في المنظومة كلها. في مخطط Make يُخزَّن نصاً صريحاً يقرأه أي
   من يصل للحساب. هنا يبقى في متغير بيئة على الخادم ولا يغادره.

   ═══ القاعدة الأمنية الجوهرية ═══
   لا نثق بأي شيء يأتي من المتصفح عن حالة الدفع أو مبلغه.
   المتصفح يعطينا payment_id فقط، ونحن نسأل ميسر مباشرة عن الباقي.
   من يعدّل الرابط لا يستطيع تزوير النتيجة، لأننا لا نقرأ منه شيئاً
   سوى المعرّف — والمعرّف وحده لا ينفع بلا تأكيد من ميسر.

   المبلغ يُقارن بالمتوقع في Airtable: دفعة ناجحة بمبلغ أقل من
   المستحق لا تُعتمد، بل تُوسم للمراجعة اليدوية.
   ════════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  'https://caminotich.sa',
  'https://www.caminotich.sa',
  'https://scintix-official.netlify.app'
];

const SEC_KEY   = 'cmt_sec_9f4Kq7Xw2R';
const BASE_ID   = 'appkYurrIYGIup8QH';
const CONTRACTS = 'tblf6juZ47NPebied';

/* أسعار الباقات بالريال — المرجع الوحيد للمبلغ المتوقع.
   لا يُقرأ السعر من المتصفح إطلاقاً. */
const PACKAGE_PRICES = {
  Spark: 899,
  Glow: 1799,
  Pulse: 3299,
  Nova: 5999,
  Zenith: 12000
};

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

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ status: 'error' }) };
  }
  if (origin && !allowed) {
    return { statusCode: 403, headers, body: JSON.stringify({ status: 'error' }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ status: 'error' }) }; }

  if (body.k !== SEC_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ status: 'error' }) };
  }

  const paymentId = String(body.payment_id || '').trim();
  if (!/^[A-Za-z0-9-]{8,64}$/.test(paymentId)) {
    return { statusCode: 400, headers, body: JSON.stringify({ status: 'error', message: 'رقم عملية غير صالح' }) };
  }

  const MOYASAR = process.env.MOYASAR_SECRET_KEY;
  if (!MOYASAR) {
    console.error('MOYASAR_SECRET_KEY غير مضبوط في متغيرات بيئة Netlify');
    return { statusCode: 500, headers, body: JSON.stringify({ status: 'pending' }) };
  }

  try {
    /* ─── 1) نسأل ميسر مباشرة ─────────────────────────────────────
       المصادقة Basic: المفتاح السري كاسم مستخدم وكلمة مرور فارغة. */
    const auth = Buffer.from(MOYASAR + ':').toString('base64');
    const res = await fetch(`https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${auth}` }
    });

    if (res.status === 404) {
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'failed', message: 'لم نجد هذه العملية لدى مزوّد الدفع.' }) };
    }
    if (!res.ok) {
      console.error('Moyasar error', res.status);
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'pending' }) };
    }

    const pay = await res.json();

    /* ─── 2) الحالة غير الناجحة تُرجَع كما هي ──────────────────── */
    if (pay.status !== 'paid') {
      const msg = (pay.source && pay.source.message) || pay.message || '';
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: pay.status === 'failed' ? 'failed' : 'pending',
          message: String(msg).slice(0, 200)
        })
      };
    }

    /* ─── 3) ناجحة: نتحقق من المبلغ قبل الاعتماد ─────────────────
       ميسر يرجع المبلغ بالهللات. نقارنه بسعر الباقة المسجّل في
       Airtable — لا بما أرسله المتصفح. */
    const paidHalalas = Number(pay.amount || 0);
    const paidSAR     = paidHalalas / 100;
    const ref         = String(pay.description || pay.metadata?.contract || '').trim();

    let verified   = true;
    let mismatch   = '';
    let contractId = '';

    const AIRTABLE = process.env.AIRTABLE_TOKEN;
    if (AIRTABLE && /^[A-Za-z0-9_-]{1,64}$/.test(ref)) {
      try {
        const formula = encodeURIComponent(`{Contract Name} = "${ref}"`);
        const aRes = await fetch(
          `https://api.airtable.com/v0/${BASE_ID}/${CONTRACTS}?filterByFormula=${formula}&maxRecords=1`,
          { headers: { Authorization: `Bearer ${AIRTABLE}` } }
        );
        if (aRes.ok) {
          const aData = await aRes.json();
          const rec = (aData.records || [])[0];
          if (rec) {
            contractId = rec.id;
            const expected = PACKAGE_PRICES[rec.fields['package']];
            /* المبلغ الأقل من المستحق لا يُعتمد تلقائياً */
            if (expected && paidSAR + 0.01 < expected) {
              verified = false;
              mismatch = `المبلغ المدفوع ${paidSAR} ريال أقل من المستحق ${expected} ريال`;
            }
          }
        }
      } catch (e) {
        console.error('Airtable lookup failed:', e && e.message);
      }
    }

    /* ─── 4) تحديث سجل العقد ──────────────────────────────────── */
    if (AIRTABLE && contractId) {
      try {
        await fetch(`https://api.airtable.com/v0/${BASE_ID}/${CONTRACTS}/${contractId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            typecast: true,
            fields: {
              Status: verified ? 'Paid' : 'Payment Review',
              paid_at: new Date().toISOString(),
              payment_id: paymentId,
              paid_amount: paidSAR
            }
          })
        });
      } catch (e) {
        /* فشل التحديث لا يبطل الدفعة — نسجّله ونكمل.
           الدفعة تمت فعلاً لدى ميسر وهذا هو المرجع. */
        console.error('Airtable update failed:', e && e.message);
      }
    }

    if (!verified) {
      console.warn('AMOUNT MISMATCH:', paymentId, mismatch);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'pending', message: 'نراجع تفاصيل دفعتك يدوياً.' })
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'paid' }) };

  } catch (err) {
    console.error('payment-verify:', err && err.message);
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'pending' }) };
  }
};
