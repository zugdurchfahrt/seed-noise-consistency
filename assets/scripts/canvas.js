function CanvasPatchModule(window) {
  const C  = window.CanvasPatchContext || (window.CanvasPatchContext = {});
    if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registratio not available');
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self !== 'undefined' && self)
    || (typeof window !== 'undefined' && window)
    || {};
      
  // === MODULE INITIALIZATION ===
  // Создаём <canvas> (идемпотентно) и разделяем DOM/Offscreen пути
  // Состояние модуля (общий контекст)
  C.state = C.state || { domReady: false, offscreenReady: false };

  // создаём скрытый HTML-canvas в окне
  function _ensureDomOnce() {
    if (C.state.domReady) return;
    if (typeof document === 'undefined' || !document.body) return; // нет DOM — выходим
    if (window.canvas && window.canvas.parentNode) {
      C.state.domReady = true;
      return;
    }
    const screenWidth = window.__WIDTH;
    const screenHeight = window.__HEIGHT;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      throw new Error('[CanvasPatch] screenWidth / screenHeight not set');
    }
    const div = document.createElement('div');
    const u = mulberry32(strToSeed(__GLOBAL_SEED + '|canvasId'))();
    div.id = 'canvas_01' + u.toString(36).slice(2, 10);

    div.style.position = 'fixed';
    div.style.left = '-997px';
    div.style.top = '0';
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    (document.body || document.documentElement).appendChild(div);

    const canvas = document.createElement('canvas');
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    canvas.style.width = screenWidth + 'px';
    canvas.style.height = screenHeight + 'px';
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
    console.log('[CanvasPatchModule] realInit done, window.canvas set:', window.canvas);
  }

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', realInit, { once: true });
  } else if (typeof document !== 'undefined') {
    realInit();
  }

    // ===== stable noise helper (module-scope) =====
  function __stableNoise__(key, a, b){
    //The ONLY source: __GLOBAL_SEED + key -> mulberry32(strToSeed(...))
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self !== 'undefined' && self)
          || (typeof window !== 'undefined' && window)
          || {};
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
      try { return new OffscreenCanvas(w, h); } catch {}
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

  function get2DProto(ctx) {
    // pick exact proto for brand-safe native calls
    if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' && ctx instanceof OffscreenCanvasRenderingContext2D) {
      return OffscreenCanvasRenderingContext2D.prototype;
    }
    if (typeof CanvasRenderingContext2D !== 'undefined' && ctx instanceof CanvasRenderingContext2D) {
      return CanvasRenderingContext2D.prototype;
    }
    // fallback: whatever the engine reports
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
      : (typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0) ? +globalThis.__DPR
      : undefined;
    if (!(typeof dpr === 'number' && dpr > 0)) {
      throw new TypeError('__getJitter__: DPR is undefined or invalid');
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

  // edge-aware ресемпл с микроджиттером; возвращает ImageData
  function __resampleWithJitter__(img, label, cfg = __CNV_CFG__) {
    if (!img || !img.data || !img.width || !img.height) return img;
    const w = img.width | 0, h = img.height | 0; if (!w || !h) return img;
    const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio > 0)
      ? +devicePixelRatio
      : ((typeof globalThis !== 'undefined' && typeof globalThis.__DPR === 'number' && globalThis.__DPR > 0)
          ? +globalThis.__DPR
          : undefined);
    const { epsX, epsY } = __getJitter__(label, w, h, dpr);

    const C1 = makeCanvas(w, h), C2 = makeCanvas(w, h);
    if (!C1 || !C2) return img;
    const ctx1 = C1.getContext('2d', { willReadFrequently: true });
    const ctx2 = C2.getContext('2d', { willReadFrequently: true });
    if (!ctx1 || !ctx2) return img;

    const P1 = get2DProto(ctx1), P2 = get2DProto(ctx2);
    try { ctx2.imageSmoothingEnabled = true; } catch {}
    nativePutImageData(P1, ctx1, img, 0, 0);
    nativeSetTransform(P2, ctx2, 1, 0, 0, 1, 0, 0);
    nativeTranslate(P2, ctx2, q256(epsX), q256(epsY));
    nativeDrawImage(P2, ctx2, C1, 0, 0);
    const res = nativeGetImageData(P2, ctx2, 0, 0, w, h);

    const src = img.data, dst = res.data;
    const mask = new Float32Array(w * h);
    let sum = 0;
    for (let y = 0; y < h; y++) {
      const yo = y * w;
      for (let x = 0; x < w; x++) {
        const i4 = (yo + x) << 2;
        const l  = 0.2126 * src[i4] + 0.7152 * src[i4 + 1] + 0.0722 * src[i4 + 2];
        const xr = (x + 1 < w) ? ((yo + x + 1) << 2) : i4;
        const yd = (y + 1 < h) ? (((y + 1) * w + x) << 2) : i4;
        const lr = 0.2126 * src[xr] + 0.7152 * src[xr + 1] + 0.0722 * src[xr + 2];
        const ld = 0.2126 * src[yd] + 0.7152 * src[yd + 1] + 0.0722 * src[yd + 2];
        let m = ((Math.abs(l - lr) + Math.abs(l - ld)) / 255) * ((cfg && cfg.edgeGain) || 4.0);
        if (m > 1) m = 1; mask[yo + x] = m; sum += m;
      }
    }
    const mean = sum / (w * h);
    if (mean < ((cfg && cfg.flatMeanThreshold) ?? 0.02)) return img;

    const blurPasses = (cfg && cfg.maskBlurPasses) | 0;
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

    try { ctx2.imageSmoothingEnabled = true; } catch {}
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
        catch { return `cnv@${w}x${h}@${(Math.round(dpr * 1024))}`; }
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
    } catch { /* silent */ }
  }

  function measureTextNoiseHook(res, text, font) {
    if (!res) return null;
    const txt  = String(text ?? '');
    const fRaw = (typeof font === 'string' && font.trim())
      ? font
      : (this && typeof this.font === 'string' && this.font.trim()) ? this.font : '16px sans-serif';
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
      const info = measureTextNoiseHook.call(this, nativeMetrics, text, font);
      if (!info || typeof info !== 'object') return nativeMetrics;
      const C  = window.CanvasPatchContext || (window.CanvasPatchContext = {});
      const TM = C.__TextMetrics__ || (C.__TextMetrics__ = { cache: new Map() });
      const key = (typeof info.key === 'string' && info.key.length) ? info.key : null;
      return new Proxy(nativeMetrics, {
        get(t, p) {
          if (key) {
            const cached = TM.cache.get(key);
            if (cached && typeof cached[p] === 'number') return cached[p];
          }
          let v = Reflect.get(t, p, t);
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
            else v = 0;
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
    } catch(_) {}
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

  function fillRectNoiseHook(x, y, w, h){
    return [ q256(x), q256(y), q256(w), q256(h) ];
  }

  // --- toBlob noise injection hook (HTMLCanvasElement) ---
  async function patchToBlobInjectNoise(blob, ...args) {
    try {
      // 1) Ничего не делать, если blob пустой или не image/*
      if (!blob || !(blob instanceof Blob)) return;

      const typeArg = (typeof args[0] === 'string')
        ? args[0]
        : (args[0] && typeof args[0] === 'object' ? args[0].type : undefined);

      const quality = (typeof args[1] === 'number')
        ? args[1]
        : (args[0] && typeof args[0] === 'object' ? args[0].quality : undefined);

      const mime = (typeArg || blob.type || 'image/png').toLowerCase();
      if (!/^image\/(png|jpeg|webp)$/.test(mime)) return;

      // 2) Декодируем Blob в ImageBitmap (с опциями); если опции не поддерживаются — фолбэк без них
      let bmp;
      try {
        if (typeof createImageBitmap === 'function') {
          try {
            bmp = await createImageBitmap(blob, {
              colorSpaceConversion: 'none',
              premultiplyAlpha: 'premultiply',
            });
          } catch {
            // некоторые окружения игнорируют/не понимают опции — пробуем без них
            bmp = await createImageBitmap(blob);
          }
        } else {
          // (опциональный фолбэк – можно опустить)
          const url = URL.createObjectURL(blob);
          bmp = await new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = url;
          });
          URL.revokeObjectURL(url);
          // тут bmp = HTMLImageElement (без bmp.close)
        }

        const w = (bmp.width || bmp.naturalWidth || 0) | 0;
        const h = (bmp.height || bmp.naturalHeight || 0) | 0;
        if (!w || !h) return;

        // 3) Scratch-канвас
        const sc = makeCanvas(w, h);
        if (!sc) return;
        const sctx = sc.getContext('2d', { willReadFrequently: true });
        if (!sctx) return;
        sctx.imageSmoothingEnabled = false;

        // 4) Кладём bitmap на scratch
        sctx.drawImage(bmp, 0, 0);

        // 5) Единый resample + jitter (вариант B)
        const img = sctx.getImageData(0, 0, w, h);
        const j   = __resampleWithJitter__(img, 'encode', __CNV_CFG__);
        sctx.putImageData(j, 0, 0);

        // 6) Ре-энкод Blob
        const q = (/^image\/(jpeg|webp)$/i.test(mime) && typeof quality === 'number')
          ? Math.min(1, Math.max(0, quality))
          : undefined;

        if (typeof sc.convertToBlob === 'function') {
          return await sc.convertToBlob({ type: mime, quality: q });
        }
        return await new Promise(r => sc.toBlob(r, mime, q));
      } finally {
        try { bmp && bmp.close && bmp.close(); } catch {}
      }
    } catch {
      // на любой ошибке — пропустить (вернуть undefined)
      return;
    }
  }

  // IHDR-патч PNG для Offscreen/HTML convertToBlob (Promise-ветка) + выравнивание шума с toBlob/toDataURL
  async function patchConvertToBlobInjectNoise(blob, options) {
    try {
      if (!blob) return;

      const reqType = (options && options.type) || blob.type || 'image/png';
      const mime = String(reqType).toLowerCase();

      // 1) Сначала попытаемся сделать decode → __resampleWithJitter__('encode') → re-encode,
      //    чтобы Offscreen дал тот же результат, что toBlob/toDataURL.
      try {
        let bmp;
        if (typeof createImageBitmap === 'function') {
          try {
            bmp = await createImageBitmap(blob, {
              colorSpaceConversion: 'none',
              premultiplyAlpha: 'premultiply',
            });
          } catch {
            bmp = await createImageBitmap(blob);
          }
        }

        if (bmp) {
          const w = (bmp.width || bmp.naturalWidth || 0) | 0;
          const h = (bmp.height || bmp.naturalHeight || 0) | 0;
          if (w && h) {
            const sc = makeCanvas(w, h);
            if (sc) {
              const sctx = sc.getContext('2d', { willReadFrequently: true });
              if (sctx) {
                try { sctx.imageSmoothingEnabled = false; } catch {}
                sctx.drawImage(bmp, 0, 0);
                const img = sctx.getImageData(0, 0, w, h);
                const j   = __resampleWithJitter__(img, 'encode', __CNV_CFG__); // тот же label, что у toBlob/toDataURL
                sctx.putImageData(j, 0, 0);

                // Ре-энкодим в тот же форм-фактор (PNG предпочтительно; другие как есть)
                if (typeof sc.convertToBlob === 'function') {
                  return await sc.convertToBlob({ type: mime });
                }
                return await new Promise(r => sc.toBlob(r, mime));
              }
            }
          }
        }
      } catch {
        // если decode/ресэмпл не удался — молча падаем на IHDR-путь ниже
      }

      // 2) Старый IHDR-путь (PNG only) — сохраняем как fallback, чтобы не ломать совместимость
      if (!/^image\/png$/i.test(mime)) return;
      const MAX_DIM = 0x7fffffff;
      const targetW = clampInt((typeof globalThis !== 'undefined' ? globalThis._NEW_WIDTH  : undefined) ?? this?.width,  1, MAX_DIM);
      const targetH = clampInt((typeof globalThis !== 'undefined' ? globalThis._NEW_HEIGHT : undefined) ?? this?.height, 1, MAX_DIM);
      if (!targetW || !targetH) return;

      const u8 = new Uint8Array(await blob.arrayBuffer());

      // 4) валидация PNG + IHDR(len=13)
      if (!isPngWithIhdr(u8)) return;

      writeBE(u8, 16, targetW >>> 0);
      writeBE(u8, 20, targetH >>> 0);
      const crc = crc32(u8, 12, 12 + 4 + 13);
      writeBE(u8, 12 + 4 + 13, crc >>> 0);

      // 6) возвращаем новый Blob с тем же типом
      return new Blob([u8], { type: 'image/png' });

    } catch {
      // На любой ошибке не ломаем цепочку — просто пропускаем дальше исходный blob
      return;
    }

    // --- helpers ---
    function clampInt(v, min, max) {
      v = Number.isFinite(v) ? Math.floor(v) : min;
      if (v < min) v = min; if (v > max) v = max; return v | 0;
    }
    function isPngWithIhdr(bytes) {
      // сигнатура PNG
      const sig = [137,80,78,71,13,10,26,10];
      for (let i=0;i<8;i++) if (bytes[i]!==sig[i]) return false;
      const len = (bytes[8]<<24)|(bytes[9]<<16)|(bytes[10]<<8)|bytes[11];
      if (len !== 13) return false;
      if (String.fromCharCode(bytes[12],bytes[13],bytes[14],bytes[15]) !== 'IHDR') return false;
      return true;
    }
    function writeBE(a, off, v) {
      a[off  ] = (v >>> 24) & 255;
      a[off+1] = (v >>> 16) & 255;
      a[off+2] = (v >>>  8) & 255;
      a[off+3] = (v >>>  0) & 255;
    }
    function getCrcTable() {
      const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self !== 'undefined' && self)
        || (typeof window !== 'undefined' && window)
        || {};
      if (G._crcTable) return G._crcTable;
      const t = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
      }
      G._crcTable = t;
      return t;
    }
    function crc32(arr, from, toExcl) {
      const tab = getCrcTable();
      let crc = ~0 >>> 0;
      for (let i = from; i < toExcl; i++) crc = (tab[(crc ^ arr[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
      return (~crc) >>> 0;
    }
  }


// --- IHDR patch (для masterToDataURLHook) ---
/**
 * Синхронный хук для dataURL/HTMLCanvasElement.
 * OffscreenCanvas — не поддерживается (нет sync toDataURL).
 */
  function patchCanvasIHDR(input, newW, newH) {
    const MAX_DIM = 0x7fffffff;
    const W = Math.max(1, Math.min(Math.floor(newW), MAX_DIM))|0;
    const H = Math.max(1, Math.min(Math.floor(newH), MAX_DIM))|0;

    let base64;
    if (typeof input === 'string' && input.startsWith('data:image/png')) {
      base64 = input.split(',')[1];
    } else if (typeof HTMLCanvasElement !== 'undefined' && input instanceof HTMLCanvasElement) {
      const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self !== 'undefined' && self)
        || (typeof window !== 'undefined' && window)
        || {};
      const safeInvoke = (typeof G.__canvasSafeInvoke__ === 'function')
        ? G.__canvasSafeInvoke__
        : ((fn, tgt, args) => fn.apply(tgt, args));
      const GUARD='__isChain_toDataURL';
      const prev = input[GUARD]; input[GUARD] = true;
      try {
        const url = safeInvoke(HTMLCanvasElement.prototype.toDataURL, input, ['image/png']);
        base64 = url.split(',')[1];
      } finally {
        input[GUARD] = prev;
      }
    } else {
      throw new TypeError('[patchCanvasIHDRSync] Unsupported input type for sync path');
    }

    const bin = atob(base64);
    const buf = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) buf[i] = bin.charCodeAt(i);

    // PNG + IHDR
    const sig=[137,80,78,71,13,10,26,10];
    for (let i=0;i<8;i++) if (buf[i]!==sig[i]) return 'data:image/png;base64,'+base64;
    const len=((buf[8]<<24)|(buf[9]<<16)|(buf[10]<<8)|buf[11]); if (len!==13) return 'data:image/png;base64,'+base64;
    if (String.fromCharCode(buf[12],buf[13],buf[14],buf[15])!=='IHDR') return 'data:image/png;base64,'+base64;

    // write W/H
    buf.set([ (W>>>24)&255,(W>>>16)&255,(W>>>8)&255,(W)&255 ], 16);
    buf.set([ (H>>>24)&255,(H>>>16)&255,(H>>>8)&255,(H)&255 ], 20);

    // CRC
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};

    const tab = (function(){ if (G._crcTable) return G._crcTable;
      const t=new Uint32Array(256); for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0;} return (G._crcTable=t);
    })();
    let crc=~0>>>0;
    for (let i=12;i<12+4+13;i++) crc=(tab[(crc^buf[i])&255]^(crc>>>8))>>>0;
    crc=(~crc)>>>0;
    const crcOff=12+4+13;
    buf.set([ (crc>>>24)&255,(crc>>>16)&255,(crc>>>8)&255,(crc)&255 ], crcOff);

    // back to dataURL
    let s='',CH=0x8000; for(let i=0;i<buf.length;i+=CH) s+=String.fromCharCode.apply(null,buf.subarray(i,i+CH));
    return 'data:image/png;base64,'+btoa(s);
  }

  // Шумим ДО кодирования: снимаем пиксели, добавляем детерминированный микрошум,
  // кодируем на временном canvas, оригинал canvas не мутируем.
  function patchToDataURLInjectNoise(res, type, quality) {
    const mime = type || 'image/png';
    if (type && !/^image\//i.test(type)) return res;
    const canvas = this;
    const isCanvas =
      (typeof HTMLCanvasElement   !== 'undefined' && canvas instanceof HTMLCanvasElement) ||
      (typeof OffscreenCanvas     !== 'undefined' && canvas instanceof OffscreenCanvas);

    if (!isCanvas) return res;

    const w = canvas.width >>> 0;
    const h = canvas.height >>> 0;
    if (!w || !h) return res;

    function get2dRF(cnv) {
      if (!cnv || !cnv.getContext) return null;
      if (cnv.__tduCtx2dRF && cnv.__tduCtx2dRF.canvas === cnv) return cnv.__tduCtx2dRF;
      let ctx = null;
      ctx = cnv.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      try { Object.defineProperty(cnv, '__tduCtx2dRF', { value: ctx }); } catch(_) {}
      return ctx;
    }

    // 1) Снимаем пиксели, добавляем детерминированный микрошум, кладём обратно
    const ctx = get2dRF(canvas);
    if (!ctx) return res;
    try {
      const img = ctx.getImageData(0, 0, w, h);
      const j   = __resampleWithJitter__(img, 'encode', __CNV_CFG__);
      if (j && j.data && j.width === w && j.height === h) {
        ctx.putImageData(j, 0, 0);
      }
    } catch(_) { /* тихий фолбэк на исходный res */ }

    // Снимок без мутаций
    const snap = ctx.getImageData(0, 0, w, h);

    // Усиленная быстрая сигнатура (FNV-1a, выборка с шагом)
    let u8 = snap.data;
    let len = u8.length >>> 0;

    // адаптивный шаг: чем больше буфер, тем крупнее stride
    const stride = (len >= 1<<19) ? 32
                : (len >= 1<<17) ? 16
                : (len >= 1<<15) ? 8
                : 4;

    // FNV-1a 32-bit
    let hsh = 0x811c9dc5 >>> 0;
    for (let i = 0; i < len; i += stride) {
      hsh ^= u8[i];
      // умножение на 16777619 (без BigInt)
      hsh = (hsh + ((hsh<<1) + (hsh<<4) + (hsh<<7) + (hsh<<8) + (hsh<<24))) >>> 0;
    }

    // домешаем хвост (последние до 16 байт) — полезно для гладких картинок
    for (let i = len - Math.min(stride, 16); i < len && i >= 0; i++) {
      hsh ^= u8[i];
      hsh = (hsh + ((hsh<<1) + (hsh<<4) + (hsh<<7) + (hsh<<8) + (hsh<<24))) >>> 0;
    }

    // привяжем к геометрии: разные (w,h) → разные сигнатуры
    const sig = (hsh ^ (w << 1) ^ (h << 17)) >>> 0;

    // per-canvas кэш
    const key = `v2:${sig}|${mime}|${quality ?? ''}`;
    canvas.__tduCache = canvas.__tduCache || new Map();
    if (canvas.__tduCache.has(key)) return canvas.__tduCache.get(key);

    // snap: ImageData исходного канваса
    const sc = (typeof document !== 'undefined' && document.createElement)
      ? (() => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; })()
      : null;
    if (!sc) return res;

    const sctx = sc.getContext('2d', { willReadFrequently: true });
    if (!sctx) return res;
    sctx.imageSmoothingEnabled = false;
    // единый edge-aware ресэмпл с микроджиттером (вариант B: шум при кодировании)
    const buf = __resampleWithJitter__(snap, 'encode', __CNV_CFG__); // ImageData
    sctx.putImageData(buf, 0, 0);


    // GUARD от рекурсии
    const GUARD = '__isChain_toDataURL';
    const prev = sc[GUARD];
    sc[GUARD] = true;
    let out;
    try {
      // Всегда HTMLCanvasElement → синхронный путь
      out = sc.toDataURL(mime, quality);
    } finally {
      sc[GUARD] = prev;
    }

    canvas.__tduCache.set(key, out);
    canvas.__tduLastSig = sig;
    return out;
  }
    

  // === HOOK FUNCTIONS ===
  function applyDrawImageHook(origDrawImage, ...args) {
    const a = args.slice();
    // normalize numeric args
    if (a.length === 3) { a[1] = q256(a[1]); a[2] = q256(a[2]); }
    else if (a.length === 5) { a[1] = q256(a[1]); a[2] = q256(a[2]); a[3] = q256(a[3]); a[4] = q256(a[4]); }
    else if (a.length === 9) { a[5] = q256(a[5]); a[6] = q256(a[6]); a[7] = q256(a[7]); a[8] = q256(a[8]); }

    // perform original draw
    const res = origDrawImage.apply(this, a);
    const ctx = this;
    const cnv = ctx.canvas || ctx;
    if (!cnv || !cnv.width || !cnv.height) return res;

    // reentrancy guard per canvas
    const __GUARD__ = Symbol.for('cnv.guard');
    if (cnv[__GUARD__]) return res;
    cnv[__GUARD__] = true;

    try {
      // compute affected region from normalized args
      let dx, dy, dw, dh;
      if (a.length === 3) {
        const img = a[0];
        dx = a[1]; dy = a[2];
        const iw = (img && (img.naturalWidth || img.videoWidth || img.width))  || cnv.width;
        const ih = (img && (img.naturalHeight || img.videoHeight || img.height)) || cnv.height;
        dw = iw; dh = ih;
      } else if (a.length === 5) {
        dx = a[1]; dy = a[2]; dw = a[3]; dh = a[4];
      } else if (a.length === 9) {
        dx = a[5]; dy = a[6]; dw = a[7]; dh = a[8];
      } else {
        return res;
      }

      // clamp to integers and canvas bounds
      dx = Math.trunc(dx); dy = Math.trunc(dy);
      dw = Math.max(1, Math.floor(dw)); dh = Math.max(1, Math.floor(dh));
      const cw = cnv.width | 0, ch = cnv.height | 0;
      if (dx < 0) { dw += dx; dx = 0; }
      if (dy < 0) { dh += dy; dy = 0; }
      if (dx >= cw || dy >= ch) return res;
      if (dx + dw > cw) dw = Math.max(1, cw - dx);
      if (dy + dh > ch) dh = Math.max(1, ch - dy);
      if (dw <= 0 || dh <= 0) return res;

      // read the region; CORS-tainted surfaces will throw
      let imgData;
      try {
        imgData = ctx.getImageData(dx, dy, dw, dh);
      } catch {
        return res; // leave as is on taint
      }

    } finally {
      cnv[__GUARD__] = false;
    }

    return res;
  }

  // Хук для master-цепочки toDataURL: оставляем синхронным (цепь sync)
  function patchCanvasIHDRHook(res, type, quality, newWidth, newHeight) {
    if (type !== 'image/png') return res;
    if (!newWidth || !newHeight) return res;
    // синхронная цепочка master → синхронный IHDR-патчер
    return patchCanvasIHDR(res || this, newWidth, newHeight);
  }

  // master-хук, который вызывает noise-инъекцию и затем IHDR-патчер
  function masterToDataURLHook(res, type, quality) {
    if (typeof patchToDataURLInjectNoise === 'function') {
      res = patchToDataURLInjectNoise.call(this, res, type, quality);
    }
    if (type === 'image/png' && typeof patchCanvasIHDRHook === 'function') {
      const newWidth  = window._NEW_WIDTH  || this.width;
      const newHeight = window._NEW_HEIGHT || this.height;
      if ((newWidth|0)!==(this.width|0) || (newHeight|0)!==(this.height|0)) {
        res = patchCanvasIHDRHook.call(this, res, type, quality, newWidth, newHeight);
      }
    }
    return res;
  }


// --- final export ---
window.CanvasPatchHooks = {
  patch2DNoise,
  patchToDataURLInjectNoise,
  patchCanvasIHDRHook,
  masterToDataURLHook,
  patchToBlobInjectNoise,
  patchConvertToBlobInjectNoise,
  measureTextNoiseHook,
  applyMeasureTextHook,
  fillTextNoiseHook,
  strokeTextNoiseHook,
  fillRectNoiseHook,
  addCanvasNoise,
  applyDrawImageHook
};
}
