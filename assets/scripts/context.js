
// === CONTEXT PATCH MODULE ===
const ContextPatchModule = function ContextPatchModule(window) {
  const C = window.CanvasPatchContext = window.CanvasPatchContext || {};
  'use strict';
  const global = window;
  if (global.CanvasPatchContext && global.CanvasPatchContext.__READY__) {
    return; // in case is already initialized
  }

  C.__READY__ = true;

  // === 0. Utilities ===
  const NOP = () => {};

  const patchedMethods = new WeakSet();
  const markAsNative = (function() {
    const ensure = global && typeof global.__ensureMarkAsNative === 'function'
      ? global.__ensureMarkAsNative
      : null;

    const m = ensure ? ensure() : (global && global.markAsNative);
    if (typeof m !== 'function') {
      throw new Error('[ContextPatch] markAsNative missing');
    }
    return function(fn, name) {
      return m(fn, name);
    };
  })();

  function guardInstance(proto, self){
    try { return self && (self instanceof proto.constructor || self instanceof proto.constructor.prototype.constructor); }
    catch { return false; }
  }


  function getHooks(){
    return (typeof global !== 'undefined' && global.CanvasPatchHooks) ? global.CanvasPatchHooks : null;
  }

  function definePatchedMethod(proto, method, value) {
    const d = Object.getOwnPropertyDescriptor(proto, method);
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
  C.canvas2DNoiseHooks                  = C.canvas2DNoiseHooks                 || [];

  C.webglGetParameterHooks              = C.webglGetParameterHooks             || [];
  C.webglGetSupportedExtensionsHooks    = C.webglGetSupportedExtensionsHooks   || [];
  C.webglGetExtensionHooks              = C.webglGetExtensionHooks             || [];
  C.webglGetContextHooks                = C.webglGetContextHooks               || [];
  C.webglReadPixelsHooks                = C.webglReadPixelsHooks               || [];
  C.webglGetShaderPrecisionFormatHooks  = C.webglGetShaderPrecisionFormatHooks || [];
  C.webglShaderSourceHooks              = C.webglShaderSourceHooks             || [];
  C.webglGetUniformHooks                = C.webglGetUniformHooks               || [];

  // === 2. Registrars ===
  C.registerHtmlCanvasGetContextHook          = fn => (typeof fn === 'function') && C.htmlCanvasGetContextHooks.push(fn);
  C.registerHtmlCanvasToDataURLHook           = fn => (typeof fn === 'function') && C.htmlCanvasToDataURLHooks.push(fn);
  C.registerHtmlCanvasToBlobHook              = fn => (typeof fn === 'function') && C.htmlCanvasToBlobHooks.push(fn);

  C.registerOffscreenGetContextHook           = fn => (typeof fn === 'function') && C.offscreenGetContextHooks.push(fn);
  C.registerOffscreenConvertToBlobHook        = fn => (typeof fn === 'function') && C.offscreenConvertToBlobHooks.push(fn);

  C.registerCtx2DGetContextHook               = fn => (typeof fn === 'function') && C.ctx2DGetContextHooks.push(fn);
  C.registerCtx2DMeasureTextHook              = fn => (typeof fn === 'function') && C.ctx2DMeasureTextHooks.push(fn);
  C.registerCtx2DFillTextHook                 = fn => (typeof fn === 'function') && C.ctx2DFillTextHooks.push(fn);
  C.registerCtx2DStrokeTextHook               = fn => (typeof fn === 'function') && C.ctx2DStrokeTextHooks.push(fn);
  C.registerCtx2DFillRectHook                 = fn => (typeof fn === 'function') && C.ctx2DFillRectHooks.push(fn);
  C.registerCtx2DDrawImageHook                = fn => (typeof fn === 'function') && C.ctx2DDrawImageHooks.push(fn);
  C.registerCtx2DAddNoiseHook                 = fn => (typeof fn === 'function') && C.canvas2DNoiseHooks.push(fn);

  C.registerWebGLGetContextHook               = fn => (typeof fn === 'function') && C.webglGetContextHooks.push(fn);
  C.registerWebGLGetParameterHook             = fn => (typeof fn === 'function') && C.webglGetParameterHooks.push(fn);
  C.registerWebGLGetSupportedExtensionsHook   = fn => (typeof fn === 'function') && C.webglGetSupportedExtensionsHooks.push(fn);
  C.registerWebGLGetExtensionHook             = fn => (typeof fn === 'function') && C.webglGetExtensionHooks.push(fn);
  C.registerWebGLReadPixelsHook               = fn => (typeof fn === 'function') && C.webglReadPixelsHooks.push(fn);
  C.registerWebGLGetShaderPrecisionFormatHook = fn => (typeof fn === 'function') && C.webglGetShaderPrecisionFormatHooks.push(fn);
  C.registerWebGLShaderSourceHook             = fn => (typeof fn === 'function') && C.webglShaderSourceHooks.push(fn);
  C.registerWebGLGetUniformHook               = fn => (typeof fn === 'function') && C.webglGetUniformHooks.push(fn);

  // === 3. Patch utilities ===
  function chain(proto, method, hooks){
    if (!proto || typeof proto[method] !== 'function' || !(hooks && hooks.length)) return false;
    const orig = proto[method];
    if (patchedMethods.has(orig)) return false;

    // Avoid expando flags on "this" (detectable). Use WeakSet recursion guard.
    const inProgress =
      (typeof WeakSet === 'function') ? new WeakSet() : null;
    const flag = '__isChain_' + method;

    const wrapped = (method === 'toDataURL')
      ? ({ toDataURL(type, quality) {
          const self = this;
          const isObj = self !== null && (typeof self === 'object' || typeof self === 'function');
          if (self && self[flag]) return Reflect.apply(orig, self, arguments);
          if (inProgress && isObj) {
            if (inProgress.has(self)) return Reflect.apply(orig, self, arguments);
            inProgress.add(self);
          } else {
            if (self) self[flag] = true;
          }
          try {
            let patchedArgs = Array.prototype.slice.call(arguments);
            for (const hook of hooks){
              if (typeof hook !== 'function') continue;
              try {
                const next = hook.apply(this, patchedArgs);
                if (next && Array.isArray(next)) patchedArgs = next;
              } catch (e) {
                if (global.__DEBUG__) console.error(`[CHAIN HOOK ERROR ${method}]`, e);
              }
            }
            const out = Reflect.apply(orig, this, patchedArgs);
            let res = out;
            for (const hook of hooks){
              try {
                const r = hook.call(this, res, ...patchedArgs);
                if (typeof r === 'string') res = r;
              } catch (e) {
                if (global.__DEBUG__) console.error(`[CHAIN POST ERROR ${method}]`, e);
              }
            }
            return res;
          } finally {
            if (inProgress && isObj) {
              inProgress.delete(self);
            } else {
              if (self) self[flag] = false;
            }
          }
        } }).toDataURL
      : ({ [method]() {
          const self = this;
          const isObj = self !== null && (typeof self === 'object' || typeof self === 'function');
          if (self && self[flag]) return Reflect.apply(orig, self, arguments);
          if (inProgress && isObj) {
            if (inProgress.has(self)) return Reflect.apply(orig, self, arguments);
            inProgress.add(self);
          } else {
            if (self) self[flag] = true;
          }
          try {
            let patchedArgs = Array.prototype.slice.call(arguments);
            for (const hook of hooks){
              if (typeof hook !== 'function') continue;
              try {
                const next = hook.apply(this, patchedArgs);
                if (next && Array.isArray(next)) patchedArgs = next;
              } catch (e) {
                if (global.__DEBUG__) console.error(`[CHAIN HOOK ERROR ${method}]`, e);
              }
            }
            return Reflect.apply(orig, this, patchedArgs);
          } finally {
            if (inProgress && isObj) {
              inProgress.delete(self);
            } else {
              if (self) self[flag] = false;
            }
          }
        } })[method];

    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched);
    patchedMethods.add(patched);
    return true;
  }

  // === WEBGL PATCHING ===
  function patchMethod(proto, method, hooks) {
      if (!proto)                              { console.warn(`[patchMethod] proto is not defined: ${method}`); return false; }
      if (typeof proto[method] !== 'function') { console.warn(`[patchMethod] not a function: ${method}`); return false; }
      if (patchedMethods.has(proto[method]))   { console.warn(`[patchMethod] already patched: ${method}`); return false; }
      if (!hooks?.length)                      { console.warn(`[patchMethod] no hooks: ${method}`); return false; }

      const orig = proto[method];
      const guard = (typeof WeakSet === 'function') ? new WeakSet() : null;

      function invoke(self, argsLike) {
          // Preserve native Illegal invocation / brand check errors
          const isObj = (self !== null) && (typeof self === 'object' || typeof self === 'function');
          const args = Array.isArray(argsLike) ? argsLike : Array.prototype.slice.call(argsLike);

          if (guard && isObj) {
              if (guard.has(self)) return orig.apply(self, args);
              guard.add(self);
          }

          try {
              if (typeof guardInstance === "function" && !guardInstance(proto, self))
                  return orig.apply(self, args);

              let patched = args;
              for (const hook of hooks) {
                  if (typeof hook !== 'function') continue;
                  try {
                      const res = hook.apply(self, [orig, ...patched]);

                      // override console logging
                      if (res !== undefined && !Array.isArray(res)) {
                          if (global.__DEBUG__ && !(global._logConfig && global._logConfig.WEBGLlogger === false))
                              console.warn('[patchMethod override]', method, hook.name || 'anon', res);
                          return res; // result substitution
                      }

                      // argument substitution
                      if (Array.isArray(res)) {
                          patched = res;
                          continue;
                      }

                  } catch (e) {
                      console.error(`[patchMethod] hook error ${method} (${hook.name || 'anon'}):`, e);
                  }
              }
              return orig.apply(self, patched);

          } finally {
              if (guard && isObj) guard.delete(self);
          }
      }

      // IMPORTANT: use MethodDefinition functions to match native (non-constructible, no "prototype")
      const wrappedRaw = (function(){
          switch (orig.length) {
              case 0: return ({ [method]() { return invoke(this, arguments); } })[method];
              case 1: return ({ [method](a0) { return invoke(this, arguments); } })[method];
              case 2: return ({ [method](a0, a1) { return invoke(this, arguments); } })[method];
              case 7: return ({ [method](a0, a1, a2, a3, a4, a5, a6) { return invoke(this, arguments); } })[method];
              default: return ({ [method](...a) { return invoke(this, a); } })[method];
          }
      })();

      const wrapped = markAsNative(wrappedRaw, method);

      definePatchedMethod(proto, method, wrapped);
      patchedMethods.add(wrapped);

      return true;
    }

  function chainAsync(proto, method, hooksGetter){
    if (!proto || typeof proto[method] !== 'function') return false;
    const orig = proto[method];
    if (patchedMethods.has(orig)) return false;

    const getHooksList = () => (typeof hooksGetter === 'function') ? hooksGetter() : [];
    const applyHooks = (self, blob, args) => {
      let b = blob;
      const hooks = getHooksList();
      if (hooks && hooks.length) {
        for (const hook of hooks) {
          const r = hook.call(self, b, ...args);
          if (r instanceof Blob) b = r;
        }
      }
      return b;
    };

    if (method === 'toBlob') {
      const wrapped = ({ toBlob(callback, type, quality) {
        const args = arguments;
        if (typeof callback === 'function') {
          const done = (blob) => callback(applyHooks(this, blob, args));
          return Reflect.apply(orig, this, [done].concat(Array.prototype.slice.call(args, 1)));
        }
        return new Promise((resolve, reject) => {
          try {
            const done = (blob) => {
              try { resolve(applyHooks(this, blob, args)); }
              catch (e) { reject(e); }
            };
            Reflect.apply(orig, this, [done].concat(Array.prototype.slice.call(args, 1)));
          } catch (e) { reject(e); }
        });
      } }).toBlob;
      const patched = markAsNative(wrapped, method);
      definePatchedMethod(proto, method, patched);
      patchedMethods.add(patched);
      return true;
    }

    if (method === 'convertToBlob') {
      const wrapped = ({ convertToBlob(options) {
        const args = arguments;
        const p = Reflect.apply(orig, this, args);
        if (!(p && typeof p.then === 'function')) return p;
        const hooks = getHooksList();
        if (!(hooks && hooks.length)) return p;
        return p.then((blob) => applyHooks(this, blob, args));
      } }).convertToBlob;
      const patched = markAsNative(wrapped, method);
      definePatchedMethod(proto, method, patched);
      patchedMethods.add(patched);
      return true;
    }

    const wrapped = ({ [method]() {
      const args = arguments;
      const p = Reflect.apply(orig, this, args);
      if (!(p && typeof p.then === 'function')) return p;
      const hooks = getHooksList();
      if (!(hooks && hooks.length)) return p;
      return p.then((blob) => applyHooks(this, blob, args));
    } })[method];
    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched);
    patchedMethods.add(patched);
    return true;
  }

  // === 4. Brand-safe patching for CanvasRenderingContext2D (no Proxy returned) ===
  function createSafeCtxProxy(ctx){
    if (!ctx || typeof CanvasRenderingContext2D === 'undefined' || !(ctx instanceof CanvasRenderingContext2D)) return ctx;

    const proto = CanvasRenderingContext2D.prototype;

    // Patch once-per-method: if already patched, do nothing
    function patchOnce(method, makeWrapped){
      if (!proto || typeof proto[method] !== 'function') return false;
      if (patchedMethods.has(proto[method])) return false;

      const orig = proto[method];
      const wrappedRaw = makeWrapped(orig);
      const wrapped = markAsNative(wrappedRaw, method);

      definePatchedMethod(proto, method, wrapped);
      patchedMethods.add(wrapped);
      return true;
    }

    const getFontStr = (self) => {
      try {
        const f = self && typeof self.font === 'string' && self.font.trim() ? self.font : '16px sans-serif';
        return f;
      } catch {
        return '16px sans-serif';
      }
    };

    // --- measureText: post-process TextMetrics via CanvasPatchHooks.applyMeasureTextHook ---
    patchOnce('measureText', (orig) => function(text){
      const txt = String(text ?? '');
      const m = Reflect.apply(orig, this, [txt]);

      try {
        const H = getHooks();
        const fontStr = getFontStr(this);

        if (H && typeof H.applyMeasureTextHook === 'function') {
          const r = H.applyMeasureTextHook.call(this, m, txt, fontStr);
          return r ?? m;
        }

        // optional fallback if applyMeasureTextHook absent
        if (H && typeof H.measureTextNoiseHook === 'function') {
          // leave native as-is if only info hook exists
          // (do not change width here to preserve consistency)
          H.measureTextNoiseHook.call(this, m, txt, fontStr);
        }
      } catch { /* silent */ }

      return m;
    });

    // --- fillText ---
    patchOnce('fillText', (orig) => function(text, x, y, ...rest){
      try {
        const H = getHooks();

        if (H && typeof H.applyFillTextHook === 'function') {
          const callOrig = function(...a){ return Reflect.apply(orig, this, a); };
          return H.applyFillTextHook.call(this, callOrig, text, x, y, ...rest);
        }

        if (H && typeof H.fillTextNoiseHook === 'function') {
          const a = H.fillTextNoiseHook.apply(this, [text, x, y, ...rest]) || [text, x, y, ...rest];
          return Reflect.apply(orig, this, a);
        }
      } catch { /* silent */ }

      return Reflect.apply(orig, this, [text, x, y, ...rest]);
    });

    // --- strokeText ---
    patchOnce('strokeText', (orig) => function(text, x, y, ...rest){
      try {
        const H = getHooks();

        if (H && typeof H.applyStrokeTextHook === 'function') {
          const callOrig = function(...a){ return Reflect.apply(orig, this, a); };
          return H.applyStrokeTextHook.call(this, callOrig, text, x, y, ...rest);
        }

        if (H && typeof H.strokeTextNoiseHook === 'function') {
          const a = H.strokeTextNoiseHook.apply(this, [text, x, y, ...rest]) || [text, x, y, ...rest];
          return Reflect.apply(orig, this, a);
        }
      } catch { /* silent */ }

      return Reflect.apply(orig, this, [text, x, y, ...rest]);
    });

    // --- fillRect ---
    patchOnce('fillRect', (orig) => function(x, y, w, h){
      try {
        const H = getHooks();
        if (H && typeof H.fillRectNoiseHook === 'function') {
          const a = H.fillRectNoiseHook.call(this, x, y, w, h);
          if (Array.isArray(a)) return Reflect.apply(orig, this, a);
        }
      } catch { /* silent */ }
      return Reflect.apply(orig, this, [x, y, w, h]);
    });

    // --- drawImage ---
    patchOnce('drawImage', (orig) => function(...args){
      try {
        const H = getHooks();
        if (H && typeof H.applyDrawImageHook === 'function') {
          const callOrig = function(...a){ return Reflect.apply(orig, this, a); };
          return H.applyDrawImageHook.call(this, callOrig, ...args);
        }
      } catch { /* silent */ }
      return Reflect.apply(orig, this, args);
    });

    // IMPORTANT: return real ctx (brand-safe). No Proxy.
    return ctx;
  }

  // === 5. getContext interception for HTMLCanvasElement/OffscreenCanvas ===
  function chainGetContext(proto, method, htmlHooks, ctx2dHooks, webglHooks){
    if (!proto || typeof proto[method] !== 'function') return false;
    const orig = proto[method];
    if (patchedMethods.has(orig)) return false;

    const wrapped = ({ getContext(contextId, contextAttributes) {
      const args = arguments;
      const type = args[0];
      const rest = Array.prototype.slice.call(args, 1);
      const res = Reflect.apply(orig, this, args);
      let ctx = res;

      try {
        if (type === '2d' && ctx){
          ctx = createSafeCtxProxy(ctx);
          // call hight level hooks
          for (const hook of (ctx2dHooks || [])){
            try { ctx = hook.call(this, ctx, type, ...rest) || ctx; } catch {}
          }
        }
        if (/^webgl/.test(String(type))){
          for (const hook of (webglHooks || [])){
            try { hook.call(this, ctx, type, ...rest); } catch {}
          }
        }
        for (const hook of (htmlHooks || [])){
          try { hook.call(this, ctx, type, ...rest); } catch {}
        }
      } catch {}

      return ctx;
    } }).getContext;

    const patched = markAsNative(wrapped, method);
    definePatchedMethod(proto, method, patched);
    patchedMethods.add(patched);
    return true;
  }

  // === 6. applying of patches===
  C.applyCanvasElementPatches = function(){
    let applied = 0, total = 0;
    total++; if (chain(HTMLCanvasElement.prototype, 'toDataURL', this.htmlCanvasToDataURLHooks)) applied++;
    total++; if (chainAsync(HTMLCanvasElement.prototype, 'toBlob', () => this.htmlCanvasToBlobHooks)) applied++;
    total++; if (chainGetContext(
      HTMLCanvasElement.prototype,
      'getContext',
      this.htmlCanvasGetContextHooks,
      this.ctx2DGetContextHooks,
      this.webglGetContextHooks
    )) applied++;
    if (global.__DEBUG__) console.log(`[CanvasPatch] Canvas element patches: applied ${applied} из ${total}`);
    return applied;
  };

  C.applyOffscreenPatches = function(){
    const Ctx = this;
    let applied = 0, total = 0;
    if (typeof OffscreenCanvas !== 'undefined'){
      total++; if (chainAsync(OffscreenCanvas.prototype, 'convertToBlob', () => Ctx.offscreenConvertToBlobHooks)) applied++;
      total++; if (chainGetContext(
        OffscreenCanvas.prototype,
        'getContext',
        Ctx.offscreenGetContextHooks,
        Ctx.ctx2DGetContextHooks,
        Ctx.webglGetContextHooks
      )) applied++;
    }
    if (global.__DEBUG__) console.log(`[CanvasPatch] Offscreen patches: applied ${applied} из ${total}`);
    return applied;
  };

  C.applyWebGLContextPatches = function () {
      let applied = 0, total = 0;
      const list = [
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getParameter", this.webglGetParameterHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getSupportedExtensions", this.webglGetSupportedExtensionsHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getExtension", this.webglGetExtensionHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "readPixels", this.webglReadPixelsHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getShaderPrecisionFormat", this.webglGetShaderPrecisionFormatHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "shaderSource", this.webglShaderSourceHooks],
        [typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null, "getUniform", this.webglGetUniformHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getParameter", this.webglGetParameterHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getSupportedExtensions", this.webglGetSupportedExtensionsHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getExtension", this.webglGetExtensionHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "readPixels", this.webglReadPixelsHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getShaderPrecisionFormat", this.webglGetShaderPrecisionFormatHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null,  "shaderSource", this.webglShaderSourceHooks],
        [typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null, "getUniform", this.webglGetUniformHooks]
      ];
      for (const [proto, m, hooks] of list) {
        if (!proto) continue;
        total++;
        if (patchMethod(proto, m, hooks)) applied++;
      }
      console.log(`[CanvasPatch] WebGL context patches: applied ${applied} из ${total}`);
      return applied;
    };

  // === 3. REGISTER HOOK FUNCTIONS ===
  C.registerHtmlCanvasToBlobHook              = fn => typeof fn === 'function' && C.htmlCanvasToBlobHooks.push(fn);
  C.registerHtmlCanvasToDataURLHook           = fn => typeof fn === 'function' && C.htmlCanvasToDataURLHooks.push(fn);
  C.registerOffscreenConvertToBlobHook        = fn => typeof fn === 'function' && C.offscreenConvertToBlobHooks.push(fn);
  C.registerCtx2DGetContextHook               = fn => typeof fn === 'function' && C.ctx2DGetContextHooks.push(fn);
  C.registerCtx2DMeasureTextHook              = fn => typeof fn === 'function' && C.ctx2DMeasureTextHooks.push(fn);
  C.registerCtx2DFillTextHook                 = fn => typeof fn === 'function' && C.ctx2DFillTextHooks.push(fn);
  C.registerCtx2DStrokeTextHook               = fn => typeof fn === 'function' && C.ctx2DStrokeTextHooks.push(fn);
  C.registerCtx2DFillRectHook                 = fn => typeof fn === 'function' && C.ctx2DFillRectHooks.push(fn);
  C.registerCtx2DDrawImageHook                = fn => typeof fn === 'function' && C.ctx2DDrawImageHooks.push(fn);
  C.registerCtx2DAddNoiseHook                 = fn => typeof fn === 'function' && C.canvas2DNoiseHooks.push(fn);
  C.registerWebGLGetContextHook               = fn => typeof fn === 'function' && C.webglGetContextHooks.push(fn);
  C.registerWebGLGetParameterHook             = fn => typeof fn === 'function' && C.webglGetParameterHooks.push(fn);
  C.registerWebGLGetSupportedExtensionsHook   = fn => typeof fn === 'function' && C.webglGetSupportedExtensionsHooks.push(fn);
  C.registerWebGLGetExtensionHook             = fn => typeof fn === 'function' && C.webglGetExtensionHooks.push(fn);
  C.registerWebGLReadPixelsHook               = fn => typeof fn === 'function' && C.webglReadPixelsHooks.push(fn);
  C.registerWebGLGetShaderPrecisionFormatHook = fn => typeof fn === 'function' && C.webglGetShaderPrecisionFormatHooks.push(fn);
  C.registerWebGLShaderSourceHook             = fn => typeof fn === 'function' && C.webglShaderSourceHooks.push(fn);
  C.registerWebGLGetUniformHook               = fn => typeof fn === 'function' && C.webglGetUniformHooks.push(fn);

  // === 4. FINAL REGISTRATION ===
  function registerAllHooks() {
    const C = window.CanvasPatchContext;
    if (!C) return;

    // 1) We guarantee the presence of registers
    window.CanvasPatchHooks = window.CanvasPatchHooks || {};
    window.webglHooks       = window.webglHooks       || {};

    // 2) We take aliases after initialization
    const H = window.CanvasPatchHooks;
    const webglHooks = window.webglHooks;

    // 3) Validation of the availability of exports Canvas-hooks (from CanvasPatchModule)
    [
      'patch2DNoise','patchToDataURLInjectNoise','patchCanvasIHDRHook','masterToDataURLHook',
      'patchToBlobInjectNoise','patchConvertToBlobInjectNoise',
      'measureTextNoiseHook','fillTextNoiseHook','strokeTextNoiseHook','fillRectNoiseHook',
      'applyDrawImageHook','addCanvasNoise'
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
    if (C.registerCtx2DAddNoiseHook)          C.registerCtx2DAddNoiseHook(H.addCanvasNoise);

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
  }
    // export registerAllHooks for applying in main.py
window.registerAllHooks = registerAllHooks;

}
