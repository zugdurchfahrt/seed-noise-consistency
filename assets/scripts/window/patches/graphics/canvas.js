/*
== CONTRACT (CURRENT PIPELINE FACTS) ==

Draft target: `Canvas_blueprint2102/canvas_stucture_draft.js`
Source base:  `sunami/assets/scripts/window/patches/graphics/canvas.js`
Date: 2026-02-21

1) Roles (single contract)
- `window.CanvasPatchContext` — internal state/registries/queues (pipeline “bus”) used by `context.js`.
- `window.CanvasPatchHooks` — export surface ONLY (functions) consumed by `context.js.registerAllHooks()` and by ctx2D wrappers
  (analogy: `window.webglHooks`).

2) Identity / export rule (DO NOT break reference)
- Never replace `window.CanvasPatchHooks` object entirely (no `window.CanvasPatchHooks = { ... }`).
- Reason: `context.js` validates + registers against one container, and wrappers read hooks by reference; replacing the object creates “two baskets”.
- Allowed pattern: ensure container exists, then assign properties onto the SAME object identity; optional `Object.defineProperty(...)`
  is OK only if `value` is that same existing object (non-enumerable export, like in `webgl.js`).

3) ctx2D text pipeline order (facts from `sunami/assets/scripts/window/core/context.js`)
- `fillText`: if `typeof H.applyFillTextHook === 'function'` → runs FIRST and receives `(callOrig, text, x, y, ...rest)`.
  Else if `typeof H.fillTextNoiseHook === 'function'` → can rewrite args → then native `fillText`.
  Else → native `fillText`.
- `strokeText`: same order with `applyStrokeTextHook` / `strokeTextNoiseHook`.

 4) Registration facts (facts from `sunami/assets/scripts/window/core/context.js`)
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

== END CONTRACT ==
*/

const CanvasPatchModule = function CanvasPatchModule(window) {
const G = (typeof globalThis !== 'undefined' && globalThis)
  || (typeof self !== 'undefined' && self)
  || (typeof window !== 'undefined' && window)
  || {};

if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
  window = G;
}

