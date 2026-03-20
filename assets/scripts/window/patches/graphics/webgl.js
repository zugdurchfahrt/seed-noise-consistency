const WebglPatchModule = function WebglPatchModule(window) {
    const C = window.CanvasPatchContext;
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self       !== 'undefined' && self)
          || (typeof window     !== 'undefined' && window)
          || (typeof global     !== 'undefined' && global)
          || {};
    const __webglTypePipeline = 'pipeline missing data';
    const __webglTypeBrowser = 'browser structure missing data';
    const __loggerRoot = (window && window.CanvasPatchContext && window.CanvasPatchContext.__logger && typeof window.CanvasPatchContext.__logger === 'object')
      ? window.CanvasPatchContext.__logger
      : null;
    const __webglDegrade = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
    const __webglDegradeDiag = (__webglDegrade && typeof __webglDegrade.diag === 'function')
      ? __webglDegrade.diag.bind(__webglDegrade)
      : null;
    function __emit(level, code, ctx, err) {
      try {
        if (__webglDegradeDiag) return __webglDegradeDiag(level, code, ctx, err || null);
        if (typeof __webglDegrade === 'function') {
          const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
          return __webglDegrade(code, err || null, Object.assign({}, safeCtx, { level: level || 'info' }));
        }
      } catch (emitErr) {
        return undefined;
      }
      return undefined;
    }
    function __webglDiag(level, code, extra, err) {
      const x = (extra && typeof extra === 'object') ? extra : {};
      return __emit(level, code, {
        module: 'webgl',
        diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'webgl',
        surface: 'webgl',
        key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
        stage: x.stage,
        message: x.message,
        data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
        type: x.type
      }, err || null);
    }
    function __webglDiagPipeline(level, code, extra, err) {
      const x0 = (extra && typeof extra === 'object') ? extra : {};
      const x = Object.assign({}, x0);
      if (typeof x.type !== 'string' || !x.type) x.type = __webglTypePipeline;
      if (typeof x.diagTag !== 'string' || !x.diagTag) x.diagTag = 'webgl';
      __webglDiag(level, code, x, err);
    }
    function __webglDiagBrowser(level, code, extra, err) {
      const x0 = (extra && typeof extra === 'object') ? extra : {};
      const x = Object.assign({}, x0);
      if (typeof x.type !== 'string' || !x.type) x.type = __webglTypeBrowser;
      if (typeof x.diagTag !== 'string' || !x.diagTag) x.diagTag = 'webgl';
      __webglDiag(level, code, x, err);
    }

    const __core = window.Core;
    const __flagKey = '__PATCH_WEBGL__';
    let __guardToken = null;
    try {
      if (!__core || typeof __core.guardFlag !== 'function') {
        __webglDiagPipeline('fatal', 'webgl:guard_missing', {
          stage: 'guard',
          key: __flagKey,
          message: 'Core.guardFlag missing',
          data: { outcome: 'throw' }
        }, null);
        throw new Error('Core.guardFlag missing');
      }
      __guardToken = __core.guardFlag(__flagKey, 'webgl');
    } catch (e) {
      __webglDiagPipeline('fatal', 'webgl:guard_failed', {
        stage: 'guard',
        key: __flagKey,
        message: 'guardFlag failed',
        data: { outcome: 'throw' }
      }, e);
      throw e;
    }
    if (!__guardToken) return; // already_patched: Core emits webgl:already_patched

    function releaseEntryGuard(rollbackOk) {
      try {
        if (__core && typeof __core.releaseGuardFlag === 'function') {
          __core.releaseGuardFlag(__flagKey, __guardToken, !!rollbackOk, 'webgl');
        }
      } catch (e) {
        __webglDiagPipeline('warn', 'webgl:guard_release_failed', {
          stage: 'rollback',
          key: __flagKey,
          message: 'releaseGuardFlag failed',
          data: { outcome: 'skip', reason: 'guard_release_failed' }
        }, e);
      }
    }

    try {

    if (!C) {
      __webglDiagPipeline('fatal', 'webgl:canvas_patch_context_missing', {
        stage: 'preflight',
        key: null,
        message: 'CanvasPatchContext missing',
        data: { outcome: 'throw' }
      });
      throw new Error('CanvasPatchContext missing');
    }

    // basic random from the existing seed initialization
    const __stateRoot = (C && C.state && typeof C.state === 'object') ? C.state : null;
    if (!__stateRoot) {
      __webglDiagPipeline('fatal', 'webgl:canvas_patch_state_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state',
        message: 'CanvasPatchContext.state missing',
        data: { outcome: 'throw' }
      });
      throw new Error('CanvasPatchContext.state missing');
    }
    const __envProfileState = (__stateRoot.__ENV_PROFILE__ && typeof __stateRoot.__ENV_PROFILE__ === 'object')
      ? __stateRoot.__ENV_PROFILE__
      : null;
    if (!__envProfileState) {
      __webglDiagPipeline('fatal', 'webgl:env_profile_missing', {
        stage: 'preflight',
        key: 'CanvasPatchContext.state.__ENV_PROFILE__',
        message: 'CanvasPatchContext.state.__ENV_PROFILE__ missing',
        data: { outcome: 'throw' }
      });
      throw new Error('CanvasPatchContext.state.__ENV_PROFILE__ missing');
    }
    const __coreInternal = (__core && __core.__internal && typeof __core.__internal === 'object')
      ? __core.__internal
      : null;
    let __webglRandFn = null;
    function __requireWebglRand() {
      if (typeof __webglRandFn === 'function') return __webglRandFn;
      const __prngState = (__coreInternal && __coreInternal.prng && typeof __coreInternal.prng === 'object')
        ? __coreInternal.prng
        : null;
      if (!__prngState) {
        __webglDiagPipeline('fatal', 'webgl:core_prng_missing', {
          stage: 'runtime',
          key: 'Core.__internal.prng',
          message: 'Core.__internal.prng missing',
          data: { outcome: 'throw' }
        }, null);
        throw new Error('Core.__internal.prng missing');
      }
      const __randSource = (__prngState.rand && typeof __prngState.rand.use === 'function')
        ? __prngState.rand
        : null;
      const __rand = (__randSource && typeof __randSource.use === 'function') ? __randSource.use('webgl') : null;
      if (typeof __rand !== 'function') {
        __webglDiagPipeline('fatal', 'webgl:core_prng_rand_missing', {
          stage: 'runtime',
          key: 'Core.__internal.prng.rand',
          message: 'Core.__internal.prng.rand missing',
          data: { outcome: 'throw' }
        }, null);
        throw new Error('Core.__internal.prng.rand missing');
      }
      __webglRandFn = __rand;
      return __webglRandFn;
    }
    
    // Internal markers: avoid leaving visible properties on WebGL instances/objects
    const __webglInstancePatched__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __webglDebugInfoPatched__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __webglShaderSourcePatchedProtos__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __webglDebugInfoCache__ = (typeof WeakMap === 'function') ? new WeakMap() : null;
    const __WEBGL_DEBUGINFO_CACHE_PROP__ = 'WebGLInstance_DebugInfoCache__';
    if (!__webglInstancePatched__ || !__webglDebugInfoPatched__ || !__webglShaderSourcePatchedProtos__ || !__webglDebugInfoCache__) {
      __webglDiagBrowser('fatal', 'webgl:weak_structures_missing', {
        stage: 'preflight',
        key: null,
        message: 'WeakMap/WeakSet are required',
        data: { outcome: 'throw' }
      });
      throw new Error('WeakMap/WeakSet are required');
    }

    let markNative = null;
    try {
      if (typeof window.__ensureMarkAsNative !== 'function') {
        throw new Error('__ensureMarkAsNative missing');
      }
      const m = window.__ensureMarkAsNative();
      if (typeof m !== 'function') {
        throw new Error('__ensureMarkAsNative returned non-function');
      }
      markNative = m;
    } catch (e) {
      __webglDiagPipeline('fatal', 'webgl:mark_native_missing', {
        stage: 'preflight',
        key: null,
        message: 'markAsNative missing',
        data: { outcome: 'throw' }
      }, e);
      throw e;
    }

    
    function noiseAt(x, y, w, h) {
      const mix = (((x*73856093) ^ (y*19349663) ^ (w*83492791) ^ (h*2654435761)) >>> 0);
      const r = __requireWebglRand()()
      return ((r - 0.5) * 3) | 0;       // integral shift [-1..+1]
    }

    // 1) VENDOR/RENDERER replacement
  function webglGetParameterMask(orig, pname, ...args) {
    let dbg;
    if (__webglDebugInfoCache__) {
      if (__webglDebugInfoCache__.has(this)) dbg = __webglDebugInfoCache__.get(this);
    } else if (this && Object.prototype.hasOwnProperty.call(this, __WEBGL_DEBUGINFO_CACHE_PROP__)) {
      dbg = this[__WEBGL_DEBUGINFO_CACHE_PROP__];
    }
    if (dbg === undefined) {
      try { dbg = this.getExtension('WEBGL_debug_renderer_info'); } catch(e){
        dbg = null;
        __webglDiagBrowser('warn', 'webgl:getExtension:debug_renderer_info_throw', {
          stage: 'runtime',
          key: 'getExtension',
          message: 'debug renderer info getExtension threw'
        }, e);
      }
      if (__webglDebugInfoCache__) {
        __webglDebugInfoCache__.set(this, dbg);
      } else if (this) {
        try {
          Object.defineProperty(this, __WEBGL_DEBUGINFO_CACHE_PROP__, {
            value: dbg,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          try {
            this[__WEBGL_DEBUGINFO_CACHE_PROP__] = dbg;
          } catch (e2) {
            __webglDiagBrowser('warn', 'webgl:debug_info_cache_set_failed', {
              stage: 'runtime',
              key: 'getExtension',
              message: 'debug info cache set failed'
            }, e2);
          }
          __webglDiagBrowser('warn', 'webgl:debug_info_cache_define_failed', {
            stage: 'runtime',
            key: 'getExtension',
            message: 'debug info cache define failed'
          }, e);
        }
      }
    }
    if (dbg) {
        if (pname === dbg.UNMASKED_VENDOR_WEBGL)   return __envProfileState.webglUnmaskedVendor;
        if (pname === dbg.UNMASKED_RENDERER_WEBGL) return __envProfileState.webglUnmaskedRenderer;
    }
    if (pname === this.VENDOR   || pname === 0x1F00) return __envProfileState.webglVendor;
    if (pname === this.RENDERER || pname === 0x1F01) return __envProfileState.webglRenderer;
    //others - do not touch
    return;  // undefined → The original will work out
    }
  // 2) Хук «whitelist-фильтра»
  function webglWhitelistParameterHook(orig, pname, ...args) {
    const __webglState = (__stateRoot.__WEBGL_STATE__ && typeof __stateRoot.__WEBGL_STATE__ === 'object')
      ? __stateRoot.__WEBGL_STATE__
      : null;
    const wl = Array.isArray(__webglState && __webglState.paramWhitelist)
      ? __webglState.paramWhitelist
      : [];
    if (wl.length === 0 || wl.includes(pname)) {
      return; // undefined → pass-through to orig.apply(this, args)
    }
    return; // undefined -> pass-through to orig.apply(this, args)
  }
    // === 2. getSupportedExtensions ===
  function webglGetSupportedExtensionsPatch(orig, ...args) {
    const __webglState = (__stateRoot.__WEBGL_STATE__ && typeof __stateRoot.__WEBGL_STATE__ === 'object')
      ? __stateRoot.__WEBGL_STATE__
      : null;
    const whitelist = Array.isArray(__webglState && __webglState.extensionsWhitelist)
      ? __webglState.extensionsWhitelist : [];
    if (whitelist.length === 0) {
      return; // undefined -> native pass-through in patchMethod
    }

    const res = Reflect.apply(orig, this, args);
    if (!Array.isArray(res)) return res;

    return res.filter(ext => whitelist.includes(ext));
  }

  function webglGetExtensionPatch(orig, name, ...rest) {
    const __webglState = (__stateRoot.__WEBGL_STATE__ && typeof __stateRoot.__WEBGL_STATE__ === 'object')
      ? __stateRoot.__WEBGL_STATE__
      : null;
    const whitelist = Array.isArray(__webglState && __webglState.extensionsWhitelist)
      ? __webglState.extensionsWhitelist : [];
    if (whitelist.length === 0) {
      return; // undefined -> native pass-through in patchMethod
    }
    if (!whitelist.includes(name)) return null;
    const res = Reflect.apply(orig, this, [name].concat(rest));
    //  WEBGL_debug_renderer_info
    if (name === 'WEBGL_debug_renderer_info' &&
      res && typeof res === 'object' &&
      !((__webglDebugInfoPatched__ && __webglDebugInfoPatched__.has(res)) || res.WebGLInstance_DebugInfoPatched__)) {

      if (typeof res.getParameter === 'function') {
        const origGetParameter = res.getParameter;
        // Hybrid routing: normal callable surface stays on named-wrapper path
        // (markAsNative), without forcing Proxy-based wrapping.
        const wrappedGetParameter = ({ getParameter(pname) {
          if (pname === this.UNMASKED_VENDOR_WEBGL)
            return __envProfileState.webglUnmaskedVendor;
          if (pname === this.UNMASKED_RENDERER_WEBGL)
            return __envProfileState.webglUnmaskedRenderer;
          return Reflect.apply(origGetParameter, this, [pname]);
        }}).getParameter;

        const wrappedGetParameterNative = markNative(wrappedGetParameter, 'getParameter');
        res.getParameter = wrappedGetParameterNative;
      }
      if (__webglDebugInfoPatched__) {
        __webglDebugInfoPatched__.add(res);
      } else {
        Object.defineProperty(res, 'WebGLInstance_DebugInfoPatched__', {
          value: true,
          writable: true,
          configurable: true,
          enumerable: false
        });
      }
    }
    if (name === 'WEBGL_debug_renderer_info') {
      if (__webglDebugInfoCache__) {
        __webglDebugInfoCache__.set(this, res || null);
      } else if (this) {
        try {
          Object.defineProperty(this, __WEBGL_DEBUGINFO_CACHE_PROP__, {
            value: res || null,
            writable: true,
            configurable: true,
            enumerable: false
          });
        } catch (e) {
          try {
            this[__WEBGL_DEBUGINFO_CACHE_PROP__] = res || null;
          } catch (e2) {
            __webglDiagBrowser('warn', 'webgl:debug_info_cache_set_failed', {
              stage: 'runtime',
              key: 'getExtension',
              message: 'debug info cache set failed'
            }, e2);
          }
          __webglDiagBrowser('warn', 'webgl:debug_info_cache_define_failed', {
            stage: 'runtime',
            key: 'getExtension',
            message: 'debug info cache define failed'
          }, e);
        }
      }
    }
    return res;
  }
  // === 4.context patch (instance mark only; prototype patching is owned by context.js) ===
  // If already patched or empty, immediately return
  function webglGetContextPatch(res, kind, ...args) {
    if (!res || ((__webglInstancePatched__ && __webglInstancePatched__.has(res)) || res.WebGLInstance_GPUPatched__)) return res;
    if (kind && ['webgl', 'experimental-webgl', 'webgl2'].includes(kind)) {
      if (__webglInstancePatched__) {
        __webglInstancePatched__.add(res);
      } else {
        Object.defineProperty(res, 'WebGLInstance_GPUPatched__', {
          value: true,
          writable: true,
          configurable: true,
          enumerable: false
        });
      }
    }
    return res;
  }
  // === 5) anti‑FP hooks  ===
  // readPixels is void and writes into the provided buffer.
  // Its noise hook must run post-orig; the executor mode is set here (not globally).
  const hookModeStore = (C.__hookModeStore && typeof C.__hookModeStore === 'object') ? C.__hookModeStore : {};
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
  const readPixelsHookMode = hookModeStore.post_orig_once;
  if (!Array.isArray(C.webglReadPixelsHooks)) {
    C.webglReadPixelsHooks = [];
  }
  Object.defineProperty(C.webglReadPixelsHooks, 'mode', {
    value: readPixelsHookMode,
    writable: true,
    configurable: true,
    enumerable: false
  });

  function webglReadPixelsHook(orig, x, y, w, h, format, type, buffer) {
    // orig already executed by patchMethod (post-call path for readPixels)
    if (!buffer) return;
    for (let row=0, i=0; row<h; row++){
      for (let col=0; col<w; col++, i+=4){
        const v = noiseAt(col,row,w,h);
        buffer[i]   += v;
        buffer[i+1] += v;
        buffer[i+2] += v;
      }
    }
    return;
  }

  function webglGetShaderPrecisionFormatHook(orig, shaderType, precisionType) {
    const res = Reflect.apply(orig, this, [shaderType, precisionType]);
    if (!res) return res;
    const v = (__requireWebglRand()() - 0.5);
    const rangeMin = Math.round(res.rangeMin + v);
    const rangeMax = Math.round(res.rangeMax + v);
    const precision = Math.round(res.precision + v);
    const proto = Object.getPrototypeOf(res);
    const dMin = Object.getOwnPropertyDescriptor(res, 'rangeMin');
    const dMax = Object.getOwnPropertyDescriptor(res, 'rangeMax');
    const dPrec = Object.getOwnPropertyDescriptor(res, 'precision');
    if (dMin && dMax && dPrec && ('value' in dMin) && ('value' in dMax) && ('value' in dPrec)) {
      const out = Object.create(proto);
      Object.defineProperty(out, 'rangeMin', Object.assign({}, dMin, { value: rangeMin }));
      Object.defineProperty(out, 'rangeMax', Object.assign({}, dMax, { value: rangeMax }));
      Object.defineProperty(out, 'precision', Object.assign({}, dPrec, { value: precision }));
      return out;
    }
    // If we cannot preserve descriptors/prototype safely, keep native result.
    return res;
  }
      // Unified precision policy by default: vertex="mediump", fragment="highp"
      // You can redefine through window._precisionPolicy = { vertex, fragment, mode }
      // mode: "float-only" (только precision-строки) | "smart"(by default: precision-strings + safe fallback \bhighp\b)
  function webglShaderSourceHook(orig, shader, src) {
    if (typeof src !== 'string') return; // undefined → patchMethod Calls orig(shader, src)
    try {
      const pol   = (typeof window !== 'undefined' && window._precisionPolicy) || {};
      const vPol  = String(pol.vertex   || 'mediump').toLowerCase();
      const fPol  = String(pol.fragment || 'highp').toLowerCase();
      const mode  = String(pol.mode     || 'smart').toLowerCase();

      const type = this.getShaderParameter(shader, this.SHADER_TYPE);
      //Helper for replacement precision-strings (+ при "smart" — общий fallback)
      const applyPolicy = (source, targetPrec) => {
        let out = source
          .replace(/\bprecision\s+highp\s+float\b/g, `precision ${targetPrec} float`)
          .replace(/\bprecision\s+highp\s+int\b/g,   `precision ${targetPrec} int`);
        if (mode !== 'float-only') {
          // safe fallback for old shadeers, where it 'highp' could be found
          out = out.replace(/\bhighp\b/g, targetPrec);
        }
        return out;
      };

      if (type === this.VERTEX_SHADER) {
        // We only degrade VERTEX (anti-FP of geometries), We do not touch the palette
        const downgraded = applyPolicy(src, vPol);
        return [shader, downgraded];
      }

      if (type === this.FRAGMENT_SHADER) {
        //By default, we do not touch the fragment, so as not to get banding/small palette
        if (fPol !== 'highp') {
          const adjusted = applyPolicy(src, fPol);
          return [shader, adjusted];
        }
        // otherwise - unchanged
        return; // undefined → pass-through
      }

      // Other types - unchanged
      return;
 
    } catch (e) {
      __webglDiagPipeline('warn', 'webgl:shaderSourceHook:error', {
        stage: 'hook',
        key: 'shaderSource',
        message: 'shaderSource hook failed'
      }, e);
      // for any malfunction case - return the original without modifications
      return;
    }
  }

  function webglGetUniformHook(orig, program, location) {
    const res = Reflect.apply(orig, this, [program, location]);
    // WebGL contract: null/undefined are semantically valid in many paths,
    // and legal zero must not be treated as missing.
    if (res == null) return res;
    if (typeof res === 'number' && (!Number.isFinite(res) || Number.isNaN(res) || res === 0)) {
      return res;
    }
    if (typeof res === 'number') {
      return res + (__requireWebglRand()() - 0.5) * 1e-4;
    }
    return res;
  }

  // === 6.export hooks to context.js ===
  const __hasOwnWebglHooks = Object.prototype.hasOwnProperty.call(window, 'webglHooks');
  const __currentWebglHooks = __hasOwnWebglHooks ? window.webglHooks : null;
  const __webglHooksEntry = (__currentWebglHooks && (typeof __currentWebglHooks === 'object' || typeof __currentWebglHooks === 'function'))
    ? __currentWebglHooks
    : Object.create(null);
  __webglHooksEntry.webglGetParameterMask = webglGetParameterMask;
  __webglHooksEntry.webglWhitelistParameterHook = webglWhitelistParameterHook;
  __webglHooksEntry.webglGetSupportedExtensionsPatch = webglGetSupportedExtensionsPatch;
  __webglHooksEntry.webglGetExtensionPatch = webglGetExtensionPatch;
  __webglHooksEntry.webglGetContextPatch = webglGetContextPatch;
  __webglHooksEntry.webglReadPixelsHook = webglReadPixelsHook;
  __webglHooksEntry.webglGetShaderPrecisionFormatHook = webglGetShaderPrecisionFormatHook;
  __webglHooksEntry.webglShaderSourceHook = webglShaderSourceHook;
  __webglHooksEntry.webglGetUniformHook = webglGetUniformHook;
  try {
    if (__hasOwnWebglHooks) {
      const __currentDesc = Object.getOwnPropertyDescriptor(window, 'webglHooks');
      const __hasUsableCurrentHooks = !!(__currentWebglHooks && (typeof __currentWebglHooks === 'object' || typeof __currentWebglHooks === 'function'));
      if (!__hasUsableCurrentHooks && (!__currentDesc || __currentDesc.configurable)) {
        Object.defineProperty(window, 'webglHooks', {
          value: __webglHooksEntry,
          writable: true,
          configurable: true,
          enumerable: false
        });
      } else if (__currentDesc && __currentDesc.configurable && __currentDesc.enumerable) {
        Object.defineProperty(window, 'webglHooks', {
          value: __webglHooksEntry,
          writable: true,
          configurable: true,
          enumerable: false
        });
      } else if (__currentDesc && !__currentDesc.configurable && __currentDesc.enumerable) {
        __webglDiagBrowser('warn', 'webgl:webglHooks:hide_skip_non_configurable', {
          stage: 'apply',
          key: 'webglHooks',
          message: 'webglHooks hide-after-apply skipped for non-configurable descriptor'
        }, null);
      }
    } else {
      Object.defineProperty(window, 'webglHooks', {
        value: __webglHooksEntry,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
  } catch (e) {
    __webglDiagBrowser('error', 'webgl:webglHooks:define_failed', {
      stage: 'apply',
      key: 'webglHooks',
      message: 'webglHooks define failed'
    }, e);
    window.webglHooks = __webglHooksEntry;
    const h = window.webglHooks;
    if (!h || typeof h !== 'object' || typeof h.webglGetParameterMask !== 'function') {
      __webglDiagBrowser('fatal', 'webgl:webglHooks:fallback_invalid', {
        stage: 'apply',
        key: 'webglHooks',
        message: 'webglHooks fallback invalid',
        data: { outcome: 'throw' }
      }, e);
      throw e;
    }
    try {
      const __fallbackDesc = Object.getOwnPropertyDescriptor(window, 'webglHooks');
      if (__fallbackDesc && __fallbackDesc.configurable && __fallbackDesc.enumerable) {
        Object.defineProperty(window, 'webglHooks', {
          value: h,
          writable: true,
          configurable: true,
          enumerable: false
        });
      } else if (__fallbackDesc && !__fallbackDesc.configurable && __fallbackDesc.enumerable) {
        __webglDiagBrowser('warn', 'webgl:webglHooks:hide_skip_non_configurable', {
          stage: 'apply',
          key: 'webglHooks',
          message: 'webglHooks hide-after-apply skipped for non-configurable descriptor'
        }, null);
      }
    } catch (hideErr) {
      __webglDiagBrowser('warn', 'webgl:webglHooks:hide_failed', {
        stage: 'apply',
        key: 'webglHooks',
        message: 'webglHooks hide-after-apply failed'
      }, hideErr);
    }
  }
    __webglDiag('info', 'webgl:patches_applied', {
      stage: 'apply',
      type: __webglTypePipeline,
      key: null,
      message: 'webgl patches applied',
      data: { outcome: 'return' }
    });
  } catch (e) {
    releaseEntryGuard(false);
    throw e;
  }
}













// **
// Why so?

// patchMethod in the context of WebGL passes the captured original as the first hook argument.
// If the hook returns undefined, patchMethod continues the cycle and ultimately returns the native response.
// If the hook returns null or any other value, that value will be substituted for the original.
