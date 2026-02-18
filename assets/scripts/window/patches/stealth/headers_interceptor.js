/**
 * headers_interceptor.js
 *
 * Патчит fetch и XHR, инжектируя заголовки по профилю.
 * Важно:
 *  - API экспортируется ВСЕГДА: window.HeadersInterceptor = { ... }
 *  - Патч сети применяется ТОЛЬКО когда готовы зависимости (CanvasPatchContext + window.__HEADERS__)
 *  - Повторный вызов HeadersInterceptor(window) безопасен (idempotent guard)
 */

const HeadersInterceptor = function HeadersInterceptor(window) {
  'use strict';
  const LOG_PREFIX = '[headers_interceptor.js]';
  const DEBUG = !!window.__HEADERS_DEBUG__;

  // --------------------------- У Т И Л И Т Ы -----------------------------
  const ORIGIN = window.location.origin;

  function dlog() {
    if (DEBUG) console.debug.apply(console, [LOG_PREFIX].concat([].slice.call(arguments)));
  }

  function emitDegrade(level, code, err, extra) {
    const d = window.__DEGRADE__;
    if (typeof d !== 'function') return;
    const e = err instanceof Error
      ? err
      : (err == null ? null : new Error(String(err)));
    const ctx = Object.assign({
      type: 'browser structure missing data',
      stage: 'apply',
      module: 'headers_interceptor',
      surface: 'network',
      key: null,
      policy: 'skip',
      action: 'native'
    }, extra || null);
    if (typeof d.diag === 'function') {
      d.diag(level, code, ctx, e);
      return;
    }
    d(code, e, ctx);
  }

  /** Безопасный разбор URL c базой location.href */
  function toURLLike(input) {
    try {
      if (input instanceof URL) return input;
      if (typeof input === 'string') return new URL(input, window.location.href);
      if (input && typeof input.url === 'string') return new URL(input.url, window.location.href);
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:url:preflight:parse_failed', e, {
        stage: 'preflight',
        surface: 'toURLLike',
        key: 'url'
      });
    }
    return null;
  }

  function getHost(input) {
    const u = toURLLike(input);
    return u ? u.hostname.toLowerCase() : '';
  }

  function getOrigin(input) {
    const u = toURLLike(input);
    return u ? u.origin : '';
  }

  function isSameOrigin(input) {
    return getOrigin(input) === ORIGIN;
  }

  /** Сопоставление по суффиксу домена с учётом границы точки */
  function hostMatchesSuffix(host, suffix) {
    if (!host || !suffix) return false;
    const h = host.toLowerCase();
    let s = suffix.toLowerCase();
    if (s[0] !== '.') s = `.${s}`;
    return h === s.slice(1) || h.endsWith(s);
  }

  // --- Heuristic: определяем ресурс, который нельзя трогать (иначе риск taint/ломаем цвета)
  function isLikelyImageURL(u) {
    try {
      const url = (u instanceof URL) ? u
        : (typeof u === 'string') ? new URL(u, window.location.href)
        : (u && typeof u.url === 'string') ? new URL(u.url, window.location.href)
        : null;
      if (!url) return false;
      const p = url.pathname.toLowerCase();
      return /\.(png|jpe?g|webp|gif|avif|bmp|ico|svg)$/.test(p);
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:url:preflight:image_probe_failed', e, {
        stage: 'preflight',
        surface: 'isLikelyImageURL',
        key: 'url'
      });
      return false;
    }
  }

  function isLikelyFontURL(u) {
    try {
      const url = (u instanceof URL) ? u
        : (typeof u === 'string') ? new URL(u, window.location.href)
        : (u && typeof u.url === 'string') ? new URL(u.url, window.location.href)
        : null;
      if (!url) return false;
      const p = url.pathname.toLowerCase();
      return /\.(woff2|woff|ttf|otf|eot)$/.test(p);
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:url:preflight:font_probe_failed', e, {
        stage: 'preflight',
        surface: 'isLikelyFontURL',
        key: 'url'
      });
      return false;
    }
  }

  function isLikelyMediaURL(u) {
    try {
      const url = (u instanceof URL) ? u
        : (typeof u === 'string') ? new URL(u, window.location.href)
        : (u && typeof u.url === 'string') ? new URL(u.url, window.location.href)
        : null;
      if (!url) return false;
      const p = url.pathname.toLowerCase();
      return /\.(mp4|webm|ogg|mp3|wav|m4a)$/.test(p);
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:url:preflight:media_probe_failed', e, {
        stage: 'preflight',
        surface: 'isLikelyMediaURL',
        key: 'url'
      });
      return false;
    }
  }

  function isImageFontMediaRequest(req, targetURL) {
    try {
      const accept = req && req.headers && req.headers.get ? (req.headers.get('accept') || '') : '';
      if (/\bimage\//i.test(accept) || /\bfont\/|application\/font/i.test(accept) || /\bvideo\/|\baudio\//i.test(accept)) {
        return true;
      }
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:request:preflight:accept_probe_failed', e, {
        stage: 'preflight',
        surface: 'isImageFontMediaRequest',
        key: 'accept'
      });
    }
    return isLikelyImageURL(targetURL || req) || isLikelyFontURL(targetURL || req) || isLikelyMediaURL(targetURL || req);
  }

  // --------------------------- К О Н Ф И Г -------------------------------

  const SAFE_LISTED = new Set([
    'accept-language',
  ]);

  // Эти заголовки допускаем ТОЛЬКО от движка/CDP, не из JS
  const CDP_ONLY = new Set(['accept', 'accept-language']);

  const IGNORED_SUFFIXES = new Set([
    '.google.com', '.yandex.ru', '.github.io', '.gstatic.com', '.chatgpt.com',
    '.facebook.com', '.doubleclick.net', '.apple.com', '.windowsupdate.com',
    '.microsoft.com',
    // Antibot Challenge
    '.cloudflare.com', '.challenge.cloudflare.com', '.challenges.cloudflare.com',
    '.akamaihd.net', '.perimeterx.net',
    '.hcaptcha.com', '.recaptcha.net'
  ]);

  const ALLOW_SUFFIXES = new Set([
    // пусто по умолчанию — управляется через API addAllow()
  ]);

  // --- API (ДОЛЖЕН БЫТЬ ДОСТУПЕН ДАЖЕ ЕСЛИ ПАТЧ ПОКА НЕЛЬЗЯ ПРИМЕНИТЬ) ---
  let headerProfile = 'min';

  function setProfile(name) {
    if (name === 'min' || name === 'default' || name === 'full') {
      headerProfile = name;
      return true;
    }
    emitDegrade('warn', 'headers_interceptor:profile:preflight:unknown', null, {
      stage: 'preflight',
      surface: 'setProfile',
      key: 'profile',
      type: 'pipeline missing data',
      data: { profile: name }
    });
    return false;
  }

  function normSuffix(s) {
    if (!s) return '';
    s = String(s).trim();
    if (!s) return '';
    return s[0] === '.' ? s : '.' + s;
  }

  function addAllow(s) {
    const v = normSuffix(s);
    if (v) ALLOW_SUFFIXES.add(v);
  }

  function addIgnore(s) {
    const v = normSuffix(s);
    if (v) IGNORED_SUFFIXES.add(v);
  }

  function listAllow() {
    return Array.from(ALLOW_SUFFIXES);
  }

  function listIgnore() {
    return Array.from(IGNORED_SUFFIXES);
  }

  window.HeadersInterceptor = {
    setProfile,
    addAllow,
    addIgnore,
    listAllow,
    listIgnore,
  };

  // --------------------------- ГЕЙТ НА ИНИТ -------------------------------

  const C = window.CanvasPatchContext;
  if (!C) {
    emitDegrade('warn', 'headers_interceptor:init:preflight:canvas_context_missing', null, {
      stage: 'preflight',
      surface: 'CanvasPatchContext',
      key: 'CanvasPatchContext',
      type: 'pipeline missing data'
    });
    return; // API уже экспортирован
  }

  const RAW_H = (window.__HEADERS__ && typeof window.__HEADERS__ === 'object') ? window.__HEADERS__ : null;
  if (!RAW_H) {
    emitDegrade('warn', 'headers_interceptor:init:preflight:headers_missing', null, {
      stage: 'preflight',
      surface: '__HEADERS__',
      key: '__HEADERS__',
      type: 'pipeline missing data'
    });
    return; // API уже экспортирован; main.py вызовет HeadersInterceptor(window) повторно после инжекта
  }

  // idempotent guard: допускаем повторный вызов, но патчим сеть только 1 раз
  if (window.__HEADERS_INTERCEPTOR_INSTALLED__) return;
  window.__HEADERS_INTERCEPTOR_INSTALLED__ = true;

  const HEADER_PROFILES = {
    min: [],
    // By default inject nothing from JS — headers come natively through CDP
    default: [],
    // Полный можно включать вручную; Accept/Accept-Language игнорируются (см. CDP_ONLY)
    full: Object.keys(RAW_H),
  };

  /** Собираем объект: {name: value} по выбранным ключам из window.__HEADERS__ */
  function getProfiledHeaders(profileName) {
    const allowKeys = HEADER_PROFILES[profileName || headerProfile] || [];
    const out = {};
    for (const k of allowKeys) {
      if (k in RAW_H) {
        const kl = String(k).toLowerCase();
        if (!CDP_ONLY.has(kl)) out[k] = RAW_H[k];
      }
    }
    return out;
  }

  function isIgnoredHost(host) {
    if (!host) return false;
    for (const sfx of IGNORED_SUFFIXES) {
      if (hostMatchesSuffix(host, sfx)) return true;
    }
    return false;
  }

  function isAllowedHost(host) {
    if (!host) return false;
    for (const sfx of ALLOW_SUFFIXES) {
      if (hostMatchesSuffix(host, sfx)) return true;
    }
    return false;
  }

  /**
   * same-origin: можно профиль целиком
   * cross-origin + allow-list: профиль целиком
   * cross-origin + not-allowed: только safelisted
   */
  function filterHeadersForCors(target, headersObj) {
    const same = isSameOrigin(target);
    const host = getHost(target);
    const allowed = isAllowedHost(host);

    if (!same && !allowed) {
      const filtered = {};
      for (const k in headersObj) {
        if (Object.prototype.hasOwnProperty.call(headersObj, k)) {
          if (SAFE_LISTED.has(String(k).toLowerCase())) filtered[k] = headersObj[k];
          else dlog('Blocked non-safelisted header for cross-origin', host, k);
        }
      }
      return filtered;
    }
    return headersObj;
  }

  function buildMergedHeaders(target, baseHeaders, profileHeaders) {
    const normalizedBase = new Headers(baseHeaders || undefined);
    const toInject = filterHeadersForCors(target, profileHeaders);
    for (const k in toInject) {
      if (Object.prototype.hasOwnProperty.call(toInject, k)) {
        try { normalizedBase.set(k, String(toInject[k])); } catch (e) {
          emitDegrade('warn', 'headers_interceptor:headers:apply:set_failed', e, {
            stage: 'apply',
            surface: 'buildMergedHeaders',
            key: String(k)
          });
        }
      }
    }
    return normalizedBase;
  }

  // ----------------------------- fetch -----------------------------------
  const _fetch = window.fetch;
  window.fetch = async function patchedFetch(input, init) {
    try {
      const baseReq = (input instanceof Request) ? input : new Request(input, init);
      const targetURL = toURLLike(baseReq.url);
      const host = targetURL ? targetURL.host : getHost(baseReq.url);

      if (isIgnoredHost(host)) return _fetch.call(this, baseReq);
      if (isImageFontMediaRequest(baseReq, targetURL)) return _fetch.call(this, baseReq);

      const same = isSameOrigin(baseReq.url);
      if (baseReq.mode === 'no-cors' && !same && !isAllowedHost(host)) return _fetch.call(this, baseReq);

      const profiled = getProfiledHeaders(headerProfile);
      if (!Object.keys(profiled).length) return _fetch.call(this, baseReq);

      const mergedHeaders = buildMergedHeaders(baseReq.url, baseReq.headers, profiled);

      // если ничего реально не поменялось — короткий путь
      let changed = false;
      for (const [k, v] of mergedHeaders.entries()) {
        if (!baseReq.headers.has(k) || baseReq.headers.get(k) !== v) { changed = true; break; }
      }
      if (!changed) return _fetch.call(this, baseReq);

      const finalReq = new Request(baseReq, { headers: mergedHeaders });
      return _fetch.call(this, finalReq);
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:fetch:apply:failed', e, {
        stage: 'apply',
        surface: 'fetch',
        key: 'fetch'
      });
      return _fetch.apply(this, arguments);
    }
  };

  // ----------------------------- XHR -------------------------------------
  const XHR_STATE = new WeakMap();
  const XHROpen = XMLHttpRequest.prototype.open;
  const XHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    try {
      XHR_STATE.set(this, { method: String(method || 'GET').toUpperCase(), url: String(url || '') });
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:xhr:apply:state_set_failed', e, {
        stage: 'apply',
        surface: 'XMLHttpRequest.open',
        key: 'XHR_STATE'
      });
    }
    return XHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    try {
      const state = XHR_STATE.get(this) || {};
      const url = state.url || '';
      const host = getHost(url);

      if (isLikelyImageURL(url) || isLikelyFontURL(url) || isLikelyMediaURL(url)) return XHRSend.apply(this, arguments);
      if (isIgnoredHost(host)) return XHRSend.apply(this, arguments);

      const profiled = getProfiledHeaders(headerProfile);
      const allowedToInject = filterHeadersForCors(url, profiled);

      for (const k in allowedToInject) {
        if (Object.prototype.hasOwnProperty.call(allowedToInject, k)) {
          try { this.setRequestHeader(k, String(allowedToInject[k])); } catch (e) {
            emitDegrade('warn', 'headers_interceptor:xhr:apply:set_header_failed', e, {
              stage: 'apply',
              surface: 'XMLHttpRequest.send',
              key: String(k)
            });
          }
        }
      }
    } catch (e) {
      emitDegrade('warn', 'headers_interceptor:xhr:apply:failed', e, {
        stage: 'apply',
        surface: 'XMLHttpRequest.send',
        key: 'send'
      });
    }
    return XHRSend.apply(this, arguments);
  };

  emitDegrade('info', 'headers_interceptor:init:apply:installed', null, {
    stage: 'apply',
    surface: 'HeadersInterceptor',
    key: 'install',
    type: 'pipeline missing data',
    policy: 'skip',
    action: 'skip',
    data: { profile: headerProfile }
  });
}
