/*
== CONTRACT (CURRENT PIPELINE FACTS) ==

1) Roles (single contract)
- `window.CanvasPatchContext` — internal state/registries/queues (pipeline “bus”) used by `context.js`.
- `window.CanvasPatchHooks` — export surface ONLY (functions) consumed by `context.js.registerAllHooks()` and by ctx2D wrappers
  (analogy: `window.webglHooks`).

2) Identity / export rule (DO NOT break reference)
- Never replace `window.CanvasPatchHooks` object entirely (no `window.CanvasPatchHooks = { ... }`).
- Reason: `context.js` validates + registers against one container, and wrappers read hooks by reference; replacing the object creates “two baskets”.
- Allowed pattern: ensure container exists, then assign properties onto the SAME object identity; optional `Object.defineProperty(...)`
  is OK only if `value` is that same existing object (non-enumerable export, like in `webgl.js`).

3) ctx2D text pipeline order (facts from `/assets/scripts/window/core/context.js`)
- `fillText`: if `typeof H.applyFillTextHook === 'function'` → runs FIRST and receives `(callOrig, text, x, y, ...rest)`.
  Else if `typeof H.fillTextNoiseHook === 'function'` → can rewrite args → then native `fillText`.
  Else → native `fillText`.
- `strokeText`: same order with `applyStrokeTextHook` / `strokeTextNoiseHook`.

 4) Registration facts (facts from `/assets/scripts/window/core/context.js`)
 - Required Canvas exports (hard-required by `registerAllHooks()`):
   `patch2DNoise`, `patchToDataURLInjectNoise`, `masterToDataURLHook`,
   `patchToBlobInjectNoise`, `patchConvertToBlobInjectNoise`,
   `measureTextNoiseHook`, `applyMeasureTextHook`, `fillTextNoiseHook`, `strokeTextNoiseHook`, `fillRectNoiseHook`,
   `applyDrawImageHook`, `addCanvasNoise`.
 - `applyFillTextHook` / `applyStrokeTextHook` are OPTIONAL: not in the required list and not registered via `CanvasPatchContext`.
   They only affect runtime if present, via wrapper precedence (see пункт 3).

5) Local constraints for this module draft
- Preserve all commented-out / disabled hooks exactly as-is (they are part of the operational contract).
- No silent-swallow: if something fails, either keep native untouched (atomic skip) + emit `__DEGRADE__.diag`, or fail-fast.

*/

const CanvasPatchModule = function CanvasPatchModule(window) {
const G = (typeof globalThis !== 'undefined' && globalThis)
  || (typeof self !== 'undefined' && self)
  || (typeof window !== 'undefined' && window)
  || {};

if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
  window = G;
}

