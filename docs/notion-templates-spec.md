# Caminotich — Notion Startup Templates / Implementation Specification

Version 1.0 — ready for build and QA

## Product rules

- Paid products only. Public demos are view-only and must not allow duplication.
- Standard edition uses Caminotich branding. Client name/logo/colors cost SAR 299.
- Workflow changes start at SAR 499 and are scoped before work.
- Every template contains: `Start Here`, one dashboard, connected databases, a user guide, sample data marked clearly as fictional, and terms/support.
- Delivery uses a clean master copy. Never build client work directly inside the master.
- Single-organization license; resale or redistribution is not permitted.

## Pricing and support

| Product | Price | Included |
|---|---:|---|
| One industry template | SAR 349 | Standard template, guide, delivery copy |
| All five templates | SAR 1,290 | Five standard templates; one-organization license |
| Startup package | SAR 1,499 | Ready-theme landing page, one template, basic branding, handover |
| Brand customization | SAR 299 | Name, logo, colors, covers |
| Workflow customization | From SAR 499 | Agreed fields, databases, formulas or views |
| Support and updates — 3 months | SAR 490 | Questions, corrections, standard-version improvements |
| Monthly support extension | SAR 190 | Continued support; new custom work excluded |
| Extra consulting hour | SAR 180 | Training or out-of-scope implementation |

Corrective fixes discovered within 30 days of delivery are included. Support response target: two business days. Client-created errors, third-party changes and new workflows are out of scope.

## Common workspace skeleton

1. `ابدأ هنا / Start Here`: outcome, 15-minute setup checklist, privacy note.
2. `لوحة التحكم / Dashboard`: today, this week, alerts, quick-add buttons.
3. `قواعد البيانات / Databases`: master databases stored in one page; dashboards use linked views.
4. `دليل الاستخدام / Guide`: daily and weekly operating routines.
5. `الدعم والترخيص / Support & License`: license, support scope and WhatsApp contact.

Naming convention: relations are plural database names; formulas start with `⚙`; rollups start with `Σ`; operational alerts start with `⚠`.

## 1) نظام إدارة الصالون

### Databases

| Database | Required properties |
|---|---|
| العملاء | الاسم (Title), الجوال (Phone), التفضيلات (Text), آخر زيارة (Rollup), عدد الزيارات (Rollup), إجمالي الإنفاق (Rollup) |
| الحجوزات | رقم الحجز (Title), العميلة (Relation), الخدمة (Relation), الموظفة (Relation), البداية (Date), الحالة (Status: بانتظار التأكيد/مؤكد/مكتمل/ملغي/لم تحضر), السعر (Rollup), ملاحظات تشغيلية (Text) |
| الخدمات | الخدمة (Title), الفئة (Select), المدة بالدقائق (Number), السعر (Number), نشطة؟ (Checkbox) |
| الموظفات | الاسم (Title), التخصص (Multi-select), أيام الدوام (Multi-select), نشطة؟ (Checkbox), الحجوزات (Relation) |
| المخزون | المنتج (Title), الكمية الحالية (Number), حد إعادة الطلب (Number), المورد (Relation), سعر الوحدة (Number), ⚠ إعادة الطلب (Formula) |
| الموردون | المورد (Title), مسؤول التواصل (Text), الجوال (Phone), المنتجات (Relation) |

Formula — reorder: `if(prop("الكمية الحالية") <= prop("حد إعادة الطلب"), "اطلب الآن", "متوفر")`

Dashboard views: today's confirmed bookings sorted by time; awaiting confirmation; low stock; top clients by visit count; quick add booking.

Acceptance test: creating one booking links client/service/staff, shows service price, and appears in the correct day view.

## 2) نظام التشغيل الإداري للعيادة

This is an administrative workspace, not an EMR/EHR. Do not include diagnoses, treatment plans, medical files, national IDs or insurance records in the master.

| Database | Required properties |
|---|---|
| دليل المراجعين | الاسم (Title), رقم ملف داخلي (Text), الجوال (Phone), تاريخ التسجيل (Created time), الطبيب المتابع (Relation), حالة التواصل (Status) |
| المواعيد | رقم الموعد (Title), المراجع (Relation), الطبيب (Relation), نوع الموعد (Select: جديد/متابعة/إجراء إداري), التاريخ (Date), الحالة (Status: مؤكد/حضر/لم يحضر/ملغي), المبلغ (Number) |
| الأطباء | الاسم (Title), التخصص (Select), أيام العيادة (Multi-select), المواعيد (Relation) |
| الفواتير | رقم الفاتورة (Title), المراجع (Relation), الموعد (Relation), المبلغ (Number), حالة السداد (Status), طريقة الدفع (Select), التاريخ (Date) |
| المتابعة الإدارية | المهمة (Title), المراجع (Relation), المسؤول (Person/Text), الاستحقاق (Date), الحالة (Status), ملاحظة إدارية عامة (Text) |

Dashboard views: today grouped by doctor; unpaid invoices; follow-ups due; new registrations this month.

Acceptance test: no property requests clinical data; unpaid invoice appears in alert view; role/access guidance is visible on Start Here.

## 3) نظام التشغيل والمتابعة المدرسية

