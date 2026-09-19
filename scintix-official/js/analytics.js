/* Caminotich GA4 measurement layer. Never send form fields or personal data. */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-2BM3RDE6XC';
  var CAMPAIGN_KEY = 'caminotich_campaign';
  var params = new URLSearchParams(window.location.search);
  var campaign = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
    var value = params.get(key);
    if (value) campaign[key] = value.slice(0, 100);
  });

  if (Object.keys(campaign).length) {
    try { sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign)); } catch (_) {}
  } else {
    try { campaign = JSON.parse(sessionStorage.getItem(CAMPAIGN_KEY) || '{}'); } catch (_) { campaign = {}; }
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    send_page_view: true
  });

  var loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(loader);

  function safe(value) {
    return String(value == null ? '' : value).trim().slice(0, 100);
  }

  function context(extra) {
    return Object.assign({
      page_language: document.documentElement.lang || 'ar',
      page_path: window.location.pathname,
      campaign_source: campaign.utm_source || '',
      campaign_medium: campaign.utm_medium || '',
      campaign_name: campaign.utm_campaign || '',
      campaign_content: campaign.utm_content || ''
    }, extra || {});
  }

  function track(name, details) {
    if (!name) return;
    window.gtag('event', name, context(details));
  }

  window.CaminotichAnalytics = { track: track, measurementId: MEASUREMENT_ID };

  function linkLabel(link) {
    return safe(link.dataset.analyticsLabel || link.getAttribute('aria-label') || link.textContent);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a,button');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var label = linkLabel(link);

    if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) {
      track('whatsapp_click', { cta_label: label, cta_location: safe(link.closest('header,main,footer,section')?.id || link.closest('header,footer')?.tagName || 'page') });
    } else if (/^mailto:/i.test(href)) {
      track('email_click', { cta_label: label });
    } else if (/^tel:/i.test(href)) {
      track('phone_click', { cta_label: label });
    }

    if (link.matches('[data-form-link]')) {
      track('consultation_start', { package_name: safe(link.dataset.package || params.get('pkg') || 'unspecified'), cta_label: label });
    }
    if (link.dataset.package) {
      track('package_click', { package_name: safe(link.dataset.package), cta_label: label });
    }
    if (/wasalt\.html|#school-request/i.test(href)) {
      track('wasalt_cta_click', { cta_label: label });
    }
    if (/\/demos\//i.test(href) || params.get('theme') || /theme=/i.test(href)) {
      var theme = safe(new URL(href, window.location.href).searchParams.get('theme') || link.closest('.card')?.querySelector('.theme-id')?.textContent || 'preview');
      track('theme_view', { theme_id: theme, cta_label: label });
    }
  });

  document.addEventListener('focusin', function (event) {
    var form = event.target.closest('form');
    if (!form || form.dataset.analyticsStarted) return;
    form.dataset.analyticsStarted = '1';
    track('form_start', { form_name: safe(form.id || form.getAttribute('name') || 'form') });
  });

  document.addEventListener('change', function (event) {
    if (event.target.matches('[data-lang-select],#langToggle,#langBtn,.lang')) {
      track('language_change', { selected_language: safe(event.target.value || document.documentElement.lang) });
    }
  });

  if (/\/wasalt(?:\.html)?\/?$/i.test(window.location.pathname)) track('wasalt_view');
  if (/\/themes(?:\.html)?\/?$/i.test(window.location.pathname)) track('themes_catalog_view');
  if (/\/analyse(?:\.html)?\/?$/i.test(window.location.pathname)) track('project_analysis_view');
})();
