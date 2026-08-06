/* ═══════════════════════════════════════════════════════════════
   Caminotich Digital Solutions — script.js
   نسخة نظيفة كاملة — تدعم العربي/الإنجليزي بشكل كامل
═══════════════════════════════════════════════════════════════ */

// ─── Selectors ────────────────────────────────────────────────
const navToggle  = document.querySelector('.nav-toggle');
const langSelect = document.querySelector('[data-lang-select]');
const html       = document.documentElement;

// ─── روابط Airtable ───────────────────────────────────────────
const FORM_LINKS = {
  ar: 'quote.html',
  en: 'quote.html'
};

// ─── روابط وسائل التواصل ─────────────────────────────────────
const SOCIAL_LINKS = {
  whatsapp:  'https://wa.me/9665XXXXXXXX',
  x:         'https://x.com/Camino_tich',
  instagram: 'https://instagram.com/caminotich',
  linkedin:  'https://linkedin.com/company/caminotich',
  tiktok:    'https://tiktok.com/@caminotich',
  youtube:   'https://youtube.com/@caminotich'
};

// ─── Translations ─────────────────────────────────────────────
const T = {
  ar: {
    'page.title':       'Caminotich | حلول ذكية للنمو الرقمي',
    'header.tagline':   'ودع العمل اليدوي وإبدأ استثمارك في المستقبل مع <span class="brand-accent">Caminotich</span>',
    'nav.toggle':       'فتح القائمة',
    'nav.services':     'الخدمات',
    'nav.plans':        'الباقات',
    'nav.ai':           'الذكاء الاصطناعي',
    'nav.clients':      'شركاؤنا',
    'nav.contact':      'اتصل بنا',
    'cta.consult':      'اطلب استشارة',
    'hero.eyebrow':     'حلول تقنية متكاملة',
    'hero.title':       'نبني أنظمة رقمية ذكية <span>تؤتمت أعمالك وتسرّع نمو شركتك.</span>',
    'hero.description': 'من الفكرة إلى الإطلاق والدعم المستمر، نقدم حلولاً تقنية متكاملة تساعدك على النمو وتقليل التكاليف.',
    'stats.launch':     'متوسط زمن الإطلاق',
    'stats.hours':      ' ساعة',
    'billing.note':     'الأسعار بالدولار تقريبية للاسترشاد فقط (1 دولار = 3.754 ريال). يتم التحصيل الفعلي بالريال السعودي عبر بوابة ميسر.',
    'stats.services':   'خدمات تقنية',
    'stats.support':    'مراقبة ودعم',
    'features.heading':     'خدماتنا',
    'features.description': 'عشر خدمات تقنية متكاملة تغطي رحلة مشروعك من التأسيس حتى التشغيل اليومي.',
    'features.web.title': 'تطوير المواقع',
    'features.web.body':  'مواقع سريعة ومتجاوبة مبنية على أسس تقنية سليمة وجاهزة لمحركات البحث.',
    'features.ecom.title': 'المتاجر الإلكترونية',
    'features.ecom.body':  'متاجر متكاملة مع بوابات دفع سعودية وإدارة مخزون وربط شحن.',
    'features.mobile.title': 'تطبيقات الجوال',
    'features.mobile.body':  'تطبيقات iOS وAndroid بواجهات عربية أصيلة وأداء مستقر.',
    'features.erp.title': 'الأنظمة الإدارية ERP / CRM',
    'features.erp.body':  'أنظمة تدير عملياتك وعملاءك ومخزونك في مكان واحد بدل الجداول المتفرقة.',
    'features.ai.title': 'حلول الذكاء الاصطناعي',
    'features.ai.body':  'مساعدات ذكية وتحليل بيانات وتوليد محتوى مدمج داخل أنظمتك.',
    'features.auto.title': 'الأتمتة',
    'features.auto.body':  'ربط أدواتك عبر Make وZapier وn8n لتشغيل المهام المتكررة بلا تدخل يدوي.',
    'features.dash.title': 'لوحات البيانات',
    'features.dash.body':  'لوحات مؤشرات لحظية تعرض أداء عملك بأرقام واضحة وقابلة للقرار.',
    'features.brand.title': 'الهوية الرقمية',
    'features.brand.body':  'شعار وهوية بصرية متكاملة تظهر باحترافية على كل منصاتك.',
    'features.mkt.title': 'التسويق الرقمي',
    'features.mkt.body':  'حملات مدروسة وتحسين محركات البحث ومحتوى يجذب عملاء فعليين.',
    'features.care.title': 'الصيانة والاستضافة',
    'features.care.body':  'استضافة آمنة ونسخ احتياطي ومتابعة دورية تضمن استمرار عملك.',
    'hero.primary':     'استكشف الباقات',
    'hero.secondary':   'تواصل معنا',
    'stats.projects':   'مشروع منشأ',
    'stats.partners':   'شريك نمو',
    'stats.satisfaction':'معدل رضا العملاء',
    'features.apps.title':     'تطبيقات متكاملة',
    'features.apps.body':      'نطور منصات رقمية تربط عملياتك وتوفر تجربة موحدة للعملاء وتدعم أهداف النمو التشغيلية.',
    'features.security.title': 'أمان متقدم',
    'features.security.body':  'حماية كاملة من الطبقة إلى الواجهة، مع بنية آمنة وخصوصية بيانات قوية للحفاظ على ثقة عملائك.',
    'features.ux.title':       'تجربة مستخدم متميزة',
    'features.ux.body':        'تصميم واجهات احترافية وواضحة تزيد من التفاعل وتُسهل عمليات المستخدم وتُعزز هوية علامتك.',
    'features.support.title':  'دعم مستمر',
    'features.support.body':   'متابعة أداء يومية، تحديثات دورية، وخدمات دعم تقنية تساعدك على الاستجابة السريعة والتطوير الدائم.',
    'plans.heading':     'باقة مرنة تناسب احتياجاتك',
    'plans.description': 'اختر الباقة المناسبة لنمو شركتك — من المشاريع الناشئة حتى المؤسسات الكبرى.',
    'plans.choose':      'ابدأ الآن',
    'plans.pulse.badge': 'الأكثر طلباً',
    'plans.spark.one':   'موقع تعريفي احترافي بصفحة واحدة',
    'plans.spark.two':   'تصميم متجاوب ثنائي اللغة (RTL)',
    'plans.spark.three': 'نموذج تواصل مع إشعار فوري',
    'plans.spark.four':  'تهيئة SEO أساسية + Google Search Console',
    'plans.spark.five':  'دليل التحديث الذاتي',
    'plans.glow.one':    'كل خدمات Spark',
    'plans.glow.two':    'موقع متعدد الأقسام (حتى 5 صفحات)',
    'plans.glow.three':  'هوية بصرية: ألوان وخطوط وشعار',
    'plans.glow.four':   'تحليلات زوار (Google Analytics)',
    'plans.glow.five':   'نظام بسيط لتجميع بيانات عملائك',
    'plans.pulse.one':   'كل مميزات Glow',
    'plans.pulse.two':   'نظام CRM احترافي لإدارة العملاء',
    'plans.pulse.three': 'بوت ترحيب تلقائي على واتساب',
    'plans.pulse.four':  'أتمتة متابعة العملاء المحتملين',
    'plans.pulse.five':  'تقارير أداء دورية',
    'plans.nova.one':    'كل مميزات Pulse',
    'plans.nova.two':    'متجر إلكتروني كامل بسلة وشراء',
    'plans.nova.three':  'بوابة دفع Moyasar باسم متجرك',
    'plans.nova.four':   'تطبيق PWA يعمل بدون متاجر التطبيقات',
    'plans.nova.five':   'إدارة المنتجات والطلبات',
    'plans.zenith.one':  'حل مخصص بالكامل حسب مشروعك',
    'plans.zenith.two':  'تنفيذ وإشراف مباشر خطوة بخطوة',
    'plans.zenith.three':'تكاملات وأنظمة متقدمة',
    'plans.zenith.four': 'أولوية قصوى في الدعم',
    'plans.zenith.five': 'اتفاقية مستوى خدمة (SLA)',
    'ai.title':   '🤖 تحليل مشروعك بالذكاء الاصطناعي',
    'ai.sub':     'أخبرنا عن مشروعك وسنرشّدك إلى أنسب باقة وخطة عمل فورية',
    'ai.btn':     '✦ تحليل المشروع',
    'clients.label':      'شركاؤنا',
    'footer.title':       'هل أنت مستعد للانطلاق مع Caminotich؟',
    'footer.description': 'ابدأ استراتيجية رقمية جديدة مع فريق متخصص في التحول الرقمي والتجربة المتميزة.',
    'footer.cta':         'ابدأ الآن',
    'subfooter.about':    'من نحن ورؤيتنا',
    'subfooter.policy':   'السياسات',
    'subfooter.privacy':  'الخصوصية',
    'subfooter.contact':  'جهات التواصل',
    'subfooter.support':  'الدعم',
    'subfooter.cr':       'السجل التجاري الموحد',
    'subfooter.vision':   'نفخر بدعم رؤية المملكة 2030',
    'subfooter.follow':   'تابعونا',
    'nav.faq':          'الأسئلة الشائعة',
    'nav.portfolio':    'أعمالنا',
    'portfolio.title':  'أعمالنا',
    'portfolio.description': 'مواقع حقيقية بُنيت بالكامل عبر منظومتنا الذكية — كل مشروع يمثل باقة مختلفة. اضغط لتصفح أي موقع مباشرة.',
    'faq.heading':      'أسئلة شائعة عن باقاتنا',
    'faq.description':  'إجابات سريعة تساعدك تختار الباقة الصح',
    'faq.spark.q':  'هل باقة Spark مناسبة لمشروع ناشئ صغير؟',
    'faq.spark.a':  'نعم، Spark مصممة خصيصاً للمشاريع الناشئة والأفراد اللي يحتاجون حضور رقمي احترافي بسرعة وبأقل تكلفة.',
    'faq.glow.q':   'وش يميز Glow عن Spark؟',
    'faq.glow.a':   'Glow تضيف مساعد واتساب ذكي وأتمتة مبيعات وربط CRM متقدم — مناسبة لما يبدأ نشاطك يكبر ويحتاج أتمتة فعلية.',
    'faq.pulse.q':  'ليش Pulse هي الأكثر طلباً؟',
    'faq.pulse.a':  'لأنها توازن مثالي بين السعر والمزايا: تطبيق ويب متكامل، لوحة تحكم متقدمة، وتكامل بوابة دفع — تغطي أغلب احتياجات الأعمال المتوسطة.',
    'faq.nova.q':   'هل Nova تدعم أكثر من مستخدم؟',
    'faq.nova.a':   'نعم، Nova مبنية لدعم فرق متعددة المستخدمين مع أتمتة AI متقدمة وتكامل مباشر مع أنظمة ERP/CRM الحالية عندك.',
    'faq.zenith.q': 'وش يشمله الدعم غير المحدود في Zenith؟',
    'faq.zenith.a': 'Zenith مخصصة للمؤسسات: مراقبة على مدار الساعة، اتفاقية مستوى خدمة (SLA) مضمونة، وفريق دعم مخصص يستجيب فوراً لأي طارئ.',
    'faq.switch.q': 'أقدر أغيّر باقتي لاحقاً؟',
    'faq.switch.a': 'بالتأكيد، تقدر تترقّى لباقة أعلى في أي وقت، ونحسب الفرق بشكل عادل حسب المدة المتبقية من اشتراكك الحالي.'
  },
  en: {
    'page.title':       'Caminotich | Smart Digital Growth Solutions',
    'header.tagline':   'Leave manual work behind and start investing in your future with <span class="brand-accent">Caminotich</span>',
    'nav.toggle':       'Open menu',
    'nav.services':     'Services',
    'nav.plans':        'Plans',
    'nav.ai':           'AI Analyser',
    'nav.clients':      'Clients',
    'nav.contact':      'Contact',
    'cta.consult':      'Request Consultation',
    'hero.eyebrow':     'Integrated Tech Solutions',
    'hero.title':       'We build smart digital systems <span>that automate your work and accelerate growth.</span>',
    'hero.description': 'From idea to launch and ongoing support, we deliver integrated technical solutions that help you grow and cut costs.',
    'stats.launch':     'Average Launch Time',
    'stats.hours':      ' hours',
    'billing.note':     'USD prices are approximate, for reference only (1 USD = 3.754 SAR). Actual charges are made in Saudi Riyals via the Moyasar gateway.',
    'stats.services':   'Tech Services',
    'stats.support':    'Monitoring & Support',
    'features.heading':     'Our Services',
    'features.description': 'Ten integrated tech services covering your project from setup through daily operation.',
    'features.web.title': 'Web Development',
    'features.web.body':  'Fast, responsive websites built on solid technical foundations and ready for search engines.',
    'features.ecom.title': 'E-Commerce',
    'features.ecom.body':  'Complete stores with Saudi payment gateways, inventory management and shipping integration.',
    'features.mobile.title': 'Mobile Apps',
    'features.mobile.body':  'iOS and Android apps with native Arabic interfaces and stable performance.',
    'features.erp.title': 'ERP / CRM Systems',
    'features.erp.body':  'Systems that run your operations, customers and inventory in one place instead of scattered sheets.',
    'features.ai.title': 'AI Solutions',
    'features.ai.body':  'Smart assistants, data analysis and content generation built into your systems.',
    'features.auto.title': 'Automation',
    'features.auto.body':  'Connecting your tools via Make, Zapier and n8n so repetitive tasks run without manual work.',
    'features.dash.title': 'Dashboards',
    'features.dash.body':  'Live dashboards showing your business performance in clear, decision-ready numbers.',
    'features.brand.title': 'Digital Identity',
    'features.brand.body':  'A logo and full visual identity that looks professional across all your platforms.',
    'features.mkt.title': 'Digital Marketing',
    'features.mkt.body':  'Considered campaigns, SEO and content that attracts real customers.',
    'features.care.title': 'Hosting & Maintenance',
    'features.care.body':  'Secure hosting, backups and regular monitoring that keep your business running.',
    'hero.primary':     'Explore Plans',
    'hero.secondary':   'Contact Us',
    'stats.projects':   'Projects Delivered',
    'stats.partners':   'Growth Partners',
    'stats.satisfaction':'Customer Satisfaction',
    'features.apps.title':     'Integrated Apps',
    'features.apps.body':      'We build digital platforms that connect your operations, unify the customer experience, and support your growth goals.',
    'features.security.title': 'Advanced Security',
    'features.security.body':  'End-to-end protection with secure architecture and strong data privacy to keep your customers\' trust.',
    'features.ux.title':       'Refined User Experience',
    'features.ux.body':        'Professional, clear interfaces that increase engagement, simplify workflows, and strengthen your brand identity.',
    'features.support.title':  'Ongoing Support',
    'features.support.body':   'Daily performance monitoring, regular updates, and technical support services to help you respond fast and keep improving.',
    'plans.heading':     'Flexible Plans for Your Needs',
    'plans.description': 'Choose the right plan for your company\'s growth — from startups to large enterprises.',
    'plans.choose':      'Get Started',
    'plans.pulse.badge': 'Most Popular',
    'plans.spark.one':   'Professional one-page website',
    'plans.spark.two':   'Responsive bilingual design (RTL)',
    'plans.spark.three': 'Contact form with instant notification',
    'plans.spark.four':  'Basic SEO + Google Search Console',
    'plans.spark.five':  'Self-update guide',
    'plans.glow.one':    'Everything in Spark',
    'plans.glow.two':    'Multi-section website (up to 5 pages)',
    'plans.glow.three':  'Brand identity: colours, fonts, logo',
    'plans.glow.four':   'Visitor analytics (Google Analytics)',
    'plans.glow.five':   'Simple system to collect customer data',
    'plans.pulse.one':   'Everything in Glow',
    'plans.pulse.two':   'Professional CRM for customer management',
    'plans.pulse.three': 'Automated WhatsApp welcome bot',
    'plans.pulse.four':  'Lead follow-up automation',
    'plans.pulse.five':  'Periodic performance reports',
    'plans.nova.one':    'Everything in Pulse',
    'plans.nova.two':    'Full online store with cart and checkout',
    'plans.nova.three':  'Moyasar payment gateway in your store name',
    'plans.nova.four':   'PWA app — no app stores needed',
    'plans.nova.five':   'Product and order management',
    'plans.zenith.one':  'Fully custom solution for your project',
    'plans.zenith.two':  'Direct step-by-step execution and oversight',
    'plans.zenith.three':'Advanced integrations and systems',
    'plans.zenith.four': 'Top priority support',
    'plans.zenith.five': 'Service level agreement (SLA)',
    'ai.title':   '🤖 Analyse Your Project with AI',
    'ai.sub':     'Tell us about your project and we\'ll instantly recommend the best package and action plan',
    'ai.btn':     '✦ Analyse Project',
    'clients.label':      'Our Clients',
    'footer.title':       'Ready to Launch with Caminotich?',
    'footer.description': 'Start a new digital strategy with a team specialized in digital transformation and premium experience.',
    'footer.cta':         'Get Started',
    'subfooter.about':    'About & Vision',
    'subfooter.policy':   'Policies',
    'subfooter.privacy':  'Privacy',
    'subfooter.contact':  'Contact Info',
    'subfooter.support':  'Support',
    'subfooter.cr':       'Unified CR No.',
    'subfooter.vision':   'Proud supporter of Saudi Vision 2030',
    'subfooter.follow':   'Follow us',
    'nav.faq':          'FAQ',
    'nav.portfolio':    'Our Work',
    'portfolio.title':  'Our Work',
    'portfolio.description': 'Real websites built end-to-end by our AI pipeline — each project represents a different package. Click to browse any site live.',
    'faq.heading':      'Frequently Asked Questions',
    'faq.description':  'Quick answers to help you pick the right plan',
    'faq.spark.q':  'Is Spark suitable for a small startup project?',
    'faq.spark.a':  'Yes, Spark is designed specifically for startups and individuals who need a professional digital presence quickly and affordably.',
    'faq.glow.q':   'What makes Glow different from Spark?',
    'faq.glow.a':   'Glow adds a smart WhatsApp assistant, sales automation, and advanced CRM integration — ideal once your business starts growing and needs real automation.',
    'faq.pulse.q':  'Why is Pulse the most popular plan?',
    'faq.pulse.a':  'It strikes the perfect balance between price and features: a full web application, advanced dashboard, and payment gateway integration — covering most mid-sized business needs.',
    'faq.nova.q':   'Does Nova support multiple users?',
    'faq.nova.a':   'Yes, Nova is built for multi-user teams with advanced AI automation and direct integration with your existing ERP/CRM systems.',
    'faq.zenith.q': 'What does unlimited support in Zenith include?',
    'faq.zenith.a': 'Zenith is built for enterprises: 24/7 monitoring, a guaranteed Service Level Agreement (SLA), and a dedicated support team that responds instantly to any issue.',
    'faq.switch.q': 'Can I change my plan later?',
    'faq.switch.a': 'Absolutely, you can upgrade to a higher plan anytime, and we calculate the difference fairly based on the remaining time on your current subscription.'
  }
};

