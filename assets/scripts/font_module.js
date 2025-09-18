function FontPatchModule(window) {
  const C = window.CanvasPatchContext;
  if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registration is not allowed');
  // === Fonts module local guard (window & worker) ===
  if (!Array.isArray(window.fontPatchConfigs))
    throw new Error('[FontPatch] fontPatchConfigs must be an array (from Python)');


  // expose awaitFontsReady in window and in the Worker env
  (function exposeFontsReady(){
    if (typeof document === 'object' && document && document.fonts) {
      window.awaitFontsReady = document.fonts.ready;
    } else if (typeof window.fonts !== 'undefined' && window.fonts && window.fonts.ready) {
      window.awaitFontsReady = window.fonts.ready;
    } else {
      window.awaitFontsReady = Promise.resolve();
    }
    // Единая «внешне резолвимая» точка; не плодим разные промисы по ходу
    if (!window.awaitFontsReady || typeof window.awaitFontsReady.then !== 'function' || !window.awaitFontsReady.__owned_by_fontpatch) {
      let resolveFn;
      const p = new Promise(res => (resolveFn = res));
      p.resolve = resolveFn;
      Object.defineProperty(p, '__owned_by_fontpatch', { value: true });
      window.awaitFontsReady = p;
    }
  })();

  // Patch API FontFaceSet (Safe in window and in Worker if FontFaceSet avaiable)
  (function patchFontFaceSetAPI(){
    if (typeof window.FontFaceSet !== 'function') return;
    const proto = window.FontFaceSet.prototype;
    if (proto.__FONTFACESET_PATCHED) return;
    Object.defineProperty(proto, '__FONTFACESET_PATCHED', { value: true });
    ['load','check','forEach'].forEach(name => {
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      if (!desc || typeof desc.value !== 'function') return;
    });
    const readyDesc = Object.getOwnPropertyDescriptor(proto, 'ready');
    if (readyDesc && typeof readyDesc.get === 'function') {
      Object.defineProperty(proto, 'ready', {
        get() { try { return readyDesc.get.call(this); } catch { return Promise.resolve(this); } },
        configurable: true
      });
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
    // load and register in document.fonts
    Promise.allSettled(fonts.map(f => {
      const fam = (f.cssFamily || f.family);
      const ff  = new FontFace(fam, `url("${f.url}") format("woff2")`, {
        weight: f.weight || 'normal',
        style:  f.style  || 'normal',
        display: 'swap'
      });
      return ff.load().then(loaded => { document.fonts.add(loaded); return fam; });
    })).then(results => {
      const loaded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // Дожидаемся document.fonts.ready + двойной RAF, затем единый resolve()
      Promise.resolve()
        .then(() => (document && document.fonts && document.fonts.ready) || Promise.resolve())
        .then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
        .finally(() => {
          window.__FONTS_READY__ = true;
          if (typeof window.awaitFontsReady?.resolve === 'function') {
            window.awaitFontsReady.resolve();
          }
          window.dispatchEvent && window.dispatchEvent(new Event('fontsready'));
        });
      console.log(`[FontPatch] window: ${loaded} loaded, ${failed} failed`);
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

  // Глобал рантайма
  const G = (typeof globalThis !== "undefined" ? globalThis : self);

  // === Tunables (локальные, регулируем «на месте», без глобальных флагов) ===
  // окно тика (мс)
  let FFS_TICK_MS   = 16;
  // лимит вызовов на тик в штатном режиме
  let FFS_LIM_RUN   = 40;   // было 8 → слишком мало, даёт «6 fonts»
  // «разгон» на старте: даём детектору сделать больше вызовов
  let FFS_BOOT_MS   = 180;  // длительность разгона (мс)
  let FFS_LIM_BOOT  = 96;   // лимит на тик в период разгона

  // FontFaceSet в текущем окружении (window/worker)
  const FFS = (G.document && G.document.fonts) || G.fonts || null;
  if (!FFS) {
    throw new Error("[FontModule] FontFaceSet API not available in this environment");
  }
  if (FFS.__FONT_GUARD__) return;
  Object.defineProperty(FFS, '__FONT_GUARD__', { value: true, configurable: false });

  const origCheck = FFS.check.bind(FFS);
  const origLoad  = FFS.load.bind(FFS);

  const now = (G.performance && typeof G.performance.now === 'function')
    ? () => G.performance.now.call(G.performance)
    : () => Date.now();

  // --- троттлер ---
  const T0 = now();
  let calls = 0;
  let ts    = 0;
  const throttled = () => {
    const t = now();
    const TMS = FFS_TICK_MS | 0;              // окно тика
    if (t - ts > TMS) { calls = 0; ts = t; }
    const inBoot = (t - T0) < FFS_BOOT_MS;    // первые ~180 мс
    const LIM = inBoot ? FFS_LIM_BOOT : FFS_LIM_RUN;
    // строгий лимит (fix off-by-one)
    return (calls++ >= LIM);
  };

  // inbound "trash" validator
  const MAX_LEN = 256;
  const CTRL = /[\u0000-\u001F]/;
  const SIZED  = /\b-?\d+(?:\.\d+)?(?:px|pt|em|rem|%)\b/i;
  const FAMILY = /"[^"]+"|'[^']+'|\b[a-z0-9][\w\- ]{1,}\b/i;

  // --- allow-list, синхронизированный с генератором ---
  const GENERICS = new Set(['serif','sans-serif','monospace','cursive','fantasy','system-ui']);
  let ALLOWED_FAMILIES = null; // лениво соберём при первом обращении

  function extractFamily(q) {
    // первая family из шортхенда: "italic bold 12px/14px 'My Font', Arial, sans-serif"
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
    if (GENERICS.has(fam)) return true;             // всегда пропускаем generics
    return getAllowedFamilies().has(fam);           // и только те, что реально есть в fontPatchConfigs
  };

  FFS.check = function check(query) {
    if (throttled()) return false;
    if (!validFontQuery(query)) return false;
    try { return origCheck(query); } catch { return false; }
  };

  FFS.load = function load(query, text) {
    if (throttled()) return Promise.resolve([]);
    if (!validFontQuery(query)) return Promise.resolve([]);
    if (text != null && typeof text !== 'string') return Promise.resolve([]);
    return origLoad(query, text).catch(() => []);
  };
})();


}