const C  = G.CanvasPatchContext || (G.CanvasPatchContext = {});
if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registratio not available');
  function emitCanvasDiag(level, code, err, extra) {
    const d = G.__DEGRADE__;
    if (typeof d !== 'function') return;
    const eventCode = (typeof code === 'string' && code) ? code : 'canvas:diag';
    const e = err instanceof Error ? err : (err == null ? null : new Error(String(err)));
    const ctx = Object.assign({
      module: 'canvas',
      diagTag: 'canvas',
      surface: 'canvas',
      key: null,
      stage: 'runtime',
      message: eventCode,
      type: 'pipeline missing data',
      data: null
    }, (extra && typeof extra === 'object') ? extra : null);
    if (typeof d.diag === 'function') {
      d.diag(level, eventCode, ctx, e);
      return;
    }
    d(eventCode, e, ctx);
  }
  function __resolvePrngState() {
    const state = (C && C.__PRNG_STATE__ && typeof C.__PRNG_STATE__ === 'object') ? C.__PRNG_STATE__ : null;
    return {
      seed: (state && typeof state.seed === 'string' && state.seed)
        ? state.seed
        : ((typeof G.__GLOBAL_SEED === 'string' && G.__GLOBAL_SEED) ? G.__GLOBAL_SEED : ''),
      strToSeed: (state && typeof state.strToSeed === 'function') ? state.strToSeed : G.strToSeed,
      mulberry32: (state && typeof state.mulberry32 === 'function') ? state.mulberry32 : G.mulberry32
    };
  }


  // Native default ctx2d font (MDN/Chromium-consistent). Cache it once in CanvasPatchContext.
  const DEFAULT_CTX2D_FONT = (function initDefaultCtx2DFont(){
    try {
      const cached = (C && typeof C.__DEFAULT_CTX2D_FONT__ === 'string') ? C.__DEFAULT_CTX2D_FONT__ : '';
      if (cached && cached.trim()) return cached.trim();

      const doc = G && G.document;
      if (!doc || typeof doc.createElement !== 'function') {
        throw new Error('[CanvasPatch] document.createElement missing');
      }
      const canvas = doc.createElement('canvas');
      const ctx = (canvas && typeof canvas.getContext === 'function') ? canvas.getContext('2d') : null;
      const font = (ctx && typeof ctx.font === 'string' && ctx.font.trim()) ? ctx.font.trim() : '';
      if (!font) throw new Error('[CanvasPatch] default ctx2d.font missing/invalid');

      if (!__defineHidden__(
        C,
        '__DEFAULT_CTX2D_FONT__',
        font,
        'canvas:ctx2d:guard:default_font_define_failed',
        '__DEFAULT_CTX2D_FONT__',
        'default font defineProperty failed; fallback assign used'
      )) {
        emitCanvasDiag('warn', 'canvas:ctx2d:guard:default_font_assign_failed', null, {
          stage: 'guard',
          key: '__DEFAULT_CTX2D_FONT__',
          type: 'browser structure missing data',
          message: 'default font fallback assign failed'
        });
      }
      return font;
    } catch (e) {
      emitCanvasDiag('warn', 'canvas:ctx2d:guard:default_font_compute_failed', e, {
        stage: 'guard',
        key: 'ctx.font',
        type: 'browser structure missing data'
      });
      const cached = (C && typeof C.__DEFAULT_CTX2D_FONT__ === 'string') ? C.__DEFAULT_CTX2D_FONT__ : '';
      return (cached && cached.trim()) ? cached.trim() : '';
    }
  })();

  // === MODULE INITIALIZATION ===
  // Создаём <canvas> (идемпотентно) и разделяем DOM/Offscreen пути
  C.state = C.state || { domReady: false, offscreenReady: false };

  // keep internal handles inside CanvasPatchContext (non-enumerable),
  // do not publish generic aliases like window.canvas/window.div/window.offscreenCanvas.
  function __defineHidden__(obj, prop, value, diagCode, diagKey, message) {
    const stage = (typeof diagCode === 'string' && diagCode.indexOf(':guard:') !== -1)
      ? 'guard'
      : ((typeof diagCode === 'string' && diagCode.indexOf(':preflight:') !== -1) ? 'preflight' : 'apply');
    try {
      Object.defineProperty(obj, prop, {
        value,
        writable: true,
        configurable: true,
        enumerable: false
      });
      return true;
    } catch (eSet) {
      emitCanvasDiag('warn', diagCode, eSet, {
        stage,
        key: diagKey || prop,
        type: 'browser structure missing data',
        message: message || 'defineProperty failed; fallback assign used'
      });
      try {
        obj[prop] = value;
        return true;
      } catch (eAssign) {
        emitCanvasDiag('warn', diagCode, eAssign, {
          stage,
          key: diagKey || prop,
          type: 'browser structure missing data',
          message: 'fallback assign failed'
        });
        return false;
      }
    }
  }

  // создаём скрытый HTML-canvas в окне
  function _ensureDomOnce() {
    if (C.state.domReady) return;

    const doc = G && G.document;
    if (!doc || !doc.body || typeof doc.createElement !== 'function') {
      C.state.domReady = false;
      return; // нет DOM — выходим
    }

    // SSOT: CanvasPatchContext
    const existingCanvas = (C && C.__DOM_CANVAS__);
    const existingHost = (C && C.__DOM_CANVAS_HOST__);
    if (existingCanvas && existingHost && existingHost.contains(existingCanvas) && existingHost.parentNode) {
      C.state.domReady = true;
      return;
    }

    const screenWidth = G.__WIDTH;
    const screenHeight = G.__HEIGHT;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      emitCanvasDiag('warn', 'canvas:init:preflight:screen_dims_missing', null, {
        stage: 'preflight',
        key: '__WIDTH/__HEIGHT',
        type: 'pipeline missing data',
        data: { __WIDTH: screenWidth, __HEIGHT: screenHeight }
      });
      return;
    }
    const viewportWidth = (
      Number.isFinite(G.innerWidth) && G.innerWidth > 0
    ) ? Math.round(G.innerWidth) : Math.round(screenWidth);
    const viewportHeight = (
      Number.isFinite(G.innerHeight) && G.innerHeight > 0
    ) ? Math.round(G.innerHeight) : Math.round(screenHeight);
    const baseCanvasWidth = 300;
    const baseCanvasHeight = 150;
    const div = doc.createElement('div');
    const __prng = __resolvePrngState();
    if (typeof __prng.seed !== 'string' || !__prng.seed) {
      emitCanvasDiag('warn', 'canvas:init:preflight:global_seed_missing', null, {
        stage: 'preflight',
        key: '__GLOBAL_SEED',
        type: 'pipeline missing data'
      });
      return;
    }
    if (typeof __prng.strToSeed !== 'function' || typeof __prng.mulberry32 !== 'function') {
      emitCanvasDiag('warn', 'canvas:init:preflight:prng_helpers_missing', null, {
        stage: 'preflight',
        key: 'strToSeed/mulberry32',
        type: 'pipeline missing data'
      });
      return;
    }
    const rng = __prng.mulberry32(__prng.strToSeed(__prng.seed + '|canvasId'));
    const u1 = rng();
    const u2 = rng();

    div.id = 'canvas_01' + u1.toString(36).slice(2, 10);

    const OFFSCREEN_LEFT_PX =
      -(viewportWidth + Math.floor(1000 + u2 * 4002));

    div.style.position = 'fixed';
    div.style.left = `${OFFSCREEN_LEFT_PX}px`;
    div.style.top = '0';
    div.style.width = `${viewportWidth}px`;
    div.style.height = `${viewportHeight}px`;
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    (doc.body || doc.documentElement).appendChild(div);

    const canvas = doc.createElement('canvas');
    canvas.width = baseCanvasWidth;
    canvas.height = baseCanvasHeight;
    canvas.style.width = viewportWidth + 'px';
    canvas.style.height = viewportHeight + 'px';
    canvas.style.display = 'block';
    canvas.style.background = 'transparent';
    div.appendChild(canvas);

    __defineHidden__(C, '__DOM_CANVAS__', canvas,
      'canvas:init:apply:dom_storage_define_failed',
      '__DOM_CANVAS__',
      'DOM canvas defineProperty failed; fallback assign used'
    );
    __defineHidden__(C, '__DOM_CANVAS_HOST__', div,
      'canvas:init:apply:dom_storage_define_failed',
      '__DOM_CANVAS_HOST__',
      'DOM host defineProperty failed; fallback assign used'
    );
    C.state.domReady = true;
  }

  // создаём OffscreenCanvas (и в окне, и в воркере)
  function _ensureOffscreenOnce() {
    if (C.state.offscreenReady) return;
    if (typeof G.OffscreenCanvas === 'undefined') return;

    const screenWidth = G.__WIDTH;
    const screenHeight = G.__HEIGHT;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      emitCanvasDiag('warn', 'canvas:init:preflight:screen_dims_missing', null, {
        stage: 'preflight',
        key: '__WIDTH/__HEIGHT',
        type: 'pipeline missing data',
        data: { __WIDTH: screenWidth, __HEIGHT: screenHeight }
      });
      return;
    }
    if (!(C && C.__OFFSCREEN_CANVAS__)) {
      const osc = new G.OffscreenCanvas(screenWidth, screenHeight);
      __defineHidden__(C, '__OFFSCREEN_CANVAS__', osc,
        'canvas:init:apply:offscreen_storage_define_failed',
        '__OFFSCREEN_CANVAS__',
        'offscreen defineProperty failed; fallback assign used'
      );
    }
    C.state.offscreenReady = true;
  }

  // Воркеру нужен Offscreen без ожидания DOM; в окне — это тоже безопасно
  _ensureOffscreenOnce();

  // Фасад для окна: создаёт DOM и гарантирует Offscreen (идемпотентно)
  function realInit() {
    _ensureDomOnce();
    _ensureOffscreenOnce();
    emitCanvasDiag('info', 'canvas:init:apply:real_init', null, {
      stage: 'apply',
      message: 'Canvas realInit done',
      data: {
        hasCanvas: !!(C && C.__DOM_CANVAS__),
        hasOffscreen: !!(C && C.__OFFSCREEN_CANVAS__)
      }
    });
  }

  if (typeof G.document !== 'undefined' && G.document.readyState === 'loading') {
    G.document.addEventListener('DOMContentLoaded', realInit, { once: true });
  } else if (typeof G.document !== 'undefined') {
    realInit();
  }
 

  function stringHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }


  function stableNoiseFromString(str, min, max) {
  //The ONLY source: __GLOBAL_SEED + key -> mulberry32(strToSeed(...))
  const __prng = __resolvePrngState();
  if (typeof __prng.seed !== 'string' || !__prng.seed)
    throw new Error('[PRNG] __GLOBAL_SEED is required');
  if (typeof __prng.strToSeed !== 'function' || typeof __prng.mulberry32 !== 'function')
    throw new Error('[PRNG] strToSeed/mulberry32 are required')
    const seedStr = str + ':' + (__prng.seed);
    let x = stringHash(seedStr);
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    const frac = (x >>> 0) / 4294967295;
    return min + frac * (max - min);
  }


  function q256(v){ return Math.round(v * 256) / 256; }

  // function makeCanvas(w, h) {
  //   // быстрая нормализация размеров
  //   w = w | 0; h = h | 0; if (w <= 0 || h <= 0) return null;

  //   // 1) предпочитаем OffscreenCanvas, если доступен
  //   if (typeof OffscreenCanvas !== 'undefined') {
  //     try { return new OffscreenCanvas(w, h); } catch (e) {
  //       emitCanvasDiag('warn', 'canvas:makeCanvas:apply:offscreen_construct_failed', e, {
  //         stage: 'apply',
  //         key: 'OffscreenCanvas',
  //         type: 'browser structure missing data'
  //       });
  //     }
  //   if (typeof document !== 'undefined') { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
  //   }
    
  //   // 2) фолбэк: DOM <canvas>
  //   if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
  //     const c = document.createElement('canvas');
  //     c.width = w; c.height = h;
  //     return c;
  //   }

  //   // 3) среда без обоих вариантов
  //   return null;
  // }




  const __CNV_CFG__ = {
    dxPx: 0.10,      // амплитуда X (px)
    dyPx: 0.10,      // амплитуда Y (px)
  };

  // =====================================================================
  // TEXT / FONTS (Layer 1: vector/layout stage, pre-raster)
  //
  // What lives here (single semantic block):
  // - TextMetrics: `measureTextNoiseHook` + `applyMeasureTextHook` (Proxy + cache)
  // - Text draw noise: `fillTextNoiseHook` / `strokeTextNoiseHook` (arg-level jitter)
  // - Font-scaling masters: `patchFontSizeScalingHooks()` → `applyFillTextHook` / `applyStrokeTextHook`
  //
  // Runtime order (facts from `sunami/assets/scripts/window/core/context.js`):
  // - fillText:  `applyFillTextHook` (if exists) → `fillTextNoiseHook` → native
  // - strokeText:`applyStrokeTextHook` (if exists) → `strokeTextNoiseHook` → native
  //
  // Important invariants:
  // - `widthNoise` must remain local to `applyMeasureTextHook` (do not mutate global state here).
  // - TextMetrics cache can "freeze" first-seen values per key; if first `measureText()` happens before fonts load,
  //   downstream hashes may stop changing. Root-cause is *not proven here* — needs runtime confirmation.
  // =====================================================================
  function measureTextNoiseHook(res, text, font) {
    if (!res) return null;
    const txt  = String(text ?? '');
    const fRaw = (typeof font === 'string' && font.trim())
      ? font
      : (this && typeof this.font === 'string' && this.font.trim()) ? this.font : DEFAULT_CTX2D_FONT;
    const fStr = fRaw.replace(/\s+/g, ' ');
    const mm = fStr.match(/(\d+(?:\.\d+)?)px/i);
    const px = mm ? parseFloat(mm[1]) : 16;
    const len = txt.length >>> 0;
    const baseWidth = Math.max(1, 0.6 * px * len);
    const approx = {
      width:   baseWidth,
      ascent:  0.8 * px,
      descent: 0.2 * px,
      left:    0,
      right:   baseWidth,
      fAscent: 0.8 * px,
      fDescent:0.2 * px
    };

    // Don't make any noise here, otherwise  "width" will ruin the consistency
    const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
      ? +devicePixelRatio
      : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
          ? +globalThis.__DPR
          : undefined);

    const key = `${fStr}\u241F${txt}\u241F${dpr}`;
    const widthNoise = 0;
    return { key, approx, widthNoise };
  }

  function getManagedFontConfig(font) {
    try {
      const cfgs = Array.isArray(window.fontPatchConfigs) ? window.fontPatchConfigs : [];
      const fontStr = String(font || '');
      const fontLower = fontStr.toLowerCase();
      for (const c of cfgs) {
        if (!c || typeof c !== 'object') continue;
        const fam = (c.family instanceof RegExp) ? c.family : new RegExp(c.family || '.*', 'i');
        const wt  = (c.weight == null) ? null : String(c.weight).toLowerCase();
        if (fam.test(fontStr) && (!wt || fontLower.includes(wt))) {
          return c;
        }
      }
    } catch (e) {
      emitCanvasDiag('warn', 'canvas:fonts:managed_config_resolve_failed', e, {
        stage: 'runtime',
        key: 'fontPatchConfigs'
      });
    }
    return null;
  }

  //  Proxy TextMetrics
  function applyMeasureTextHook(nativeMetrics, text, font) {
    try {
      // Cache-freeze root cause (by design): TextMetrics cache has no invalidation.
      // If the first measureText() for a key happens before fonts are actually ready,
      // the cached values can "cement" early/fallback metrics forever for that key.
      //
      // Mitigation (minimal, MDN/Chromium-consistent):
      // - Do not create/use TextMetrics cache until fonts are ready.
      // - Keep API-shape compatibility: do not synthesize values for properties absent on native TextMetrics.

      const doc = (window && window.document);
      const ffs = doc && doc.fonts;
      const fontStr = (typeof font === 'string' && font.trim())
        ? font
        : (this && typeof this.font === 'string' && this.font.trim()) ? this.font : DEFAULT_CTX2D_FONT;
      const managedFontCfg = getManagedFontConfig(fontStr);
      const isManagedFont = !!managedFontCfg;

      const fontsState = (C && C.__FONTS_STATE__ && typeof C.__FONTS_STATE__ === 'object')
        ? C.__FONTS_STATE__
        : null;
      const fontsReadyFlag = !!(fontsState && fontsState.ready === true);

      const nativeFontsReady = !!(ffs && typeof ffs.status === 'string' && ffs.status === 'loaded');

      // Managed fonts stay on the explicit CanvasPatchContext.__FONTS_STATE__.ready gate.
      // Unmanaged/custom CSS fonts must follow only native FontFaceSet readiness.
      const fontsReady = isManagedFont ? fontsReadyFlag : nativeFontsReady;
      if (!fontsReady) return nativeMetrics;
      // NOTE: widthNoise is intentionally applied ONLY here (post-read),
      // measureTextNoiseHook itself must not change returned metrics for consistency.
      const info = measureTextNoiseHook.call(this, nativeMetrics, text, fontStr);
      if (!info || typeof info !== 'object') return nativeMetrics;
      const C  = window.CanvasPatchContext || (window.CanvasPatchContext = {});
      const TM = C.__TextMetrics__ || (C.__TextMetrics__ = { cache: new Map() });
      const key = (typeof info.key === 'string' && info.key.length) ? info.key : null;
      return new Proxy(nativeMetrics, {
        get(t, p) {
          const hasProp = (p in t);
          if (key) {
            const cached = TM.cache.get(key);
            if (hasProp && cached && typeof cached[p] === 'number') return cached[p];
          }
          let v = Reflect.get(t, p, t);
          if (!hasProp) return v;
          if (!(typeof v === 'number' && isFinite(v))) {
            const a = info.approx || {};
            if (p === 'width')                          v = a.width   ?? 1;
            else if (p === 'actualBoundingBoxAscent')   v = a.ascent  ?? 0;
            else if (p === 'actualBoundingBoxDescent')  v = a.descent ?? 0;
            else if (p === 'fontBoundingBoxAscent')     v = a.fAscent ?? 0;
            else if (p === 'fontBoundingBoxDescent')    v = a.fDescent?? 0;
            else if (p === 'actualBoundingBoxLeft')     v = a.left    ?? 0;
            else if (p === 'actualBoundingBoxRight')    v = a.right   ?? 0;
            else if (p === 'emHeightAscent')            v = a.ascent  ?? 0;
            else if (p === 'emHeightDescent')           v = a.descent ?? 0;
            else return v;
          }
          const out = (p === 'width') ? (v + (info.widthNoise || 0)) : v;
          if (key && typeof out === 'number' && isFinite(out)) {
            const rec = TM.cache.get(key) || {};
            rec[p] = out;
            TM.cache.set(key, rec);
          }
          return out;
        },
        has: (t,p) => p in t,
      });
    } catch (e) {
      emitCanvasDiag('warn', 'canvas:measureText:hook:failed', e, {
        stage: 'hook',
        key: 'measureText'
      });
    }
    return nativeMetrics;
  }

  // ===== fillTextNoiseHook  =====
  function fillTextNoiseHook(text, x, y, ...rest) {
    const font = (this && this.font) || '';
    const keyx = `fx|${font}\u241F${text}`;
    const keyy = `fy|${font}\u241F${text}`;
    const dx = stableNoiseFromString(keyx, -(__CNV_CFG__.dxPx), (__CNV_CFG__.dxPx));
    const dy = stableNoiseFromString(keyy, -(__CNV_CFG__.dyPx), (__CNV_CFG__.dyPx));
    return [text, x + dx, y + dy, ...rest];
  }

  // ===== strokeTextNoiseHook  =====
  function strokeTextNoiseHook(text, x, y, ...rest) {
    const font = (this && this.font) || '';
    const keyx = `sx|${font}\u241F${text}`;
    const keyy = `sy|${font}\u241F${text}`;
    const dx = stableNoiseFromString(keyx, -(__CNV_CFG__.dxPx), (__CNV_CFG__.dxPx));
    const dy = stableNoiseFromString(keyy, -(__CNV_CFG__.dyPx), (__CNV_CFG__.dyPx));
    return [text, x + dx, y + dy, ...rest];
  }

  // === Font size scaling: masters for fillText/strokeText (Layer 1) ===
  //
  // Requirements:
  // - Reads global configs: `window.fontPatchConfigs` (optional)
  // - Writes global idempotency flag: `window.__PATCH_FONT_SCALE_HOOKS__`
  // - Exports masters: `applyFillTextHook` / `applyStrokeTextHook` (via final export section)
  //
  // NOTE: This block must not replace `window.CanvasPatchHooks` identity.
  // let applyFillTextHook, applyStrokeTextHook;

  // (function patchFontSizeScalingHooks(){
  //   if (window.__PATCH_FONT_SCALE_HOOKS__) return;
  //   window.__PATCH_FONT_SCALE_HOOKS__ = true;

  //   const Hooks = (window.CanvasPatchHooks ||= {});

  //   // ——— helpers ———
  //   // Разбор font-шортхенда: "... 16px/normal Arial"
  //   function parseFontShorthand(font) {
  //     const m = String(font || '').match(
  //       /^(?:(italic|oblique|normal)\s+)?(?:(small-caps)\s+)?(?:(bold|bolder|lighter|\d{3}|normal)\s+)?(\d+(?:\.\d+)?)px(?:\/([^\s]+))?\s+(.+)$/i
  //     );
  //     if (!m) {
  //       return { style:'normal', variant:'normal', weight:'normal', sizePx:16, line:undefined, family:'sans-serif' };
  //     }
  //     return {
  //       style:   m[1] || 'normal',
  //       variant: m[2] || 'normal',
  //       weight:  m[3] || 'normal',
  //       sizePx:  parseFloat(m[4]),
  //       line:    m[5],
  //       family:  m[6]
  //     };
  //   }

    // function buildFont(f) {
    //   if (!f || typeof f !== 'object') {
    //     throw new Error('[CanvasPatch] buildFont: invalid font object');
    //   }
    //   const parts = [];
    //   if (f.style && f.style !== 'normal') parts.push(String(f.style));
    //   if (f.variant && f.variant !== 'normal') parts.push(String(f.variant));
    //   if (f.weight && f.weight !== 'normal') parts.push(String(f.weight));

    //   const sizePx = f.sizePx;
    //   if (!(typeof sizePx === 'number' && isFinite(sizePx) && sizePx > 0)) {
    //     throw new Error('[CanvasPatch] buildFont: invalid sizePx');
    //   }
    //   const sizePart = `${sizePx}px` + (f.line ? `/${String(f.line)}` : '');
    //   parts.push(sizePart);

    //   const family = (typeof f.family === 'string') ? f.family.trim() : '';
    //   if (!family) {
    //     throw new Error('[CanvasPatch] buildFont: missing family');
    //   }
    //   parts.push(family);

    //   return parts.join(' ');
    // }

    // Масштаб под текст: сперва fontPatchConfigs, фолбэк — __FONT_SCALE__
    // function getScaleForText(ctx, text) {
    //   try {
    //     const font = String(ctx && ctx.font || '');
    //     const cfg = getManagedFontConfig(font);
    //     if (cfg) {
    //       const sx = Number.isFinite(cfg.scaleX) ? cfg.scaleX : (Number.isFinite(cfg.scale) ? cfg.scale : 1);
    //       const sy = Number.isFinite(cfg.scaleY) ? cfg.scaleY : (Number.isFinite(cfg.scale) ? cfg.scale : 1);
    //       return { sx, sy };
    //     }
    //   } catch (e) {
    //     emitCanvasDiag('warn', 'canvas:font_scale:runtime:config_read_failed', e, {
    //       stage: 'runtime',
    //       key: 'fontPatchConfigs'
    //     });
    //   }
    //   return { sx: 1, sy: 1 };
    // }

    // ——— master for fillText: consistent render ———
    // applyFillTextHook = function(origFillText, text, x, y, maxWidth) {
    //   const { sx, sy } = getScaleForText(this, text);
    //   if (sx===1 && sy===1) {
    //     return (maxWidth!=null) ? origFillText(text, x, y, maxWidth) : origFillText(text, x, y);
    //   }
    //   // Isotropic — temporarily scale font.sizePx (faster)
    //   if (Math.abs(sx - sy) < 1e-6) {
    //     const prev = this.font || '';
    //     try {
    //       const f = parseFontShorthand(prev);
    //       f.sizePx *= sx;
    //       this.font = buildFont(f);
    //       return (maxWidth!=null) ? origFillText(text, x, y, maxWidth) : origFillText(text, x, y);
    //     } finally {
    //       this.font = prev;
    //     }
    //   }
    //   // Anisotropic — matrix scale + coordinate/width compensation
    //   this.save();
    //   try {
    //     this.scale(sx, sy);
    //     return (maxWidth!=null)
    //       ? origFillText(text, x/sx, y/sy, maxWidth/sx)
    //       : origFillText(text, x/sx, y/sy);
    //   } finally {
    //     this.restore();
    //   }
    // };

    // ——— master for strokeText: same as above ———
    // applyStrokeTextHook = function(origStrokeText, text, x, y, maxWidth) {
    //   const { sx, sy } = getScaleForText(this, text);
    //   if (sx===1 && sy===1) {
    //     return (maxWidth!=null) ? origStrokeText(text, x, y, maxWidth) : origStrokeText(text, x, y);
    //   }
    //   if (Math.abs(sx - sy) < 1e-6) {
    //     const prev = this.font || '';
    //     try {
    //       const f = parseFontShorthand(prev);
    //       f.sizePx *= sx;
    //       this.font = buildFont(f);
    //       return (maxWidth!=null) ? origStrokeText(text, x, y, maxWidth) : origStrokeText(text, x, y);
    //     } finally {
    //       this.font = prev;
    //     }
    //   }
    //   this.save();
    //   try {
    //     this.scale(sx, sy);
    //     return (maxWidth!=null)
    //       ? origStrokeText(text, x/sx, y/sy, maxWidth/sx)
    //       : origStrokeText(text, x/sx, y/sy);
    //   } finally {
    //     this.restore();
    //   }
    // };
  // })();

  function fillRectNoiseHook(x, y, w, h){
    return [ q256(x), q256(y), q256(w), q256(h) ];
  }


  // Keep native-shaped blob output here; draw/text noise remains in canvas pipeline.
  async function patchToBlobInjectNoise(blob, ...args) {
    try {
      if (!blob || !(blob instanceof Blob)) return;

      const typeArg = (typeof args[0] === 'string')
        ? args[0]
        : (args[0] && typeof args[0] === 'object' ? args[0].type : undefined);

      const mime = (typeArg || blob.type || 'image/png').toLowerCase();
      if (!/^image\/png$/i.test(mime)) return;

      return blob;
    } catch (e) {
      emitCanvasDiag('warn', 'canvas:toBlob:hook_failed', e, {
        stage: 'hook',
        key: 'toBlob'
      });
      return;
    }
  }

  // Promise-ветка convertToBlob: post-process PNG bytes без decode/getImageData + IHDR fallback.
  // 2026-02-11: heavy PNG blob post-process disabled in convertToBlob path (CPU guard).
  async function patchConvertToBlobInjectNoise(blob, options) {
    try {
      if (!blob || !(blob instanceof Blob)) return;

      const reqType = (options && options.type) || blob.type || 'image/png';
      const mime = String(reqType).toLowerCase();
      if (!/^image\/png$/i.test(mime)) return;
   
      return blob;

    } catch (e) {
      emitCanvasDiag('warn', 'canvas:convertToBlob:hook_failed', e, {
        stage: 'hook',
        key: 'convertToBlob'
      });
      return;
    }

  }


  // Deterministic pixel-noise remains in 2D draw/text hooks.
  // 2026-02-11: keep toDataURL hook lightweight and single-pass.
  // No decode/getImageData/re-encode/readback calls here.
  function patchToDataURLInjectNoise(res, type, quality) {
    if (typeof res !== 'string') return res;
    if (type && String(type).toLowerCase() !== 'image/png') return res;
    if (res.indexOf('data:image/png;base64,') !== 0) return res;

    return res;
  }
    

  // === HOOK FUNCTIONS ===
  function applyDrawImageHook(origDrawImage, ...args) {
    const a = args.slice();
    if (a.length === 3) { a[1] = q256(a[1]); a[2] = q256(a[2]); }
    else if (a.length === 5) { a[1] = q256(a[1]); a[2] = q256(a[2]); a[3] = q256(a[3]); a[4] = q256(a[4]); }
    else if (a.length === 9) { a[5] = q256(a[5]); a[6] = q256(a[6]); a[7] = q256(a[7]); a[8] = q256(a[8]); }
    return origDrawImage.apply(this, a);
  }


  // master-хук toDataURL: один post-process (без дополнительного IHDR-прохода)
  function masterToDataURLHook(res, type, quality) {
    // 2026-02-11: single post-pass only.
    if (typeof patchToDataURLInjectNoise === 'function') {
      res = patchToDataURLInjectNoise.call(this, res, type, quality);
    }
    return res;
  }


