const FontPatchModule = function FontPatchModule(window) {
const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self       !== 'undefined' && self)
      || (typeof window     !== 'undefined' && window)
      || (typeof global     !== 'undefined' && global)
      || {};

  if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
    // если модуль оказался в worker-среде и его вызвали как FontPatchModule(window) где window=undefined
    window = G;
  }

  const C = window.CanvasPatchContext;
  if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registration is not allowed');

  const Core = window && window.Core;
  if (!Core || typeof Core.applyTargets !== 'function') {
    throw new Error('[FontPatch] Core.applyTargets is required');
  }

  function degrade(code, err, extra) {
    try {
      if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__(code, err, extra);
    } catch (_) {}
  }

  function isSameDescriptor(actual, expected) {
    if (!actual || !expected) return false;
    const keys = ['configurable', 'enumerable', 'writable', 'value', 'get', 'set'];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (Object.prototype.hasOwnProperty.call(expected, k)) {
        if (actual[k] !== expected[k]) return false;
      }
    }
    return true;
  }

  function applyTargetGroup(groupTag, targets, policy) {
    const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
    const preflightTarget = (Core && typeof Core.preflightTarget === 'function') ? Core.preflightTarget : null;
    if (typeof preflightTarget === 'function') {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const pre = preflightTarget(target);
        if (!pre || pre.ok !== true) {
          const err = (pre && pre.error instanceof Error) ? pre.error : new Error('[FontPatch] target preflight failed');
          const reason = pre && pre.reason ? pre.reason : 'preflight_failed';
          degrade(groupTag + ':target_preflight_failed', err, {
            index: i,
            reason,
            key: target && target.key ? target.key : null,
            kind: target && target.kind ? target.kind : null
          });
          if (groupPolicy === 'throw') throw err;
          return 0;
        }
      }
    }
    let plans = [];
    try {
      plans = Core.applyTargets(targets, window.__PROFILE__, []);
    } catch (e) {
      degrade(groupTag + ':preflight_failed', e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      if (plans && plans.ok === false) {
        const e = new Error('[FontPatch] target group skipped');
        degrade(groupTag + ':group_skipped', e, { reason: plans.reason || null });
      }
      return 0;
    }

    const done = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.nextDesc || !p.owner || typeof p.key !== 'string') {
          throw new Error('[FontPatch] invalid execution plan item');
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          throw new Error('[FontPatch] descriptor post-check mismatch');
        }
        p.applied = true;
        done.push(p);
      }
      return done.length;
    } catch (e) {
      for (let i = done.length - 1; i >= 0; i--) {
        const p = done[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        } catch (_) {}
      }
      degrade(groupTag + ':apply_failed', e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
  }

  // === Fonts module local guard (window & worker) ===
  if (!Array.isArray(window.fontPatchConfigs))
    throw new Error('[FontPatch] fontPatchConfigs must be an array (from Python)');


  // expose awaitFontsReady in window and in the Worker env
  (function exposeFontsReady(){
    const hasDocFonts = (typeof document === 'object' && document && document.fonts && document.fonts.ready);

    // В window-ветке нам нужна "внешне резолвимая" точка
    if (hasDocFonts) {
      if (!window.awaitFontsReady || typeof window.awaitFontsReady.then !== 'function' || !window.awaitFontsReady.__owned_by_fontpatch) {
        let resolveFn, rejectFn;
        const p = new Promise((res, rej) => { resolveFn = res; rejectFn = rej; });
        p.resolve = resolveFn;
        p.reject  = rejectFn;
        Object.defineProperty(p, '__owned_by_fontpatch', { value: true });
        window.awaitFontsReady = p;
      }
      return;
    }
    // В non-window (worker) НЕ подменяем нативный ready на pending-промис, который никто не резолвит
    if (window.fonts && window.fonts.ready && typeof window.fonts.ready.then === 'function') {
      window.awaitFontsReady = window.fonts.ready;
    } else {
      window.awaitFontsReady = Promise.resolve();
    }
  })();

  const domPlat = window.__NAV_PLATFORM__;
  if (!domPlat) throw new Error('[FontPatch] __NAV_PLATFORM__ is missing (run NavTotalSetPatchModule first)');

  const fonts = window.fontPatchConfigs.filter(f => f.platform_dom === domPlat);
  if (!fonts.length) {
    console.warn('[FontPatch] filtered fonts = 0 for', domPlat);
  } else {
    console.log('[FontPatch] filtered fonts =', fonts.length, 'for', domPlat);
  }




  // --- DOM override for quick macOS check (optional, debugging) ---
  (function () {
    // в worker’е документа нет — выходим
    if (typeof document === 'undefined') return;

    const domPlat = window.__NAV_PLATFORM__;
    if (!domPlat) throw new Error('[FontPatch] __NAV_PLATFORM__ is missing (ensure NavTotalSetPatchModule runs first)');

    // строго только под macOS и только если есть что применять
    function run() {
      if (domPlat !== 'MacIntel') return;

      const fonts = (window.fontPatchConfigs || []).filter(f => f.platform_dom === domPlat);
      if (!fonts.length) {
        console.warn('[FontPatch] filtered fonts = 0 for', domPlat);
        return;
      }

      const testFam = (fonts[0].cssFamily || fonts[0].family);
      if (!testFam) return;

      // idempotent: не плодим несколько <style id="force-font-override">
      let el = document.getElementById('force-font-override');
      if (!el) {
        el = document.createElement('style');
        el.id = 'force-font-override';
        // вставляем в head, если он уже есть; иначе — в documentElement/body
        const parent =
          document.head ||
          document.documentElement ||
          document.body;
        if (!parent) {
          // если DOM ещё не готов (редкий случай), оставим через RAF следующему тику
          requestAnimationFrame(run);
          return;
        }
        parent.appendChild(el);
      }

      el.textContent = `
        :root, body, * {
          font-family: '${testFam}', Helvetica, Arial, sans-serif !important;
          font-synthesis: none !important;
        }`;
      console.log('[FontPatch] DOM override style applied for', domPlat, '→', testFam);
    }

    // дождаться готовности DOM, чтобы не ловить appendChild на null
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
})();


  // ===  window branch (DOM exist here) ====
  if (typeof document === 'object' && document) {
    Promise.allSettled(
      fonts.map((f) => {
        try {
          if (!f || typeof f !== 'object') {
            throw new TypeError('[FontPatch] font entry must be object');
          }
          const fam = (f.cssFamily || f.family);
          if (!fam || typeof fam !== 'string') {
            throw new TypeError('[FontPatch] font.family missing/invalid');
          }
          const url = f.url;
          if (!url || typeof url !== 'string') {
            throw new TypeError('[FontPatch] font.url missing/invalid');
          }

          const src = `url(${JSON.stringify(url)}) format("woff2")`;

          const ff = new FontFace(fam, src, {
            weight: f.weight || 'normal',
            style:  f.style  || 'normal',
            display: 'swap',
          });

          return ff.load().then((loaded) => {
            document.fonts.add(loaded);
            return fam;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      })
    ).then((results) => {
      const loaded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Дожидаемся document.fonts.ready + двойной RAF, затем единый settle()
      return Promise.resolve()
        .then(() => (document.fonts && document.fonts.ready) || Promise.resolve())
        .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
        .finally(() => {
          if (failed > 0) {
            const first = results.find((r) => r.status === 'rejected');
            const err = first && ('reason' in first) ? first.reason : new Error('[FontPatch] font load failed');

            window.__FONTS_READY__ = false;
            try {
              window.__FONTS_ERROR__ = String((err && (err.stack || err.message)) || err);
            } catch (eSet) {
              degrade('fonts:data:set_error_failed', eSet);
            }

            if (typeof window.awaitFontsReady?.reject === 'function') window.awaitFontsReady.reject(err);
            console.log(`[FontPatch] window: ${loaded} loaded, ${failed} failed`);
            return;
          }

          window.__FONTS_READY__ = true;
          if (typeof window.awaitFontsReady?.resolve === 'function') window.awaitFontsReady.resolve();
          try {
            if (window.dispatchEvent) window.dispatchEvent(new Event('fontsready'));
          } catch (eEvt) {
            degrade('fonts:event:dispatch_failed', eEvt);
          }
          console.log(`[FontPatch] window: ${loaded} loaded, ${failed} failed`);
        });
    });
  
      // CSS @font-face →Only in the window
  (function injectCss(){
    let css = '';
    for (const f of fonts) {
      const fam = (f.cssFamily || f.family);
      css += `@font-face{font-family:'${fam}';src:url('${f.url}') format('woff2');font-weight:${f.weight||'normal'};font-style:${f.style||'normal'};font-display:swap;}`;
    }
    const tagId = 'font-patch-styles';
    const apply = () => {
      let styleEl = document.getElementById(tagId) || document.createElement('style');
      styleEl.id = tagId;
      (document.head || document.documentElement || document.body).appendChild(styleEl);
      styleEl.textContent = css;
    };

    // НОВОЕ: не ждём строго DOMContentLoaded — пробуем как только появляется контейнер
    if (document.readyState === 'loading') {
      const tryApply = () => {
        if (document.head || document.documentElement || document.body) apply();
        else requestAnimationFrame(tryApply);
      };
      tryApply();
    } else {
      apply();
    }
  })();
}


// font -guard
(() => {
  'use strict';

  // data group: critical runtime promise handle
  applyTargetGroup('fonts:data:critical', [{
    owner: window,
    key: 'awaitFontsReady',
    kind: 'data',
    value: window.awaitFontsReady,
    allowCreate: true,
    writable: true,
    configurable: true,
    enumerable: true,
    policy: 'throw',
    diagTag: 'fonts:data:awaitFontsReady'
  }], 'throw');

  // data group: optional runtime flags
  applyTargetGroup('fonts:data:flags', [
    {
      owner: window,
      key: '__FONTS_READY__',
      kind: 'data',
      value: window.__FONTS_READY__,
      allowCreate: true,
      writable: true,
      configurable: true,
      enumerable: true,
      policy: 'skip',
      diagTag: 'fonts:data:ready'
    },
    {
      owner: window,
      key: '__FONTS_ERROR__',
      kind: 'data',
      value: window.__FONTS_ERROR__,
      allowCreate: true,
      writable: true,
      configurable: true,
      enumerable: true,
      policy: 'skip',
      diagTag: 'fonts:data:error'
    }
  ], 'skip');

  // Глобал рантайма
  const G = (typeof globalThis !== "undefined" ? globalThis : self);

  // FontFaceSet в текущем окружении (window/worker)
  const FFS = (G.document && G.document.fonts) || G.fonts || null;
  if (!FFS) return;

  const proto = Object.getPrototypeOf(FFS);
  if (!proto) return;

  // accessor group: ready
  applyTargetGroup('fonts:accessor', [{
    owner: proto,
    key: 'ready',
    kind: 'accessor',
    policy: 'skip',
    diagTag: 'fonts:accessor:ready',
    getImpl(origGet) {
      return Reflect.apply(origGet, this, []);
    }
  }], 'skip');

  // === Tunables (локальные, регулируем «на месте», без глобальных флагов) ===
  let FFS_TICK_MS   = 16;
  let FFS_LIM_RUN   = 40;
  let FFS_BOOT_MS   = 180;
  let FFS_LIM_BOOT  = 96;

  const now = (G.performance && typeof G.performance.now === 'function')
    ? () => G.performance.now.call(G.performance)
    : () => Date.now();

  const T0 = now();
  let calls = 0;
  let ts    = 0;
  const throttled = () => {
    const t = now();
    const TMS = FFS_TICK_MS | 0;
    if (t - ts > TMS) { calls = 0; ts = t; }
    const inBoot = (t - T0) < FFS_BOOT_MS;
    const LIM = inBoot ? FFS_LIM_BOOT : FFS_LIM_RUN;
    return (calls++ >= LIM);
  };

  const MAX_LEN = 256;
  const CTRL = /[\u0000-\u001F]/;
  const SIZED  = /\b-?\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b/i;
  const FAMILY = /"[^"]+"|'[^']+'|\b[a-z0-9][\w\- ]{1,}\b/i;
  const GENERICS = new Set(['serif','sans-serif','monospace','cursive','fantasy','system-ui']);
  let ALLOWED_FAMILIES = null;

  function extractFamily(q) {
    const m = String(q).match(/(?:^|\s)\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b(?:\/\d+(?:\.\d+)?(?:px|pt|em|rem|%))?\s+(.+)$/i);
    const raw = (m ? m[1] : q);
    return raw.split(',')[0].replace(/['"]/g,'').trim().toLowerCase();
  }

  function getAllowedFamilies() {
    if (ALLOWED_FAMILIES) return ALLOWED_FAMILIES;
    const win = (typeof window !== 'undefined') ? window : G;
    const domPlat = win.__NAV_PLATFORM__;
    const cfgs = Array.isArray(win.fontPatchConfigs) ? win.fontPatchConfigs : [];
    ALLOWED_FAMILIES = new Set(
      (domPlat ? cfgs.filter(f => f.platform_dom === domPlat) : cfgs)
        .flatMap(f => [f.cssFamily, f.family, f.name, f.fallback].filter(Boolean))
        .map(s => s.toLowerCase())
    );
    return ALLOWED_FAMILIES;
  }

  const validFontQuery = q => {
    if (!(typeof q === 'string' && q.length <= MAX_LEN && !CTRL.test(q) && SIZED.test(q) && FAMILY.test(q))) {
      return false;
    }
    const fam = extractFamily(q);
    if (!fam) return false;
    if (GENERICS.has(fam)) return true;
    return getAllowedFamilies().has(fam);
  };

  // method group: check + forEach(declare-only)
  applyTargetGroup('fonts:method', [
    {
      owner: proto,
      key: 'check',
      kind: 'method',
      policy: 'skip',
      diagTag: 'fonts:method:check',
      invoke(orig, args) {
        const query = args[0];
        if (throttled()) return false;
        if (!validFontQuery(query)) return false;
        return Reflect.apply(orig, this, args);
      }
    },
    {
      owner: proto,
      key: 'forEach',
      kind: 'method',
      mode: 'declare_only',
      enabled: false,
      policy: 'skip',
      diagTag: 'fonts:method:forEach'
    }
  ], 'skip');

  // promise_method group: load
  applyTargetGroup('fonts:promise', [{
    owner: proto,
    key: 'load',
    kind: 'promise_method',
    policy: 'skip',
    diagTag: 'fonts:promise:load',
    invoke(orig, args) {
      const query = args[0];
      const text = args[1];
      if (throttled()) return Promise.resolve([]);
      if (!validFontQuery(query)) return Promise.resolve([]);
      if (text != null && typeof text !== 'string') return Promise.resolve([]);
      return Reflect.apply(orig, this, args);
    }
  }], 'skip');
})();


}
