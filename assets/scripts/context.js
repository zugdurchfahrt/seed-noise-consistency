
// === CONTEXT PATCH MODULE ===
function ContextPatchModule(window) {
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

  function safeInvoke(orig, self, args, proto, method){
    try {
      return orig.apply(self, args);
    } catch (e) {
      // Illegal invocation fallback
      if (proto && typeof proto[method] === 'function') {
        try { return proto[method].call(self, ...args); } catch {}
      }
      throw e;
    }
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

    const wrapped = (method === 'toDataURL')
      ? ({ toDataURL(type, quality) {
          const flag = '__isChain_' + method;
          if (this && this[flag]) return Reflect.apply(orig, this, arguments);
          if (this) this[flag] = true;
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
            if (this) this[flag] = false;
          }
        } }).toDataURL
      : ({ [method]() {
          const flag = '__isChain_' + method;
          if (this && this[flag]) return Reflect.apply(orig, this, arguments);
          if (this) this[flag] = true;
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
            if (this) this[flag] = false;
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

  // === 4. Proxy foe CanvasRenderingContext2D (Safe wrap) ===
  function createSafeCtxProxy(ctx){
    if (!ctx || typeof CanvasRenderingContext2D === 'undefined' || !(ctx instanceof CanvasRenderingContext2D)) return ctx;

    const proto = CanvasRenderingContext2D.prototype;

    const ORIG = {
      getImageData: proto.getImageData,
      putImageData: proto.putImageData,
      drawImage:    proto.drawImage,
      measureText:  proto.measureText,
      fillText:     proto.fillText,
      strokeText:   proto.strokeText,
      fillRect:     proto.fillRect
    };

    const guard = { getImageData: false };

    const handler = {
      get(target, prop){
        // Special methods interception
        if (prop === 'getImageData' && ORIG.getImageData){
          const wrapped = function(...args){
            if (guard.getImageData) return safeInvoke(ORIG.getImageData, target, args, proto, 'getImageData');
            guard.getImageData = true;
            try {
              if (args.length >= 4){
                let [x, y, w, h] = args;
                const cw = (this && this.canvas && this.canvas.width)  || 0;
                const ch = (this && this.canvas && this.canvas.height) || 0;
                x |= 0; y |= 0; w |= 0; h |= 0;
                if (x < 0) x = 0; if (y < 0) y = 0;
                if (x + w > cw) w = Math.max(1, cw - x);
                if (y + h > ch) h = Math.max(1, ch - y);
                const img = safeInvoke(ORIG.getImageData, target, [x, y, w, h], proto, 'getImageData');
                // No post-processing: the equality of ways is guaranteed that
                // that we are "noisy" only when changing canvas (DRAWIMAGE, etc.)
                return img;
              }
              return safeInvoke(ORIG.getImageData, target, args, proto, 'getImageData');
            } finally {
              guard.getImageData = false;
            }
          };
          return markAsNative(wrapped, 'getImageData');
        }

        if (prop === 'measureText' && ORIG.measureText){
          const wrapped = function(text, ...rest){
            const txt = String(text ?? '');
            const m = safeInvoke(ORIG.measureText, target, [txt, ...rest], proto, 'measureText');
            try {
              const H = getHooks();
              const fontStr = (typeof this?.font === 'string' && this.font.trim()) ? this.font : '16px sans-serif';
              if (H && typeof H.applyMeasureTextHook === 'function'){
                return H.applyMeasureTextHook.call(this, m, txt, fontStr) ?? m;
              }
              if (H && typeof H.measureTextNoiseHook === 'function'){
                return H.measureTextNoiseHook.call(this, m, txt, fontStr) ?? m;
              }
            } catch {}
            return m;
          };
          return markAsNative(wrapped, 'measureText');
        }

        if (prop === 'fillText' && ORIG.fillText){
          const H = getHooks();
          if (H && typeof H.applyFillTextHook === 'function'){
            const wrapped = function(...args){
              return H.applyFillTextHook.call(this, ORIG.fillText.bind(target), ...args);
            };
            return markAsNative(wrapped, 'fillText');
          }
          const wrapped = function(text, x, y, ...rest){
            try {
              let a = [text, x, y, ...rest];
              const H = getHooks();
              const hook = H && H.fillTextNoiseHook;
              if (typeof hook === 'function') a = hook.apply(this, a) || a;
              return safeInvoke(ORIG.fillText, target, a, proto, 'fillText');
            } catch {
              return safeInvoke(ORIG.fillText, target, [text, x, y, ...rest], proto, 'fillText');
            }
          };
          return markAsNative(wrapped, 'fillText');
        }
    
        if (prop === 'fillRect' && ORIG.fillRect){
          const H = getHooks();
          const wrapped = function(x, y, w, h){
            try {
              if (H && typeof H.fillRectNoiseHook === 'function') {
                const a = H.fillRectNoiseHook.call(this, x, y, w, h);
                if (Array.isArray(a)) return safeInvoke(ORIG.fillRect, target, a, proto, 'fillRect');
              }
            } catch {}
            return safeInvoke(ORIG.fillRect, target, [x, y, w, h], proto, 'fillRect');
          };
          return markAsNative(wrapped, 'fillRect');
        }

        if (prop === 'strokeText' && ORIG.strokeText){
          const H = getHooks();
          if (H && typeof H.applyStrokeTextHook === 'function'){
            const wrapped = function(...args){
              return H.applyStrokeTextHook.call(this, ORIG.strokeText.bind(target), ...args);
            };
            return markAsNative(wrapped, 'strokeText');
          }
          const wrapped = function(text, x, y, ...rest){
            try {
              let a = [text, x, y, ...rest];
              const H = getHooks();
              const hook = H && H.strokeTextNoiseHook;
              if (typeof hook === 'function') a = hook.apply(this, a) || a;
              return safeInvoke(ORIG.strokeText, target, a, proto, 'strokeText');
            } catch {
              return safeInvoke(ORIG.strokeText, target, [text, x, y, ...rest], proto, 'strokeText');
            }
          };
          return markAsNative(wrapped, 'strokeText');
        }

        if (prop === 'drawImage' && ORIG.drawImage){
          const H = getHooks();
          if (H && typeof H.applyDrawImageHook === 'function'){
            const wrapped = function(...args){
              return H.applyDrawImageHook.call(this, ORIG.drawImage.bind(target), ...args);
            };
            return markAsNative(wrapped, 'drawImage');
          }
          const wrapped = function(...args){
            return safeInvoke(ORIG.drawImage, target, args, proto, 'drawImage');
          };
          return markAsNative(wrapped, 'drawImage');
        }

      // other functions - a safe call; Properties - as is
        const orig = Reflect.get(target, prop, target);
        if (typeof orig === 'function'){
          const wrapped = function(...args){
            try { return safeInvoke(orig, target, args, proto, prop); }
            catch { try { return safeInvoke(orig, target, args, proto, prop); } catch { return undefined; } }
          };
          return markAsNative(wrapped, String(prop));
        }
        try { return orig; } catch { return undefined; }
      },
      set(target, prop, value){ try { return Reflect.set(target, prop, value, target); } catch { return false; } },
      getOwnPropertyDescriptor(target, prop){ try { return Object.getOwnPropertyDescriptor(target, prop); } catch { return undefined; } },
      defineProperty(target, prop, desc){ try { return Reflect.defineProperty(target, prop, desc); } catch { return false; } },
      setPrototypeOf(){ return false; }
    };

    return new Proxy(ctx, handler);
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

    // 7) Apply context patches after hooks registration
    // Idempotent: protected by patchedMethods WeakSet inside ContextPatchModule
    if (typeof C.applyCanvasElementPatches === 'function') C.applyCanvasElementPatches();
    if (typeof C.applyOffscreenPatches === 'function')     C.applyOffscreenPatches();
    if (typeof C.applyWebGLContextPatches === 'function')  C.applyWebGLContextPatches();
  }
    // export registerAllHooks for applying in main.py
window.registerAllHooks = registerAllHooks;

}(typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : globalThis));