// --- final export ---
// IMPORTANT: do not replace the CanvasPatchHooks object identity.
// Other modules may hold a reference to the existing object and/or keep config fields on it.
const __CanvasPatchHooksExisting__ = window.CanvasPatchHooks;
const __CanvasPatchHooks__ =
  (__CanvasPatchHooksExisting__ && (typeof __CanvasPatchHooksExisting__ === 'object' || typeof __CanvasPatchHooksExisting__ === 'function'))
    ? __CanvasPatchHooksExisting__
    : (__CanvasPatchHooksExisting__ == null ? {} : null);

if (!__CanvasPatchHooks__) {
  // Contract violation: CanvasPatchHooks must be an object container for exports.
  // Fail-fast: context.js relies on this being an object and will otherwise misbehave silently.
  throw new Error('[CanvasPatch] CanvasPatchHooks contract violation (expected object)');
}

// Prefer hidden (non-enumerable) export 
try {
  Object.defineProperty(window, 'CanvasPatchHooks', {
    value: __CanvasPatchHooks__,
    writable: true,
    configurable: true,
    enumerable: false
  });
} catch (e) {
  // Fallback: best-effort assignment. Do NOT allocate a new object here.
  try { if (window.CanvasPatchHooks == null) window.CanvasPatchHooks = __CanvasPatchHooks__; } catch (eSet) {
    emitCanvasDiag('warn', 'canvas:CanvasPatchHooks:fallback_assign_failed', eSet, {
      stage: 'apply',
      key: 'CanvasPatchHooks',
      type: 'browser structure missing data',
      message: 'CanvasPatchHooks fallback assign failed'
    });
  }
  emitCanvasDiag('warn', 'canvas:CanvasPatchHooks:define_failed', e, {
    stage: 'apply',
    key: 'CanvasPatchHooks',
    type: 'browser structure missing data'
  });
}

