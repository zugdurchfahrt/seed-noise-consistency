/**
 * headers_interceptor.js
 *
 * Патчит fetch и XHR,  инжектируя заголовки по профилю.
 * Ключевые принципы:
 *  - Не падаем, если CanvasPatchContext ещё не готов (ранний return + warn).
 *  - Сохраняем Request и его свойства (работаем поверх base Request).
 *  - На кросс-ориджин по умолчанию — НИЧЕГО, кроме safelisted (и то только если нужно).
 *  - Явный allow-list доменов для инжекта «полных»/кастомных заголовков.
 *  - Игнор — по suffix/pSL-подобной проверке (минимум endsWith(.example.com)), без includes.
 *  - Никаких спец-веток для OPTIONS — фокус на том, чтобы не провоцировать preflight.
 *  - Нормализация через new Headers(...) — без «плоских объектов», не теряем дубликаты.
 *  - XHR: проверяем sameOrigin, на cross-origin — только safelisted/ничего.
 *  - Экспортируем API: window.HeadersInterceptor = { setProfile, addAllow, addIgnore }.
 */

function HeadersInterceptor(window) {
  'use strict';
  const LOG_PREFIX = '[headers_interceptor.js]';
  const C = window.CanvasPatchContext;
    if (!C) {
      console.warn(`${LOG_PREFIX} CanvasPatchContext is not ready — skipping headers patch for now`);
      return;
    }
  const DEBUG = !!window.__HEADERS_DEBUG__;
  
  // --------------------------- У Т И Л И Т Ы -----------------------------
  const ORIGIN = window.location.origin;

  /** Безопасный разбор URL c базой location.href */
  function toURLLike(input) {
    try {
      if (input instanceof URL) return input;
      if (typeof input === 'string') return new URL(input, window.location.href);
      if (input && typeof input.url === 'string') return new URL(input.url, window.location.href);
    } catch (_) {
      /* ignore */
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
    if (s[0] !== '.') s = `.${s}`; // нормализуем к виду ".example.com"
    return h === s.slice(1) || h.endsWith(s);
  }

  /** print to Debug if it is on */
  function dlog(...args) {
    if (DEBUG) console.debug(LOG_PREFIX, ...args);
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
    } catch { return false; }
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
    } catch { return false; }
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
    } catch { return false; }
  }

  function isImageFontMediaRequest(req, targetURL) {
    try {
      const accept = req && req.headers && req.headers.get ? (req.headers.get('accept') || '') : '';
      if (/\bimage\//i.test(accept) || /\bfont\/|application\/font/i.test(accept) || /\bvideo\/|\baudio\//i.test(accept)) {
        return true;
      }
    } catch {}
    return isLikelyImageURL(targetURL || req) || isLikelyFontURL(targetURL || req) || isLikelyMediaURL(targetURL || req);
  }

  // --------------------------- К О Н Ф И Г -------------------------------
  /**
   * Safelisted request-headers (минимальный набор, чтобы не провоцировать preflight).
   * Do not touch the Accept - let the browser set it yourself.
   * Content-Type не инжектим (сложная матрица допустимых значений).
   */
  const SAFE_LISTED = new Set([
    'accept-language',
    // 'accept',        // It is better not to touch - the browser will put it by its own
  ]);

  // Эти заголовки допускаем ТОЛЬКО от движка/CDP, не из JS
  const CDP_ONLY = new Set(['accept','accept-language']);

  /**
   *Ignor suffixes (without includes!) — Requests that we do not touch at all.
   *
   * Включает 2 категории:
   *  1. Critical services(Google, Apple, Microsoft, Facebook и т.п.):
   *     - The intervention breaks their work or is quickly detected.
   *  2.Antibot-Challange Providers(Cloudflare, Akamai, hCaptcha/Recaptcha и т.п.):
   *     - check the consistency of the headings and JS-API, any intervention → Guaranteed Ban/Challenge.
   *
   * На всех этих доменах заголовки и поведение сети оставляем «как есть»,
   * чтобы сохранить нативную консистентность и избежать сбоев.
   */
  const IGNORED_SUFFIXES = new Set([
    '.google.com', '.yandex.ru', '.github.io', '.gstatic.com', '.chatgpt.com',
    '.facebook.com', '.doubleclick.net', '.apple.com', '.windowsupdate.com',
    '.microsoft.com',
    // Antibot Challenge
    '.cloudflare.com', '.challenge.cloudflare.com','.challenges.cloudflare.com',
    '.akamaihd.net', '.perimeterx.net',
    '.hcaptcha.com', '.recaptcha.net'
  ]);
  /**
   * Явный allow-list — где разрешено инжектить «полные» кастомные заголовки.
   */
  const ALLOW_SUFFIXES = new Set([

  ]);
  /** Вычисляемые профили (берём значения из window.__HEADERS__) */
  const RAW_H = (window.__HEADERS__ && typeof window.__HEADERS__ === 'object') ? window.__HEADERS__ : {};

  const HEADER_PROFILES = {
    // Минимальный — ничего лишнего
    min: [],
    // By default inject nothing from JS  — Heders will come by native through CDP
    default: [],
    // Полный можно включать вручную; Accept/Accept-Language всё равно игнорируются (см. CDP_ONLY)
    full: Object.keys(RAW_H),
  };

  let headerProfile = 'min';

  // ------------------------- В Ы Б О Р  Х Е Д Е Р О В ---------------------

  /** Собираем объект: {name: value} по выбранным ключам из window.__HEADERS__ */
  function getProfiledHeaders(profileName = headerProfile) {
    const allowKeys = HEADER_PROFILES[profileName] || [];
    const out = {};
    for (const k of allowKeys) {
      if (k in RAW_H) {
        // Не ставим из JS заголовки, которые должны приходить ТОЛЬКО нативно через движок/CDP
        const kl = String(k).toLowerCase();
        if (!CDP_ONLY.has(kl)) out[k] = RAW_H[k];
      }
    }
    return out;
  }

  /** Возвращает true, если host в ignore-list */
  function isIgnoredHost(host) {
    if (!host) return false;
    for (const sfx of IGNORED_SUFFIXES) {
      if (hostMatchesSuffix(host, sfx)) return true;
    }
    return false;
  }

  /** Возвращает true, если host в allow-list */
  function isAllowedHost(host) {
    if (!host) return false;
    for (const sfx of ALLOW_SUFFIXES) {
      if (hostMatchesSuffix(host, sfx)) return true;
    }
    return false;
  }

  /**
   * Фильтруем набор инжектируемых заголовков под CORS-правила:
   *  - same-origin: можно профиль целиком
   *  - cross-origin + allow-list: профиль целиком
   *  - cross-origin + not-allowed: только safelisted
   */
  function filterHeadersForCors(target, headersObj) {
    const same = isSameOrigin(target);
    const host = getHost(target);
    const allowed = isAllowedHost(host);

    // cross-origin и не в allow → оставляем только safelisted
    if (!same && !allowed) {
      const filtered = {};
      for (const [k, v] of Object.entries(headersObj)) {
        if (SAFE_LISTED.has(k.toLowerCase())) filtered[k] = v;
        else dlog(`Blocked non-safelisted header for cross-origin ${host}:`, k);
      }
      return filtered;
    }
    return headersObj;
  }

  /**
   * Возвращает Headers, полученные из base + наши инжекты (после фильтра).
   * Никаких специальных правил для OPTIONS — preflight не провоцируем самим выбором заголовков.
   */
  function buildMergedHeaders(target, baseHeaders, profileHeaders) {
    const normalizedBase = new Headers(baseHeaders || undefined);

    // Фильтрация под CORS
    const toInject = filterHeadersForCors(target, profileHeaders);

    // Инжектируем через set(), чтобы не плодить дубликаты наших ключей
    for (const [k, v] of Object.entries(toInject)) {
      try {
        normalizedBase.set(k, String(v));
      } catch (e) {
        dlog(`Failed to set header "${k}" due to:`, e);
      }
    }
    return normalizedBase;
  }

  // ----------------------------- fetch -----------------------------------
  const _fetch = window.fetch;

  window.fetch = async function patchedFetch(input, init) {
    try {
      // 1) At first Basic Request
      const baseReq = (input instanceof Request) ? input : new Request(input, init);

      // 2) Парсим цель
      const targetURL = toURLLike(baseReq.url);
      const host = targetURL ? targetURL.host : getHost(baseReq.url);

      // 3) Игнор доменов
      if (isIgnoredHost(host)) {
        dlog(`Ignored fetch for host: ${host}`);
        return _fetch.call(this, baseReq);
      }

      // 4) Не трогаем изображения/шрифты/медиа (иначе taint/цвета)
      if (isImageFontMediaRequest(baseReq, targetURL)) {
        dlog('Bypass fetch (image/font/media):', (targetURL || baseReq.url));
        return _fetch.call(this, baseReq);
      }

      // 5) Carefull with no-cors cross-origin
      const same = isSameOrigin(baseReq.url);
      if (baseReq.mode === 'no-cors' && !same && !isAllowedHost(host)) {
        dlog('Bypass fetch (no-cors cross-origin):', (targetURL || baseReq.url));
        return _fetch.call(this, baseReq);
      }

      // 6) Профиль
      const profiled = getProfiledHeaders(headerProfile);
      if (!Object.keys(profiled).length) {
        return _fetch.call(this, baseReq);
      }

      // 7) Фильтруем под CORS и мёрджим
      const allowedToInject = filterHeadersForCors(baseReq.url, profiled);
      const mergedHeaders = buildMergedHeaders(baseReq.url, baseReq.headers, allowedToInject);

      // 8) Если ничего реально не поменялось — короткий путь
      let changed = false;
      for (const [k, v] of mergedHeaders.entries()) {
        if (!baseReq.headers.has(k) || baseReq.headers.get(k) !== v) { changed = true; break; }
      }
      if (!changed) return _fetch.call(this, baseReq);

      // 9) Финальный запрос
      const finalReq = new Request(baseReq, { headers: mergedHeaders });
      return _fetch.call(this, finalReq);
    } catch (e) {
      console.warn(`${LOG_PREFIX} fetch patch error:`, e);
      return _fetch.apply(this, arguments);
    }
  };

  // ----------------------------- XHR -------------------------------------

  const XHR_STATE = new WeakMap();
  const XHROpen = XMLHttpRequest.prototype.open;
  const XHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  const XHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    try {
      XHR_STATE.set(this, { method: String(method || 'GET').toUpperCase(), url: String(url || '') });
    } catch {
      // no-op
    }
    return XHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    // Не вмешиваемся в пользовательские заголовки, но могли бы логировать запреты, если понадобится
    try {
      return XHRSetRequestHeader.call(this, name, value);
    } catch (e) {
      dlog(`XHR.setRequestHeader failed for ${name}:`, e);
      throw e;
    }
  };

  XMLHttpRequest.prototype.send = function (...args) {
    try {
      const state = XHR_STATE.get(this) || {};
      const { method = 'GET', url = '' } = state;
      const host = getHost(url);

      // --- байпас медиа/шрифтов/изображений (здесь 'url' уже определён)
      if (isLikelyImageURL(url) || isLikelyFontURL(url) || isLikelyMediaURL(url)) {
        dlog('Bypass XHR (image/font/media):', url);
        return XHRSend.apply(this, args);
      }

      if (isIgnoredHost(host)) {
        dlog(`Ignored XHR for host: ${host}`);
        return XHRSend.apply(this, args);
      }

      const profiled = getProfiledHeaders(headerProfile);
      const allowedToInject = filterHeadersForCors(url, profiled);

      for (const k of Object.keys(profiled)) {
        if (!(k in allowedToInject)) dlog(`Blocked XHR header for ${host}: ${k}`);
      }
      for (const [k, v] of Object.entries(allowedToInject)) {
        try { this.setRequestHeader(k, String(v)); } catch (e) { dlog(`XHR: failed to set "${k}" due to:`, e); }
      }
    } catch (e) {
      console.warn(`${LOG_PREFIX} XHR patch error:`, e);
    }
    return XHRSend.apply(this, args);
  };

  // -----------------------------LOG-----------------------------------

  console.log(`${LOG_PREFIX} patch loaded. Header profile: ${headerProfile}`);
}

