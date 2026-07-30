# حزمة النزاع — كامينوتك
ما يُحفظ، وكيف يُستخرج عند اعتراض بنكي · 2026-07-30

---

## ١) أرشيف الشروط — الثغرة الأخطر، مُغلقة

مجلد `terms/2026-07-30/` يُرفع مع الموقع ويُنشر على `caminotich.sa/terms/2026-07-30/ar.txt`.

| الملف | الأحرف | SHA-256 |
|---|---|---|
| `ar.txt` | 1008 | `58f96545935d0d03f2a214c3e68ff0360203ae21f4e6660c7a164c31d099012e` |
| `en.txt` | 1180 | `c1f32bd7f0165e6202bbd07126000a4a0da5487641b7bfe2bb77efd8a121d989` |

**تم التحقق:** حساب SHA-256 على الملف المؤرشف يعطي نفس البصمة التي تحسبها `contract.html` لحظة التوقيع، حرفاً بحرف. أي أن الرقم المخزّن في سجل العميل أصبح قابلاً للإثبات لا مجرد رقم.

**قاعدة لا تُكسر:** أي تعديل على بنود العقد ⇒ `TERMS_VERSION` جديد في `CMT_CFG` + مجلد جديد تحت `terms/`. **لا تُعدَّل نسخة منشورة أبداً** — العقود الموقّعة عليها تفقد إثباتها فوراً.

ميزة إضافية مجانية: تاريخ نشر كل نسخة موثّق في سجل إيداعات GitHub — شاهد مستقل عنك على متى وُجد النص.

---

## ٢) جدول `Contract_Attempts`

سجل تدقيق منفصل عن `Contracts` حتى لا تختلط المحاولات الفاشلة بالعقود الفعلية.

| الحقل | النوع |
|---|---|
| `request_id` | Single line text — المعرّف الظاهر للعميل في رسالة الخطأ |
| `token_used` | Text |
| `contract` | Link → Contracts |
| `result` | Single select: REJECTED / ALREADY_SIGNED / TOKEN_INVALID / TOKEN_EXPIRED |
| `attempted_at` | Date+time — من الخادم |
| `ip` · `user_agent` | Text |
| `signer_name` · `phone_e164` | Text |
| `package_sent` · `amount_sent` | ما أرسله المتصفح |
| `package_expected` · `amount_expected` | ما في السجل |
| `lang` | Text |

**لماذا حقلا "المُرسل" و"المتوقَّع" معاً؟** لأن الفرق بينهما هو الدليل. صفّان يُظهران `amount_sent = 1` مقابل `amount_expected = 899` يُثبتان محاولة تلاعب موثّقة بوقتها و IP — وهذا ينقلب لصالحك في أي نزاع.

مُضاف إلى `contract-sign.blueprint.json`: كل مسار رفض يُنشئ سجلاً قبل الرد. تكلفة المسار الناجح لم تتغيّر.

---

## ٣) سيناريو `Dispute Pack`

**المُشغّل:** Webhook أو تشغيل يدوي، بمُدخل `contract_no` و`dispute_ref` اختياري.

| # | الوحدة | الغرض |
|---|---|---|
| 1 | Webhook / Manual | `contract_no` |
| 2 | Airtable › Search Records — `Contracts` | `{contract_no} = "..."` |
| 3 | Airtable › Search Records — `Contract_Attempts` | كل المحاولات على العقد |
| 4 | Airtable › Search Records — `Payments` | سجل موياسر |
| 5 | HTTP › Get a file | `https://caminotich.sa/terms/{{2.terms_version}}/{{2.sign_lang}}.txt` |
| 6 | Tools › Set variable | تعبئة `dispute-pack.template.html` |
| 7 | Google Drive › Upload a file | رفع HTML مع **Convert = Yes** |
| 8 | Google Drive › Download a file | تصدير بصيغة **PDF** |
| 9 | Email | إرسال الـ PDF إلى `info@caminotich.sa` |

الخطوتان 7–8 تنتجان PDF عبر Google Workspace الذي تملكينه — بلا خدمة تحويل مدفوعة، وهذا يتوافق مع وضع التوفير. ~9 عمليات، وتُشغَّل عند الحاجة فقط.

`dispute-pack.template.html` جاهز بـ **48 حقلاً** موزعة على ثمانية أقسام: الأطراف، الخدمة، إثبات التوقيع، إثبات ما وُوفق عليه، السداد، التسليم، التواصل، وسجل المحاولات. اختُبر بتعبئة كاملة — لا حقل واحد بقي فارغاً. و`dispute-pack.sample.html` نموذج معبأ لتري الشكل النهائي.

---

## ٤) ما زال ناقصاً — وهو خارج الكود

هذه لا يحلّها ملف، بل قرار منك:

1. **3-D Secure في موياسر.** أقوى حماية لديك، ولا وجود لها في أي كود هنا. تحققي من تفعيلها قبل أول عملية، واحفظي `three_ds_result` مع كل سجل دفع — القالب يعرضه.
2. **حقول التسليم.** أضيفي إلى `Projects`: `delivered_at`, `delivery_url`, `delivery_ack`. العقد يثبت الاتفاق، لا التنفيذ.
3. **سجل واتساب في Airtable** — بند معلّق عندك، وهو القسم ٧ في القالب.
4. **نسخة احتياطية شهرية** من Airtable إلى Google Drive. قاعدة واحدة بلا نسخ = دليل واحد قابل للضياع بحذف خاطئ.
5. **مراجعة محامٍ** لمدد الحفظ وسياسة الخصوصية (PDPL) والاعتداد بالتوقيع الإلكتروني. لم أُقدّر المدد لأنني لا أعرفها بثقة.
