
// === CONTEXT PATCH MODULE ===
const ContextPatchModule = function ContextPatchModule(window) {
  'use strict';  
  const C  = window.CanvasPatchContext;
  const __loggerRoot = (C && C.__logger && typeof C.__logger === 'object') ? C.__logger : null;
    if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — registratio not available');
  const G = (typeof globalThis !== 'undefined' && globalThis)
    || (typeof self       !== 'undefined' && self)
    || (typeof window     !== 'undefined' && window)
    || (typeof global     !== 'undefined' && global)
    || {};
    
  const global = window;
  if (global.CanvasPatchContext && global.CanvasPatchContext.__READY__) {
    return; // in case is already initialized
  }

  function __defineHiddenValue__(obj, key, value) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return value;
    const d = Object.getOwnPropertyDescriptor(obj, key);
    if (d && d.configurable === false) {
      if (Object.prototype.hasOwnProperty.call(d, 'value')) return d.value;
      return value;
    }
    Object.defineProperty(obj, key, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: false
    });
    return value;
  }

  __defineHiddenValue__(C, '__READY__', true);
  const patchState = (() => {
    const existing = (C.__patchState && typeof C.__patchState === 'object') ? C.__patchState : null;
    if (existing) {
      __defineHiddenValue__(C, '__patchState', existing);
      return existing;
    }
    return __defineHiddenValue__(C, '__patchState', {
      canvas: false,
      offscreen: false,
      webgl: false,
      hooksRegistered: false,
    });
  })();
  function __ensurePatchState__(owner) {
    const target = (owner && (typeof owner === 'object' || typeof owner === 'function'))
      ? owner
      : C;
    const existing = (target.__patchState && typeof target.__patchState === 'object')
      ? target.__patchState
      : null;
    if (existing) {
      __defineHiddenValue__(target, '__patchState', existing);
      return existing;
    }
    __defineHiddenValue__(target, '__patchState', patchState);
    return patchState;
  }
  const hookModeStore = (C.__hookModeStore && typeof C.__hookModeStore === 'object')
    ? C.__hookModeStore
    : {};
  if (!Object.prototype.hasOwnProperty.call(C, '__hookModeStore')) {
    Object.defineProperty(C, '__hookModeStore', {
      value: hookModeStore,
      writable: false,
      configurable: true,
      enumerable: false
    });
  }
  if (!Object.prototype.hasOwnProperty.call(hookModeStore, 'post_orig_once')) {
    Object.defineProperty(hookModeStore, 'post_orig_once', {
      value: Object.freeze({}),
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
  const HOOK_MODE_POST_ORIG_ONCE = hookModeStore.post_orig_once;
  const KEEP_NATIVE_WL = (C && C.__KEEP_NATIVE_WL__ && typeof C.__KEEP_NATIVE_WL__ === 'object')
    ? C.__KEEP_NATIVE_WL__
    : Object.freeze({
        htmlCanvas: Object.freeze(['getContext', 'toDataURL', 'toBlob']),
        offscreenCanvas: Object.freeze(['getContext', 'convertToBlob']),
        ctx2D: Object.freeze(['getImageData', 'putImageData', 'measureText', 'fillText', 'strokeText', 'fillRect', 'drawImage']),
        webgl: Object.freeze(['getParameter', 'getSupportedExtensions', 'getExtension', 'readPixels', 'getShaderPrecisionFormat', 'shaderSource', 'getUniform'])
      });
  if (!Object.prototype.hasOwnProperty.call(C, '__KEEP_NATIVE_WL__')) {
    Object.defineProperty(C, '__KEEP_NATIVE_WL__', {
      value: KEEP_NATIVE_WL,
      writable: false,
      configurable: true,
      enumerable: false
    });
  }
  const GATEWAY_METHODS = (C && C.__GATEWAY_METHODS__ && typeof C.__GATEWAY_METHODS__ === 'object')
    ? C.__GATEWAY_METHODS__
    : Object.freeze({
        htmlCanvasSync: Object.freeze(['toDataURL']),
        htmlCanvasAsync: Object.freeze(['toBlob']),
        htmlCanvasFactory: Object.freeze(['getContext']),
        offscreenAsync: Object.freeze(['convertToBlob']),
        offscreenFactory: Object.freeze(['getContext']),
        ctx2DRead: Object.freeze(['getImageData']),
        ctx2DCore: Object.freeze(['putImageData', 'measureText', 'fillText', 'strokeText', 'fillRect', 'drawImage']),
        webgl: Object.freeze(['getParameter', 'getSupportedExtensions', 'getExtension', 'readPixels', 'getShaderPrecisionFormat', 'shaderSource', 'getUniform'])
      });
  if (!Object.prototype.hasOwnProperty.call(C, '__GATEWAY_METHODS__')) {
    Object.defineProperty(C, '__GATEWAY_METHODS__', {
      value: GATEWAY_METHODS,
      writable: false,
      configurable: true,
      enumerable: false
    });
  }
  const keptNativeRefs = (C && C.__keptNativeRefs__ instanceof WeakMap)
    ? C.__keptNativeRefs__
    : new WeakMap();
  if (!Object.prototype.hasOwnProperty.call(C, '__keptNativeRefs__')) {
    Object.defineProperty(C, '__keptNativeRefs__', {
      value: keptNativeRefs,
      writable: false,
      configurable: true,
      enumerable: false
    });
  }

  const ctx2DGatewayMethods = Object.freeze(
    Array.prototype.concat.call([], GATEWAY_METHODS.ctx2DRead, GATEWAY_METHODS.ctx2DCore)
  );
  const issuedSerializationPatchedOwners = (typeof WeakSet === 'function') ? new WeakSet() : null;
  const issuedWebGLPatchedContexts = (typeof WeakSet === 'function') ? new WeakSet() : null;
  const issuedGetContextPatchedOwners = (typeof WeakSet === 'function') ? new WeakSet() : null;
  const issuedDocumentFactoryPatchedDocs = (typeof WeakSet === 'function') ? new WeakSet() : null;
  let issuedOffscreenFactoryPatched = false;

  // === 0. Utilities ===
  function emitContextDiag(level, code, err, extra) {
    try {
      const x = (extra && typeof extra === "object") ? extra : {};
      const __MODULE  = (typeof x.module === "string" && x.module) ? x.module : "context";
      const __SURFACE = "canvas"; // дефолт для ctx2d веток; webgl приходит из extra.surface

      const __D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
      const __diag = (__D && typeof __D.diag === "function") ? __D.diag.bind(__D) : null;

      const ctx = {
        module: __MODULE,
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __MODULE,
        surface: (typeof x.surface === "string" && x.surface) ? x.surface : __SURFACE,
        key: (typeof x.key === "string" || x.key === null) ? x.key : null,
        stage: x.stage,      // no local normalization
        message: x.message,  // no local normalization
        data: Object.prototype.hasOwnProperty.call(x, "data") ? x.data : null,
        type: x.type         // no local normalization
      };

      if (__diag) return __diag(level, code, ctx, (err === undefined) ? null : err);

      if (typeof __D === "function") {
        const safeLevel = (level === undefined || level === null) ? "info" : level;
        const safeErr = (err === undefined || err === null) ? null : err;
        return __D(code, safeErr, Object.assign({}, ctx, { level: safeLevel }));
      }

      return undefined;
    } catch (_emitErr) {
      return undefined;
    }
  }

  function emitWebGLMonitor(entry) {
    try {
      if (!isWebGLAccessLoggerEnabled()) return;
      const x = (entry && typeof entry === 'object') ? entry : {};
      const monitor = {
        eventType: (typeof x.eventType === 'string' && x.eventType) ? x.eventType : 'webgl',
        method: (typeof x.method === 'string' && x.method) ? x.method : '',
        hook: (typeof x.hook === 'string' && x.hook) ? x.hook : '',
        stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
        message: (typeof x.message === 'string' && x.message) ? x.message : '',
        args: Object.prototype.hasOwnProperty.call(x, 'args') ? x.args : [],
        result: Object.prototype.hasOwnProperty.call(x, 'result') ? x.result : null,
        error: Object.prototype.hasOwnProperty.call(x, 'error') ? x.error : null
      };
      const extra = (Object.prototype.hasOwnProperty.call(x, 'extra') && x.extra && typeof x.extra === 'object') ? x.extra : null;
      emitContextDiag('info', 'context:webgl:monitor', null, {
        module: 'webgl',
        diagTag: 'webgl',
        surface: 'webgl',
        key: monitor.method || null,
        stage: monitor.stage,
        message: monitor.message || 'webgl monitor event',
        type: 'pipeline missing data',
        data: Object.assign({
          loggerGroup: 'WEBGLlogger',
          loggerChannel: 'monitor_diag'
        }, monitor)
      });
      const push = (__loggerRoot && typeof __loggerRoot.__pushWebGLMonitor__ === 'function')
        ? __loggerRoot.__pushWebGLMonitor__
        : null;
      if (typeof push !== 'function') return;
      push(Object.assign({}, monitor, {
        extra: Object.assign({
          loggerGroup: 'WEBGLlogger',
          loggerChannel: 'monitor'
        }, extra),
        timestamp: new Date().toISOString()
      }));
    } catch (_) {}
  }

  function isWebGLAccessLoggerEnabled() {
    try {
      const cfg = (__loggerRoot && __loggerRoot._logConfig && typeof __loggerRoot._logConfig === 'object')
        ? __loggerRoot._logConfig.WEBGLlogger
        : null;
      if (cfg === false) return false;
      if (cfg && typeof cfg === 'object' && cfg.enabled === false) return false;
    } catch (_) {}
    return true;
  }

  const WEBGL_ACCESS_METHODS = Object.freeze({
    getParameter: true,
    getSupportedExtensions: true,
    getExtension: true,
    readPixels: true,
    getShaderPrecisionFormat: true,
    shaderSource: true,
    getUniform: true
  });

  function shouldLogWebGLAccess(method) {
    return !!WEBGL_ACCESS_METHODS[method];
  }

  function emitWebGLAccess(method, args, result, extra) {
    try {
      if (!isWebGLAccessLoggerEnabled()) return;
      if (!shouldLogWebGLAccess(method)) return;
      const x = (extra && typeof extra === 'object') ? extra : {};
      const safeArgs = Array.isArray(args) ? args : [];
      emitContextDiag('info', 'context:webgl:access', null, {
        module: 'webgl',
        stage: 'runtime',
        surface: 'webgl',
        key: method,
        message: 'webgl access',
        data: {
          outcome: 'return',
          reason: 'webgl_access',
          extra: {
            loggerGroup: 'WEBGLlogger',
            loggerChannel: 'access',
            method: method,
            source: (typeof x.source === 'string' && x.source) ? x.source : 'native',
            hook: (typeof x.hook === 'string' && x.hook) ? x.hook : null,
            request: safeArgs.length ? safeArgs[0] : null,
            args: safeArgs,
            result: result
          }
        }
      });
    } catch (_) {}
  }

  function emitCanvasAccess(method, args, result, source, phase, hook, count) {
    try {
      const safeArgs = Array.isArray(args) ? args : [];
      let resultMeta = null;
      if (typeof result === 'string') resultMeta = { kind: 'string', length: result.length };
      else if (result != null) {
        try {
          resultMeta = (typeof Blob !== 'undefined' && result instanceof Blob)
            ? { kind: 'Blob', size: result.size, type: result.type || '' }
            : { kind: (result.constructor && result.constructor.name) || typeof result };
        } catch (_) {
          resultMeta = { kind: typeof result };
        }
      }
      emitContextDiag('info', 'context:canvas:access', null, {
        module: 'context',
        stage: 'runtime',
        surface: 'canvas',
        key: method,
        message: 'canvas access',
        type: 'pipeline diagnostic',
        data: {
          outcome: 'return',
          reason: 'canvas_access',
          extra: {
            loggerGroup: 'CANVASlogger',
            loggerChannel: 'access',
            method: method,
            source: (typeof source === 'string' && source) ? source : 'native',
            hook: (typeof hook === 'string' && hook) ? hook : null,
            hookCount: Number.isFinite(count) ? count : null,
            hookPhase: (typeof phase === 'string' && phase) ? phase : null,
            request: safeArgs.length ? safeArgs[0] : null,
            resultMeta: resultMeta
          }
        }
      });
    } catch (_) {}
  }

  const patchedMethods = new WeakSet();
  const coreWindow = (global && global.Core && typeof global.Core === 'object')
    ? global.Core
    : null;
  const registerToStringWrapper = (coreWindow && typeof coreWindow.__registerToStringWrapper === 'function')
    ? coreWindow.__registerToStringWrapper
    : null;
  if (typeof registerToStringWrapper !== 'function') {
    throw new Error('[ContextPatch] Core.__registerToStringWrapper missing');
  }

  function guardInstance(proto, self){
    try { return self && (self instanceof proto.constructor || self instanceof proto.constructor.prototype.constructor); }
    catch (e) {
      emitContextDiag('warn', 'context:guard_instance:runtime:failed', e, {
        key: 'guardInstance',
        stage: 'runtime',
        type: 'browser structure missing data'
      });
      return false;
    }
  }


  function getHooks(){
    return (typeof global !== 'undefined' && global.CanvasPatchHooks) ? global.CanvasPatchHooks : null;
  }

  function __resolveCanvasStateForFont__() {
    const canvasRoot = (C && C.state && C.state.__CANVAS__ && typeof C.state.__CANVAS__ === 'object')
      ? C.state.__CANVAS__
      : null;
    const canvasState = (canvasRoot && canvasRoot.__STATE__ && typeof canvasRoot.__STATE__ === 'object')
      ? canvasRoot.__STATE__
      : null;
    return canvasState;
  }

  function __readSharedDefaultCtx2dFont__() {
    const canvasState = __resolveCanvasStateForFont__();
    const cached = (canvasState && typeof canvasState.defaultCtx2dFont === 'string')
      ? canvasState.defaultCtx2dFont.trim()
      : '';
    return cached || null;
  }

  function __storeSharedDefaultCtx2dFont__(ctx) {
    const canvasState = __resolveCanvasStateForFont__();
    if (!canvasState) {
      emitContextDiag('error', 'context:ctx2d:guard:default_font_state_missing', null, {
        stage: 'guard',
        key: 'CanvasPatchContext.state.__CANVAS__.__STATE__.defaultCtx2dFont',
        type: 'pipeline missing data',
        message: 'shared default ctx2d font state missing'
      });
      return false;
    }
    const existing = (typeof canvasState.defaultCtx2dFont === 'string') ? canvasState.defaultCtx2dFont.trim() : '';
    if (existing) return true;
    const font = (ctx && typeof ctx.font === 'string') ? ctx.font.trim() : '';
    if (!font) {
      emitContextDiag('error', 'context:ctx2d:guard:default_font_capture_failed', null, {
        stage: 'guard',
        key: 'ctx.font',
        type: 'browser structure missing data',
        message: 'default ctx2d font capture failed'
      });
      return false;
    }
    canvasState.defaultCtx2dFont = font;
    return true;
  }

  function getFontStr(self) {
    try {
      const liveFont = (self && typeof self.font === 'string' && self.font.trim()) ? self.font.trim() : '';
      if (liveFont) return liveFont;
      const sharedFont = __readSharedDefaultCtx2dFont__();
      if (sharedFont) return sharedFont;
      throw new Error('[ContextPatch] shared default ctx2d font missing');
    } catch (e) {
      emitContextDiag('warn', 'context:ctx2d:runtime:font_read_failed', e, {
        stage: 'runtime',
        key: 'font',
        type: 'browser structure missing data'
      });
      throw e;
    }
  }

  function keepNativeMethods(proto, methods) {
    if (!proto || !Array.isArray(methods) || !methods.length) return false;
    let bucket = keptNativeRefs.get(proto);
    if (!bucket) {
      bucket = Object.create(null);
      keptNativeRefs.set(proto, bucket);
    }
    let captured = false;
    for (const method of methods) {
      if (typeof method !== 'string' || !method || Object.prototype.hasOwnProperty.call(bucket, method)) continue;
      const desc = Object.getOwnPropertyDescriptor(proto, method);
      if (desc && typeof desc.value === 'function') {
        bucket[method] = desc.value;
        captured = true;
      }
    }
    return captured;
  }

  function resolveKeptNative(proto, method) {
    const bucket = proto ? keptNativeRefs.get(proto) : null;
    if (bucket && typeof bucket[method] === 'function') return bucket[method];
    const desc = proto ? Object.getOwnPropertyDescriptor(proto, method) : null;
    return (desc && typeof desc.value === 'function') ? desc.value : null;
  }

  function captureKeepNativeRefs() {
    if (typeof HTMLCanvasElement !== 'undefined' && HTMLCanvasElement.prototype) {
      keepNativeMethods(HTMLCanvasElement.prototype, KEEP_NATIVE_WL.htmlCanvas);
    }
    if (typeof OffscreenCanvas !== 'undefined' && OffscreenCanvas.prototype) {
      keepNativeMethods(OffscreenCanvas.prototype, KEEP_NATIVE_WL.offscreenCanvas);
    }
    if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype) {
      keepNativeMethods(CanvasRenderingContext2D.prototype, KEEP_NATIVE_WL.ctx2D);
    }
    if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' && OffscreenCanvasRenderingContext2D.prototype) {
      keepNativeMethods(OffscreenCanvasRenderingContext2D.prototype, KEEP_NATIVE_WL.ctx2D);
    }
    if (typeof WebGLRenderingContext !== 'undefined' && WebGLRenderingContext.prototype) {
      keepNativeMethods(WebGLRenderingContext.prototype, KEEP_NATIVE_WL.webgl);
    }
    if (typeof WebGL2RenderingContext !== 'undefined' && WebGL2RenderingContext.prototype) {
      keepNativeMethods(WebGL2RenderingContext.prototype, KEEP_NATIVE_WL.webgl);
    }
  }

  function getCtx2DProto(ctx) {
    if (typeof CanvasRenderingContext2D !== 'undefined' && ctx instanceof CanvasRenderingContext2D) {
      return CanvasRenderingContext2D.prototype;
    }
    if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' && ctx instanceof OffscreenCanvasRenderingContext2D) {
      return OffscreenCanvasRenderingContext2D.prototype;
    }
    return null;
  }

  captureKeepNativeRefs();

  function corePreflight(owner, key, kind, diagTag, contract) {
    const cfg = (contract && typeof contract === 'object') ? contract : {};
    const resolve = (typeof cfg.resolve === 'string' && cfg.resolve) ? cfg.resolve : 'own';
    let wrapLayer = (typeof cfg.wrapLayer === 'string' && cfg.wrapLayer) ? cfg.wrapLayer : null;
    if (!wrapLayer) {
      if (kind === 'data') wrapLayer = 'descriptor_only';
      else if (kind === 'accessor') {
        throw new Error(`[ContextPatch] accessor wrapLayer required for ${String(key)}`);
      }
      else wrapLayer = 'named_wrapper';
    }
    const policy = (typeof cfg.policy === 'string' && cfg.policy)
      ? cfg.policy
      : ((kind === 'accessor' && (wrapLayer === 'strict_accessor_gateway' || wrapLayer === 'object_return_gateway')) ? 'strict' : 'throw');
    const core = global && global.Core;
    if (!core || typeof core.preflightTarget !== 'function') {
      throw new Error('[ContextPatch] Core.preflightTarget missing');
    }
    const target = {
      owner: owner,
      key: key,
      kind: kind,
      wrapLayer: wrapLayer,
      resolve: resolve,
      policy: policy,
      diagTag: diagTag || 'context:preflight'
    };
    if (typeof cfg.invokeClass === 'string' && cfg.invokeClass) {
      target.invokeClass = cfg.invokeClass;
    }
    const preflight = core.preflightTarget(target);
    if (!preflight || preflight.ok !== true) {
      throw (preflight && preflight.error) ? preflight.error : new Error('[ContextPatch] preflight failed');
    }
    return preflight;
  }

  function definePatchedMethod(proto, method, value, contract) {
    const cfg = (contract && typeof contract === 'object') ? contract : {};
    const wrapLayer = (typeof cfg.wrapLayer === 'string' && cfg.wrapLayer) ? cfg.wrapLayer : '';
    if (!wrapLayer) {
      emitContextDiag('error', 'context:definePatchedMethod:contract_missing_wrapLayer', null, {
        stage: 'guard',
        key: method,
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'missing_wrapLayer' }
      });
      throw new Error(`[ContextPatch] definePatchedMethod missing wrapLayer for ${method}`);
    }
    const preflightContract = {
      wrapLayer,
      policy: (typeof cfg.policy === 'string' && cfg.policy) ? cfg.policy : 'throw'
    };
    if (typeof cfg.invokeClass === 'string' && cfg.invokeClass) {
      preflightContract.invokeClass = cfg.invokeClass;
    }
    const preflight = corePreflight(proto, method, 'method', 'context:definePatchedMethod', preflightContract);
    const d = preflight.desc || Object.getOwnPropertyDescriptor(proto, method);
    if (!d) {
      throw new Error(`[ContextPatch] descriptor missing for ${method}`);
    }
    Object.defineProperty(proto, method, {
      value,
      configurable: d ? !!d.configurable : true,
      enumerable: d ? !!d.enumerable : false,
      writable: d ? !!d.writable : true
    });
  }

  function defineIssuedMethod(instance, proto, method, value) {
    if (!instance || (typeof instance !== 'object' && typeof instance !== 'function')) return false;
    const d = proto ? Object.getOwnPropertyDescriptor(proto, method) : null;
    if (!d || typeof d.value !== 'function') return false;
    Object.defineProperty(instance, method, {
      value,
      configurable: !!d.configurable,
      enumerable: !!d.enumerable,
      writable: !!d.writable
    });
    return true;
  }

  // === 1.Hook registries (Initialization of arrays) ===
  C.htmlCanvasGetContextHooks           = C.htmlCanvasGetContextHooks          || [];
  C.htmlCanvasToDataURLHooks            = C.htmlCanvasToDataURLHooks           || [];
  C.htmlCanvasToBlobHooks               = C.htmlCanvasToBlobHooks              || [];

  C.offscreenGetContextHooks            = C.offscreenGetContextHooks           || [];
  C.offscreenConvertToBlobHooks         = C.offscreenConvertToBlobHooks        || [];

  C.ctx2DGetContextHooks                = C.ctx2DGetContextHooks               || [];
  C.ctx2DMeasureTextHooks               = C.ctx2DMeasureTextHooks              || [];
  C.ctx2DFillTextHooks                  = C.ctx2DFillTextHooks                 || [];
  C.ctx2DStrokeTextHooks                = C.ctx2DStrokeTextHooks               || [];
  C.ctx2DFillRectHooks                  = C.ctx2DFillRectHooks                 || [];
  C.ctx2DDrawImageHooks                 = C.ctx2DDrawImageHooks                || [];
  C.webglGetParameterHooks              = C.webglGetParameterHooks             || [];
  C.webglGetSupportedExtensionsHooks    = C.webglGetSupportedExtensionsHooks   || [];
  C.webglGetExtensionHooks              = C.webglGetExtensionHooks             || [];
  C.webglGetContextHooks                = C.webglGetContextHooks               || [];
  C.webglReadPixelsHooks                = C.webglReadPixelsHooks               || [];
  C.webglGetShaderPrecisionFormatHooks  = C.webglGetShaderPrecisionFormatHooks || [];
  C.webglShaderSourceHooks              = C.webglShaderSourceHooks             || [];
  C.webglGetUniformHooks                = C.webglGetUniformHooks               || [];

  function registerOnce(list, fn) {
    if (!list || typeof fn !== 'function') return false;
    if (list.indexOf(fn) !== -1) return false;
    list.push(fn);
    return true;
  }

  // === 2. Registrars ===
  C.registerHtmlCanvasGetContextHook          = fn => registerOnce(C.htmlCanvasGetContextHooks, fn);
  C.registerHtmlCanvasToDataURLHook           = fn => registerOnce(C.htmlCanvasToDataURLHooks, fn);
  C.registerHtmlCanvasToBlobHook              = fn => registerOnce(C.htmlCanvasToBlobHooks, fn);

  C.registerOffscreenGetContextHook           = fn => registerOnce(C.offscreenGetContextHooks, fn);
  C.registerOffscreenConvertToBlobHook        = fn => registerOnce(C.offscreenConvertToBlobHooks, fn);

  C.registerCtx2DGetContextHook               = fn => registerOnce(C.ctx2DGetContextHooks, fn);
  C.registerCtx2DMeasureTextHook              = fn => registerOnce(C.ctx2DMeasureTextHooks, fn);
  C.registerCtx2DFillTextHook                 = fn => registerOnce(C.ctx2DFillTextHooks, fn);
  C.registerCtx2DStrokeTextHook               = fn => registerOnce(C.ctx2DStrokeTextHooks, fn);
  C.registerCtx2DFillRectHook                 = fn => registerOnce(C.ctx2DFillRectHooks, fn);
  C.registerCtx2DDrawImageHook                = fn => registerOnce(C.ctx2DDrawImageHooks, fn);
  C.registerWebGLGetContextHook               = fn => registerOnce(C.webglGetContextHooks, fn);
  C.registerWebGLGetParameterHook             = fn => registerOnce(C.webglGetParameterHooks, fn);
  C.registerWebGLGetSupportedExtensionsHook   = fn => registerOnce(C.webglGetSupportedExtensionsHooks, fn);
  C.registerWebGLGetExtensionHook             = fn => registerOnce(C.webglGetExtensionHooks, fn);
  C.registerWebGLReadPixelsHook               = fn => registerOnce(C.webglReadPixelsHooks, fn);
  C.registerWebGLGetShaderPrecisionFormatHook = fn => registerOnce(C.webglGetShaderPrecisionFormatHooks, fn);
  C.registerWebGLShaderSourceHook             = fn => registerOnce(C.webglShaderSourceHooks, fn);
  C.registerWebGLGetUniformHook               = fn => registerOnce(C.webglGetUniformHooks, fn);

  // === 3. Patch utilities ===

  // === WEBGL PATCHING ===
  // METHODOLOGY NOTE:
  // WebGL patchMethod is a separate context-level gateway contract.
  // Its current preflight sequence, diag/logging, and override-log toggles
  // are part of the patch semantics here, not incidental debug noise.

  // ===== WEBGL issued override logging: two toggles (ВКЛ/ВЫКЛ) =====
  // Эти тумблеры влияют ТОЛЬКО на issued override logging в working path.
  // Standard access logging goes through context:webgl:access in __DEGRADE__.
  // Второй тумблер оставлен выключенным: отдельный auxiliary monitor-path сейчас не нужен.
  const WEBGL_OVERRIDE_DIAG_LOG    = true;  // true=ВКЛ, false=ВЫКЛ (__DEGRADE__.diag для issued override)
  const WEBGL_OVERRIDE_LOG = true; // true=ВКЛ, false=ВЫКЛ (auxiliary monitor path for override)

  function installIssuedSerializationMethods(owner) {
    if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) return 0;
    if (issuedSerializationPatchedOwners && issuedSerializationPatchedOwners.has(owner)) return 0;
    let proto = null;
    let plan = null;
    if (typeof HTMLCanvasElement !== 'undefined' && owner instanceof HTMLCanvasElement) {
      proto = HTMLCanvasElement.prototype;
      plan = [
        { method: 'toDataURL', hooks: () => C.htmlCanvasToDataURLHooks || [] },
        { method: 'toBlob', hooks: () => C.htmlCanvasToBlobHooks || [] }
      ];
    } else if (typeof OffscreenCanvas !== 'undefined' && owner instanceof OffscreenCanvas) {
      proto = OffscreenCanvas.prototype;
      plan = [
        { method: 'convertToBlob', hooks: () => C.offscreenConvertToBlobHooks || [] }
      ];
    }
    if (!proto || !Array.isArray(plan) || !plan.length) return 0;

    let applied = 0;
    for (const item of plan) {
      const method = item && item.method;
      if (typeof method !== 'string' || !method) continue;
      if (Object.prototype.hasOwnProperty.call(owner, method)) continue;
      const orig = resolveKeptNative(proto, method) || proto[method];
      if (typeof orig !== 'function') continue;

      const getHooksList = () => {
        const hooks = (item && typeof item.hooks === 'function') ? item.hooks() : [];
        return Array.isArray(hooks) ? hooks : [];
      };
      const applyHooksAsync = async (self, blob, hookArgs) => {
        let b = blob;
        const hooks = getHooksList();
        if (!(hooks && hooks.length)) return b;
        for (const hook of hooks) {
          if (typeof hook !== 'function') continue;
          try {
            const r = hook.call(self, b, ...(hookArgs || []));
            const out = (r && typeof r.then === 'function') ? await r : r;
            if (out instanceof Blob) b = out;
          } catch (e) {
            try {
              emitContextDiag('error', 'context:issued_serialization:hook:post_failed', e, {
                key: method,
                stage: 'hook',
                data: { hook: hook && (hook.name || null) }
              });
            } catch (_e) {
              emitWebGLMonitor({
                eventType: 'hook_error',
                method: method,
                hook: hook && (hook.name || ''),
                stage: 'hook',
                message: '[issuedSerialization][hook_failed]',
                error: e,
                extra: { mode: 'issuedSerialization' }
              });
            }
          }
        }
        return b;
      };

      let wrapped = null;
      if (method === 'toDataURL') {
        const inProgress = (typeof WeakSet === 'function') ? new WeakSet() : null;
        wrapped = ({ toDataURL(type, quality) {
          const self = this;
          const isObj = self !== null && (typeof self === 'object' || typeof self === 'function');
          if (inProgress && isObj) {
            if (inProgress.has(self)) return Reflect.apply(orig, self, arguments);
            inProgress.add(self);
          }
          try {
            const patchedArgs = Array.prototype.slice.call(arguments);
            const out = Reflect.apply(orig, this, patchedArgs);
            let res = out;
            const hooks = getHooksList();
            for (const hook of hooks) {
              try {
                const r = hook.call(this, res, ...patchedArgs);
                if (typeof r === 'string') res = r;
              } catch (e) {
                emitContextDiag('error', 'context:issued_serialization:hook:post_failed', e, {
                  key: method,
                  stage: 'hook',
                  data: { hook: hook && (hook.name || null) }
                });
                throw e;
              }
            }
            if (hooks && hooks.length) {
              emitCanvasAccess(method, patchedArgs, res, 'issued_serialization', 'post', null, hooks.length);
            }
            return res;
          } finally {
            if (inProgress && isObj) {
              inProgress.delete(self);
            }
          }
        } }).toDataURL;
      } else if (method === 'toBlob') {
        wrapped = ({ toBlob(callback, type, quality) {
          const self = this;
          const args = arguments;
          if (typeof callback === 'function') {
            const done = (blob) => {
              let out;
              try {
                out = applyHooksAsync(self, blob, args);
              } catch (e) {
                emitContextDiag('warn', 'context:issued_serialization:hook_failed', e, {
                  stage: 'hook',
                  key: method
                });
                callback(blob);
                return;
              }

              if (out && typeof out.then === 'function') {
                out.then(
                  (b2) => {
                    const hooks = getHooksList();
                    if (hooks && hooks.length) {
                      emitCanvasAccess(method, Array.prototype.slice.call(args), b2, 'issued_serialization', 'post', null, hooks.length);
                    }
                    callback(b2);
                  },
                  (e)  => {
                    emitContextDiag('warn', 'context:issued_serialization:hook_failed', e, {
                      stage: 'hook',
                      key: method
                    });
                    callback(blob);
                  }
                );
                return;
              }

              const hooks = getHooksList();
              if (hooks && hooks.length) {
                emitCanvasAccess(method, Array.prototype.slice.call(args), out, 'issued_serialization', 'post', null, hooks.length);
              }
              callback(out);
            };

            return Reflect.apply(orig, self, [done].concat(Array.prototype.slice.call(args, 1)));
          }
          return Reflect.apply(orig, self, args);
        } }).toBlob;
      } else if (method === 'convertToBlob') {
        wrapped = ({ convertToBlob(options) {
          const self = this;
          const args = arguments;
          const p = Reflect.apply(orig, self, args);
          if (!(p && typeof p.then === 'function')) {
            return p;
          }
          const hooks = getHooksList();
          if (!(hooks && hooks.length)) {
            return p;
          }
          return p.then(
            (blob) => {
              const out = applyHooksAsync(self, blob, args);
              return Promise.resolve(out).then(
                (b2) => {
                  emitCanvasAccess(method, Array.prototype.slice.call(args), b2, 'issued_serialization', 'post', null, hooks.length);
                  return b2;
                },
                (e)  => { throw e; }
              );
            },
            (e) => { throw e; }
          );
        } }).convertToBlob;
      }

      if (!wrapped) continue;
      if (defineIssuedMethod(owner, proto, method, wrapped)) {
        applied++;
        patchedMethods.add(wrapped);
      }
    }

    if (applied > 0 && issuedSerializationPatchedOwners) {
      issuedSerializationPatchedOwners.add(owner);
    }
    return applied;
  }

  // The current issued-instance path has a deliberate observability trade-off:
  // the hooked method may appear as an own property on the concrete ctx instance.
  // However, installing hooks on the issued instance after getContext() keeps
  // the broader prototype surface closer to Chromium behavior
  // and remains the stable baseline for this WebGL method family

  // As WebGL methods are brand- and receiver-sensitive APIs, switching this
  // hook to WebGLRenderingContext.prototype or WebGL2RenderingContext.prototype
  // leads to worse observability for Function.prototype.toString, Proxy/Reflect
  // behavior, and prototype-chain checks.

  function installIssuedWebGLMethods(ctx) {
    if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function')) {
      emitContextDiag('warn', 'context:issued_webgl:preflight:ctx_missing', null, {
        module: 'webgl',
        stage: 'preflight',
        surface: 'webgl',
        key: 'installIssuedWebGLMethods',
        type: 'browser structure missing data',
        message: 'issued webgl ctx is not defined',
        data: { reason: 'ctx_missing', path: 'issued' }
      });
      return 0;
    }
    if (issuedWebGLPatchedContexts && issuedWebGLPatchedContexts.has(ctx)) {
      emitContextDiag('info', 'context:issued_webgl:apply:already_patched', null, {
        module: 'webgl',
        stage: 'apply',
        surface: 'webgl',
        key: 'installIssuedWebGLMethods',
        type: 'pipeline missing data',
        message: 'issued webgl context already patched',
        data: { reason: 'context_already_patched', path: 'issued' }
      });
      return 0;
    }
    const proto =
      (typeof WebGLRenderingContext !== 'undefined' && ctx instanceof WebGLRenderingContext)
        ? WebGLRenderingContext.prototype
        : ((typeof WebGL2RenderingContext !== 'undefined' && ctx instanceof WebGL2RenderingContext)
            ? WebGL2RenderingContext.prototype
            : null);
    if (!proto) {
      emitContextDiag('warn', 'context:issued_webgl:preflight:proto_rejected', null, {
        module: 'webgl',
        stage: 'preflight',
        surface: 'webgl',
        key: 'installIssuedWebGLMethods',
        type: 'browser structure missing data',
        message: 'issued webgl proto rejected',
        data: { reason: 'proto_rejected', path: 'issued' }
      });
      return 0;
    }

    const methodPlan = [
      ['getParameter', C.webglGetParameterHooks],
      ['getSupportedExtensions', C.webglGetSupportedExtensionsHooks],
      ['getExtension', C.webglGetExtensionHooks],
      ['readPixels', C.webglReadPixelsHooks],
      ['getShaderPrecisionFormat', C.webglGetShaderPrecisionFormatHooks],
      ['shaderSource', C.webglShaderSourceHooks],
      ['getUniform', C.webglGetUniformHooks]
    ];
    let applied = 0;

    for (const [method, hooks] of methodPlan) {
      if (Object.prototype.hasOwnProperty.call(ctx, method)) {
        emitContextDiag('info', 'context:issued_webgl:apply:already_patched', null, {
          module: 'webgl',
          stage: 'apply',
          surface: 'webgl',
          key: method,
          type: 'pipeline missing data',
          message: 'issued webgl method already patched',
          data: { reason: 'issued_own_method_present', path: 'issued' }
        });
        continue;
      }
      if (!hooks?.length) {
        emitContextDiag('warn', 'context:issued_webgl:preflight:hooks_missing', null, {
          module: 'webgl',
          stage: 'preflight',
          surface: 'webgl',
          key: method,
          type: 'pipeline missing data',
          message: 'issued webgl hooks missing',
          data: { reason: 'hooks_missing', path: 'issued' }
        });
        continue;
      }
      const orig = resolveKeptNative(proto, method) || proto[method];
      if (typeof orig !== 'function') {
        emitContextDiag('warn', 'context:issued_webgl:preflight:proto_missing', null, {
          module: 'webgl',
          stage: 'preflight',
          surface: 'webgl',
          key: method,
          type: 'browser structure missing data',
          message: 'issued webgl proto method is not defined',
          data: { reason: 'proto_missing', path: 'issued' }
        });
        continue;
      }
      const guard = (typeof WeakSet === 'function') ? new WeakSet() : null;
      const hookMode = (hooks && (typeof hooks === 'object' || typeof hooks === 'function')) ? hooks.mode : undefined;
      const isPostOrigOnceMode = hookMode === HOOK_MODE_POST_ORIG_ONCE;
      const forbidOrigCall = function forbidOrigCall() { throw new TypeError(); };

      function invoke(self, argsLike) {
        const isObj = (self !== null) && (typeof self === 'object' || typeof self === 'function');
        const args = Array.isArray(argsLike) ? argsLike : Array.prototype.slice.call(argsLike);

        if (guard && isObj) {
          if (guard.has(self)) return Reflect.apply(orig, self, args);
          guard.add(self);
        }

        try {
          if (typeof guardInstance === "function" && !guardInstance(proto, self)) {
            return Reflect.apply(orig, self, args);
          }

          if (isPostOrigOnceMode) {
            const out = Reflect.apply(orig, self, args);
            for (const hook of hooks) {
              if (typeof hook !== 'function') continue;
              try {
                hook.apply(self, [forbidOrigCall, ...args, out]);
              } catch (e) {
                emitContextDiag('error', 'context:issued_webgl:hook:post_failed', e, {
                  module: 'webgl',
                  stage: 'hook',
                  surface: 'webgl',
                  key: method,
                  message: 'issued webgl post-orig hook failed',
                  data: {
                    hook: hook.name || 'anon',
                    mode: 'post_orig_once',
                    path: 'issued',
                    args: args,
                    result: out
                  }
                });
              }
            }
            emitWebGLAccess(method, args, out, {
              source: 'issued_native_post_orig_once'
            });
            return out;
          }

          let patched = args;
          for (const hook of hooks) {
            if (typeof hook !== 'function') continue;
            try {
              const res = hook.apply(self, [orig, ...patched]);
              if (Array.isArray(res) && method === 'getSupportedExtensions') {
                emitWebGLAccess(method, patched, res, {
                  source: 'issued_override',
                  hook: hook.name || 'anon'
                });
                return res;
              }
              if (res !== undefined && !Array.isArray(res)) {
                emitWebGLAccess(method, patched, res, {
                  source: 'issued_override',
                  hook: hook.name || 'anon'
                });
                if ((__loggerRoot && __loggerRoot.__DEBUG__) && isWebGLAccessLoggerEnabled()) {
                  if (WEBGL_OVERRIDE_DIAG_LOG) {
                    emitContextDiag('debug', 'context:issued_webgl:hook:override', null, {
                      module: 'webgl',
                      stage: 'hook',
                      surface: 'webgl',
                      key: method,
                      message: 'issued webgl override',
                      data: {
                        loggerGroup: 'WEBGLlogger',
                        loggerChannel: 'override_diag',
                        hook: hook.name || 'anon',
                        path: 'issued',
                        args: patched,
                        result: res
                      }
                    });
                  }
                  if (WEBGL_OVERRIDE_LOG) {
                    emitWebGLMonitor({
                      eventType: 'override',
                      method: method,
                      hook: hook.name || 'anon',
                      stage: 'hook',
                      message: '[installIssuedWebGLMethods override]',
                      args: patched,
                      result: res,
                      extra: { surface: 'webgl', path: 'issued' }
                    });
                  }
                }
                return res;
              }
              if (Array.isArray(res)) {
                patched = res;
              }
            } catch (e) {
              emitContextDiag('error', 'context:issued_webgl:hook:failed', e, {
                module: 'webgl',
                stage: 'hook',
                surface: 'webgl',
                key: method,
                message: 'issued webgl hook failed',
                data: {
                  hook: hook.name || 'anon',
                  mode: 'override_or_args',
                  path: 'issued',
                  args: patched
                }
              });
            }
          }
          const out = Reflect.apply(orig, self, patched);
          emitWebGLAccess(method, patched, out, {
            source: 'issued_native'
          });
          return out;
        } finally {
          if (guard && isObj) guard.delete(self);
        }
      }

      const wrapped = (function(){
        switch (orig.length) {
          case 0: return ({ [method]() { return invoke(this, arguments); } })[method];
          case 1: return ({ [method](a0) { return invoke(this, arguments); } })[method];
          case 2: return ({ [method](a0, a1) { return invoke(this, arguments); } })[method];
          case 7: return ({ [method](a0, a1, a2, a3, a4, a5, a6) { return invoke(this, arguments); } })[method];
          default: return ({ [method](...a) { return invoke(this, a); } })[method];
        }
      })();

      if (defineIssuedMethod(ctx, proto, method, wrapped)) {
        applied++;
        patchedMethods.add(wrapped);
      }
    }

    if (applied > 0 && issuedWebGLPatchedContexts) {
      issuedWebGLPatchedContexts.add(ctx);
    }
    return applied;
  }

  function installIssuedGetContextMethod(owner, htmlHooks, ctx2dHooks, webglHooks) {
    if (!owner || (typeof owner !== 'object' && typeof owner !== 'function')) return 0;
    if (issuedGetContextPatchedOwners && issuedGetContextPatchedOwners.has(owner)) return 0;
    let proto = null;
    if (typeof HTMLCanvasElement !== 'undefined' && owner instanceof HTMLCanvasElement) {
      proto = HTMLCanvasElement.prototype;
    } else if (typeof OffscreenCanvas !== 'undefined' && owner instanceof OffscreenCanvas) {
      proto = OffscreenCanvas.prototype;
    }
    if (!proto) return 0;
    if (Object.prototype.hasOwnProperty.call(owner, 'getContext')) return 0;
    const orig = resolveKeptNative(proto, 'getContext') || proto.getContext;
    if (typeof orig !== 'function') return 0;

    const dispatch = function(self, argsLike) {
      const args = Array.prototype.slice.call(argsLike || []);
      const type = args[0];
      const rest = args.length > 1 ? Array.prototype.slice.call(args, 1) : [];
      const res = Reflect.apply(orig, self, args);
      let ctx = res;
      let issuedHookCount = 0;

      try {
        if (ctx) {
          installIssuedSerializationMethods(self);
        }
        if (type === '2d' && ctx) {
          ctx = createSafeCtxProxy(ctx);
          __storeSharedDefaultCtx2dFont__(ctx);
          issuedHookCount += (ctx2dHooks && ctx2dHooks.length) || 0;
          for (const hook of (ctx2dHooks || [])) {
            try { ctx = hook.call(self, ctx, type, ...rest) || ctx; } catch (e) {
              emitContextDiag('warn', 'context:getContext:ctx2d_hook_failed', e, {
                stage: 'hook',
                key: 'getContext',
                data: { hook: hook && (hook.name || null), type: type || null }
              });
            }
          }
        }
        if (/^webgl/.test(String(type))) {
          if (ctx) {
            installIssuedWebGLMethods(ctx);
          }
          issuedHookCount += (webglHooks && webglHooks.length) || 0;
          for (const hook of (webglHooks || [])) {
            try { hook.call(self, ctx, type, ...rest); } catch (e) {
              emitContextDiag('warn', 'context:getContext:webgl_hook_failed', e, {
                stage: 'hook',
                key: 'getContext',
                data: { hook: hook && (hook.name || null), type: type || null }
              });
            }
          }
        }
        issuedHookCount += (htmlHooks && htmlHooks.length) || 0;
        for (const hook of (htmlHooks || [])) {
          try { hook.call(self, ctx, type, ...rest); } catch (e) {
            emitContextDiag('warn', 'context:getContext:html_hook_failed', e, {
              stage: 'hook',
              key: 'getContext',
              data: { hook: hook && (hook.name || null), type: type || null }
            });
          }
        }
        if (ctx && issuedHookCount) {
          emitCanvasAccess('getContext', args, ctx, 'issued_factory', 'post', null, issuedHookCount);
        }
      } catch (e) {
        emitContextDiag('error', 'context:getContext:chain_failed', e, {
          stage: 'hook',
          key: 'getContext',
          data: { type: type || null }
        });
      }
      return ctx;
    };

    const wrappedGetContextRaw = (function() {
      switch (orig.length) {
        case 0: return ({ getContext() { return dispatch(this, arguments); } }).getContext;
        case 1: return ({ getContext(a0) { return dispatch(this, arguments); } }).getContext;
        case 2: return ({ getContext(a0, a1) { return dispatch(this, arguments); } }).getContext;
        default: return ({ getContext(...a) { return dispatch(this, a); } }).getContext;
      }
    })();
    const wrapped = registerToStringWrapper(
      wrappedGetContextRaw,
      orig,
      'getContext',
      'ContextPatch:getContext'
    );
    if (!defineIssuedMethod(owner, proto, 'getContext', wrapped)) return 0;
    patchedMethods.add(wrapped);
    if (issuedGetContextPatchedOwners) issuedGetContextPatchedOwners.add(owner);
    return 1;
  }

  function installIssuedCanvasFactory(htmlHooks, ctx2dHooks, webglHooks) {
    const doc = global && global.document;
    if (!doc || typeof doc.createElement !== 'function') return 0;
    if (issuedDocumentFactoryPatchedDocs && issuedDocumentFactoryPatchedDocs.has(doc)) return 0;
    const docProto = Object.getPrototypeOf(doc);
    if (!docProto) return 0;
    let applied = 0;

    const resolveDocumentMethodOwner = function(method) {
      let owner = docProto;
      while (owner && !Object.prototype.hasOwnProperty.call(owner, method)) {
        owner = Object.getPrototypeOf(owner);
      }
      if (!owner) return null;
      const desc = Object.getOwnPropertyDescriptor(owner, method);
      return (desc && typeof desc.value === 'function') ? owner : null;
    };

    const installCanvasOwner = function(canvas) {
      if (!canvas) return;
      installIssuedSerializationMethods(canvas);
      installIssuedGetContextMethod(canvas, htmlHooks, ctx2dHooks, webglHooks);
    };

    const createElementProto = resolveDocumentMethodOwner('createElement');
    const createElementOrig = createElementProto && createElementProto.createElement;
    if (typeof createElementOrig === 'function' && !Object.prototype.hasOwnProperty.call(doc, 'createElement')) {
      const wrappedCreateElementRaw = function createElement(localName, options) {
        const el = Reflect.apply(createElementOrig, this, arguments);
        try {
          if (el && String(localName).toLowerCase() === 'canvas') installCanvasOwner(el);
        } catch (e) {
          emitContextDiag('warn', 'context:factory:createElement:decorate_failed', e, {
            stage: 'apply',
            key: 'createElement',
            data: { localName: localName == null ? null : String(localName) }
          });
        }
        return el;
      };
      const wrappedCreateElement = registerToStringWrapper(
        wrappedCreateElementRaw,
        createElementOrig,
        'createElement',
        'ContextPatch:createElement'
      );
      if (defineIssuedMethod(doc, createElementProto, 'createElement', wrappedCreateElement)) {
        patchedMethods.add(wrappedCreateElement);
        applied++;
      }
    }

    const createElementNSProto = resolveDocumentMethodOwner('createElementNS');
    const createElementNSOrig = createElementNSProto && createElementNSProto.createElementNS;
    if (typeof createElementNSOrig === 'function' && !Object.prototype.hasOwnProperty.call(doc, 'createElementNS')) {
      const wrappedCreateElementNSRaw = function createElementNS(namespaceURI, qualifiedName, options) {
        const el = Reflect.apply(createElementNSOrig, this, arguments);
        try {
          if (el && String(qualifiedName).toLowerCase() === 'canvas') installCanvasOwner(el);
        } catch (e) {
          emitContextDiag('warn', 'context:factory:createElementNS:decorate_failed', e, {
            stage: 'apply',
            key: 'createElementNS',
            data: { qualifiedName: qualifiedName == null ? null : String(qualifiedName) }
          });
        }
        return el;
      };
      const wrappedCreateElementNS = registerToStringWrapper(
        wrappedCreateElementNSRaw,
        createElementNSOrig,
        'createElementNS',
        'ContextPatch:createElementNS'
      );
      if (defineIssuedMethod(doc, createElementNSProto, 'createElementNS', wrappedCreateElementNS)) {
        patchedMethods.add(wrappedCreateElementNS);
        applied++;
      }
    }

    if (typeof doc.getElementsByTagName === 'function') {
      try {
        const existing = doc.getElementsByTagName('canvas');
        for (let i = 0; existing && i < existing.length; i++) {
          installCanvasOwner(existing[i]);
        }
      } catch (e) {
        emitContextDiag('warn', 'context:factory:existing_canvas_scan_failed', e, {
          stage: 'apply',
          key: 'canvas',
          data: { outcome: 'skip', reason: 'exception' }
        });
      }
    }

    if (applied > 0 && issuedDocumentFactoryPatchedDocs) issuedDocumentFactoryPatchedDocs.add(doc);
    return applied;
  }

  function installIssuedOffscreenFactory(htmlHooks, ctx2dHooks, webglHooks) {
    if (issuedOffscreenFactoryPatched) return 0;
    if (typeof global.OffscreenCanvas !== 'function') return 0;
    const ctorDesc = Object.getOwnPropertyDescriptor(global, 'OffscreenCanvas');
    const NativeOffscreenCanvas = global.OffscreenCanvas;
    if (!ctorDesc || ctorDesc.configurable === false) return 0;

    const WrappedOffscreenCanvasRaw = function OffscreenCanvas(width, height) {
      const nextTarget = (typeof new.target === 'function' && new.target !== WrappedOffscreenCanvas)
        ? new.target
        : NativeOffscreenCanvas;
      const instance = Reflect.construct(NativeOffscreenCanvas, arguments, nextTarget);
      try {
        installIssuedSerializationMethods(instance);
        installIssuedGetContextMethod(instance, htmlHooks, ctx2dHooks, webglHooks);
      } catch (e) {
        emitContextDiag('warn', 'context:factory:offscreen:decorate_failed', e, {
          stage: 'apply',
          key: 'OffscreenCanvas',
          data: { outcome: 'skip', reason: 'exception' }
        });
      }
      return instance;
    };
    Object.defineProperty(WrappedOffscreenCanvasRaw, '__coreBridgeTarget__', {
      value: NativeOffscreenCanvas,
      writable: true,
      configurable: true,
      enumerable: false
    });
    Object.setPrototypeOf(WrappedOffscreenCanvasRaw, Object.getPrototypeOf(NativeOffscreenCanvas));
    Object.defineProperty(WrappedOffscreenCanvasRaw, 'prototype', {
      value: NativeOffscreenCanvas.prototype,
      writable: false,
      configurable: false,
      enumerable: false
    });
    const WrappedOffscreenCanvas = registerToStringWrapper(
      WrappedOffscreenCanvasRaw,
      NativeOffscreenCanvas,
      'OffscreenCanvas',
      'ContextPatch:OffscreenCanvas'
    );

    Object.defineProperty(global, 'OffscreenCanvas', {
      value: WrappedOffscreenCanvas,
      writable: !!ctorDesc.writable,
      enumerable: !!ctorDesc.enumerable,
      configurable: !!ctorDesc.configurable
    });
    patchedMethods.add(WrappedOffscreenCanvas);
    issuedOffscreenFactoryPatched = true;
    return 1;
  }

  // === 4. Brand-safe patching for CanvasRenderingContext2D (no Proxy returned) ===
  function createSafeCtxProxy(ctx){
    const proto = getCtx2DProto(ctx);
    if (!ctx || !proto) return ctx;
    captureKeepNativeRefs();
    const core = (global && global.Core && typeof global.Core === 'object')
      ? global.Core
      : null;
    const wrapApply = (core && typeof core.__wrapNativeApply === 'function')
      ? core.__wrapNativeApply
      : null;
    if (typeof wrapApply !== 'function') {
      emitContextDiag('error', 'context:ctx2d:guard:wrap_native_apply_missing', null, {
        stage: 'guard',
        key: 'ctx2dGateway',
        type: 'pipeline missing data',
        data: { need: 'Core.__wrapNativeApply', outcome: 'skip', reason: 'wrap_native_apply_missing' }
      });
      return ctx;
    }

    // Patch once-per-method: if already patched, do nothing
    function patchOnce(method, makeApplyImpl){
      if (!proto || typeof proto[method] !== 'function') return false;
      if (ctx2DGatewayMethods.indexOf(method) === -1) return false;
      if (patchedMethods.has(proto[method])) return false;

      const orig = resolveKeptNative(proto, method) || proto[method];
      const applyImpl = makeApplyImpl(orig);
      const wrapped = wrapApply(orig, method, applyImpl);

      definePatchedMethod(proto, method, wrapped, {
        wrapLayer: 'core_wrapper',
        policy: 'throw',
        invokeClass: 'brand_strict'
      });
      patchedMethods.add(wrapped);
      return true;
    }

    // --- getImageData: route read-path through gateway without changing native answer ---
    patchOnce('getImageData', (orig) => (target, thisArg, argList) => {
      return Reflect.apply(target, thisArg, argList || []);
    });

    patchOnce('putImageData', (orig) => (target, thisArg, argList) => {
      return Reflect.apply(target, thisArg, argList || []);
    });

    // --- measureText: post-process TextMetrics via CanvasPatchHooks.applyMeasureTextHook ---
    patchOnce('measureText', (orig) => (target, thisArg, argList) => {
      const txt = ''.concat((argList && argList.length) ? argList[0] : '');
      const m = Reflect.apply(target, thisArg, [txt]);

      try {
        const H = getHooks();
        const fontStr = getFontStr(thisArg);

        if (H && typeof H.applyMeasureTextHook === 'function') {
          const r = Reflect.apply(H.applyMeasureTextHook, thisArg, [m, txt, fontStr]);
          return r ?? m;
        }

        // optional fallback if applyMeasureTextHook absent
        if (H && typeof H.measureTextNoiseHook === 'function') {
          // leave native as-is if only info hook exists
          // (do not change width here to preserve consistency)
          H.measureTextNoiseHook.call(thisArg, m, txt, fontStr);
        }
      } catch (e) {
        emitContextDiag('warn', 'context:ctx2d:hook:measureText_failed', e, {
          stage: 'hook',
          key: 'measureText'
        });
      }

      return m;
    });

    // --- fillText ---
    patchOnce('fillText', (orig) => (target, thisArg, argList) => {
      const text = argList && argList.length ? argList[0] : undefined;
      const x = argList && argList.length > 1 ? argList[1] : undefined;
      const y = argList && argList.length > 2 ? argList[2] : undefined;
      const rest = (argList && argList.length > 3) ? Array.prototype.slice.call(argList, 3) : [];
      const H = getHooks();


      let callArgs = [text, x, y, ...rest];
      if (H && typeof H.fillTextNoiseHook === 'function') {
        try {
          const a = H.fillTextNoiseHook.apply(thisArg, callArgs);
          if (Array.isArray(a)) callArgs = a;
        } catch (e) {
          emitContextDiag('warn', 'context:ctx2d:hook:fillText_failed', e, {
            stage: 'hook',
            key: 'fillText',
            data: { outcome: 'skip', reason: 'hook_exception' }
          });
        }
      }

      return Reflect.apply(target, thisArg, callArgs);
    });

    // --- strokeText ---
    patchOnce('strokeText', (orig) => (target, thisArg, argList) => {
      const text = argList && argList.length ? argList[0] : undefined;
      const x = argList && argList.length > 1 ? argList[1] : undefined;
      const y = argList && argList.length > 2 ? argList[2] : undefined;
      const rest = (argList && argList.length > 3) ? Array.prototype.slice.call(argList, 3) : [];
      const H = getHooks();


      let callArgs = [text, x, y, ...rest];
      if (H && typeof H.strokeTextNoiseHook === 'function') {
        try {
          const a = H.strokeTextNoiseHook.apply(thisArg, callArgs);
          if (Array.isArray(a)) callArgs = a;
        } catch (e) {
          emitContextDiag('warn', 'context:ctx2d:hook:strokeText_failed', e, {
            stage: 'hook',
            key: 'strokeText',
            data: { outcome: 'skip', reason: 'hook_exception' }
          });
        }
      }

      return Reflect.apply(target, thisArg, callArgs);
    });

    // --- fillRect ---
    patchOnce('fillRect', (orig) => (target, thisArg, argList) => {
      const x = argList && argList.length ? argList[0] : undefined;
      const y = argList && argList.length > 1 ? argList[1] : undefined;
      const w = argList && argList.length > 2 ? argList[2] : undefined;
      const h = argList && argList.length > 3 ? argList[3] : undefined;
      const H = getHooks();
      let callArgs = [x, y, w, h];
      if (H && typeof H.fillRectNoiseHook === 'function') {
        try {
          const a = H.fillRectNoiseHook.call(thisArg, x, y, w, h);
          if (Array.isArray(a)) callArgs = a;
        } catch (e) {
          emitContextDiag('warn', 'context:ctx2d:hook:fillRect_failed', e, {
            stage: 'hook',
            key: 'fillRect',
            data: { outcome: 'skip', reason: 'hook_exception' }
          });
        }
      }
      return Reflect.apply(target, thisArg, callArgs);
    });

    // --- drawImage ---
    patchOnce('drawImage', (orig) => (target, thisArg, argList) => {
      const args = (argList && argList.length) ? Array.prototype.slice.call(argList) : [];
      const H = getHooks();
      if (H && typeof H.applyDrawImageHook === 'function') {
        try {
          const callOrig = (...a) => Reflect.apply(target, thisArg, a);
          return H.applyDrawImageHook.call(thisArg, callOrig, ...args);
        } catch (e) {
          emitContextDiag('warn', 'context:ctx2d:hook:drawImage_failed', e, {
            stage: 'hook',
            key: 'drawImage',
            type: 'browser structure missing data',
            data: { outcome: 'throw', reason: 'hook_apply_failed' }
          });
          throw e;
        }
      }
      return Reflect.apply(target, thisArg, args);
    });

    // IMPORTANT: return real ctx (brand-safe). No Proxy.
    return ctx;
  }

  // === 6. applying of patches===
  C.applyCanvasElementPatches = function(){
    const state = __ensurePatchState__(this);
    if (state.canvas) return 0;
    if (typeof HTMLCanvasElement === 'undefined' || !HTMLCanvasElement.prototype) return 0;
    captureKeepNativeRefs();
    let applied = 0, total = 2;
    applied += installIssuedCanvasFactory(
      this.htmlCanvasGetContextHooks,
      this.ctx2DGetContextHooks,
      this.webglGetContextHooks
    );
    const canvasState = __resolveCanvasStateForFont__();
    const domCanvas = canvasState ? canvasState.domCanvas : null;
    if (domCanvas) {
      total += 3;
      applied += installIssuedSerializationMethods(domCanvas);
      applied += installIssuedGetContextMethod(domCanvas, this.htmlCanvasGetContextHooks, this.ctx2DGetContextHooks, this.webglGetContextHooks);
    }
    state.canvas = applied > 0;
    if (__loggerRoot && __loggerRoot.__DEBUG__) {
      emitContextDiag('info', 'context:canvas:apply:patches_applied', null, {
        stage: 'apply',
        key: 'HTMLCanvasElement.getContext',
        message: 'canvas issued patches applied',
        data: { applied: applied, total: total }
      });
    }
    return applied;
  };

  C.applyOffscreenPatches = function(){
    const state = __ensurePatchState__(this);
    if (state.offscreen) return 0;
    const Ctx = this;
    let applied = 0, total = 1;
    if (typeof OffscreenCanvas !== 'undefined'){
      captureKeepNativeRefs();
      applied += installIssuedOffscreenFactory(
        Ctx.offscreenGetContextHooks,
        Ctx.ctx2DGetContextHooks,
        Ctx.webglGetContextHooks
      );
      const canvasState = __resolveCanvasStateForFont__();
      const offscreenCanvas = canvasState ? canvasState.offscreenCanvas : null;
      if (offscreenCanvas) {
        total += 2;
        applied += installIssuedSerializationMethods(offscreenCanvas);
        applied += installIssuedGetContextMethod(offscreenCanvas, Ctx.offscreenGetContextHooks, Ctx.ctx2DGetContextHooks, Ctx.webglGetContextHooks);
      }
      state.offscreen = applied > 0;
    }
    if (__loggerRoot && __loggerRoot.__DEBUG__) {
      emitContextDiag('info', 'context:offscreen:apply:patches_applied', null, {
        stage: 'apply',
        key: 'OffscreenCanvas.getContext',
        message: 'offscreen issued patches applied',
        data: { applied: applied, total: total }
      });
    }
    return applied;
  };

  C.applyWebGLContextPatches = function () {
      const state = __ensurePatchState__(this);
      if (state.webgl) return 0;
      captureKeepNativeRefs();
      let applied = 0, total = 2;
      let already = 0;
      state.webgl = applied > 0;
      emitContextDiag('info', 'context:webgl:apply:patches_applied', null, {
        stage: 'apply',
        surface: 'webgl',
        key: 'WebGLRenderingContext',
        message: 'webgl prototype patches deferred to issued-context install',
        type: 'pipeline missing data',
        data: { applied, total, already }
      });
      return applied;
    };

  // === 4. FINAL REGISTRATION ===
  function registerAllHooks() {
    const C = window.CanvasPatchContext;
    if (!C) return;
    const state = __ensurePatchState__(C);
    if (state.hooksRegistered) return;

    // 1) We guarantee the presence of registers
    window.CanvasPatchHooks = window.CanvasPatchHooks || {};
    window.webglHooks       = window.webglHooks       || {};

    // 2) We take aliases after initialization
    const H = window.CanvasPatchHooks;
    const webglHooks = window.webglHooks;

    // 3) Validation of the availability of exports Canvas-hooks (from CanvasPatchModule)
    [
      // 2026-02-11: 'patchCanvasIHDRHook' disabled (non-wired runtime hook, kept out of required list).
      'patchToDataURLInjectNoise','masterToDataURLHook', 'fillTextNoiseHook','strokeTextNoiseHook', 'patchToBlobInjectNoise', 'patchConvertToBlobInjectNoise',
      'measureTextNoiseHook','applyMeasureTextHook', 'fillRectNoiseHook', 'applyDrawImageHook',
    ].forEach(name => {
      if (typeof H[name] !== 'function') {
        throw new Error(`[CanvasPatch] Hook ${name} not defined in CanvasPatchHooks`);
      }
    });

    // 4) Registration Canvas 2D
    if (C.registerHtmlCanvasToDataURLHook)    C.registerHtmlCanvasToDataURLHook(H.masterToDataURLHook);
    if (C.registerHtmlCanvasToBlobHook)       C.registerHtmlCanvasToBlobHook(H.patchToBlobInjectNoise);
    if (C.registerOffscreenConvertToBlobHook) C.registerOffscreenConvertToBlobHook(H.patchConvertToBlobInjectNoise);
    if (C.registerCtx2DMeasureTextHook)       C.registerCtx2DMeasureTextHook(H.measureTextNoiseHook);
    if (C.registerCtx2DFillTextHook)          C.registerCtx2DFillTextHook(H.fillTextNoiseHook);
    if (C.registerCtx2DStrokeTextHook)        C.registerCtx2DStrokeTextHook(H.strokeTextNoiseHook);
    if (C.registerCtx2DFillRectHook)          C.registerCtx2DFillRectHook(H.fillRectNoiseHook);
    if (C.registerCtx2DDrawImageHook)         C.registerCtx2DDrawImageHook(H.applyDrawImageHook);

    // 5) Validation of availability WebGL-hooks
    [
      'webglGetParameterMask',
      'webglWhitelistParameterHook',
      'webglGetSupportedExtensionsPatch',
      'webglGetExtensionPatch',
      'webglGetContextPatch',
      'webglReadPixelsHook',
      'webglGetShaderPrecisionFormatHook',
      'webglShaderSourceHook',
      'webglGetUniformHook'
    ].forEach(fn => {
      if (typeof webglHooks[fn] !== 'function') {
        throw new Error(`Функция ${fn} не определена в webglHooks!`);
      }
    });

    // 6) WebGL-hooks regisgration
    if (C.registerWebGLGetParameterHook) {          C.registerWebGLGetParameterHook(webglHooks.webglGetParameterMask);
                                                    C.registerWebGLGetParameterHook(webglHooks.webglWhitelistParameterHook);
    }
    if (C.registerWebGLGetSupportedExtensionsHook)   C.registerWebGLGetSupportedExtensionsHook(webglHooks.webglGetSupportedExtensionsPatch);
    if (C.registerWebGLGetExtensionHook)             C.registerWebGLGetExtensionHook(webglHooks.webglGetExtensionPatch);
    if (C.registerWebGLGetContextHook)               C.registerWebGLGetContextHook(webglHooks.webglGetContextPatch);
    if (C.registerWebGLReadPixelsHook)               C.registerWebGLReadPixelsHook(webglHooks.webglReadPixelsHook);
    if (C.registerWebGLGetShaderPrecisionFormatHook) C.registerWebGLGetShaderPrecisionFormatHook(webglHooks.webglGetShaderPrecisionFormatHook);
    if (C.registerWebGLShaderSourceHook)             C.registerWebGLShaderSourceHook(webglHooks.webglShaderSourceHook);
    if (C.registerWebGLGetUniformHook)               C.registerWebGLGetUniformHook(webglHooks.webglGetUniformHook);
    state.hooksRegistered = true;
  }
    // keep registerAllHooks inside CanvasPatchContext to avoid a standalone window export
    if (!Object.prototype.hasOwnProperty.call(C, 'registerAllHooks')) {
      Object.defineProperty(C, 'registerAllHooks', {
        value: registerAllHooks,
        writable: true,
        configurable: true,
        enumerable: false
      });
    } else {
      const d = Object.getOwnPropertyDescriptor(C, 'registerAllHooks');
      if (d && d.enumerable !== false && d.configurable !== false && typeof C.registerAllHooks === 'function') {
        Object.defineProperty(C, 'registerAllHooks', {
          value: C.registerAllHooks,
          writable: !!d.writable,
          configurable: true,
          enumerable: false
        });
      }
    }

}