const C  = window.CanvasPatchContext || (window.CanvasPatchContext = {});
if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registratio not available');
  function emitCanvasDiag(level, code, err, extra) {
    const d = window.__DEGRADE__;
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

  // Native default ctx2d font (MDN/Chromium-consistent). Cache it once in CanvasPatchContext.
  const DEFAULT_CTX2D_FONT = (function initDefaultCtx2DFont(){
    try {
      const cached = (C && typeof C.__DEFAULT_CTX2D_FONT__ === 'string') ? C.__DEFAULT_CTX2D_FONT__ : '';
      if (cached && cached.trim()) return cached.trim();

      const doc = window && window.document;
      if (!doc || typeof doc.createElement !== 'function') {
        throw new Error('[CanvasPatch] document.createElement missing');
      }
      const canvas = doc.createElement('canvas');
      const ctx = (canvas && typeof canvas.getContext === 'function') ? canvas.getContext('2d') : null;
      const font = (ctx && typeof ctx.font === 'string' && ctx.font.trim()) ? ctx.font.trim() : '';
      if (!font) throw new Error('[CanvasPatch] default ctx2d.font missing/invalid');

      try {
        Object.defineProperty(C, '__DEFAULT_CTX2D_FONT__', {
          value: font,
          writable: false,
          configurable: true,
          enumerable: false
        });
      } catch (eDef) {
        emitCanvasDiag('warn', 'canvas:ctx2d:guard:default_font_define_failed', eDef, {
          stage: 'guard',
          key: '__DEFAULT_CTX2D_FONT__',
          type: 'browser structure missing data'
        });
        try { C.__DEFAULT_CTX2D_FONT__ = font; } catch (_) {}
      }
      return font;
    } catch (e) {
      emitCanvasDiag('warn', 'canvas:ctx2d:guard:default_font_compute_failed', e, {
        stage: 'guard',
        key: 'ctx.font',
        type: 'browser structure missing data'
      });
      const cached = (C && typeof C.__DEFAULT_CTX2D_FONT__ === 'string') ? C.__DEFAULT_CTX2D_FONT__ : '';
      return (cached && cached.trim()) ? cached.trim() : '16px sans-serif';
    }
  })();

  // === MODULE INITIALIZATION ===
  // Создаём <canvas> (идемпотентно) и разделяем DOM/Offscreen пути
  // Состояние модуля (общий контекст)
  C.state = C.state || { domReady: false, offscreenReady: false };

  // создаём скрытый HTML-canvas в окне
  function _ensureDomOnce() {
    if (C.state.domReady) return;
    if (typeof document === 'undefined' || !document.body) {
      C.state.domReady = false;
      return; // нет DOM — выходим
    }
    if (window.canvas && window.canvas.parentNode) {
      C.state.domReady = true;
      return;
    }
    const screenWidth = window.__WIDTH;
    const screenHeight = window.__HEIGHT;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      throw new Error('[CanvasPatch] screenWidth / screenHeight not set');
    }
    const viewportWidth = (
      Number.isFinite(window.innerWidth) && window.innerWidth > 0
    ) ? Math.round(window.innerWidth) : Math.round(screenWidth);
    const viewportHeight = (
      Number.isFinite(window.innerHeight) && window.innerHeight > 0
    ) ? Math.round(window.innerHeight) : Math.round(screenHeight);
    const baseCanvasWidth = 300;
    const baseCanvasHeight = 150;
    const div = document.createElement('div');
    if (typeof G.__GLOBAL_SEED !== 'string' || !G.__GLOBAL_SEED) {
      throw new Error('[CanvasPatch] __GLOBAL_SEED missing');
    }
    if (typeof G.strToSeed !== 'function' || typeof G.mulberry32 !== 'function') {
      throw new Error('[CanvasPatch] strToSeed/mulberry32 missing');
    }
    const rng = G.mulberry32(G.strToSeed(G.__GLOBAL_SEED + '|canvasId'));
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
    (document.body || document.documentElement).appendChild(div);

    const canvas = document.createElement('canvas');
    canvas.width = baseCanvasWidth;
    canvas.height = baseCanvasHeight;
    canvas.style.width = viewportWidth + 'px';
    canvas.style.height = viewportHeight + 'px';
    canvas.style.display = 'block';
    canvas.style.background = 'transparent';
    div.appendChild(canvas);

    window.canvas = canvas;
    window.div = div;
    C.state.domReady = true;
  }

  // создаём OffscreenCanvas (и в окне, и в воркере)
  function _ensureOffscreenOnce() {
    if (C.state.offscreenReady) return;
    if (typeof window.OffscreenCanvas === 'undefined') return;
    const screenWidth = window.__WIDTH;
    const screenHeight = window.__HEIGHT;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      throw new Error('[CanvasPatch] screenWidth / screenHeight not set');
    }
    if (!window.offscreenCanvas) {
      window.offscreenCanvas = new window.OffscreenCanvas(screenWidth, screenHeight);
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
      data: { hasCanvas: !!window.canvas }
    });
  }

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', realInit, { once: true });
  } else if (typeof document !== 'undefined') {
    realInit();
  }

    // ===== stable noise helper (module-scope) =====
  function __stableNoise__(key, a, b){
    //The ONLY source: __GLOBAL_SEED + key -> mulberry32(strToSeed(...))
    if (typeof G.__GLOBAL_SEED !== 'string' || !G.__GLOBAL_SEED)
      throw new Error('[PRNG] __GLOBAL_SEED is required');
    if (typeof G.strToSeed !== 'function' || typeof G.mulberry32 !== 'function')
      throw new Error('[PRNG] strToSeed/mulberry32 are required');
    const base = 'seed:' + G.__GLOBAL_SEED + '|key:' + String(key);
    const seed = G.strToSeed(base) >>> 0;
    const u  = G.mulberry32(seed)();   // deterministical and order-independently
    return a + (b - a) * u;
  }

  function q256(v){ return Math.round(v * 256) / 256; }

  function makeCanvas(w, h) {
    // быстрая нормализация размеров
    w = w | 0; h = h | 0; if (w <= 0 || h <= 0) return null;

    // 1) предпочитаем OffscreenCanvas, если доступен
    if (typeof OffscreenCanvas !== 'undefined') {
      try { return new OffscreenCanvas(w, h); } catch (e) {
        emitCanvasDiag('warn', 'canvas:makeCanvas:apply:offscreen_construct_failed', e, {
          stage: 'apply',
          key: 'OffscreenCanvas',
          type: 'browser structure missing data'
        });
      }
    if (typeof document !== 'undefined') { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
    }
    
    // 2) фолбэк: DOM <canvas>
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      return c;
    }

    // 3) среда без обоих вариантов
    return null;
  }
