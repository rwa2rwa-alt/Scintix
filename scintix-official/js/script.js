/* ═══════════════════════════════════════════════════════════════
   Scintix Digital Solutions — script.js
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
  x:         'https://x.com/scintix',
  instagram: 'https://instagram.com/scintix',
  linkedin:  'https://linkedin.com/company/scintix',
  tiktok:    'https://tiktok.com/@scintix'
};

// ─── Translations ─────────────────────────────────────────────
const T = {
  ar: {
    'page.title':       'Scintix | حلول ذكية للنمو الرقمي',
    'header.tagline':   'ودع العمل اليدوي وإبدأ استثمارك في المستقبل مع <span class="brand-accent">Scintix</span>',
    'nav.toggle':       'فتح القائمة',
    'nav.services':     'الخدمات',
    'nav.plans':        'الباقات',
    'nav.ai':           'الذكاء الاصطناعي',
    'nav.clients':      'شركاؤنا',
    'nav.contact':      'اتصل بنا',
    'cta.consult':      'اطلب استشارة',
    'hero.eyebrow':     'حلول تقنية متكاملة',
    'hero.title':       'حلول ذكية. آمنة. <span>نمو مستدام.</span>',
    'hero.description': 'نحو تجربة رقمية متكاملة، نربط بين الاستراتيجية والتقنية والتصميم لمنتجات تلائم السوق والمستخدم وتسرع نمو أعمالك.',
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
    'plans.spark.one':   'نماذج رقمية احترافية',
    'plans.spark.two':   'صفحة هبوط ذكية',
    'plans.spark.three': 'ربط CRM أساسي',
    'plans.spark.four':  'دعم تقني أساسي',
    'plans.spark.five':  'تحليلات بسيطة',
    'plans.glow.one':    'كل خدمات Spark',
    'plans.glow.two':    'مساعد واتساب ذكي',
    'plans.glow.three':  'أتمتة المبيعات',
    'plans.glow.four':   'ربط CRM متقدم',
    'plans.glow.five':   'إشعارات تلقائية',
    'plans.pulse.one':   'كل خدمات Glow',
    'plans.pulse.two':   'تطبيق ويب متكامل',
    'plans.pulse.three': 'لوحة تحكم متقدمة',
    'plans.pulse.four':  'تكامل بوابة دفع',
    'plans.pulse.five':  'تقارير أداء متقدمة',
    'plans.nova.one':    'كل خدمات Pulse',
    'plans.nova.two':    'أتمتة متقدمة AI',
    'plans.nova.three':  'متعدد المستخدمين',
    'plans.nova.four':   'تكامل ERP / CRM',
    'plans.nova.five':   'دعم فني مخصص',
    'plans.zenith.one':  'حلول مؤسسية كاملة',
    'plans.zenith.two':  'تكامل كامل مع الأنظمة',
    'plans.zenith.three':'مراقبة 24/7',
    'plans.zenith.four': 'SLA مضمون',
    'plans.zenith.five': 'دعم غير محدود',
    'ai.title':   '🤖 تحليل مشروعك بالذكاء الاصطناعي',
    'ai.sub':     'أخبرنا عن مشروعك وسنرشّدك إلى أنسب باقة وخطة عمل فورية',
    'ai.btn':     '✦ تحليل المشروع',
    'clients.label':      'شركاؤنا',
    'footer.title':       'هل أنت مستعد للانطلاق مع Scintix؟',
    'footer.description': 'ابدأ استراتيجية رقمية جديدة مع فريق متخصص في التحول الرقمي والتجربة المتميزة.',
    'footer.cta':         'ابدأ الآن',
    'subfooter.about':    'من نحن ورؤيتنا',
    'subfooter.policy':   'السياسات',
    'subfooter.contact':  'جهات التواصل',
    'subfooter.support':  'الدعم',
    'subfooter.cr':       'السجل التجاري',
    'subfooter.vision':   'نفخر بدعم رؤية المملكة 2030',
    'subfooter.follow':   'تابعونا',
    'nav.faq':          'الأسئلة الشائعة',
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
    'page.title':       'Scintix | Smart Digital Growth Solutions',
    'header.tagline':   'Leave manual work behind and start investing in your future with <span class="brand-accent">Scintix</span>',
    'nav.toggle':       'Open menu',
    'nav.services':     'Services',
    'nav.plans':        'Plans',
    'nav.ai':           'AI Analyser',
    'nav.clients':      'Clients',
    'nav.contact':      'Contact',
    'cta.consult':      'Request Consultation',
    'hero.eyebrow':     'Integrated Tech Solutions',
    'hero.title':       'Smart. Secure. <span>Sustainable Growth.</span>',
    'hero.description': 'A complete digital experience connecting strategy, technology, and design — products that fit your market and accelerate your business growth.',
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
    'plans.spark.one':   'Professional digital forms',
    'plans.spark.two':   'Smart landing page',
    'plans.spark.three': 'Basic CRM integration',
    'plans.spark.four':  'Basic technical support',
    'plans.spark.five':  'Simple analytics',
    'plans.glow.one':    'Everything in Spark',
    'plans.glow.two':    'Smart WhatsApp assistant',
    'plans.glow.three':  'Sales automation',
    'plans.glow.four':   'Advanced CRM integration',
    'plans.glow.five':   'Automated notifications',
    'plans.pulse.one':   'Everything in Glow',
    'plans.pulse.two':   'Full web application',
    'plans.pulse.three': 'Advanced dashboard',
    'plans.pulse.four':  'Payment gateway integration',
    'plans.pulse.five':  'Advanced performance reports',
    'plans.nova.one':    'Everything in Pulse',
    'plans.nova.two':    'Advanced AI automation',
    'plans.nova.three':  'Multi-user access',
    'plans.nova.four':   'ERP / CRM integration',
    'plans.nova.five':   'Dedicated technical support',
    'plans.zenith.one':  'Full enterprise solutions',
    'plans.zenith.two':  'Complete system integration',
    'plans.zenith.three':'24/7 monitoring',
    'plans.zenith.four': 'Guaranteed SLA',
    'plans.zenith.five': 'Unlimited support',
    'ai.title':   '🤖 Analyse Your Project with AI',
    'ai.sub':     'Tell us about your project and we\'ll instantly recommend the best package and action plan',
    'ai.btn':     '✦ Analyse Project',
    'clients.label':      'Our Clients',
    'footer.title':       'Ready to Launch with Scintix?',
    'footer.description': 'Start a new digital strategy with a team specialized in digital transformation and premium experience.',
    'footer.cta':         'Get Started',
    'subfooter.about':    'About & Vision',
    'subfooter.policy':   'Policies',
    'subfooter.contact':  'Contact Info',
    'subfooter.support':  'Support',
    'subfooter.cr':       'Commercial Registration',
    'subfooter.vision':   'Proud supporter of Saudi Vision 2030',
    'subfooter.follow':   'Follow us',
    'nav.faq':          'FAQ',
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
  ar: { sar: 'SAR / شهرياً', usd: '$ / month' },
  en: { sar: 'SAR / month',  usd: '$ / month'  }
};

// ─── State ────────────────────────────────────────────────────
const state = {
  lang:     localStorage.getItem('scintix-lang')     || 'ar',
  currency: localStorage.getItem('scintix-currency') || 'sar'
};

function formatPrice(value, currency) {
  const v = currency === 'usd' ? value / 3.75 : value;
  const n = new Intl.NumberFormat(state.lang === 'en' ? 'en-US' : 'ar-SA', {
    minimumFractionDigits: currency === 'usd' ? 2 : 0,
    maximumFractionDigits: 2
  }).format(v);
  return currency === 'usd' ? `$ ${n}` : `SAR ${n}`;
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
    a.href = FORM_LINKS[lang] || FORM_LINKS.ar;
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
  tiktok:    '<path d="M19.5 4h-3.1v15.1c0 1.6-1.3 2.9-2.9 2.9a2.9 2.9 0 0 1 0-5.8c.3 0 .6 0 .9.1V13c-.3 0-.6-.1-.9-.1-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6V11.4c1.2.9 2.7 1.4 4.3 1.4V9.6c-2.4 0-4.3-1.9-4.3-4.3V4z"/>'
};

// ─── Build subfooter ──────────────────────────────────────────
function buildSubFooter(lang) {
  const old = document.getElementById('scintix-subfooter');
  if (old) old.remove();

  const dict = T[lang] || T['ar'];
  const isAr = lang === 'ar';
  const CR   = '1234567890'; // ← غيّريه برقم سجلك الفعلي
  const year = new Date().getFullYear();

  const navItems = [
    { key: 'subfooter.about',   href: 'vision.html'   },
    { key: 'subfooter.policy',  href: 'policies.html'  },
    { key: 'subfooter.contact', href: '#contact'        },
    { key: 'subfooter.support', href: 'support.html'    }
  ];

  const sf = document.createElement('div');
  sf.id = 'scintix-subfooter';
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

  botRow.append(crDiv, socRow, visDiv);

  // copyright
  const copy = document.createElement('p');
  copy.style.cssText = 'text-align:center;color:rgba(255,255,255,0.2);font-size:0.72rem;margin:18px 0 0;letter-spacing:0.04em';
  copy.textContent = `© ${year} Scintix Digital Solutions. ${isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}`;

  sf.append(navRow, divider, botRow, copy);

  const shell = document.querySelector('.page-shell');
  if (shell) shell.appendChild(sf);
}

// ─── applyLanguage — المحور الرئيسي ──────────────────────────
function applyLanguage(lang) {
  if (!T[lang]) lang = 'ar';

  state.lang     = lang;
  state.currency = lang === 'en' ? 'usd' : 'sar';

  // 1) اتجاه الصفحة ولغتها
  html.setAttribute('lang', lang);
  html.setAttribute('dir',  lang === 'en' ? 'ltr' : 'rtl');

  // 2) ترجمة كل عناصر DOM
  translateDOM(lang);

  // 3) إعادة بناء الفوتر الفرعي
  buildSubFooter(lang);

  // 4) حفظ التفضيل
  localStorage.setItem('scintix-lang',     lang);
  localStorage.setItem('scintix-currency', state.currency);

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

// ─── Boot ─────────────────────────────────────────────────────
applyLanguage(state.lang);
