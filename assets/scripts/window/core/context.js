
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
  const issuedContextRegistry = (C && C.__issuedContextRegistry__ instanceof WeakMap)
    ? C.__issuedContextRegistry__
    : new WeakMap();
  if (!Object.prototype.hasOwnProperty.call(C, '__issuedContextRegistry__')) {
    Object.defineProperty(C, '__issuedContextRegistry__', {
      value: issuedContextRegistry,
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
  const NOP = () => {};
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
      const push = (__loggerRoot && typeof __loggerRoot.__pushWebGLMonitor__ === 'function')
        ? __loggerRoot.__pushWebGLMonitor__
        : null;
      if (typeof push !== 'function') return;
      const x = (entry && typeof entry === 'object') ? entry : {};
      push({
        eventType: (typeof x.eventType === 'string' && x.eventType) ? x.eventType : 'webgl',
        method: (typeof x.method === 'string' && x.method) ? x.method : '',
        hook: (typeof x.hook === 'string' && x.hook) ? x.hook : '',
        stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
        message: (typeof x.message === 'string' && x.message) ? x.message : '',
        args: Object.prototype.hasOwnProperty.call(x, 'args') ? x.args : [],
        result: Object.prototype.hasOwnProperty.call(x, 'result') ? x.result : null,
        error: Object.prototype.hasOwnProperty.call(x, 'error') ? x.error : null,
        extra: Object.prototype.hasOwnProperty.call(x, 'extra') ? x.extra : null,
        timestamp: new Date().toISOString()
      });
    } catch (_) {}
  }

  function shouldLogWebGLAccess(method) {
    return method === 'getParameter'
      || method === 'getSupportedExtensions'
      || method === 'getExtension';
  }

  function summarizeWebGLAccessValue(value) {
    if (value == null) return value;
    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') return value;
    if (Array.isArray(value)) {
      return {
        kind: 'Array',
        length: value.length,
        sample: value.slice(0, 16)
      };
    }
    try {
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && ArrayBuffer.isView(value)) {
        return {
          kind: (value && value.constructor && value.constructor.name) ? value.constructor.name : 'TypedArray',
          length: (value && typeof value.length === 'number') ? value.length : 0,
          sample: Array.prototype.slice.call(value, 0, 16)
        };
      }
    } catch (_) {}
    let ctorName = null;
    let tag = null;
    try { ctorName = (value && value.constructor && value.constructor.name) ? value.constructor.name : null; } catch (_) {}
    try { tag = Object.prototype.toString.call(value); } catch (_) {}
    return {
      kind: ctorName || tag || t
    };
  }

  function emitWebGLAccess(method, args, result, extra) {
    try {
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
            method: method,
            source: (typeof x.source === 'string' && x.source) ? x.source : 'native',
            hook: (typeof x.hook === 'string' && x.hook) ? x.hook : null,
            request: safeArgs.length ? safeArgs[0] : null,
            args: safeArgs,
            result: result,
            resultMeta: summarizeWebGLAccessValue(result)
          }
        }
      });
    } catch (_) {}
  }

  const patchedMethods = new WeakSet();
  const markAsNative = (function() {
    const core = (global && global.Core && typeof global.Core === 'object')
      ? global.Core
      : null;
    const ensure = core && typeof core.__ensureMarkAsNative === 'function'
      ? core.__ensureMarkAsNative
      : null;

    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      throw new Error('[ContextPatch] markAsNative missing');
    }
    return function(fn, name) {
      return m(fn, name);
    };
  })();

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

  // Native default ctx2d font (MDN/Chromium-consistent). Cache it once in CanvasPatchContext.
  // NOTE: this value is used as a stable fallback for hook keys (fontStr) when ctx.font is unreadable/empty.
  const DEFAULT_CTX2D_FONT = (function initDefaultCtx2DFont(){
    const cached = (C && typeof C.__DEFAULT_CTX2D_FONT__ === 'string') ? C.__DEFAULT_CTX2D_FONT__ : '';
    if (cached && cached.trim()) return cached.trim();
    emitContextDiag('warn', 'context:ctx2d:guard:default_font_missing', null, {
      stage: 'guard',
      key: '__DEFAULT_CTX2D_FONT__',
      type: 'pipeline missing data',
      message: 'shared default ctx2d font missing'
    });
    return '';
  })();

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

  function registerIssuedContext(ctx, contextId, owner) {
    if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function')) return ctx;
    const kind = (typeof contextId === 'string' && contextId) ? contextId : null;
    let surface = 'canvas';
    if (kind && /^webgl/.test(kind)) surface = 'webgl';
    issuedContextRegistry.set(ctx, {
      kind,
      surface,
      owner: (owner && owner.constructor && owner.constructor.name) ? String(owner.constructor.name) : null
    });
    return ctx;
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
  // C.canvas2DNoiseHooks                  = C.canvas2DNoiseHooks                 || [];

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
  // C.registerCtx2DAddNoiseHook                 = fn => registerOnce(C.canvas2DNoiseHooks, fn);
  // 2026-02-11: TEMPORARILY DISABLED in one place (pipeline de-integration only).
  // Related implementations to revisit later:
  // assets/scripts/window/patches/graphics/canvas.js -> masterToDataURLHook, patchToBlobInjectNoise, patchConvertToBlobInjectNoise, addCanvasNoise

  // if (C.registerCtx2DAddNoiseHook)          C.registerCtx2DAddNoiseHook(H.addCanvasNoise);

  C.registerWebGLGetContextHook               = fn => registerOnce(C.webglGetContextHooks, fn);
  C.registerWebGLGetParameterHook             = fn => registerOnce(C.webglGetParameterHooks, fn);
  C.registerWebGLGetSupportedExtensionsHook   = fn => registerOnce(C.webglGetSupportedExtensionsHooks, fn);
  C.registerWebGLGetExtensionHook             = fn => registerOnce(C.webglGetExtensionHooks, fn);
  C.registerWebGLReadPixelsHook               = fn => registerOnce(C.webglReadPixelsHooks, fn);
  C.registerWebGLGetShaderPrecisionFormatHook = fn => registerOnce(C.webglGetShaderPrecisionFormatHooks, fn);
  C.registerWebGLShaderSourceHook             = fn => registerOnce(C.webglShaderSourceHooks, fn);
  C.registerWebGLGetUniformHook               = fn => registerOnce(C.webglGetUniformHooks, fn);

  // === 3. Patch utilities ===
  function chain(proto, method, hooks){
    if (!proto || typeof proto[method] !== 'function') return false;
    const current = proto[method];
    if (patchedMethods.has(current)) return false;
    const orig = resolveKeptNative(proto, method) || current;
    const hookList = Array.isArray(hooks) ? hooks : [];

    // Avoid expando flags on "this" (detectable). Use WeakSet recursion guard.
    const inProgress =
      (typeof WeakSet === 'function') ? new WeakSet() : null;
    const wrapped = (method === 'toDataURL')
      ? ({ toDataURL(type, quality) {
           const self = this;
           const isObj = self !== null && (typeof self === 'object' || typeof self === 'function');
            // 2026-02-11: disabled dead guard block (__isChain_toDataURL) as non-wired in runtime.
            // Internal encode paths guard left commented intentionally for later revisit.
            // const __CHAIN_GUARD__ = '__isChain_toDataURL';
            // if (isObj && self[__CHAIN_GUARD__]) return Reflect.apply(orig, self, arguments);
            if (inProgress && isObj) {
             if (inProgress.has(self)) return Reflect.apply(orig, self, arguments);
             inProgress.add(self);
           }
           try {
             const patchedArgs = Array.prototype.slice.call(arguments);
             const out = Reflect.apply(orig, this, patchedArgs);
             let res = out;
              for (const hook of hookList){
                try {
                  const r = hook.call(this, res, ...patchedArgs);
                  if (typeof r === 'string') res = r;
               } catch (e) {
                 emitContextDiag('error', 'context:chain:hook:post_failed', e, {
                   key: method,
                   stage: 'hook',
                   data: { hook: hook && (hook.name || null) }
                 });
                 throw e;
             }
           }
           return res;
          } finally {
            if (inProgress && isObj) {
              inProgress.delete(self);
            }
          }
        } }).toDataURL
      : ({ [method]() {
          const self = this;
          const isObj = self !== null && (typeof self === 'object' || typeof self === 'function');
          if (inProgress && isObj) {
            if (inProgress.has(self)) return Reflect.apply(orig, self, arguments);
            inProgress.add(self);
          }
          try {
            let patchedArgs = Array.prototype.slice.call(arguments);
            for (const hook of hookList){
              if (typeof hook !== 'function') continue;
              try {
                const next = hook.apply(this, patchedArgs);
                if (next && Array.isArray(next)) patchedArgs = next;
              } catch (e) {
                emitContextDiag('error', 'context:chain:hook:args_failed', e, {
                  key: method,
                  stage: 'hook',
                  data: { hook: hook && (hook.name || null) }
                });
                throw e;
              }
            }
            return Reflect.apply(orig, this, patchedArgs);
          } finally {
            if (inProgress && isObj) {
              inProgress.delete(self);
            }
          }
        } })[method];

    Object.defineProperty(wrapped, '__coreBridgeTarget__', {
      value: orig,
      writable: true,
      configurable: true,
      enumerable: false
    });
    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched, { wrapLayer: 'named_wrapper', policy: 'throw' });
    patchedMethods.add(patched);
    return true;
  }

  // === WEBGL PATCHING ===
  // METHODOLOGY NOTE:
  // WebGL patchMethod is a separate context-level gateway contract.
  // Its current preflight sequence, diag/console logging, and override-log toggles
  // are part of the patch semantics here, not incidental debug noise.
  // Do not remove, reorder, or "normalize" these paths without explicit manual
  // approval and runtime revalidation of this module.

  // ===== WEBGL hook override logging: two toggles (ВКЛ/ВЫКЛ) =====
  // Эти тумблеры влияют ТОЛЬКО на логирование ветки "override".
  // Standard access logging now goes through context:webgl:access in __DEGRADE__.
  // WEBGL_OVERRIDE_CONSOLE_LOG is kept as a legacy toggle name for the auxiliary
  // logger-owned WebGL monitor path; it no longer means public console.*.
  const WEBGL_OVERRIDE_DIAG_LOG    = false; // true=ВКЛ, false=ВЫКЛ (emitContextDiag для override)
  const WEBGL_OVERRIDE_CONSOLE_LOG = false; // true=ВКЛ, false=ВЫКЛ (logger WebGL monitor for override)

  function patchMethod(proto, method, hooks) {
      if (!proto) {
        emitContextDiag('warn', 'context:webgl:preflight:proto_missing', null, {
          stage: 'preflight',
          surface: 'webgl',
          key: method,
          type: 'browser structure missing data'
        });
        emitWebGLMonitor({
          eventType: 'preflight_warn',
          method: method,
          stage: 'preflight',
          message: '[patchMethod] proto is not defined',
          extra: { reason: 'proto_missing', surface: 'webgl' }
        });
        return false;
      }
      if (!hooks?.length) {
        emitContextDiag('warn', 'context:webgl:preflight:hooks_missing', null, {
          stage: 'preflight',
          surface: 'webgl',
          key: method,
          type: 'pipeline missing data'
        });
        emitWebGLMonitor({
          eventType: 'preflight_warn',
          method: method,
          stage: 'preflight',
          message: '[patchMethod] no hooks',
          extra: { reason: 'hooks_missing', surface: 'webgl' }
        });
        return false;
      }
      const isWebGLProto =
        (typeof WebGLRenderingContext !== 'undefined' && proto === WebGLRenderingContext.prototype) ||
        (typeof WebGL2RenderingContext !== 'undefined' && proto === WebGL2RenderingContext.prototype);
      if (!isWebGLProto) {
        emitContextDiag('warn', 'context:webgl:preflight:proto_rejected', null, {
          stage: 'preflight',
          surface: 'webgl',
          key: method,
          type: 'browser structure missing data'
        });
        emitWebGLMonitor({
          eventType: 'preflight_warn',
          method: method,
          stage: 'preflight',
          message: '[patchMethod] non-WebGL proto rejected',
          extra: { reason: 'proto_rejected', surface: 'webgl' }
        });
        return false;
      }

      const preflight = corePreflight(proto, method, 'method', 'context:webgl:patchMethod', {
        wrapLayer: 'named_wrapper',
        policy: 'throw'
      });
      const desc = preflight.desc || Object.getOwnPropertyDescriptor(proto, method);
      if (!desc || typeof desc.value !== 'function') {
        throw new TypeError(`[patchMethod] not a function: ${method}`);
      }
      if (patchedMethods.has(desc.value)) {
        emitContextDiag('info', 'context:webgl:apply:already_patched', null, {
          stage: 'apply',
          surface: 'webgl',
          key: method,
          type: 'pipeline missing data'
        });
        emitWebGLMonitor({
          eventType: 'apply_info',
          method: method,
          stage: 'apply',
          message: '[patchMethod] already patched',
          extra: { reason: 'already_patched', surface: 'webgl' }
        });
        return false;
      }

      const orig = resolveKeptNative(proto, method) || desc.value;
      const guard = (typeof WeakSet === 'function') ? new WeakSet() : null;
      const hookMode = (hooks && (typeof hooks === 'object' || typeof hooks === 'function')) ? hooks.mode : undefined;
      const isPostOrigOnceMode = hookMode === HOOK_MODE_POST_ORIG_ONCE;
      const forbidOrigCall = function forbidOrigCall() { throw new TypeError(); };

      function invoke(self, argsLike) {
          const isObj = (self !== null) && (typeof self === 'object' || typeof self === 'function');
          const args = Array.isArray(argsLike) ? argsLike : Array.prototype.slice.call(argsLike);

          if (guard && isObj) {
              if (guard.has(self)) return orig.apply(self, args);
              guard.add(self);
          }

          try {
              if (typeof guardInstance === "function" && !guardInstance(proto, self))
                  return orig.apply(self, args);

              if (isPostOrigOnceMode) {
                  const out = orig.apply(self, args);
                  for (const hook of hooks) {
                      if (typeof hook !== 'function') continue;
                      try {
                          hook.apply(self, [forbidOrigCall, ...args, out]);
                      } catch (e) {
                          emitContextDiag('error', 'context:webgl:hook:post_failed', e, {
                            stage: 'hook',
                            surface: 'webgl',
                            key: method,
                            data: { hook: hook.name || 'anon' }
                          });
                          emitWebGLMonitor({
                            eventType: 'hook_error',
                            method: method,
                            hook: hook.name || 'anon',
                            stage: 'hook',
                            message: '[patchMethod] hook error',
                            args: args,
                            result: out,
                            error: e,
                            extra: { mode: 'post_orig_once', surface: 'webgl' }
                          });
                          throw e;
                      }
                  }
                  emitWebGLAccess(method, args, out, {
                    source: 'native_post_orig_once'
                  });
                  return out;
              }

              let patched = args;
              for (const hook of hooks) {
                  if (typeof hook !== 'function') continue;
                  try {
                      const res = hook.apply(self, [orig, ...patched]);

                      // override logging (TOGGLED)
                      if (res !== undefined && !Array.isArray(res)) {
                          emitWebGLAccess(method, patched, res, {
                            source: 'override',
                            hook: hook.name || 'anon'
                          });
                          const webglLoggerGate =
                            !(__loggerRoot && __loggerRoot._logConfig && __loggerRoot._logConfig.WEBGLlogger === false);

                          if ((__loggerRoot && __loggerRoot.__DEBUG__) && webglLoggerGate) {
                              if (WEBGL_OVERRIDE_DIAG_LOG) {
                                emitContextDiag('debug', 'context:webgl:hook:override', null, {
                                  stage: 'hook',
                                  surface: 'webgl',
                                  key: method,
                                  data: { hook: hook.name || 'anon' }
                                });
                              }
                              if (WEBGL_OVERRIDE_CONSOLE_LOG) {
                                emitWebGLMonitor({
                                  eventType: 'override',
                                  method: method,
                                  hook: hook.name || 'anon',
                                  stage: 'hook',
                                  message: '[patchMethod override]',
                                  args: patched,
                                  result: res,
                                  extra: { surface: 'webgl' }
                                });
                              }
                          }

                          return res; // result substitution
                      }

                      // argument substitution
                      if (Array.isArray(res)) {
                          patched = res;
                          continue;
                      }

                   } catch (e) {
                        emitContextDiag('error', 'context:webgl:hook:failed', e, {
                          stage: 'hook',
                          surface: 'webgl',
                          key: method,
                          data: { hook: hook.name || 'anon' }
                        });
                        emitWebGLMonitor({
                          eventType: 'hook_error',
                          method: method,
                          hook: hook.name || 'anon',
                          stage: 'hook',
                          message: '[patchMethod] hook error',
                          args: patched,
                          error: e,
                          extra: { mode: 'override_or_args', surface: 'webgl' }
                        });
                        throw e;
                   }
               }
              const out = orig.apply(self, patched);
              emitWebGLAccess(method, patched, out, {
                source: 'native'
              });
              return out;

          } finally {
              if (guard && isObj) guard.delete(self);
          }
      }

      const wrappedRaw = (function(){
          switch (orig.length) {
              case 0: return ({ [method]() { return invoke(this, arguments); } })[method];
              case 1: return ({ [method](a0) { return invoke(this, arguments); } })[method];
              case 2: return ({ [method](a0, a1) { return invoke(this, arguments); } })[method];
              case 7: return ({ [method](a0, a1, a2, a3, a4, a5, a6) { return invoke(this, arguments); } })[method];
              default: return ({ [method](...a) { return invoke(this, a); } })[method];
          }
      })();

      Object.defineProperty(wrappedRaw, '__coreBridgeTarget__', {
        value: orig,
        writable: true,
        configurable: true,
        enumerable: false
      });
      const wrapped = markAsNative(wrappedRaw, method);
      if ((__loggerRoot && __loggerRoot.__DEBUG__) && (method === 'getParameter' || method === 'readPixels')) {
        emitContextDiag('info', 'context:webgl:wrapLayer:selected', null, {
          stage: 'apply',
          surface: 'webgl',
          key: method,
          data: { wrapLayer: 'named_wrapper', wrapperClass: 'synthetic_named' }
        });
      }

      definePatchedMethod(proto, method, wrapped, { wrapLayer: 'named_wrapper', policy: 'throw' });
      patchedMethods.add(wrapped);

      return true;
    }

  function chainAsync(proto, method, hooksGetter){
    if (!proto || typeof proto[method] !== 'function') return false;
    const current = proto[method];
    if (patchedMethods.has(current)) return false;
    const orig = resolveKeptNative(proto, method) || current;

    const getHooksList = () => (typeof hooksGetter === 'function') ? hooksGetter() : [];
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
          // soft-fail: keep native contract, but not silent-swallow
          try {
            emitContextDiag('error', 'context:chain:hook:post_failed', e, {
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
              message: '[chainAsync][hook_failed]',
              error: e,
              extra: { mode: 'chainAsync' }
            });
          }
          // keep b unchanged
        }
      }
      return b;
    };

     if (method === 'toBlob') {
       const wrapped = ({ toBlob(callback, type, quality) {
         const self = this;
         const args = arguments;
         if (typeof callback === 'function') {
          const done = (blob) => {
            let out;
            try {
              out = applyHooksAsync(self, blob, args);
            } catch (e) {
              emitContextDiag('warn', 'context:chainAsync:hook_failed', e, {
                stage: 'hook',
                key: method
              });
              callback(blob);
              return;
            }

            if (out && typeof out.then === 'function') {
              out.then(
                (b2) => { callback(b2); },
                (e)  => {
                  emitContextDiag('warn', 'context:chainAsync:hook_failed', e, {
                    stage: 'hook',
                    key: method
                  });
                  callback(blob);
                }
              );
              return;
            }

            callback(out);
          };

          try {
            return Reflect.apply(orig, self, [done].concat(Array.prototype.slice.call(args, 1)));
          } catch (e) {
            throw e;
          }
         }
         // 2026-02-11: keep native contract - toBlob without callback returns undefined.
         return Reflect.apply(orig, self, args);
       } }).toBlob;
       Object.defineProperty(wrapped, '__coreBridgeTarget__', {
         value: orig,
         writable: true,
         configurable: true,
         enumerable: false
       });
       const patched = markAsNative(wrapped, method);
       definePatchedMethod(proto, method, patched, { wrapLayer: 'named_wrapper', policy: 'throw' });
       patchedMethods.add(patched);
       return true;
     }
 
     if (method === 'convertToBlob') {
       const wrapped = ({ convertToBlob(options) {
         const self = this;
         const args = arguments;
        let p;
        try {
          p = Reflect.apply(orig, self, args);
        } catch (e) {
          throw e;
        }

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
              (b2) => { return b2; },
              (e)  => { throw e; }
            );
          },
          (e) => { throw e; }
        );
      } }).convertToBlob;
       Object.defineProperty(wrapped, '__coreBridgeTarget__', {
         value: orig,
         writable: true,
         configurable: true,
         enumerable: false
       });
       const patched = markAsNative(wrapped, method);
       definePatchedMethod(proto, method, patched, { wrapLayer: 'named_wrapper', policy: 'throw' });
       patchedMethods.add(patched);
       return true;
     }

    const wrapped = ({ [method]() {
      const self = this;
      const args = arguments;
      const p = Reflect.apply(orig, self, args);
      if (!(p && typeof p.then === 'function')) return p;
      const hooks = getHooksList();
      if (!(hooks && hooks.length)) return p;
      return p.then((blob) => {
        return Promise.resolve(applyHooksAsync(self, blob, args))
          .catch((e) => {
            try {
              emitContextDiag('error', 'context:chain:hook:post_failed', e, {
                key: method,
                stage: 'hook',
                data: { hook: 'applyHooksAsync' }
              });
            } catch (_e) {}
            return blob; // fallback
          });
      });
    } })[method];
    Object.defineProperty(wrapped, '__coreBridgeTarget__', {
      value: orig,
      writable: true,
      configurable: true,
      enumerable: false
    });
    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched, { wrapLayer: 'named_wrapper', policy: 'throw' });
    patchedMethods.add(patched);
    return true;
  }

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
            for (const hook of getHooksList()) {
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
                  (b2) => { callback(b2); },
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
                (b2) => { return b2; },
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

  function installIssuedWebGLMethods(ctx) {
    if (!ctx || (typeof ctx !== 'object' && typeof ctx !== 'function')) return 0;
    if (issuedWebGLPatchedContexts && issuedWebGLPatchedContexts.has(ctx)) return 0;
    const proto =
      (typeof WebGLRenderingContext !== 'undefined' && ctx instanceof WebGLRenderingContext)
        ? WebGLRenderingContext.prototype
        : ((typeof WebGL2RenderingContext !== 'undefined' && ctx instanceof WebGL2RenderingContext)
            ? WebGL2RenderingContext.prototype
            : null);
    if (!proto) return 0;

    const methodPlan = [
      ['getParameter', C.webglGetParameterHooks],
      ['getSupportedExtensions', C.webglGetSupportedExtensionsHooks],
      ['getExtension', C.webglGetExtensionHooks],
      ['readPixels', C.webglReadPixelsHooks]
    ];
    let applied = 0;

    for (const [method, hooks] of methodPlan) {
      if (Object.prototype.hasOwnProperty.call(ctx, method)) continue;
      const orig = resolveKeptNative(proto, method) || proto[method];
      if (typeof orig !== 'function') continue;
      const guard = (typeof WeakSet === 'function') ? new WeakSet() : null;
      const hookMode = (hooks && (typeof hooks === 'object' || typeof hooks === 'function')) ? hooks.mode : undefined;
      const isPostOrigOnceMode = hookMode === HOOK_MODE_POST_ORIG_ONCE;
      const forbidOrigCall = function forbidOrigCall() { throw new TypeError(); };

      function invoke(self, argsLike) {
        const isObj = (self !== null) && (typeof self === 'object' || typeof self === 'function');
        const args = Array.isArray(argsLike) ? argsLike : Array.prototype.slice.call(argsLike);

        if (guard && isObj) {
          if (guard.has(self)) return orig.apply(self, args);
          guard.add(self);
        }

        try {
          if (typeof guardInstance === "function" && !guardInstance(proto, self)) {
            return orig.apply(self, args);
          }

          if (isPostOrigOnceMode) {
            const out = orig.apply(self, args);
            for (const hook of hooks) {
              if (typeof hook !== 'function') continue;
              try {
                hook.apply(self, [forbidOrigCall, ...args, out]);
              } catch (e) {
                emitContextDiag('error', 'context:issued_webgl:hook:post_failed', e, {
                  stage: 'hook',
                  surface: 'webgl',
                  key: method,
                  data: { hook: hook.name || 'anon' }
                });
                throw e;
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
              if (res !== undefined && !Array.isArray(res)) {
                emitWebGLAccess(method, patched, res, {
                  source: 'issued_override',
                  hook: hook.name || 'anon'
                });
                return res;
              }
              if (Array.isArray(res)) {
                patched = res;
              }
            } catch (e) {
              emitContextDiag('error', 'context:issued_webgl:hook:failed', e, {
                stage: 'hook',
                surface: 'webgl',
                key: method,
                data: { hook: hook.name || 'anon' }
              });
              throw e;
            }
          }
          const out = orig.apply(self, patched);
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

    const dispatch = function(boundOwner, contextId, contextAttributes) {
      const args = Array.prototype.slice.call(arguments, 1);
      const type = args[0];
      const rest = args.length > 1 ? Array.prototype.slice.call(args, 1) : [];
      const res = Reflect.apply(orig, boundOwner, args);
      let ctx = res;

      try {
        if (ctx) {
          installIssuedSerializationMethods(boundOwner);
        }
        if (type === '2d' && ctx) {
          ctx = createSafeCtxProxy(ctx);
          for (const hook of (ctx2dHooks || [])) {
            try { ctx = hook.call(boundOwner, ctx, type, ...rest) || ctx; } catch (e) {
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
          for (const hook of (webglHooks || [])) {
            try { hook.call(boundOwner, ctx, type, ...rest); } catch (e) {
              emitContextDiag('warn', 'context:getContext:webgl_hook_failed', e, {
                stage: 'hook',
                key: 'getContext',
                data: { hook: hook && (hook.name || null), type: type || null }
              });
            }
          }
        }
        for (const hook of (htmlHooks || [])) {
          try { hook.call(boundOwner, ctx, type, ...rest); } catch (e) {
            emitContextDiag('warn', 'context:getContext:html_hook_failed', e, {
              stage: 'hook',
              key: 'getContext',
              data: { hook: hook && (hook.name || null), type: type || null }
            });
          }
        }
        registerIssuedContext(ctx, type, boundOwner);
      } catch (e) {
        emitContextDiag('error', 'context:getContext:chain_failed', e, {
          stage: 'hook',
          key: 'getContext',
          data: { type: type || null }
        });
        registerIssuedContext(ctx, type, boundOwner);
      }

      return ctx;
    };

    const wrappedGetContext = dispatch.bind(null, owner);
    Object.defineProperty(wrappedGetContext, '__coreBridgeTarget__', {
      value: orig,
      writable: true,
      configurable: true,
      enumerable: false
    });
    const wrapped = markAsNative(wrappedGetContext, 'getContext');
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
      Object.defineProperty(wrappedCreateElementRaw, '__coreBridgeTarget__', {
        value: createElementOrig,
        writable: true,
        configurable: true,
        enumerable: false
      });
      const wrappedCreateElement = markAsNative(wrappedCreateElementRaw, 'createElement');
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
      Object.defineProperty(wrappedCreateElementNSRaw, '__coreBridgeTarget__', {
        value: createElementNSOrig,
        writable: true,
        configurable: true,
        enumerable: false
      });
      const wrappedCreateElementNS = markAsNative(wrappedCreateElementNSRaw, 'createElementNS');
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
    const WrappedOffscreenCanvas = markAsNative(WrappedOffscreenCanvasRaw, 'OffscreenCanvas');

    Object.setPrototypeOf(WrappedOffscreenCanvas, NativeOffscreenCanvas);
    Object.defineProperty(WrappedOffscreenCanvas, 'prototype', {
      value: NativeOffscreenCanvas.prototype,
      writable: false,
      configurable: false,
      enumerable: false
    });
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

      const getFontStr = (self) => {
      try {
        const f = self && typeof self.font === 'string' && self.font.trim() ? self.font : DEFAULT_CTX2D_FONT;
        return f;
      } catch (e) {
        emitContextDiag('warn', 'context:ctx2d:runtime:font_read_failed', e, {
          stage: 'runtime',
          key: 'font',
          type: 'browser structure missing data'
        });
        return DEFAULT_CTX2D_FONT;
      }
    };

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

      if (H && typeof H.applyFillTextHook === 'function') {
        try {
          const callOrig = (...a) => Reflect.apply(target, thisArg, a);
          return H.applyFillTextHook.call(thisArg, callOrig, text, x, y, ...rest);
        } catch (e) {
          emitContextDiag('warn', 'context:ctx2d:hook:fillText_failed', e, {
            stage: 'hook',
            key: 'fillText',
            type: 'browser structure missing data',
            data: { outcome: 'throw', reason: 'hook_apply_failed' }
          });
          throw e;
        }
      }

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

      if (H && typeof H.applyStrokeTextHook === 'function') {
        try {
          const callOrig = (...a) => Reflect.apply(target, thisArg, a);
          return H.applyStrokeTextHook.call(thisArg, callOrig, text, x, y, ...rest);
        } catch (e) {
          emitContextDiag('warn', 'context:ctx2d:hook:strokeText_failed', e, {
            stage: 'hook',
            key: 'strokeText',
            type: 'browser structure missing data',
            data: { outcome: 'throw', reason: 'hook_apply_failed' }
          });
          throw e;
        }
      }

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

  // === 5. getContext interception for HTMLCanvasElement/OffscreenCanvas ===
  function chainGetContext(proto, method, htmlHooks, ctx2dHooks, webglHooks){
    if (!proto || typeof proto[method] !== 'function') return false;
    captureKeepNativeRefs();
    const current = proto[method];
    if (patchedMethods.has(current)) return false;
    const orig = resolveKeptNative(proto, method) || current;

    const wrapped = ({ getContext(contextId, contextAttributes) {
      const args = arguments;
      const type = args[0];
      const rest = Array.prototype.slice.call(args, 1);
      const res = Reflect.apply(orig, this, args);
      let ctx = res;

      try {
        if (ctx) {
          installIssuedSerializationMethods(this);
        }
        if (type === '2d' && ctx){
          ctx = createSafeCtxProxy(ctx);
          // call hight level hooks
          for (const hook of (ctx2dHooks || [])){
            try { ctx = hook.call(this, ctx, type, ...rest) || ctx; } catch (e) {
              emitContextDiag('warn', 'context:getContext:ctx2d_hook_failed', e, {
                stage: 'hook',
                key: 'getContext',
                data: { hook: hook && (hook.name || null), type: type || null }
              });
            }
          }
        }
        if (/^webgl/.test(String(type))){
          if (ctx) {
            installIssuedWebGLMethods(ctx);
          }
          for (const hook of (webglHooks || [])){
            try { hook.call(this, ctx, type, ...rest); } catch (e) {
              emitContextDiag('warn', 'context:getContext:webgl_hook_failed', e, {
                stage: 'hook',
                key: 'getContext',
                data: { hook: hook && (hook.name || null), type: type || null }
              });
            }
          }
        }
        for (const hook of (htmlHooks || [])){
          try { hook.call(this, ctx, type, ...rest); } catch (e) {
            emitContextDiag('warn', 'context:getContext:html_hook_failed', e, {
              stage: 'hook',
              key: 'getContext',
              data: { hook: hook && (hook.name || null), type: type || null }
            });
          }
        }
        registerIssuedContext(ctx, type, this);
      } catch (e) {
        emitContextDiag('error', 'context:getContext:chain_failed', e, {
          stage: 'hook',
          key: 'getContext',
          data: { type: type || null }
        });
        registerIssuedContext(ctx, type, this);
      }

      return ctx;
    } }).getContext;

    Object.defineProperty(wrapped, '__coreBridgeTarget__', {
      value: orig,
      writable: true,
      configurable: true,
      enumerable: false
    });
    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched, { wrapLayer: 'named_wrapper', policy: 'throw' });
    patchedMethods.add(patched);
    return true;
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
    if (C && C.__DOM_CANVAS__) {
      total += 3;
      applied += installIssuedSerializationMethods(C.__DOM_CANVAS__);
      applied += installIssuedGetContextMethod(C.__DOM_CANVAS__, this.htmlCanvasGetContextHooks, this.ctx2DGetContextHooks, this.webglGetContextHooks);
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
      if (C && C.__OFFSCREEN_CANVAS__) {
        total += 2;
        applied += installIssuedSerializationMethods(C.__OFFSCREEN_CANVAS__);
        applied += installIssuedGetContextMethod(C.__OFFSCREEN_CANVAS__, Ctx.offscreenGetContextHooks, Ctx.ctx2DGetContextHooks, Ctx.webglGetContextHooks);
      }
      state.offscreen = true;
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
      state.webgl = true;
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
      // 2026-03-07: 'patch2DNoise','addCanvasNoise' disabled (non-wired runtime hook, kept out of required list).
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
