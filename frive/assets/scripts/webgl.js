function WebglPatchModule(window) {
  if (!window.__PATCH_WEBGL__) {
    window.__PATCH_WEBGL__ = true;
    const C = window.CanvasPatchContext;
    if (!C) throw new Error(' WebglPatchModule] CanvasPatchContext is undefined — registration is not available');
    // basic random from the existing seed initialization
    const R = window.rand.use('webgl');
    if (typeof R !== 'function') {
      throw new Error('[WebGLPatchModule] "R" is not initialized');
    }
    
    function noiseAt(x, y, w, h) {
      const mix = (((x*73856093) ^ (y*19349663) ^ (w*83492791) ^ (h*2654435761)) >>> 0);
      const r = R()
      return ((r - 0.5) * 3) | 0;       // integral shift [-1..+1]
    }

    // 1) VENDOR/RENDERER replacement
  function webglGetParameterMask(orig, pname, ...args) {
    let dbg = null;
    try { dbg = this.getExtension('WEBGL_debug_renderer_info'); } catch(e){}
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
    const wl = Array.isArray(window.__WEBGL_PARAM_WHITELIST__)
      ? window.__WEBGL_PARAM_WHITELIST__ : [];

    //Allowed parameters - we let the original (patchMethodThen it will call orig)
    if (wl.length === 0 || wl.includes(pname)) {
      return; // undefined → pass-through to orig.apply(this, args)
    }
    // We mask prohibited parameters like driver answer (without throw)
    return; // driver-like: error as null
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
        !res.WebGLInstance_DebugInfoPatched__) {

      if (typeof res.getParameter === 'function') {
        const origGetParameter = res.getParameter;
        res.getParameter = function(pname) {
          if (pname === this.UNMASKED_VENDOR_WEBGL)
            return window.__WEBGL_UNMASKED_VENDOR__;
          if (pname === this.UNMASKED_RENDERER_WEBGL)
            return window.__WEBGL_UNMASKED_RENDERER__;
          return origGetParameter.call(this, pname);
        };
      }
      res.WebGLInstance_DebugInfoPatched__ = true;
    }
    return res;
  }

  // === 4.context patch (shaderSource → selective downgrade) ===
  function webglGetContextPatch(res, kind, ...args) {
    // If already patched or empty, immediately return
    if (!res || res.WebGLInstance_GPUPatched__) return res;

    const proto = Object.getPrototypeOf(res);
    if (kind && ['webgl', 'experimental-webgl', 'webgl2'].includes(kind)) {
      if (proto.shaderSource && !proto.shaderSource._isPatchedByStealth) {
        const orig = proto.shaderSource;
        // НИЧЕГО НЕ МЕНЯЕМ ЗДЕСЬ — вся precision-политика уедет в webglShaderSourceHook
        proto.shaderSource = function (shader, src) {
          return orig.call(this, shader, src);
        };
        proto.shaderSource._isPatchedByStealth = true;
      }
      res.WebGLInstance_GPUPatched__ = true;
    }
    return res;
  }

  // === 5) anti‑FP hooks  ===
  function webglReadPixelsHook(orig, x, y, w, h, format, type, buffer) {
    const r = orig.call(this, x, y, w, h, format, type, buffer);
    if (!buffer) return r;
    for (let row=0, i=0; row<h; row++){
      for (let col=0; col<w; col++, i+=4){
        const v = noiseAt(col,row,w,h);
        buffer[i]   += v;
        buffer[i+1] += v;
        buffer[i+2] += v;
      }
    }
    return r;
  }

  function webglGetShaderPrecisionFormatHook(orig, shaderType, precisionType) {
    const res = orig.call(this, shaderType, precisionType);
    if (!res) return res;
    const v = (R() - 0.5);
    return {
      rangeMin: Math.round(res.rangeMin + v),
      rangeMax: Math.round(res.rangeMax + v),
      precision: Math.round(res.precision + v)
    };
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

    } catch (_) {
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
    console.log('[WebGLPatchModule] WebglPatchModule applied');
}
}













// **
// Why so?

// patchMethod in the context of WebGL when patching getParameter first takes result = orig(this, args) and passes it to the hook as the first argument.
// If the hook returns undefined, patchMethod continues the cycle and ultimately returns result (the original response).
// If the hook returns null or any other value, that value will be substituted for the original.