// ─── Currency ─────────────────────────────────────────────────
const CURRENCY_LABELS = {
  ar: { sar: '· دفعة واحدة', usd: '· دفعة واحدة (تقريبي)' },
  en: { sar: '· one-time',    usd: '· one-time (approx.)'   }
};

// ─── State ────────────────────────────────────────────────────
const state = {
  lang:     localStorage.getItem('caminotich-lang')     || 'ar',
  currency: localStorage.getItem('caminotich-currency') || 'sar'
};

const RATE_USD = 3.754;   // ريال لكل دولار — العرض فقط، التحصيل دائماً بالريال
function formatPrice(value, currency) {
  const v = currency === 'usd' ? value / RATE_USD : value;
  const n = new Intl.NumberFormat('en-US', {   // أرقام لاتينية في اللغتين — توحيد العرض المالي
    minimumFractionDigits: currency === 'usd' ? 2 : 0,
    maximumFractionDigits: 2
  }).format(v);
  return currency === 'usd' ? `$ ${n}` : (state.lang === 'en' ? `SAR ${n}` : `${n} ريال`);
}

// ─── Translate DOM ────────────────────────────────────────────
function translateDOM(lang) {
  const dict = T[lang] || T['ar'];

  // [data-i18n] — نص عادي أو HTML
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = dict[key];
    if (val === undefined) return;
    const useHTML = el.dataset.i18nHtml === 'true'
                 || key === 'hero.title'
                 || key === 'header.tagline';
    if (useHTML) el.innerHTML = val;
    else         el.textContent = val;
  });

  // aria-labels
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const val = dict[el.dataset.i18nAriaLabel];
    if (val) el.setAttribute('aria-label', val);
  });

  // currency labels
  document.querySelectorAll('[data-currency-label]').forEach(el => {
    el.textContent = CURRENCY_LABELS[lang]?.[state.currency] || '';
  });

  // prices
  document.querySelectorAll('[data-price]').forEach(el => {
    el.textContent = formatPrice(Number(el.dataset.price), state.currency);
  });

  // form links
  document.querySelectorAll('a[data-form-link]').forEach(a => {
    const base = FORM_LINKS[lang] || FORM_LINKS.ar;
    const pkg  = a.getAttribute('data-package');
    a.href = pkg ? `${base}?package=${encodeURIComponent(pkg)}` : base;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  // page title
  if (dict['page.title']) document.title = dict['page.title'];

  // lang select sync
  if (langSelect) langSelect.value = lang;

  // nav links in separate pages (policies/vision)
  document.querySelectorAll('[data-i18n-href]').forEach(el => {
    const hrefKey = el.dataset.i18nHref;
    if (hrefKey === 'form') el.href = FORM_LINKS[lang];
  });
}

// ─── Social icons SVG ─────────────────────────────────────────
const SOCIAL_ICONS = {
  whatsapp: '<path d="M16 3C9 3 3 9 3 16c0 2.4.7 4.7 1.9 6.6L3 29l6.6-1.8A13 13 0 0 0 16 29c7 0 13-6 13-13S23 3 16 3zm0 23.6c-2.2 0-4.3-.6-6.1-1.7l-.4-.3-4 .9 1-3.9-.3-.4A10.6 10.6 0 0 1 5.4 16c0-5.9 4.8-10.6 10.6-10.6S26.6 10.1 26.6 16 21.9 26.6 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1-.5-2-1.1-2.9-2-.8-.7-1.4-1.6-1.9-2.5-.1-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.1-.7-.1-.2-.7-1.8-1-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3 2.9 1.2 2.9.8 3.4.7.5-.1 1.7-.7 1.9-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.5-.4z"/>',
  x:         '<path d="M23.5 4h3.7l-8 9.2L28 28h-7.3l-5.7-7.5L8.3 28H4.6l8.6-9.8L4 4h7.4l5.2 6.9L23.5 4zm-1.3 21.5h2L9.9 6.4H7.7l14.5 19.1z"/>',
  instagram: '<path d="M16 5c3 0 3.3 0 4.5.1 1.1 0 1.7.2 2.1.4.5.2.9.4 1.3.8.4.4.6.8.8 1.3.2.4.3 1 .4 2.1.1 1.2.1 1.5.1 4.3s0 3.1-.1 4.3c0 1.1-.2 1.7-.4 2.1-.2.5-.4.9-.8 1.3-.4.4-.8.6-1.3.8-.4.2-1 .3-2.1.4-1.2.1-1.5.1-4.5.1s-3.3 0-4.5-.1c-1.1 0-1.7-.2-2.1-.4-.5-.2-.9-.4-1.3-.8-.4-.4-.6-.8-.8-1.3-.2-.4-.3-1-.4-2.1C6.8 17.1 6.8 16.8 6.8 14s0-3.1.1-4.3c0-1.1.2-1.7.4-2.1.2-.5.4-.9.8-1.3.4-.4.8-.6 1.3-.8.4-.2 1-.3 2.1-.4C12.7 5 13 5 16 5zm0 2c-2.9 0-3.2 0-4.4.1-.9 0-1.4.2-1.7.3-.4.1-.7.3-1 .6-.3.3-.5.6-.6 1-.1.3-.3.8-.3 1.7C8 11.8 8 12.1 8 15s0 3.2.1 4.4c0 .9.2 1.4.3 1.7.1.4.3.7.6 1 .3.3.6.5 1 .6.3.1.8.3 1.7.3 1.2.1 1.5.1 4.4.1s3.2 0 4.4-.1c.9 0 1.4-.2 1.7-.3.4-.1.7-.3 1-.6.3-.3.5-.6.6-1 .1-.3.3-.8.3-1.7.1-1.2.1-1.5.1-4.4s0-3.2-.1-4.4c0-.9-.2-1.4-.3-1.7-.1-.4-.3-.7-.6-1-.3-.3-.6-.5-1-.6-.3-.1-.8-.3-1.7-.3C19.2 7 18.9 7 16 7zm0 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5.7-3.7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>',
  linkedin:  '<path d="M7.2 9.8h3.8V23H7.2V9.8zM9.1 4.4a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM13.6 9.8h3.6v1.8h.1c.5-.9 1.7-1.9 3.6-1.9 3.9 0 4.6 2.5 4.6 5.8V23h-3.8v-6.6c0-1.6 0-3.6-2.2-3.6-2.2 0-2.5 1.7-2.5 3.5V23h-3.8V9.8z"/>',
  tiktok:    '<path d="M19.5 4h-3.1v15.1c0 1.6-1.3 2.9-2.9 2.9a2.9 2.9 0 0 1 0-5.8c.3 0 .6 0 .9.1V13c-.3 0-.6-.1-.9-.1-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6V11.4c1.2.9 2.7 1.4 4.3 1.4V9.6c-2.4 0-4.3-1.9-4.3-4.3V4z"/>',
  youtube:   '<path d="M27.6 9.3c-.3-1.1-1.1-1.9-2.2-2.2C23.5 6.6 16 6.6 16 6.6s-7.5 0-9.4.5c-1.1.3-1.9 1.1-2.2 2.2C4 11.2 4 15 4 15s0 3.8.4 5.7c.3 1.1 1.1 1.9 2.2 2.2 1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5c1.1-.3 1.9-1.1 2.2-2.2.4-1.9.4-5.7.4-5.7s0-3.8-.4-5.7zM13.6 18.6v-7.2l6.2 3.6-6.2 3.6z"/>' 
};

// ─── Build subfooter ──────────────────────────────────────────
function buildSubFooter(lang) {
  const old = document.getElementById('caminotich-subfooter');
  if (old) old.remove();

  const dict = T[lang] || T['ar'];
  const isAr = lang === 'ar';
  const CR   = '7054770941';
  const year = new Date().getFullYear();

  const navItems = [
    { key: 'subfooter.about',   href: 'vision.html'   },
    { key: 'subfooter.policy',  href: 'policies.html'  },
    { key: 'subfooter.privacy', href: 'privacy.html'   },
    { key: 'subfooter.contact', href: '#contact'        },
    { key: 'subfooter.support', href: 'support.html'    }
  ];

  const sf = document.createElement('div');
  sf.id = 'caminotich-subfooter';
  sf.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  sf.style.cssText = [
    'margin-top:0','padding:28px 34px 24px',
    'background:rgba(2,5,18,0.98)',
    'border-top:1px solid rgba(255,255,255,0.06)',
    'font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif'
  ].join(';');

  // nav row
  const navRow = document.createElement('div');
  navRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:20px';
  navItems.forEach(({ key, href }) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = dict[key] || key;
    a.style.cssText = 'color:rgba(255,255,255,0.45);font-size:0.82rem;text-decoration:none;padding:6px 16px;border:1px solid rgba(255,255,255,0.08);border-radius:999px;transition:all 0.2s;white-space:nowrap';
    a.onmouseover = () => { a.style.color='#5cf0ff'; a.style.borderColor='rgba(92,240,255,0.3)'; };
    a.onmouseout  = () => { a.style.color='rgba(255,255,255,0.45)'; a.style.borderColor='rgba(255,255,255,0.08)'; };
    navRow.appendChild(a);
  });

  // divider
  const divider = document.createElement('div');
  divider.style.cssText = 'height:1px;background:rgba(255,255,255,0.05);margin-bottom:20px';

  // bottom row
  const botRow = document.createElement('div');
  botRow.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px';

  // CR number
  const crDiv = document.createElement('div');
  crDiv.style.cssText = 'display:flex;align-items:center;gap:8px';
  const crLbl = document.createElement('span');
  crLbl.textContent = (dict['subfooter.cr'] || 'CR') + ':';
  crLbl.style.cssText = 'color:rgba(255,255,255,0.25);font-size:0.75rem';
  const crVal = document.createElement('span');
  crVal.textContent = CR;
  crVal.style.cssText = 'color:rgba(92,240,255,0.7);font-size:0.82rem;font-weight:600;letter-spacing:0.06em;font-family:monospace';
  crDiv.append(crLbl, crVal);

  // contact email
  const mailDiv = document.createElement('div');
  mailDiv.style.cssText = 'display:flex;align-items:center;gap:8px';
  const mailLbl = document.createElement('span');
  mailLbl.textContent = (dict['subfooter.contact'] || 'Contact') + ':';
  mailLbl.style.cssText = 'color:rgba(255,255,255,0.25);font-size:0.75rem';
  const mailA = document.createElement('a');
  mailA.href = 'mailto:info@caminotich.sa';
  mailA.textContent = 'info@caminotich.sa';
  mailA.style.cssText = 'color:rgba(92,240,255,0.7);font-size:0.82rem;font-weight:600;text-decoration:none;font-family:monospace';
  mailA.onmouseover = () => { mailA.style.color = '#5cf0ff'; };
  mailA.onmouseout  = () => { mailA.style.color = 'rgba(92,240,255,0.7)'; };
  mailDiv.append(mailLbl, mailA);

  // social icons
  const socRow = document.createElement('div');
  socRow.style.cssText = 'display:flex;align-items:center;gap:10px';
  const socLbl = document.createElement('span');
  socLbl.textContent = dict['subfooter.follow'] || '';
  socLbl.style.cssText = 'color:rgba(255,255,255,0.3);font-size:0.75rem';
  socRow.appendChild(socLbl);
  Object.entries(SOCIAL_LINKS).forEach(([key, url]) => {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.5);transition:all 0.2s;flex-shrink:0';
    a.innerHTML = `<svg width="15" height="15" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${SOCIAL_ICONS[key]||''}</svg>`;
    a.onmouseover = () => { a.style.color='#5cf0ff'; a.style.borderColor='rgba(92,240,255,0.35)'; };
    a.onmouseout  = () => { a.style.color='rgba(255,255,255,0.5)'; a.style.borderColor='rgba(255,255,255,0.1)'; };
    socRow.appendChild(a);
  });

  // Vision 2030
  const visDiv = document.createElement('div');
  visDiv.style.cssText = 'display:flex;align-items:center;gap:10px';
  const visLbl = document.createElement('span');
  visLbl.textContent = dict['subfooter.vision'] || '';
  visLbl.style.cssText = 'color:rgba(255,255,255,0.3);font-size:0.75rem';
  const visImg = document.createElement('img');
  visImg.src = 'assets/vision2030.png';
  visImg.alt = isAr ? 'رؤية 2030' : 'Vision 2030';
  visImg.style.cssText = 'height:40px;opacity:0.85;flex-shrink:0;object-fit:contain';
  visImg.onerror = function() { this.style.display = 'none'; };
  visDiv.append(visLbl, visImg);

  /* ═══ شعار المركز السعودي للأعمال ═══
     ⚠️ لا يُعرض إلا بعد صدور التوثيق الفعلي — عرضه قبل ذلك ادعاء اعتماد غير قائم.
     للتفعيل: غيّري القيمة أدناه إلى true فقط. */
  const SBC_VERIFIED = false;

  const sbcDiv = document.createElement('div');
  sbcDiv.style.cssText = 'display:flex;align-items:center;gap:10px';
  if (SBC_VERIFIED) {
    const sbcImg = document.createElement('img');
    sbcImg.src = 'assets/Saudi%20Business%20Center%20Logo%20-%20PNG%20-%20SVG.png';
    sbcImg.alt = isAr ? 'المركز السعودي للأعمال' : 'Saudi Business Center';
    sbcImg.style.cssText = 'height:40px;opacity:0.85;flex-shrink:0;object-fit:contain';
    sbcImg.onerror = function () { this.style.display = 'none'; };
    sbcDiv.appendChild(sbcImg);
  }

  botRow.append(crDiv, mailDiv, socRow, visDiv, sbcDiv);

  // copyright
  const copy = document.createElement('p');
  copy.style.cssText = 'text-align:center;color:rgba(255,255,255,0.2);font-size:0.72rem;margin:18px 0 0;letter-spacing:0.04em';
  copy.textContent = `© ${year} Caminotich Digital Solutions. ${isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}`;

  sf.append(navRow, divider, botRow, copy);

  const shell = document.querySelector('.page-shell');
  if (shell) shell.appendChild(sf);
}

