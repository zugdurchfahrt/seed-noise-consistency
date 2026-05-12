/*
Canvas patch module contract:
- `FernwehContext` owns internal state and hook registries.
- `FernwehHooks` is the function export surface consumed by `context.js`.
- Do not replace the `FernwehHooks` object; update properties on the existing identity.
- Required exports must match `context.js::registerAllHooks()`.
- Disabled exports below are kept as commented operational switches.
*/

const CanvasPatchModule = function CanvasPatchModule(window) {
const G = (typeof globalThis !== 'undefined' && globalThis)
  || (typeof self !== 'undefined' && self)
  || (typeof window !== 'undefined' && window)
  || {};

if (!window || (typeof window !== 'object' && typeof window !== 'function')) {
  window = G;
}

const C  = G.FernwehContext;
if (!C) throw new Error('[FernwehContext] FernwehContext is undefined — registratio not available');

const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
if (!stateRoot) {
  throw new Error('[FernwehContext] FernwehContext.state is undefined — module registration is not available');
}

const loggerRoot = (C.__logger && typeof C.__logger === 'object') ? C.__logger : null;

const envProfileState = (stateRoot.__ENV_PROFILE__ && typeof stateRoot.__ENV_PROFILE__ === 'object')
  ? stateRoot.__ENV_PROFILE__
  : null;
const __canvasEnvScreenState = (envProfileState && envProfileState.__SCREEN__ && typeof envProfileState.__SCREEN__ === 'object')
  ? envProfileState.__SCREEN__
  : null;
const __canvasScreenWidth = Number(__canvasEnvScreenState && __canvasEnvScreenState.width);
const __canvasScreenHeight = Number(__canvasEnvScreenState && __canvasEnvScreenState.height);
const __canvasDpr = Number(__canvasEnvScreenState && __canvasEnvScreenState.dpr);

const canvasModuleSlot = (stateRoot.__CANVAS__ && typeof stateRoot.__CANVAS__ === 'object')
  ? stateRoot.__CANVAS__
  : null;
if (!canvasModuleSlot) {
  throw new Error('[FernwehContext] FernwehContext.state.__CANVAS__ is undefined — module registration is not available');
}
const __canvasState = (canvasModuleSlot.__STATE__ && typeof canvasModuleSlot.__STATE__ === 'object')
  ? canvasModuleSlot.__STATE__
  : null;
if (!__canvasState) {
  throw new Error('[FernwehContext] FernwehContext.state.__CANVAS__.__STATE__ is undefined — module registration is not available');
}

function emitDiag(level, code, err, extra) {
  const d = (loggerRoot && typeof loggerRoot.__DEGRADE__ === 'function') ? loggerRoot.__DEGRADE__ : null;
  if (typeof d !== 'function') return;
  const eventCode = (typeof code === 'string' && code) ? code : 'canvas:diag';
  const e = err instanceof Error ? err : (err == null ? null : new Error(String(err)));
  const ctx = Object.assign({
    module: 'canvas',
    diagTag: 'canvas',
    surface: 'canvas',
    key: 'canvas',
    stage: 'runtime',
    message: eventCode,
    type: 'pipeline missing data',
    data: null
  }, (extra && typeof extra === 'object') ? extra : null);
  if (ctx.key === null || typeof ctx.key === 'undefined' || ctx.key === '') {
    ctx.key = (typeof ctx.diagTag === 'string' && ctx.diagTag) ? ctx.diagTag : 'canvas';
  }
  if (typeof d.diag === 'function') {
    d.diag(level, eventCode, ctx, e);
    return;
  }
  d(eventCode, e, ctx);
}

if (
  !Number.isFinite(__canvasScreenWidth) ||
  !Number.isFinite(__canvasScreenHeight) ||
  !Number.isFinite(__canvasDpr)
) {
  emitDiag('warn', 'canvas:preflight:screen_metrics_missing', null, {
    stage: 'preflight',
    key: 'FernwehContext.state.__ENV_PROFILE__.__SCREEN__.width/height/dpr',
    type: 'pipeline missing data',
    message: 'screen metrics missing for canvas module',
    data: {
      outcome: 'skip',
      reason: 'screen_metrics_missing',
      hasEnvProfile: !!envProfileState,
      hasEnvScreen: !!__canvasEnvScreenState,
      width: Number.isFinite(__canvasScreenWidth) ? __canvasScreenWidth : null,
      height: Number.isFinite(__canvasScreenHeight) ? __canvasScreenHeight : null,
      dpr: Number.isFinite(__canvasDpr) ? __canvasDpr : null
    }
  });
} else if (__canvasScreenWidth <= 0 || __canvasScreenHeight <= 0 || __canvasDpr <= 0) {
  emitDiag('warn', 'canvas:preflight:screen_metrics_invalid', null, {
    stage: 'preflight',
    key: 'FernwehContext.state.__ENV_PROFILE__.__SCREEN__.width/height/dpr',
    type: 'pipeline missing data',
    message: 'screen metrics invalid',
    data: {
      outcome: 'skip',
      reason: 'screen_metrics_invalid',
      width: __canvasScreenWidth,
      height: __canvasScreenHeight,
      dpr: __canvasDpr
    }
  });
}

function __resolvePrngState() {
  const __core = G && G.Core;
  const __coreInternal = (__core && __core.__internal && typeof __core.__internal === 'object')
    ? __core.__internal
    : null;
  const state = (__coreInternal && __coreInternal.prng && typeof __coreInternal.prng === 'object')
    ? __coreInternal.prng
    : null;
  return {
    seed: (state && typeof state.seed === 'string' && state.seed)
      ? state.seed
      : '',
    strToSeed: (state && typeof state.strToSeed === 'function') ? state.strToSeed : null,
    mulberry32: (state && typeof state.mulberry32 === 'function') ? state.mulberry32 : null
  };
}

function __defineHiddenLocal(obj, prop, value, diagCode, diagKey, message) {
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
    emitDiag('warn', diagCode, eSet, {
      stage,
      key: diagKey || prop,
      type: 'browser structure missing data',
      message: message || 'defineProperty failed; fallback assign used'
    });
    try {
      obj[prop] = value;
      return true;
    } catch (eAssign) {
      emitDiag('warn', diagCode, eAssign, {
        stage,
        key: diagKey || prop,
        type: 'browser structure missing data',
        message: 'fallback assign failed'
      });
      return false;
    }
  }
}

