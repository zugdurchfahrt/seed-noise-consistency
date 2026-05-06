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

const __canvasDocument = (G && G.document && typeof G.document === 'object') ? G.document : null;
function __canvasCanCreateElements() {
  return !!(__canvasDocument && typeof __canvasDocument.createElement === 'function');
}
function __canvasCreateElement(localName) {
  if (!__canvasCanCreateElements()) return null;
  return __canvasDocument.createElement(localName);
}
function __canvasCreateCanvas(width, height) {
  const canvas = __canvasCreateElement('canvas');
  if (!canvas) return null;
  if (Number.isFinite(width) && width >= 0) canvas.width = width;
  if (Number.isFinite(height) && height >= 0) canvas.height = height;
  return canvas;
}
function __canvasCreateDomHostElements() {
  const host = __canvasCreateElement('div');
  const canvas = __canvasCreateCanvas();
  return {
    host,
    canvas,
    ok: !!(host && canvas)
  };
}
const C  = G.CanvasPatchContext;
// === CanvasEnvBus phase ===
// 1) reading CanvasPatchContext.state
// 2) reading logger/env/screen/prng roots
// 3) validating dependencies
// 4) preparing helper functions
// 5) writing hidden init-state into CanvasPatchContext
const __canvasEnvBus = (function initCanvasEnvBus() {
  if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registratio not available');

  const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
  const loggerRoot = (C.__logger && typeof C.__logger === 'object') ? C.__logger : null;
  const envProfileState = (stateRoot && stateRoot.__ENV_PROFILE__ && typeof stateRoot.__ENV_PROFILE__ === 'object')
    ? stateRoot.__ENV_PROFILE__
    : null;
  const envScreenState = (envProfileState && envProfileState.__SCREEN__ && typeof envProfileState.__SCREEN__ === 'object')
    ? envProfileState.__SCREEN__
    : null;
  const screenWidth = Number(envScreenState && envScreenState.width);
  const screenHeight = Number(envScreenState && envScreenState.height);
  const dpr = Number(envProfileState && envProfileState.dpr);

  function emitCanvasDiag(level, code, err, extra) {
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
    Number.isFinite(screenWidth) &&
    Number.isFinite(screenHeight) &&
    Number.isFinite(dpr)
  ) {
    if (
      screenWidth <= 0 ||
      screenHeight <= 0 ||
      dpr <= 0
    ) {
      emitCanvasDiag('warn', 'canvas:preflight:screen_metrics_invalid', null, {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__ENV_PROFILE__.__SCREEN__.width/height/dpr',
        message: 'screen metrics invalid',
        data: {
          outcome: 'skip',
          reason: 'screen_metrics_invalid',
          width: screenWidth,
          height: screenHeight,
          dpr: dpr
        }
      });
    }
  }

  function resolvePrngState() {
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

  if (!stateRoot) {
    throw new Error('[CanvasPatch] CanvasPatchContext.state is undefined — module registration is not available');
  }
  const canvasModuleSlot = (stateRoot.__CANVAS__ && typeof stateRoot.__CANVAS__ === 'object')
    ? stateRoot.__CANVAS__
    : null;
  if (!canvasModuleSlot) {
    throw new Error('[CanvasPatch] CanvasPatchContext.state.__CANVAS__ is undefined — module registration is not available');
  }
  const canvasState = (canvasModuleSlot.__STATE__ && typeof canvasModuleSlot.__STATE__ === 'object')
    ? canvasModuleSlot.__STATE__
    : null;
  if (!canvasState) {
    throw new Error('[CanvasPatch] CanvasPatchContext.state.__CANVAS__.__STATE__ is undefined — module registration is not available');
  }

  function defineHidden(obj, prop, value, diagCode, diagKey, message) {
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

  defineHidden(
    canvasModuleSlot,
    '__ENV_BUS__',
    Object.freeze({
      phase: 'CanvasEnvBus',
      hasDocument: !!__canvasDocument,
      hasCreateElement: __canvasCanCreateElements(),
      hasLogger: !!loggerRoot,
      hasEnvProfile: !!envProfileState,
      hasEnvScreen: !!envScreenState,
      screenWidth: Number.isFinite(screenWidth) ? screenWidth : null,
      screenHeight: Number.isFinite(screenHeight) ? screenHeight : null,
      dpr: Number.isFinite(dpr) ? dpr : null
    }),
    'canvas:apply:env_bus_state_define_failed',
    'CanvasPatchContext.state.__CANVAS__.__ENV_BUS__',
    'CanvasEnvBus init-state defineProperty failed; fallback assign used'
  );

  return {
    loggerRoot,
    stateRoot,
    envProfileState,
    envScreenState,
    screenWidth,
    screenHeight,
    dpr,
    canvasModuleSlot,
    canvasState,
    emitCanvasDiag,
    resolvePrngState,
    defineHidden
  };
})();
const __loggerRoot = __canvasEnvBus.loggerRoot;
const __canvasStateRoot = __canvasEnvBus.stateRoot;
const __canvasEnvProfileState = __canvasEnvBus.envProfileState;
const __canvasEnvScreenState = __canvasEnvBus.envScreenState;
const __canvasScreenWidth = __canvasEnvBus.screenWidth;
const __canvasScreenHeight = __canvasEnvBus.screenHeight;
const __canvasDpr = __canvasEnvBus.dpr;
const __stateRoot = __canvasEnvBus.stateRoot;
const __canvasModuleSlot = __canvasEnvBus.canvasModuleSlot;
const __canvasState = __canvasEnvBus.canvasState;
const emitCanvasDiag = __canvasEnvBus.emitCanvasDiag;
const __resolvePrngState = __canvasEnvBus.resolvePrngState;
const __defineHidden__ = __canvasEnvBus.defineHidden;

  function __readSharedDefaultCtx2dFont__() {
    const cached = (__canvasState && typeof __canvasState.defaultCtx2dFont === 'string')
      ? __canvasState.defaultCtx2dFont.trim()
      : '';
    return cached || null;
  }

  function __requireSharedDefaultCtx2dFont__() {
    const font = __readSharedDefaultCtx2dFont__();
    if (typeof font === 'string' && font) return font;
    throw new Error('[CanvasPatch] shared default ctx2d font missing');
  }

  // создаём скрытый HTML-canvas в окне
  function _ensureDomOnce() {
    if (__canvasState.domReady) return;

    const doc = __canvasDocument;
    const docReadyState = (doc && typeof doc.readyState === 'string') ? doc.readyState : null;
    if (!doc || (!doc.body && !doc.documentElement) || !__canvasCanCreateElements()) {
      const domDeferred = !!(__canvasCanCreateElements() && docReadyState === 'loading');
      emitCanvasDiag(domDeferred ? 'info' : 'warn', domDeferred ? 'canvas:preflight:dom_deferred' : 'canvas:preflight:dom_unavailable', null, {
        stage: 'preflight',
        key: 'document',
        type: 'browser structure missing data',
        message: domDeferred
          ? 'document root not ready yet for DOM canvas host init'
          : 'document/createElement unavailable for DOM canvas host init',
        data: {
          outcome: 'skip',
          reason: domDeferred ? 'dom_deferred' : 'dom_unavailable',
          hasDocument: !!doc,
          hasDocumentElement: !!(doc && doc.documentElement),
          hasBody: !!(doc && doc.body),
          hasCreateElement: __canvasCanCreateElements(),
          documentReadyState: docReadyState
        }
      });
      __canvasState.domReady = false;
      return; // нет DOM — выходим
    }

    // SSOT: CanvasPatchContext
    const existingCanvas = (__canvasState && __canvasState.domCanvas);
    const existingHost = (__canvasState && __canvasState.domCanvasHost);
    if (existingCanvas && existingHost && existingHost.contains(existingCanvas) && existingHost.parentNode) {
      __canvasState.domReady = true;
      return;
    }

    const screenWidth = __canvasScreenWidth;
    const screenHeight = __canvasScreenHeight;
    const viewportWidth = (
      Number.isFinite(G.innerWidth) && G.innerWidth > 0
    ) ? Math.round(G.innerWidth) : (
      Number.isFinite(screenWidth) && screenWidth > 0 ? Math.round(screenWidth) : NaN
    );
    const viewportHeight = (
      Number.isFinite(G.innerHeight) && G.innerHeight > 0
    ) ? Math.round(G.innerHeight) : (
      Number.isFinite(screenHeight) && screenHeight > 0 ? Math.round(screenHeight) : NaN
    );
    if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth <= 0 || viewportHeight <= 0) {
      emitCanvasDiag('warn', 'canvas:preflight:viewport_dims_missing', null, {
        stage: 'preflight',
        key: 'innerWidth/innerHeight/__WIDTH/__HEIGHT',
        type: 'pipeline missing data',
        message: 'viewport dimensions unavailable for DOM canvas host init',
        data: {
          outcome: 'skip',
          reason: 'viewport_dims_missing',
          innerWidth: Number.isFinite(G.innerWidth) ? G.innerWidth : null,
          innerHeight: Number.isFinite(G.innerHeight) ? G.innerHeight : null,
          __WIDTH: screenWidth,
          __HEIGHT: screenHeight,
          viewportWidth: viewportWidth,
          viewportHeight: viewportHeight
        }
      });
      return;
    }
    const domFactory = __canvasCreateDomHostElements();
    const div = domFactory.host;
    const canvas = domFactory.canvas;
    if (!domFactory.ok) {
      emitCanvasDiag('warn', 'canvas:preflight:dom_element_create_failed', null, {
        stage: 'preflight',
        key: 'document.createElement',
        type: 'browser structure missing data',
        message: 'document.createElement failed for DOM canvas host init',
        data: {
          outcome: 'skip',
          reason: 'dom_element_create_failed',
          hasHost: !!div,
          hasCanvas: !!canvas
        }
      });
      return;
    }
    const baseCanvasWidth = Number(canvas.width);
    const baseCanvasHeight = Number(canvas.height);
    if (
      !Number.isFinite(baseCanvasWidth) || baseCanvasWidth <= 0 ||
      !Number.isFinite(baseCanvasHeight) || baseCanvasHeight <= 0
    ) {
      emitCanvasDiag('warn', 'canvas:preflight:native_default_bitmap_size_invalid', null, {
        stage: 'preflight',
        key: 'HTMLCanvasElement.width/height',
        type: 'browser structure missing data',
        message: 'native canvas default bitmap size invalid',
        data: {
          outcome: 'skip',
          reason: 'native_default_bitmap_size_invalid',
          width: baseCanvasWidth,
          height: baseCanvasHeight
        }
      });
      return;
    }
    const __prng = __resolvePrngState();
    if (typeof __prng.seed !== 'string' || !__prng.seed) {
      emitCanvasDiag('warn', 'canvas:preflight:core_prng_seed_missing', null, {
        stage: 'preflight',
        key: 'Core.__internal.prng.seed',
        type: 'pipeline missing data',
        message: 'core prng seed missing for DOM canvas host',
        data: {
          outcome: 'skip',
          reason: 'core_prng_seed_missing'
        }
      });
      return;
    }
    if (typeof __prng.strToSeed !== 'function' || typeof __prng.mulberry32 !== 'function') {
      emitCanvasDiag('warn', 'canvas:preflight:core_prng_helpers_missing', null, {
        stage: 'preflight',
        key: 'Core.__internal.prng.strToSeed/Core.__internal.prng.mulberry32',
        type: 'pipeline missing data',
        message: 'core prng helpers missing for DOM canvas host init',
        data: {
          outcome: 'skip',
          reason: 'core_prng_helpers_missing'
        }
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

    canvas.width = baseCanvasWidth;
    canvas.height = baseCanvasHeight;
    canvas.style.width = viewportWidth + 'px';
    canvas.style.height = viewportHeight + 'px';
    canvas.style.display = 'block';
    canvas.style.background = 'transparent';
    div.appendChild(canvas);

    const canvasStored = __defineHidden__(__canvasState, 'domCanvas', canvas,
      'canvas:apply:dom_storage_define_failed',
      'CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvas',
      'DOM canvas defineProperty failed; fallback assign used'
    );
    const hostStored = __defineHidden__(__canvasState, 'domCanvasHost', div,
      'canvas:apply:dom_storage_define_failed',
      'CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost',
      'DOM host defineProperty failed; fallback assign used'
    );
    const domCanvasReady = !!(__canvasState && __canvasState.domCanvas === canvas);
    const domHostReady = !!(__canvasState && __canvasState.domCanvasHost === div);
    if (!canvasStored || !hostStored || !domCanvasReady || !domHostReady) {
      emitCanvasDiag('warn', 'canvas:apply:dom_storage_incomplete', null, {
        stage: 'apply',
        key: 'CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvas/domCanvasHost',
        type: 'browser structure missing data',
        message: 'dom canvas host storage incomplete',
        data: {
          outcome: 'skip',
          reason: 'dom_storage_incomplete',
          canvasStored: !!canvasStored,
          hostStored: !!hostStored,
          domCanvasReady: domCanvasReady,
          domHostReady: domHostReady
        }
      });
      __canvasState.domReady = false;
      return;
    }
    __canvasState.domReady = true;
  }

  // создаём OffscreenCanvas (и в окне, и в воркере)
  function _ensureOffscreenOnce() {
    if (__canvasState.offscreenReady) return;
    if (typeof G.OffscreenCanvas === 'undefined') return;

    const screenWidth = __canvasScreenWidth;
    const screenHeight = __canvasScreenHeight;
    if (!Number.isFinite(screenWidth) || !Number.isFinite(screenHeight)) {
      emitCanvasDiag('warn', 'canvas:preflight:screen_dims_missing', null, {
        stage: 'preflight',
        key: '__WIDTH/__HEIGHT',
        type: 'pipeline missing data',
        message: 'screen dimensions unavailable for OffscreenCanvas init',
        data: {
          outcome: 'skip',
          reason: 'screen_dims_missing',
          __WIDTH: screenWidth,
          __HEIGHT: screenHeight
        }
      });
      return;
    }
    if (!(__canvasState && __canvasState.offscreenCanvas)) {
      const osc = new G.OffscreenCanvas(screenWidth, screenHeight);
      __defineHidden__(__canvasState, 'offscreenCanvas', osc,
        'canvas:apply:offscreen_storage_define_failed',
        'CanvasPatchContext.state.__CANVAS__.__STATE__.offscreenCanvas',
        'offscreen defineProperty failed; fallback assign used'
      );
    }
    __canvasState.offscreenReady = true;
  }

  // Воркеру нужен Offscreen без ожидания DOM; в window — это тоже безопасно
  _ensureOffscreenOnce();

  // Фасад для окна: создаёт DOM и гарантирует Offscreen (идемпотентно)
  function realInit() {
    _ensureDomOnce();
    _ensureOffscreenOnce();
    const hasCanvas = !!(__canvasState && __canvasState.domCanvas);
    const hasCanvasHost = !!(__canvasState && __canvasState.domCanvasHost);
    const hasOffscreen = !!(__canvasState && __canvasState.offscreenCanvas);
    const domReady = !!(__canvasState && __canvasState.domReady === true);
    const documentReadyState = (__canvasDocument && typeof __canvasDocument.readyState === 'string') ? __canvasDocument.readyState : null;
    if (domReady && hasCanvas && hasCanvasHost && hasOffscreen) {
      emitCanvasDiag('info', 'canvas:applied', null, {
        stage: 'apply',
        message: 'Canvas realInit done',
        data: {
          outcome: 'return',
          reason: 'applied',
          initReason: 'real_init',
          hasCanvas: hasCanvas,
          hasCanvasHost: hasCanvasHost,
          hasOffscreen: hasOffscreen,
          domReady: domReady
        }
      });
      return;
    }
    const initDeferred = !domReady && documentReadyState === 'loading';
    if (initDeferred) return;
    emitCanvasDiag('warn', 'canvas:apply:real_init_incomplete', null, {
      stage: 'apply',
      type: 'browser structure missing data',
      message: 'Canvas realInit incomplete',
      data: {
        outcome: 'skip',
        reason: 'real_init_incomplete',
        hasCanvas: hasCanvas,
        hasCanvasHost: hasCanvasHost,
        hasOffscreen: hasOffscreen,
        domReady: domReady,
        documentReadyState: documentReadyState
      }
    });
  }

  if (__canvasDocument) {
    realInit();
    if (!__canvasState.domReady && __canvasDocument.readyState === 'loading' && __canvasState.__REAL_INIT_DOM_DEFERRED__ !== true) {
      __defineHidden__(
        __canvasState,
        '__REAL_INIT_DOM_DEFERRED__',
        true,
        'canvas:apply:real_init_deferred_flag_define_failed',
        'CanvasPatchContext.state.__CANVAS__.__STATE__.__REAL_INIT_DOM_DEFERRED__',
        'realInit deferred flag defineProperty failed; fallback assign used'
      );
      __canvasDocument.addEventListener('DOMContentLoaded', () => {
        __canvasState.__REAL_INIT_DOM_DEFERRED__ = false;
        realInit();
      }, { once: true });
    }
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


  function q256(v){ return Math.round(v * 256) / 256; }



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
      // Cache-freeze root cause (by design): TextMetrics cache has no invalidation.
      // If the first measureText() for a key happens before fonts are actually ready,
      // the cached values can "cement" early/fallback metrics forever for that key.
      //
      // Mitigation (minimal, MDN/Chromium-consistent):
      // - Do not create/use TextMetrics cache until fonts are ready in CanvasPatchContext.state.__FONTS__.__STATE__.
      // - Couple cache epoch to familySnapshot.versionToken so runtime font-family transitions invalidate old keys.
      // - Keep API-shape compatibility: do not synthesize values for properties absent on native TextMetrics.

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

 // ===== fillRectNoiseHook  =====
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
  // Keep toDataURL hook single-pass: no getImageData, no re-render, no pixel/dimension changes.
  function patchToDataURLInjectNoise(res, type, quality) {
    if (typeof res !== 'string') return res;
    if (type && String(type).toLowerCase() !== 'image/png') return res;
    if (res.indexOf('data:image/png;base64,') !== 0) return res;

    try {
      const __prng = __resolvePrngState();
      if (typeof __prng.seed !== 'string' || !__prng.seed) {
        emitCanvasDiag('warn', 'canvas:toDataURL:png_chunk_seed_missing', null, {
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

      const sig = [137, 80, 78, 71, 13, 10, 26, 10];
      if (u8.length < 8 + 12) return res;
      for (let i = 0; i < 8; i++) if (u8[i] !== sig[i]) return res;
      if (String.fromCharCode(u8[12], u8[13], u8[14], u8[15]) !== 'IHDR') return res;

      function readU32BE(a, off) {
        return ((a[off] << 24) | (a[off + 1] << 16) | (a[off + 2] << 8) | a[off + 3]) >>> 0;
      }
      function writeU32BE(a, off, v) {
        a[off] = (v >>> 24) & 255;
        a[off + 1] = (v >>> 16) & 255;
        a[off + 2] = (v >>> 8) & 255;
        a[off + 3] = v & 255;
      }
      function getCrcTable() {
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
      function crc32Chunk(typeStr, dataU8) {
        const tab = getCrcTable();
        let crc = ~0 >>> 0;
        for (let i = 0; i < 4; i++) crc = (tab[(crc ^ (typeStr.charCodeAt(i) & 255)) & 255] ^ (crc >>> 8)) >>> 0;
        for (let i = 0; i < dataU8.length; i++) crc = (tab[(crc ^ dataU8[i]) & 255] ^ (crc >>> 8)) >>> 0;
        return (~crc) >>> 0;
      }

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
      if (iendOff < 0) return res;

      const seedHash = stringHash(__prng.seed + '|toDataURL|png-ancillary');
      const bytesHash = stringHash(base64.slice(0, 4096) + '|' + u8.length);
      const payload = new Uint8Array(8);
      writeU32BE(payload, 0, seedHash >>> 0);
      writeU32BE(payload, 4, bytesHash >>> 0);

      const chunkType = 'iHDr';
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

      let s = '';
      const CH = 0x8000;
      for (let i = 0; i < out.length; i += CH) {
        s += String.fromCharCode.apply(null, out.subarray(i, i + CH));
      }
      return prefix + btoa(s);
    } catch (e) {
      emitCanvasDiag('warn', 'canvas:toDataURL:png_chunk_failed', e, {
        stage: 'hook',
        key: 'toDataURL',
        data: { outcome: 'return_native', reason: 'png_ancillary_chunk_failed' }
      });
      return res;
    }
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

}
