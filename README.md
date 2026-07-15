# Caminotich — Production Repository

الريبو التشغيلي لوكالة **Caminotich** (السجل التجاري الموحد 7054770941 · caminotich.sa)

## البنية

| المسار | الوصف |
|---|---|
| `scintix-official/` | الموقع الرسمي caminotich.sa — **مربوط بـ Netlify (auto-deploy)**: أي commit على main يُنشر تلقائيًا |
| `assets/` | أصول عامة |
| `{client-slug}/` | مواقع العملاء المولّدة آليًا عبر خط إنتاج Make (باقة لكل مجلد) — تُنشر على `caminotich-{slug}.netlify.app` |

## خط الإنتاج
Webhook (طلب/دفع) → Claude API (توليد الموقع) → GitHub (هذا الريبو) → Netlify (نشر) → Airtable (سجلات) → Gmail (إشعارات)

## مشاريع العملاء الحالية
- `wahaj/` — صالون وهج المذهلة للتزيين النسائي (Glow) — قيد المراجعة

> آخر تنظيف وإعادة هيكلة: 2026-07-15
