const WebglPatchModule = function WebglPatchModule(window) {
    if (!window.__PATCH_WEBGL__) {
    window.__PATCH_WEBGL__ = true;

    const C = window.CanvasPatchContext;
    if (!C) throw new Error(' WebglPatchModule] CanvasPatchContext is undefined — registration is not available');
    const G = (typeof globalThis !== 'undefined' && globalThis)
          || (typeof self       !== 'undefined' && self)
          || (typeof window     !== 'undefined' && window)
          || (typeof global     !== 'undefined' && global)
          || {};

    // basic random from the existing seed initialization
    const R = window.rand.use('webgl');
    if (typeof R !== 'function') {
      throw new Error('[WebGLPatchModule] "R" is not initialized');
    }
    
    // Internal markers: avoid leaving visible properties on WebGL instances/objects
    const __webglInstancePatched__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __webglDebugInfoPatched__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __webglShaderSourcePatchedProtos__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __webglDebugInfoCache__ = (typeof WeakMap === 'function') ? new WeakMap() : null;
    const __WEBGL_DEBUGINFO_CACHE_PROP__ = 'WebGLInstance_DebugInfoCache__';
    if (!__webglInstancePatched__ || !__webglDebugInfoPatched__ || !__webglShaderSourcePatchedProtos__ || !__webglDebugInfoCache__) {
      throw new Error('[WebGLPatchModule] WeakMap/WeakSet are required');
    }

    const markNative = (function() {
      if (typeof window.__ensureMarkAsNative !== 'function') {
        throw new Error('[WebglPatchModule] __ensureMarkAsNative missing');
      }
      const m = window.__ensureMarkAsNative();
      if (typeof m !== 'function') {
        throw new Error('[WebglPatchModule] __ensureMarkAsNative returned non-function');
      }
      return m;
    })();

    
    function noiseAt(x, y, w, h) {
      const mix = (((x*73856093) ^ (y*19349663) ^ (w*83492791) ^ (h*2654435761)) >>> 0);
      const r = R()
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
        if (typeof window.__DEGRADE__ === 'function') {
          try { window.__DEGRADE__('webgl:getExtension:debug_renderer_info_throw', e); } catch (_) {}
        }
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
        } catch (_) {
          try { this[__WEBGL_DEBUGINFO_CACHE_PROP__] = dbg; } catch (_) {}
        }
      }
    }
    if (dbg) {
        if (pname === dbg.UNMASKED_VENDOR_WEBGL)   return window.__WEBGL_UNMASKED_VENDOR__;
        if (pname === dbg.UNMASKED_RENDERER_WEBGL) return window.__WEBGL_UNMASKED_RENDERER__;
    }
    if (pname === this.VENDOR   || pname === 0x1F00) return window.__WEBGL_VENDOR__;
    if (pname === this.RENDERER || pname === 0x1F01) return window.__WEBGL_RENDERER__;
    //others - do not touch
    return;  // undefined → The original will work out
    }
  // 2) Хук «whitelist-фильтра»
  function webglWhitelistParameterHook(orig, pname, ...args) {
    const wl = window.__WEBGL_PARAM_WHITELIST__;
    if (!Array.isArray(wl)) {
      throw new Error('[WebGLPatchModule] __WEBGL_PARAM_WHITELIST__ missing/invalid');
    }

    // Always let core string params through via orig to avoid nulls breaking FP scripts
    // (keep masked vendor/renderer logic in webglGetParameterMask)
    // if (typeof this.VERSION === 'number' && pname === this.VERSION) {
    //   return orig.call(this, pname, ...args);
    // }
    // if (typeof this.SHADING_LANGUAGE_VERSION === 'number' && pname === this.SHADING_LANGUAGE_VERSION) {
    //   return orig.call(this, pname, ...args);
    // }

    //Allowed parameters - we let the original (patchMethodThen it will call orig)
    if (wl.includes(pname)) {
      return; // undefined → pass-through to orig.apply(this, args)
    }
    // TTST !!if (typeof this.VERSION === 'number' && pname === this.VERSION) return;
    // if (typeof this.SHADING_LANGUAGE_VERSION === 'number' && pname === this.SHADING_LANGUAGE_VERSION) return;

    // For non-whitelisted enums: keep native pass-through to avoid null overrides
    // that can break third-party report renderers (Object.values(null) paths).
    if (typeof window.__DEGRADE__ === 'function') {
      try { window.__DEGRADE__('webgl:param_whitelist_miss', null, { pname: pname }); } catch (_) {}
    }
    return; // undefined -> pass-through to orig.apply(this, args)
  }
    // === 2. getSupportedExtensions ===
  function webglGetSupportedExtensionsPatch(orig, ...args) {
    const whitelist = Array.isArray(window.__EXTENSIONS_WHITELIST__)
      ? window.__EXTENSIONS_WHITELIST__ : [];

    const res = orig.apply(this, args);
    if (!Array.isArray(res)) return res;

    return res.filter(ext => whitelist.includes(ext));
  }

  function webglGetExtensionPatch(orig, name, ...rest) {
    const whitelist = Array.isArray(window.__EXTENSIONS_WHITELIST__)
      ? window.__EXTENSIONS_WHITELIST__ : [];
    if (!whitelist.includes(name)) return null;
    const res = orig.call(this, name, ...rest);
    //  WEBGL_debug_renderer_info
    if (name === 'WEBGL_debug_renderer_info' &&
      res && typeof res === 'object' &&
      !((__webglDebugInfoPatched__ && __webglDebugInfoPatched__.has(res)) || res.WebGLInstance_DebugInfoPatched__)) {

      if (typeof res.getParameter === 'function') {
        const origGetParameter = res.getParameter;
        const wrappedGetParameter = ({ getParameter(pname) {
          if (pname === this.UNMASKED_VENDOR_WEBGL)
            return window.__WEBGL_UNMASKED_VENDOR__;
          if (pname === this.UNMASKED_RENDERER_WEBGL)
            return window.__WEBGL_UNMASKED_RENDERER__;
          return origGetParameter.call(this, pname);
        }}).getParameter;

        markNative(wrappedGetParameter, 'getParameter');
        res.getParameter = wrappedGetParameter;
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
        } catch (_) {
          try { this[__WEBGL_DEBUGINFO_CACHE_PROP__] = res || null; } catch (_) {}
        }
      }
    }
    return res;
  }

  // === 4.context patch (instance mark only; prototype patching is owned by context.js) ===
  function webglGetContextPatch(res, kind, ...args) {
    // If already patched or empty, immediately return
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
    const res = orig.call(this, shaderType, precisionType);
    if (!res) return res;
    const v = (R() - 0.5);
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

  function webglShaderSourceHook(orig, shader, src) {
    if (typeof src !== 'string') return; // undefined → patchMethod Calls orig(shader, src)
 
    try {
      // Unified precision policy by default: vertex="mediump", fragment="highp"
      // You can redefine through window._precisionPolicy = { vertex, fragment, mode }
      // mode: "float-only" (только precision-строки) | "smart"(by default: precision-strings + safe fallback \bhighp\b)
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
      if (typeof window.__DEGRADE__ === 'function') {
        try { window.__DEGRADE__('webgl:shaderSourceHook:error', e); } catch (_) {}
      }
      // for any malfunction case - return the original without modifications
      return;
    }
  }

  function webglGetUniformHook(orig, program, location) {
    const res = orig.call(this, program, location);
    if (typeof res === 'number' && typeof R === 'function') {
      return res + (R() - 0.5) * 1e-4;
    }
    return res;
  }

  // === 6.export hooks to context.js ===
  try {
    Object.defineProperty(window, 'webglHooks', {
      value: {
        webglGetParameterMask,
        webglWhitelistParameterHook,
        webglGetSupportedExtensionsPatch,
        webglGetExtensionPatch,
        webglGetContextPatch,
        webglReadPixelsHook,
        webglGetShaderPrecisionFormatHook,
        webglShaderSourceHook,
        webglGetUniformHook
      },
      writable: true,
      configurable: true,
      enumerable: false
    });
  } catch (e) {
    if (typeof window.__DEGRADE__ === 'function') {
      try { window.__DEGRADE__('webgl:webglHooks:define_failed', e); } catch (_) {}
    }
    window.webglHooks = {
      webglGetParameterMask,
      webglWhitelistParameterHook,
      webglGetSupportedExtensionsPatch,
      webglGetExtensionPatch,
      webglGetContextPatch,
      webglReadPixelsHook,
      webglGetShaderPrecisionFormatHook,
      webglShaderSourceHook,
      webglGetUniformHook
    };
    const h = window.webglHooks;
    if (!h || typeof h !== 'object' || typeof h.webglGetParameterMask !== 'function') {
      throw e;
    }
  }
    console.log('[WebGLPatchModule] WebglPatchModule applied');
}
}













// **
// Why so?

// patchMethod in the context of WebGL when patching getParameter first takes result = orig(this, args) and passes it to the hook as the first argument.
// If the hook returns undefined, patchMethod continues the cycle and ultimately returns result (the original response).
// If the hook returns null or any other value, that value will be substituted for the original.