// pick exact proto for brand-safe native calls
// fallback: whatever the engine reports
  function get2DProto(ctx) {
    
    if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' && ctx instanceof OffscreenCanvasRenderingContext2D) {
      return OffscreenCanvasRenderingContext2D.prototype;
    }
    if (typeof CanvasRenderingContext2D !== 'undefined' && ctx instanceof CanvasRenderingContext2D) {
      return CanvasRenderingContext2D.prototype;
    }
    
    return Object.getPrototypeOf(ctx);
  }

  function nativeGetImageData(P, ctx, x, y, w, h) {
    const fn = P && typeof P.getImageData === 'function' ? P.getImageData : ctx.getImageData;
    return fn.call(ctx, x, y, w, h);
  }
  function nativePutImageData(P, ctx, img, x, y) {
    const fn = P && typeof P.putImageData === 'function' ? P.putImageData : ctx.putImageData;
    return fn.call(ctx, img, x, y);
  }
  function nativeDrawImage(P, ctx, src, dx, dy) {
    const fn = P && typeof P.drawImage === 'function' ? P.drawImage : ctx.drawImage;
    return fn.call(ctx, src, dx, dy);
  }
  function nativeTranslate(P, ctx, x, y) {
    const fn = P && typeof P.translate === 'function' ? P.translate : ctx.translate;
    return fn.call(ctx, x, y);
  }
  function nativeSetTransform(P, ctx, a, b, c, d, e, f) {
    const fn = P && typeof P.setTransform === 'function' ? P.setTransform : ctx.setTransform;
    return fn.call(ctx, a, b, c, d, e, f);
  }

  const __CNV_CFG__ = {
    epsBasePPX: 512,
    epsJitterFactor: 0.5,
    edgeGain: 4.0,
    maskBlurPasses: 1,
    flatMeanThreshold: 0.02,
    epsScale: 0,          // анизотр. масштаб (опц.)
    linearBlend: false ,    // гамма-корректное смешивание (опц.)
    dxPx: 0.10,      // амплитуда X (px)
    dyPx: 0.10,      // амплитуда Y (px)
  };

  // --- Джиттер: порядок-независимый, кэш по (op,w,h,dpr) ---
  const JIT_CACHE = (typeof globalThis !== 'undefined' && globalThis.__JIT_CACHE__ instanceof Map)
    ? globalThis.__JIT_CACHE__
    : (typeof globalThis !== 'undefined'
        ? (globalThis.__JIT_CACHE__ = new Map())
        : new Map());

  function __getJitter__(op, w, h, dpr, cfg = __CNV_CFG__) {
    w |= 0;
    h |= 0;
    dpr = (typeof dpr === 'number' && dpr > 0) ? +dpr
      : (typeof devicePixelRatio === 'number' && devicePixelRatio > 0) ? +devicePixelRatio
      : (typeof window !== 'undefined' && typeof window.__DPR === 'number' && window.__DPR > 0) ? +window.__DPR
      : (typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0) ? +globalThis.__DPR
      : undefined;
    if (!(typeof dpr === 'number' && dpr > 0)) {
      if (typeof globalThis !== 'undefined') {
        if (!globalThis.__JITTER_DPR_WARNED__) {
          emitCanvasDiag('warn', 'canvas:jitter:preflight:dpr_missing', null, {
            stage: 'preflight',
            key: 'dpr',
            message: 'jitter disabled: DPR missing/invalid',
            type: 'pipeline missing data'
          });
          globalThis.__JITTER_DPR_WARNED__ = true;
        }
      }
      return { epsX: 0, epsY: 0 };
    }
    const key = `${op}:${w}x${h}@${Math.round((dpr) * 1024)}`;

    const cached = JIT_CACHE.get(key); if (cached) return cached;

    const basePPX = (cfg && cfg.epsBasePPX);
    const jitterK = (cfg && cfg.epsJitterFactor != null) ? cfg.epsJitterFactor : 0.5;
    const base = 1 / (basePPX * dpr);

    const mag = base * (1 + jitterK * __stableNoise__(`${key}|m`, 0, 1));
    const ang = 2 * Math.PI * __stableNoise__(`${key}|a`, 0, 1);
    const v = { epsX: Math.cos(ang) * mag, epsY: Math.sin(ang) * mag };

    JIT_CACHE.set(key, v);
    return v;
  }

  function boxBlurMask(m, w, h) {
    const tmp = new Float32Array(m.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let acc = 0, cnt = 0;
        for (let yy = y - 1; yy <= y + 1; yy++) {
          if (yy < 0 || yy >= h) continue;
          const yOff = yy * w;
          for (let xx = x - 1; xx <= x + 1; xx++) {
            if (xx < 0 || xx >= w) continue;
            acc += m[yOff + xx]; cnt++;
          }
        }
        tmp[y * w + x] = acc / cnt;
      }
    }
    m.set(tmp);
  }


  // --- 2D ImageData noise hook ---
  function patch2DNoise(img, type) {
    if (type !== '2d' || !img || !img.data || !img.width || !img.height) return img;
    const w = img.width | 0, h = img.height | 0; if (!w || !h) return img;
    const cfg = (typeof globalThis !== 'undefined' && globalThis.CanvasPatchHooks && globalThis.CanvasPatchHooks.resampleCfg)
            || (typeof __CNV_CFG__ !== 'undefined' ? __CNV_CFG__ : {})
            || {};
    const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
      ? +devicePixelRatio
      : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
          ? +globalThis.__DPR
          : undefined);
    const { epsX, epsY } = __getJitter__('img:2d', w, h, dpr);

    const C1 = makeCanvas(w, h), C2 = makeCanvas(w, h);
    if (!C1 || !C2) return img;
    const ctx1 = C1.getContext('2d', { willReadFrequently: true });
    const ctx2 = C2.getContext('2d', { willReadFrequently: true });
    if (!ctx1 || !ctx2) return img;
    const P1 = get2DProto(ctx1), P2 = get2DProto(ctx2);

    try { ctx2.imageSmoothingEnabled = true; } catch (e) {
      emitCanvasDiag('warn', 'canvas:patch2DNoise:apply:imageSmoothing_set_failed', e, {
        stage: 'apply',
        key: 'imageSmoothingEnabled',
        type: 'browser structure missing data'
      });
    }
    nativePutImageData(P1, ctx1, img, 0, 0);
    nativeSetTransform(P2, ctx2, 1, 0, 0, 1, 0, 0);
    nativeTranslate(P2, ctx2, q256(epsX), q256(epsY));
    nativeDrawImage(P2, ctx2, C1, 0, 0);
    const res = nativeGetImageData(P2, ctx2, 0, 0, w, h);

    const src = img.data, dst = res.data;
    const mask = new Float32Array(w * h);
    let sumMask = 0;
    for (let y = 0; y < h; y++) {
      const yOff = y * w;
      for (let x = 0; x < w; x++) {
        const i4 = (yOff + x) << 2;
        const l  = 0.2126 * src[i4] + 0.7152 * src[i4 + 1] + 0.0722 * src[i4 + 2];
        const xr = (x + 1 < w) ? ((yOff + x + 1) << 2) : i4;
        const yd = (y + 1 < h) ? (((y + 1) * w + x) << 2) : i4;
        const lr = 0.2126 * src[xr] + 0.7152 * src[xr + 1] + 0.0722 * src[xr + 2];
        const ld = 0.2126 * src[yd] + 0.7152 * src[yd + 1] + 0.0722 * src[yd + 2];
        const dx = Math.abs(l - lr) / 255; const dy = Math.abs(l - ld) / 255;
        let m = (dx + dy) * (cfg.edgeGain ?? 4.0);
        if (m > 1) m = 1; mask[yOff + x] = m; sumMask += m;
      }
    }
    if (sumMask / (w * h) < (cfg.flatMeanThreshold ?? 0.02)) return img;

    const blurPasses = (cfg.maskBlurPasses ?? 1) | 0;
    for (let p = 0; p < blurPasses; p++) boxBlurMask(mask, w, h);

    const out = new Uint8ClampedArray(src.length);
    for (let i = 0; i < out.length; i += 4) {
      const m = mask[i >> 2];
      if (m > 0) {
        out[i]     = src[i]     + (dst[i]     - src[i])     * m;
        out[i + 1] = src[i + 1] + (dst[i + 1] - src[i + 1]) * m;
        out[i + 2] = src[i + 2] + (dst[i + 2] - src[i + 2]) * m;
      } else {
        out[i]     = src[i];
        out[i + 1] = src[i + 1];
        out[i + 2] = src[i + 2];
      }
      out[i + 3] = src[i + 3];
    }
    return new ImageData(out, w, h);
  }

  //  addCanvasNoise()
  function addCanvasNoise(imageData, dx = 0, dy = 0) {
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};
    try {
      const cfg = (G.CanvasPatchHooks && G.CanvasPatchHooks.noiseCfg) || {};
      const density  = Number.isFinite(cfg.density)  ? cfg.density  : 0.08;
      const strength = Number.isFinite(cfg.strength) ? cfg.strength : 0.75;
      const mono = !!cfg.mono;

      if (!imageData || !imageData.data || !imageData.width || !imageData.height) return;
      const w = imageData.width | 0;
      const h = imageData.height | 0;
      if (!w || !h) return;

      const data = imageData.data;
      const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
        ? +devicePixelRatio
        : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
            ? +globalThis.__DPR
            : undefined);
            
      const cnv  = (this && this.canvas) ? this.canvas : null;
      const cid  = (() => {
        try { const cw = cnv && cnv.width, ch = cnv && cnv.height; return `cnv@${cw}x${ch}@${(Math.round(dpr * 1024))}`; }
        catch (e) {
          emitCanvasDiag('warn', 'canvas:addCanvasNoise:runtime:canvas_size_read_failed', e, {
            stage: 'runtime',
            key: 'canvas',
            type: 'browser structure missing data'
          });
          return `cnv@${w}x${h}@${(Math.round(dpr * 1024))}`;
        }
      })();
      const baseKey = `px|${w}x${h}|${cid}|dx:${dx|0},dy:${dy|0}`;

      for (let y = 0, i = 0; y < h; y++) {
        const ay = (dy|0) + y;
        for (let x = 0; x < w; x++, i += 4) {
          const ax = (dx|0) + x;

          const gate = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|g`, 0, 1);
          if (gate > density) continue;

          if (mono) {
            const d  = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|mono`, -strength, +strength);
            let r = data[i] + d, g = data[i+1] + d, b = data[i+2] + d;
            data[i]   = r < 0 ? 0 : r > 255 ? 255 : r;
            data[i+1] = g < 0 ? 0 : g > 255 ? 255 : g;
            data[i+2] = b < 0 ? 0 : b > 255 ? 255 : b;
          } else {
            const dr = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|r`, -strength, +strength);
            const dg = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|g`, -strength, +strength);
            const db = __stableNoise__(`${baseKey}|x:${ax},y:${ay}|b`, -strength, +strength);
            let r = data[i] + dr, g = data[i+1] + dg, b = data[i+2] + db;
            data[i]   = r < 0 ? 0 : r > 255 ? 255 : r;
            data[i+1] = g < 0 ? 0 : g > 255 ? 255 : g;
            data[i+2] = b < 0 ? 0 : b > 255 ? 255 : b;
          }
        }
      }
    } catch (e) {
      emitCanvasDiag('warn', 'canvas:addCanvasNoise:hook:failed', e, {
        stage: 'hook',
        key: 'addCanvasNoise'
      });
    }
  }

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

       const fontsReadyFlag =
         (Object.prototype.hasOwnProperty.call(window, '__FONTS_READY__')
           ? (window.__FONTS_READY__ === true)
           : false);

       // If Fonts-patch is enabled (fontPatchConfigs present), avoid trusting FontFaceSet.status.
       // `status === 'loaded'` can be true even before our injected fonts are actually ready,
       // which would allow TextMetrics cache/Proxy to start too early and "freeze" fallback metrics.
       const fontsPatchEnabled = Array.isArray(window.fontPatchConfigs);
       const fontsReady = fontsPatchEnabled
         ? fontsReadyFlag
         : (fontsReadyFlag || (!!(ffs && typeof ffs.status === 'string' && ffs.status === 'loaded')));
 
       if (!fontsReady) return nativeMetrics;
      // NOTE: widthNoise is intentionally applied ONLY here (post-read),
      // measureTextNoiseHook itself must not change returned metrics for consistency.
      const info = measureTextNoiseHook.call(this, nativeMetrics, text, font);
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
    const dx = __stableNoise__(keyx, -(__CNV_CFG__.dxPx), (__CNV_CFG__.dxPx));
    const dy = __stableNoise__(keyy, -(__CNV_CFG__.dyPx), (__CNV_CFG__.dyPx));
    return [text, x + dx, y + dy, ...rest];
  }

  // ===== strokeTextNoiseHook  =====
  function strokeTextNoiseHook(text, x, y, ...rest) {
    const font = (this && this.font) || '';
    const keyx = `sx|${font}\u241F${text}`;
    const keyy = `sy|${font}\u241F${text}`;
    const dx = __stableNoise__(keyx, -(__CNV_CFG__.dxPx), (__CNV_CFG__.dxPx));
    const dy = __stableNoise__(keyy, -(__CNV_CFG__.dyPx), (__CNV_CFG__.dyPx));
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
  let applyFillTextHook, applyStrokeTextHook;

  (function patchFontSizeScalingHooks(){
    if (window.__PATCH_FONT_SCALE_HOOKS__) return;
    window.__PATCH_FONT_SCALE_HOOKS__ = true;

    const Hooks = (window.CanvasPatchHooks ||= {});

    // ——— helpers ———
    // Разбор font-шортхенда: "... 16px/normal Arial"
    function parseFontShorthand(font) {
      const m = String(font || '').match(
        /^(?:(italic|oblique|normal)\s+)?(?:(small-caps)\s+)?(?:(bold|bolder|lighter|\d{3}|normal)\s+)?(\d+(?:\.\d+)?)px(?:\/([^\s]+))?\s+(.+)$/i
      );
      if (!m) {
        return { style:'normal', variant:'normal', weight:'normal', sizePx:16, line:undefined, family:'sans-serif' };
      }
      return {
        style:   m[1] || 'normal',
        variant: m[2] || 'normal',
        weight:  m[3] || 'normal',
        sizePx:  parseFloat(m[4]),
        line:    m[5],
        family:  m[6]
      };
    }

    function buildFont(f) {
      if (!f || typeof f !== 'object') {
        throw new Error('[CanvasPatch] buildFont: invalid font object');
      }
      const parts = [];
      if (f.style && f.style !== 'normal') parts.push(String(f.style));
      if (f.variant && f.variant !== 'normal') parts.push(String(f.variant));
      if (f.weight && f.weight !== 'normal') parts.push(String(f.weight));

      const sizePx = f.sizePx;
      if (!(typeof sizePx === 'number' && isFinite(sizePx) && sizePx > 0)) {
        throw new Error('[CanvasPatch] buildFont: invalid sizePx');
      }
      const sizePart = `${sizePx}px` + (f.line ? `/${String(f.line)}` : '');
      parts.push(sizePart);

      const family = (typeof f.family === 'string') ? f.family.trim() : '';
      if (!family) {
        throw new Error('[CanvasPatch] buildFont: missing family');
      }
      parts.push(family);

      return parts.join(' ');
    }

    // Масштаб под текст: сперва fontPatchConfigs, фолбэк — __FONT_SCALE__
    function getScaleForText(ctx, text) {
      try {
        const cfgs = Array.isArray(window.fontPatchConfigs) ? window.fontPatchConfigs : [];
        const font = String(ctx && ctx.font || '');
        for (const c of cfgs) {
          const fam = (c.family instanceof RegExp) ? c.family : new RegExp(c.family || '.*', 'i');
          const wt  = (c.weight == null) ? null : String(c.weight).toLowerCase();
          if (fam.test(font) && (!wt || font.toLowerCase().includes(wt))) {
            const sx = Number.isFinite(c.scaleX) ? c.scaleX : (Number.isFinite(c.scale) ? c.scale : 1);
            const sy = Number.isFinite(c.scaleY) ? c.scaleY : (Number.isFinite(c.scale) ? c.scale : 1);
            return { sx, sy };
          }
        }
      } catch (e) {
        emitCanvasDiag('warn', 'canvas:font_scale:runtime:config_read_failed', e, {
          stage: 'runtime',
          key: 'fontPatchConfigs'
        });
      }
      const s = (typeof window.__FONT_SCALE__ === 'number' && isFinite(window.__FONT_SCALE__)) ? window.__FONT_SCALE__ : 1;
      return { sx: s, sy: s };
    }

    // ——— master for fillText: consistent render ———
    applyFillTextHook = function(origFillText, text, x, y, maxWidth) {
      const { sx, sy } = getScaleForText(this, text);
      if (sx===1 && sy===1) {
        return (maxWidth!=null) ? origFillText(text, x, y, maxWidth) : origFillText(text, x, y);
      }
      // Isotropic — temporarily scale font.sizePx (faster)
      if (Math.abs(sx - sy) < 1e-6) {
        const prev = this.font || '';
        try {
          const f = parseFontShorthand(prev);
          f.sizePx *= sx;
          this.font = buildFont(f);
          return (maxWidth!=null) ? origFillText(text, x, y, maxWidth) : origFillText(text, x, y);
        } finally {
          this.font = prev;
        }
      }
      // Anisotropic — matrix scale + coordinate/width compensation
      this.save();
      try {
        this.scale(sx, sy);
        return (maxWidth!=null)
          ? origFillText(text, x/sx, y/sy, maxWidth/sx)
          : origFillText(text, x/sx, y/sy);
      } finally {
        this.restore();
      }
    };

    // ——— master for strokeText: same as above ———
    applyStrokeTextHook = function(origStrokeText, text, x, y, maxWidth) {
      const { sx, sy } = getScaleForText(this, text);
      if (sx===1 && sy===1) {
        return (maxWidth!=null) ? origStrokeText(text, x, y, maxWidth) : origStrokeText(text, x, y);
      }
      if (Math.abs(sx - sy) < 1e-6) {
        const prev = this.font || '';
        try {
          const f = parseFontShorthand(prev);
          f.sizePx *= sx;
          this.font = buildFont(f);
          return (maxWidth!=null) ? origStrokeText(text, x, y, maxWidth) : origStrokeText(text, x, y);
        } finally {
          this.font = prev;
        }
      }
      this.save();
      try {
        this.scale(sx, sy);
        return (maxWidth!=null)
          ? origStrokeText(text, x/sx, y/sy, maxWidth/sx)
          : origStrokeText(text, x/sx, y/sy);
      } finally {
        this.restore();
      }
    };
  })();

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

// Prefer hidden (non-enumerable) export like webglHooks, but keep the same object identity.
try {
  Object.defineProperty(window, 'CanvasPatchHooks', {
    value: __CanvasPatchHooks__,
    writable: true,
    configurable: true,
    enumerable: false
  });
} catch (e) {
  // Fallback: best-effort assignment. Do NOT allocate a new object here.
  try { if (window.CanvasPatchHooks == null) window.CanvasPatchHooks = __CanvasPatchHooks__; } catch (_) {}
  emitCanvasDiag('warn', 'canvas:CanvasPatchHooks:define_failed', e, {
    stage: 'apply',
    key: 'CanvasPatchHooks',
    type: 'browser structure missing data'
  });
}

__CanvasPatchHooks__.patch2DNoise = patch2DNoise;
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
__CanvasPatchHooks__.addCanvasNoise = addCanvasNoise;
__CanvasPatchHooks__.applyDrawImageHook = applyDrawImageHook;

// optional masters (may be absent depending on build/guards)
if (typeof applyFillTextHook === 'function') __CanvasPatchHooks__.applyFillTextHook = applyFillTextHook;
if (typeof applyStrokeTextHook === 'function') __CanvasPatchHooks__.applyStrokeTextHook = applyStrokeTextHook;
}