// __CanvasPatchHooks__.patch2DNoise = patch2DNoise;
__CanvasPatchHooks__.patchToDataURLInjectNoise = patchToDataURLInjectNoise;
// 2026-02-11: disabled export with runtime-disabled hook.
// __CanvasPatchHooks__.patchCanvasIHDRHook = patchCanvasIHDRHook;
__CanvasPatchHooks__.masterToDataURLHook = masterToDataURLHook;
__CanvasPatchHooks__.patchToBlobInjectNoise = patchToBlobInjectNoise;
__CanvasPatchHooks__.patchConvertToBlobInjectNoise = patchConvertToBlobInjectNoise;
__CanvasPatchHooks__.measureTextNoiseHook = measureTextNoiseHook;
__CanvasPatchHooks__.applyMeasureTextHook = applyMeasureTextHook;
__CanvasPatchHooks__.fillTextNoiseHook = fillTextNoiseHook;
__CanvasPatchHooks__.strokeTextNoiseHook = strokeTextNoiseHook;
__CanvasPatchHooks__.fillRectNoiseHook = fillRectNoiseHook;
// __CanvasPatchHooks__.addCanvasNoise = addCanvasNoise;
__CanvasPatchHooks__.applyDrawImageHook = applyDrawImageHook;

// if (typeof applyFillTextHook === 'function') __CanvasPatchHooks__.applyFillTextHook = applyFillTextHook;
// if (typeof applyStrokeTextHook === 'function') __CanvasPatchHooks__.applyStrokeTextHook = applyStrokeTextHook;
}