// ─── applyLanguage — المحور الرئيسي ──────────────────────────
function applyLanguage(lang) {
  if (!T[lang]) lang = 'ar';

  state.lang = lang;

  // 1) اتجاه الصفحة ولغتها
  html.setAttribute('lang', lang);
  html.setAttribute('dir',  lang === 'en' ? 'ltr' : 'rtl');

  // 2) ترجمة كل عناصر DOM
  translateDOM(lang);

  // 3) إعادة بناء الفوتر الفرعي
  buildSubFooter(lang);

  // 4) حفظ التفضيل
  localStorage.setItem('caminotich-lang', lang);

  // 5) إشعار صفحات السياسات والرؤية
  if (typeof window.onPageLanguageChange === 'function') {
    window.onPageLanguageChange(lang);
  }
}

// ─── Events ───────────────────────────────────────────────────
navToggle?.addEventListener('click', () => {
  document.body.classList.toggle('mobile-nav-open');
});

document.querySelectorAll('.main-nav a').forEach(a => {
  a.addEventListener('click', () => {
    document.body.classList.remove('mobile-nav-open');
  });
});

langSelect?.addEventListener('change', () => {
  applyLanguage(langSelect.value);
});

// ─── مبدّل العملة (عرض فقط — التحصيل بالريال دائماً) ──────────
const curSelect = document.querySelector('[data-currency-select]');
function applyCurrency(cur) {
  state.currency = cur === 'usd' ? 'usd' : 'sar';
  localStorage.setItem('caminotich-currency', state.currency);
  translateDOM(state.lang);
  const note = document.querySelector('[data-billing-note]');
  if (note) note.style.display = state.currency === 'usd' ? 'block' : 'none';
  if (typeof window.applyPackageMaint === 'function') window.applyPackageMaint();
}
if (curSelect) {
  curSelect.value = state.currency;
  curSelect.addEventListener('change', () => applyCurrency(curSelect.value));
}

// ─── Boot ─────────────────────────────────────────────────────
applyLanguage(state.lang);
applyCurrency(state.currency);
