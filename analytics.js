/* The Skill Mill pageview analytics.
 * Measurement ID source: C:/Users/ckame/agent-org/shared/dashboard/_inflationgone_runner/.env
 * Installed 2026-05-25 so UTM traffic to theskillmillbooks.com is measurable.
 */
(function () {
  'use strict';

  var measurementId = 'G-Y5E3HHYPLZ';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(script);
})();
