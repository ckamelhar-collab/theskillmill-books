/* attribution.js — UTM capture + MailerLite hidden-field injection
 * Spec: agent-org/standards/utm-tagging-standard-2026-05-03.md
 *
 * On page load:
 *   1. Read utm_* params from URL.
 *   2. Persist to sessionStorage (this-visit) and localStorage (first-touch, sticky).
 *   3. Use MutationObserver to wait for MailerLite's Universal form to render
 *      inside .ml-embedded, then inject 5 hidden inputs (fields[utm_*]) into
 *      the form so MailerLite captures them as custom-field values per
 *      subscriber.
 *
 * MailerLite custom fields (utm_source, utm_medium, utm_campaign, utm_content,
 * utm_term) MUST exist in the account; create via
 * agent-org/scripts/mailerlite-create-utm-fields.js (already done 2026-05-03).
 */
(function () {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var SS_KEY = 'tsm_utm_session_v1';
  var LS_KEY = 'tsm_utm_first_touch_v1';

  function readFromURL() {
    try {
      var p = new URLSearchParams(window.location.search);
      var out = {};
      var any = false;
      UTM_KEYS.forEach(function (k) {
        var v = p.get(k);
        if (v != null && v !== '') { out[k] = v; any = true; }
      });
      return any ? out : null;
    } catch (e) { return null; }
  }

  function readStored(storage, key) {
    try {
      var raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeStored(storage, key, val) {
    try { storage.setItem(key, JSON.stringify(val)); } catch (e) { /* quota or disabled */ }
  }

  // 1) Resolve the UTM set we'll inject.
  // Priority: current URL > sessionStorage > localStorage (first-touch).
  // First-touch persists across page navigations — if a user clicks a Publer
  // link, browses around, then submits, we still attribute to Publer.
  var fromUrl = readFromURL();
  if (fromUrl) {
    writeStored(window.sessionStorage, SS_KEY, fromUrl);
    if (!readStored(window.localStorage, LS_KEY)) {
      writeStored(window.localStorage, LS_KEY, fromUrl);
    }
  }
  var current = fromUrl
    || readStored(window.sessionStorage, SS_KEY)
    || readStored(window.localStorage, LS_KEY)
    || {};

  // Default utm_content if any UTM was set without content (per standard).
  if (Object.keys(current).length > 0 && !current.utm_content) {
    current.utm_content = 'default';
  }

  // 2) Inject hidden fields into MailerLite's rendered form.
  // MailerLite Universal replaces .ml-embedded with a real <form>. We can't
  // hook submit directly, but we can ensure inputs exist on the form before
  // submission. Re-inject on every DOM mutation in case MailerLite re-renders
  // (e.g., after validation error).
  function ensureHiddenFields(form) {
    UTM_KEYS.forEach(function (k) {
      var name = 'fields[' + k + ']';
      var existing = form.querySelector('input[name="' + name + '"]');
      var val = current[k] || '';
      if (existing) {
        // Only overwrite if MailerLite's value is empty; preserve user-typed values
        if (!existing.value) existing.value = val;
        return;
      }
      var inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = name;
      inp.value = val;
      inp.setAttribute('data-utm-injected', '1');
      form.appendChild(inp);
    });
  }

  function tryInject() {
    var injected = 0;
    document.querySelectorAll('.ml-embedded form, form.ml-block-form').forEach(function (f) {
      ensureHiddenFields(f);
      injected++;
    });
    return injected;
  }

  // Try once if DOM is already loaded; otherwise wait for it.
  function start() {
    tryInject();
    var obs = new MutationObserver(function () { tryInject(); });
    obs.observe(document.body, { childList: true, subtree: true });
    // Hard cap on the observer — stop after 60s. MailerLite renders within
    // a couple seconds; longer means script blocked or no embed on page.
    setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Expose for debugging / Playwright probes.
  window.__tsmAttribution = {
    current: current,
    fromUrl: fromUrl,
    keys: UTM_KEYS.slice(),
    forceInject: tryInject
  };
})();