__defineHiddenLocal(
  __canvasState,
  'willReadFrequently',
  true,
  'canvas:apply:will_read_frequently_define_failed',
  'FernwehContext.state.__CANVAS__.__STATE__.willReadFrequently',
  'willReadFrequently defineProperty failed; fallback assign used'
);


  function __readSharedDefaultCtx2dFont__() {
    const cached = (__canvasState && typeof __canvasState.defaultCtx2dFont === 'string')
      ? __canvasState.defaultCtx2dFont.trim()
      : '';
    return cached || null;
  }

  function __requireSharedDefaultCtx2dFont__() {
    const font = __readSharedDefaultCtx2dFont__();
    if (typeof font === 'string' && font) return font;
    throw new Error('[FernwehContext] shared default ctx2d font missing');
  }

  // Internal DOM/offscreen canvas handles are intentionally not created here.
  // Page/issued canvases are handled by context.js factories; this module only
  // owns Canvas hooks/state and does not wait for DOM readiness.

  // === HELPER FUNCTIONS ===

  // Stable string hash function, sufficient for deterministic noise generation
  function stringHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

//  The ONLY source of variability, which is included in the input string. This ensures that noise values are consistent across calls and contexts as long as the Core PRNG seed is unchanged.
  function stableNoiseFromString(str, min, max) {
  // The ONLY source: Core.__internal.prng + key.
  const __prng = __resolvePrngState();
  if (typeof __prng.seed !== 'string' || !__prng.seed)
    throw new Error('[PRNG] Core.__internal.prng.seed is required');
  if (typeof __prng.strToSeed !== 'function' || typeof __prng.mulberry32 !== 'function')
    throw new Error('[PRNG] Core.__internal.prng.strToSeed/mulberry32 are required')
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


  // Quantize to 1/256th of a pixel;
  function q256(v){ return Math.round(v * 256) / 256; }

  // Shared configuration for text jitter hooks; not a public export.
  const __CNV_CFG__ = {
    dxPx: 0.10,      // амплитуда X (px)
    dyPx: 0.10,      // амплитуда Y (px)
  };



function readDrawTargetBitmapSize(ctx, stageKey) {
  const canvas = ctx && ctx.canvas;
  const width = Number(canvas && canvas.width);
  const height = Number(canvas && canvas.height);

  if (
    !canvas ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    Math.floor(width) !== width ||
    Math.floor(height) !== height
  ) {
    emitDiag('warn', 'canvas:drawImage:target_bitmap_size_invalid', null, {
      stage: 'hook',
      key: stageKey || 'drawImage',
      type: 'browser structure missing data',
      message: 'drawImage target canvas bitmap size invalid; stamp skipped',
      data: {
        outcome: 'return_native',
        reason: 'target_bitmap_size_invalid',
        hasCanvas: !!canvas,
        width: Number.isFinite(width) ? width : null,
        height: Number.isFinite(height) ? height : null
      }
    });
    return null;
  }

  return {
    canvas: canvas,
    width: width,
    height: height
  };
}






  // === HOOK FUNCTIONS ===

  // TEXT / FONTS: TextMetrics proxy/cache plus draw-argument jitter.
  // Keep width noise local to `applyMeasureTextHook`; do not mutate shared metric state.
  function measureTextNoiseHook(res, text, font) {
    if (!res) return null;
    const txt  = String(text ?? '');
    const fRaw = (typeof font === 'string' && font.trim())
      ? font
      : (this && typeof this.font === 'string' && this.font.trim()) ? this.font : __requireSharedDefaultCtx2dFont__();
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
      : (Number.isFinite(__canvasDpr) && __canvasDpr > 0
          ? __canvasDpr
          : undefined);

    const key = `${fStr}\u241F${txt}\u241F${dpr}`;
    const widthNoise = 0;
    return { key, approx, widthNoise };
  }

  //  Proxy TextMetrics
  function applyMeasureTextHook(nativeMetrics, text, font) {
    try {
      // Cache keys include the current font epoch; only native-present TextMetrics fields are exposed.

      const fontStr = (typeof font === 'string' && font.trim())
        ? font
        : (this && typeof this.font === 'string' && this.font.trim()) ? this.font : __requireSharedDefaultCtx2dFont__();
      const stateRoot = (C && C.state && typeof C.state === 'object') ? C.state : null;
      const fontsRoot = (stateRoot && stateRoot.__FONTS__ && typeof stateRoot.__FONTS__ === 'object')
        ? stateRoot.__FONTS__
        : null;
      const fontsState = (fontsRoot && fontsRoot.__STATE__ && typeof fontsRoot.__STATE__ === 'object')
        ? fontsRoot.__STATE__
        : null;
      const familySnapshot = (fontsState && fontsState.familySnapshot && typeof fontsState.familySnapshot === 'object')
        ? fontsState.familySnapshot
        : null;
      const fontsReady = !!(fontsState && fontsState.ready === true);
      if (!fontsReady) return nativeMetrics;
      // NOTE: widthNoise is intentionally applied ONLY here (post-read),
      // measureTextNoiseHook itself must not change returned metrics for consistency.
      const info = measureTextNoiseHook.call(this, nativeMetrics, text, fontStr);
      if (!info || typeof info !== 'object') return nativeMetrics;
      const TM = C.__TextMetrics__ || (C.__TextMetrics__ = { cache: new Map() });
      const epochToken = (familySnapshot && Object.prototype.hasOwnProperty.call(familySnapshot, 'versionToken'))
        ? String(familySnapshot.versionToken || '')
        : '';
      const key = (typeof info.key === 'string' && info.key.length) ? `${info.key}\u241F${epochToken}` : null;
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
      emitDiag('warn', 'canvas:measureText:hook:failed', e, {
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

 // ===== fillRectNoiseHook  =====
  function fillRectNoiseHook(x, y, w, h){
    return [ q256(x), q256(y), q256(w), q256(h) ];
  }


  // PNG export layer: add one private ancillary chunk before IEND.
  // No getImageData, no re-render, no pixel changes, no dimension/IHDR changes.
  let __canvasCrcTable = null;

  function readU32BE(a, off) {
    return ((a[off] << 24) | (a[off + 1] << 16) | (a[off + 2] << 8) | a[off + 3]) >>> 0;
  }
  function writeU32BE(a, off, v) {
    a[off] = (v >>> 24) & 255;
    a[off + 1] = (v >>> 16) & 255;
    a[off + 2] = (v >>> 8) & 255;
    a[off + 3] = v & 255;
  }
  function getCanvasCrcTable() {
    if (__canvasCrcTable) return __canvasCrcTable;
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    __canvasCrcTable = t;
    return t;
  }
  function crc32Chunk(typeStr, dataU8) {
    const tab = getCanvasCrcTable();
    let crc = ~0 >>> 0;
    for (let i = 0; i < 4; i++) crc = (tab[(crc ^ (typeStr.charCodeAt(i) & 255)) & 255] ^ (crc >>> 8)) >>> 0;
    for (let i = 0; i < dataU8.length; i++) crc = (tab[(crc ^ dataU8[i]) & 255] ^ (crc >>> 8)) >>> 0;
    return (~crc) >>> 0;
  }
  function patchPngAncillaryBytes(u8, seed) {
    const sig = [137, 80, 78, 71, 13, 10, 26, 10];
    if (!(u8 && u8.length >= 8 + 12)) return null;
    for (let i = 0; i < 8; i++) if (u8[i] !== sig[i]) return null;
    if (String.fromCharCode(u8[12], u8[13], u8[14], u8[15]) !== 'IHDR') return null;

    let off = 8;
    let iendOff = -1;
    while (off + 12 <= u8.length) {
      const clen = readU32BE(u8, off);
      const typeOff = off + 4;
      const dataOff = off + 8;
      const crcOff = dataOff + clen;
      const next = crcOff + 4;
      if (next > u8.length) break;
      const chunk = String.fromCharCode(u8[typeOff], u8[typeOff + 1], u8[typeOff + 2], u8[typeOff + 3]);
      if (chunk === 'IEND') {
        iendOff = off;
        break;
      }
      off = next;
    }
    if (iendOff < 0) return null;

    let sample = '';
    const sampleLen = Math.min(4096, u8.length);
    for (let i = 0; i < sampleLen; i++) sample += String.fromCharCode(u8[i]);

    const seedHash = stringHash(seed + '|png-ancillary');
    const bytesHash = stringHash(sample + '|' + u8.length);
    const textPayload = 'vpAg\0seed=' + (seedHash >>> 0).toString(16) + ';data=' + (bytesHash >>> 0).toString(16);
    const payload = new Uint8Array(textPayload.length);
    for (let i = 0; i < textPayload.length; i++) payload[i] = textPayload.charCodeAt(i) & 255;

    const chunkType = 'tEXt';
    const addLen = 4 + 4 + payload.length + 4;
    const out = new Uint8Array(u8.length + addLen);
    out.set(u8.subarray(0, iendOff), 0);
    let w = iendOff;
    writeU32BE(out, w, payload.length >>> 0); w += 4;
    out[w++] = chunkType.charCodeAt(0) & 255;
    out[w++] = chunkType.charCodeAt(1) & 255;
    out[w++] = chunkType.charCodeAt(2) & 255;
    out[w++] = chunkType.charCodeAt(3) & 255;
    out.set(payload, w); w += payload.length;
    writeU32BE(out, w, crc32Chunk(chunkType, payload)); w += 4;
    out.set(u8.subarray(iendOff), w);

    return out;
  }

  async function patchPngBlobAncillaryChunk(blob, key, reqType) {
    if (!blob || !(blob instanceof Blob)) return blob;

    const mime = String(reqType || blob.type || 'image/png').toLowerCase();
    if (!/^image\/png$/i.test(mime)) return blob;

    const __prng = __resolvePrngState();
    if (typeof __prng.seed !== 'string' || !__prng.seed) {
      emitDiag('warn', 'canvas:' + key + ':png_chunk_seed_missing', null, {
        stage: 'hook',
        key,
        data: { outcome: 'return_native', reason: 'core_prng_seed_missing' }
      });
      return blob;
    }

    const buf = await blob.arrayBuffer();
    const patched = patchPngAncillaryBytes(new Uint8Array(buf), __prng.seed);
    if (!patched) return blob;
    return new Blob([patched], { type: blob.type || 'image/png' });
  }

  // Blob export path uses the shared PNG ancillary byte-builder.
  async function patchToBlobInjectNoise(blob, ...args) {
    try {
      if (!blob || !(blob instanceof Blob)) return blob;

      const typeArg = (typeof args[1] === 'string') ? args[1] : undefined;

      const mime = (typeArg || blob.type || 'image/png').toLowerCase();
      if (!/^image\/png$/i.test(mime)) return blob;

      return await patchPngBlobAncillaryChunk(blob, 'toBlob', mime);
    } catch (e) {
      emitDiag('warn', 'canvas:toBlob:hook_failed', e, {
        stage: 'hook',
        key: 'toBlob'
      });
      return blob;
    }
  }

  // Offscreen convertToBlob path uses the same PNG byte-builder as toBlob/toDataURL.
  async function patchConvertToBlobInjectNoise(blob, options) {
    try {
      if (!blob || !(blob instanceof Blob)) return blob;

      const reqType = (options && options.type) || blob.type || 'image/png';
      const mime = String(reqType).toLowerCase();
      if (!/^image\/png$/i.test(mime)) return blob;
   
      return await patchPngBlobAncillaryChunk(blob, 'convertToBlob', mime);

    } catch (e) {
      emitDiag('warn', 'canvas:convertToBlob:hook_failed', e, {
        stage: 'hook',
        key: 'convertToBlob'
      });
      return blob;
    }

  }


  // toDataURL path uses the same PNG ancillary byte-builder as Blob exports.
  function patchToDataURLInjectNoise(res, type, quality) {
    if (typeof res !== 'string') return res;
    if (type && String(type).toLowerCase() !== 'image/png') return res;
    if (res.indexOf('data:image/png;base64,') !== 0) return res;

    try {
      const __prng = __resolvePrngState();
      if (typeof __prng.seed !== 'string' || !__prng.seed) {
        emitDiag('warn', 'canvas:toDataURL:png_chunk_seed_missing', null, {
          stage: 'hook',
          key: 'toDataURL',
          data: { outcome: 'return_native', reason: 'core_prng_seed_missing' }
        });
        return res;
      }

      const comma = res.indexOf(',');
      if (comma < 0) return res;
      const prefix = res.slice(0, comma + 1);
      const base64 = res.slice(comma + 1);
      const bin = atob(base64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);

      const out = patchPngAncillaryBytes(u8, __prng.seed);
      if (!out) return res;

      let s = '';
      const CH = 0x8000;
      for (let i = 0; i < out.length; i += CH) {
        s += String.fromCharCode.apply(null, out.subarray(i, i + CH));
      }
      return prefix + btoa(s);
    } catch (e) {
      emitDiag('warn', 'canvas:toDataURL:png_chunk_failed', e, {
        stage: 'hook',
        key: 'toDataURL',
        data: { outcome: 'return_native', reason: 'png_ancillary_chunk_failed' }
      });
      return res;
    }
  }
    





  function applyDrawImageHook(origDrawImage, ...args) {
    const beforeSize = readDrawTargetBitmapSize(this, 'drawImage:pre');
    const out = origDrawImage.apply(this, args);
    const afterSize = readDrawTargetBitmapSize(this, 'drawImage:post');

    try {
      const ctx = this;

      if (!(Number.isFinite(__canvasScreenWidth) && __canvasScreenWidth > 0) ||
          !(Number.isFinite(__canvasScreenHeight) && __canvasScreenHeight > 0) ||
          !(Number.isFinite(__canvasDpr) && __canvasDpr > 0)) {
        emitDiag('warn', 'canvas:drawImage:screen_metrics_missing', null, {
          stage: 'hook',
          key: 'drawImage',
          type: 'pipeline missing data',
          message: 'bootstrap screen metrics missing for drawImage stamp; stamp skipped',
          data: {
            outcome: 'return_native',
            reason: 'screen_metrics_missing',
            width: Number.isFinite(__canvasScreenWidth) ? __canvasScreenWidth : null,
            height: Number.isFinite(__canvasScreenHeight) ? __canvasScreenHeight : null,
            dpr: Number.isFinite(__canvasDpr) ? __canvasDpr : null
          }
        });
        return out;
      }

      if (!beforeSize || !afterSize) return out;

      if (
        beforeSize.canvas !== afterSize.canvas ||
        beforeSize.width !== afterSize.width ||
        beforeSize.height !== afterSize.height
      ) {
        emitDiag('warn', 'canvas:drawImage:target_bitmap_size_changed', null, {
          stage: 'hook',
          key: 'drawImage',
          type: 'browser structure missing data',
          message: 'drawImage target bitmap size changed during native call; stamp skipped',
          data: {
            outcome: 'return_native',
            reason: 'target_bitmap_size_changed',
            beforeWidth: beforeSize.width,
            beforeHeight: beforeSize.height,
            afterWidth: afterSize.width,
            afterHeight: afterSize.height
          }
        });
        return out;
      }

      const targetWidth = afterSize.width;
      const targetHeight = afterSize.height;

      if (!ctx || typeof ctx.putImageData !== 'function') return out;

      const __prng = __resolvePrngState();
      if (typeof __prng.seed !== 'string' || !__prng.seed) {
        emitDiag('warn', 'canvas:drawImage:stamp_seed_missing', null, {
          stage: 'hook',
          key: 'drawImage',
          data: { outcome: 'return_native', reason: 'core_prng_seed_missing' }
        });
        return out;
      }

      let dx = 0;
      let dy = 0;
      let dw = targetWidth;
      let dh = targetHeight;

      if (args.length === 3) {
        dx = Number(args[1]);
        dy = Number(args[2]);
        dw = targetWidth;
        dh = targetHeight;
      } else if (args.length === 5) {
        dx = Number(args[1]);
        dy = Number(args[2]);
        dw = Number(args[3]);
        dh = Number(args[4]);
      } else if (args.length === 9) {
        dx = Number(args[5]);
        dy = Number(args[6]);
        dw = Number(args[7]);
        dh = Number(args[8]);
      }

      if (
        !Number.isFinite(dx) || !Number.isFinite(dy) ||
        !Number.isFinite(dw) || !Number.isFinite(dh) ||
        dw === 0 || dh === 0
      ) {
        return out;
      }

      const x0 = Math.max(0, Math.min(targetWidth - 1, Math.floor(Math.min(dx, dx + dw))));
      const y0 = Math.max(0, Math.min(targetHeight - 1, Math.floor(Math.min(dy, dy + dh))));
      const x1 = Math.max(0, Math.min(targetWidth - 1, Math.ceil(Math.max(dx, dx + dw)) - 1));
      const y1 = Math.max(0, Math.min(targetHeight - 1, Math.ceil(Math.max(dy, dy + dh)) - 1));

      if (x1 < x0 || y1 < y0) return out;

      const key = __prng.seed + '|drawImage|stamp|' + String(args.length) + '|' +
        String(__canvasScreenWidth) + 'x' + String(__canvasScreenHeight) + '@' + String(__canvasDpr) + '|' +
        String(targetWidth) + 'x' + String(targetHeight) + '|' +
        String(Math.round(dx * 256)) + ',' +
        String(Math.round(dy * 256)) + ',' +
        String(Math.round(dw * 256)) + ',' +
        String(Math.round(dh * 256));

      const h = stringHash(key);
      const px = x0 + (h % Math.max(1, (x1 - x0 + 1)));
      const py = y0 + (((h >>> 8) % Math.max(1, (y1 - y0 + 1))));

      const img = new ImageData(
        new Uint8ClampedArray([
          (h >>> 16) & 255,
          (h >>> 8) & 255,
          h & 255,
          255
        ]),
        1,
        1
      );

      ctx.putImageData(img, px, py);
    } catch (e) {
      emitDiag('warn', 'canvas:drawImage:stamp_failed', e, {
        stage: 'hook',
        key: 'drawImage',
        data: { outcome: 'return_native', reason: 'drawImage_stamp_failed' }
      });
    }

    return out;
  }

  // function applyDrawImageHook(origDrawImage, ...args) {
  //   const source = args[0];

  //   if (
  //     (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) ||
  //     (typeof OffscreenCanvas !== 'undefined' && source instanceof OffscreenCanvas)
  //   ) {
  //     return origDrawImage.apply(this, args);
  //   }

  //   const a = args.slice();
  //   if (a.length === 3) { a[1] = q256(a[1]); a[2] = q256(a[2]); }
  //   else if (a.length === 5) { a[1] = q256(a[1]); a[2] = q256(a[2]); a[3] = q256(a[3]); a[4] = q256(a[4]); }
  //   else if (a.length === 9) { a[5] = q256(a[5]); a[6] = q256(a[6]); a[7] = q256(a[7]); a[8] = q256(a[8]); }

  //   return origDrawImage.apply(this, a);
  // }

  // master-хук toDataURL: один post-process (без дополнительного IHDR-прохода)
  function masterToDataURLHook(res, type, quality) {
    if (typeof patchToDataURLInjectNoise === 'function') {
      res = patchToDataURLInjectNoise.call(this, res, type, quality);
    }
    return res;
  }


// --- final export ---
// IMPORTANT: do not replace the FernwehHooks object identity.
// Other modules may hold a reference to the existing object and/or keep config fields on it.
const __CanvasPatchHooksExisting__ = window.FernwehHooks;
const __CanvasPatchHooks__ =
  (__CanvasPatchHooksExisting__ && (typeof __CanvasPatchHooksExisting__ === 'object' || typeof __CanvasPatchHooksExisting__ === 'function'))
    ? __CanvasPatchHooksExisting__
    : (__CanvasPatchHooksExisting__ == null ? {} : null);

if (!__CanvasPatchHooks__) {
  // Contract violation: FernwehHooks must be an object container for exports.
  // Fail-fast: context.js relies on this being an object and will otherwise misbehave silently.
  throw new Error('[FernwehContext] FernwehHooks contract violation (expected object)');
}

// Prefer hidden (non-enumerable) export 
try {
  Object.defineProperty(window, 'FernwehHooks', {
    value: __CanvasPatchHooks__,
    writable: true,
    configurable: true,
    enumerable: false
  });
} catch (e) {
  // Fallback: best-effort assignment. Do NOT allocate a new object here.
  try { if (window.FernwehHooks == null) window.FernwehHooks = __CanvasPatchHooks__; } catch (eSet) {
    emitDiag('warn', 'canvas:FernwehHooks:fallback_assign_failed', eSet, {
      stage: 'apply',
      key: 'FernwehHooks',
      type: 'browser structure missing data',
      message: 'FernwehHooks fallback assign failed'
    });
  }
  emitDiag('warn', 'canvas:FernwehHooks:define_failed', e, {
    stage: 'apply',
    key: 'FernwehHooks',
    type: 'browser structure missing data'
  });
}

__CanvasPatchHooks__.patchToDataURLInjectNoise = patchToDataURLInjectNoise;
// Disabled/non-required export kept as an operational switch.
// __CanvasPatchHooks__.patchCanvasIHDRHook = patchCanvasIHDRHook;
__CanvasPatchHooks__.masterToDataURLHook = masterToDataURLHook;
__CanvasPatchHooks__.patchToBlobInjectNoise = patchToBlobInjectNoise;
__CanvasPatchHooks__.patchConvertToBlobInjectNoise = patchConvertToBlobInjectNoise;
__CanvasPatchHooks__.measureTextNoiseHook = measureTextNoiseHook;
__CanvasPatchHooks__.applyMeasureTextHook = applyMeasureTextHook;
__CanvasPatchHooks__.fillTextNoiseHook = fillTextNoiseHook;
__CanvasPatchHooks__.strokeTextNoiseHook = strokeTextNoiseHook;
__CanvasPatchHooks__.fillRectNoiseHook = fillRectNoiseHook;
__CanvasPatchHooks__.applyDrawImageHook = applyDrawImageHook;

}