| Database | Required properties |
|---|---|
| الطلاب | الاسم (Title), الرقم الداخلي (Text), الصف (Select), الفصل (Select), ولي الأمر (Text), جوال التواصل (Phone), الحالة (Status), الحضور (Relation), Σ الغياب (Rollup), ⚠ متابعة (Formula) |
| المعلمون | الاسم (Title), المادة (Multi-select), الصفوف المسندة (Multi-select), الجدول (Relation) |
| الجدول الدراسي | الحصة (Title), المادة (Select), المعلم (Relation), الصف (Select), الفصل (Select), اليوم (Select), رقم الحصة (Number) |
| الحضور | السجل (Title), الطالب (Relation), التاريخ (Date), الحالة (Status: حاضر/غائب/متأخر/بعذر), الفصل الدراسي (Select) |
| الدرجات | التقييم (Title), الطالب (Relation), المادة (Select), الفصل الدراسي (Select), الدرجة (Number), الدرجة الكلية (Number), ⚙ النسبة (Formula) |
| تواصل أولياء الأمور | الموضوع (Title), الطالب (Relation), ولي الأمر (Text), التاريخ (Date), القناة (Select), الحالة (Status), الخطوة التالية (Text) |

Formula — grade percentage: `round(prop("الدرجة") / prop("الدرجة الكلية") * 100)`.

Dashboard views: attendance today; repeated absence; low grades; unresolved parent communication; teacher timetable filtered by teacher.

Privacy: sample data must be fictional. Recommend separate workspaces/views and least-privilege access before real student data is entered.

## 4) نظام إدارة الدروس الخصوصية

| Database | Required properties |
|---|---|
| الطلاب | الاسم (Title), المادة (Select), المستوى (Select), ولي الأمر (Text), الجوال (Phone), سعر الساعة (Number), الجلسات (Relation), Σ المستحق (Rollup), Σ المدفوع (Rollup), ⚙ الرصيد (Formula) |
| الجلسات | الجلسة (Title), الطالب (Relation), البداية (Date), المدة بالساعات (Number), الموضوع (Text), الحالة (Status: مجدولة/مكتملة/ملغاة), سعر الساعة (Rollup), ⚙ الإجمالي (Formula), حالة الدفع (Status) |
| المدفوعات | الدفعة (Title), الطالب (Relation), الجلسة (Relation optional), المبلغ (Number), التاريخ (Date), الطريقة (Select) |
| المواد التعليمية | العنوان (Title), المادة (Select), الرابط/الملف (URL/Files), الطلاب (Relation optional), النوع (Select) |
| متابعة التقدم | التقرير (Title), الطالب (Relation), التاريخ (Date), نقاط القوة (Text), التحسين (Text), الهدف القادم (Text), نسبة الإنجاز (Number) |

Formulas: session total `prop("المدة بالساعات") * prop("سعر الساعة")`; balance `prop("Σ المستحق") - prop("Σ المدفوع")`.

Dashboard views: next seven days; unpaid completed sessions; progress timeline by student; payments this month.

## 5) نظام إدارة جلسات التدريب

| Database | Required properties |
|---|---|
| العملاء | الاسم (Title), الهدف الرئيسي (Text), تاريخ البدء (Date), الباقة (Relation), الحالة (Status), الجلسات (Relation), Σ المستخدمة (Rollup), ⚙ المتبقية (Formula), ⚠ التجديد (Formula) |
| الباقات | الباقة (Title), عدد الجلسات (Number), السعر (Number), المدة بالأيام (Number), نشطة؟ (Checkbox) |
| الجلسات | الجلسة (Title), العميل (Relation), التاريخ (Date), الحالة (Status), ملخص إداري (Text), الخطوة التالية (Text), محسوبة؟ (Checkbox) |
| الأهداف والتقدم | الهدف (Title), العميل (Relation), تاريخ المراجعة (Date), نسبة الإنجاز (Number), الحالة (Status), المعيار التالي (Text) |
| الفواتير | الفاتورة (Title), العميل (Relation), المبلغ (Number), حالة السداد (Status), التاريخ (Date), الطريقة (Select) |

Formulas: remaining sessions `prop("الباقة").first().prop("عدد الجلسات") - prop("Σ المستخدمة")` (adjust to Notion formula syntax after relation setup); renewal alert when remaining sessions <= 1.

Do not collect health or psychological details in the standard edition. Use administrative summaries and next actions only.

## View-only previews

Create a separate sanitized preview copy per template. Share as `Can view`; disable duplication if the current Notion plan exposes that control. Before publishing, test the link in a signed-out browser and confirm no real data, comments, workspace members or private pages are visible.

## Sales and fulfillment checklist

1. Customer selects product and signs scope/terms.
2. Payment is confirmed before delivery/customization begins.
3. Duplicate the clean master into a client delivery area.
4. Apply paid customization only; log every change.
5. Run the acceptance test and mobile check.
6. Deliver the duplication link and guide; record delivery date.
7. Start 30-day corrective period and optional support term.

## Launch gate

- [ ] Five master templates built in the connected Caminotich Notion workspace.
- [ ] All relations, rollups and formulas tested with fictional records.
- [ ] Five sanitized view-only preview URLs added to `/templates`.
- [ ] Payment/checkout or confirmed order workflow connected.
- [ ] Terms, privacy notice and license approved.
- [ ] `/templates` reviewed on mobile, Arabic and English.
- [ ] Production merge and deploy approved.

