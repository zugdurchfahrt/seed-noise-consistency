const HideWebdriverPatchModule = function HideWebdriverPatchModule(window) {
  if (window && window.__HIDE_WEBDRIVER_READY__) return;
  if (window) window.__HIDE_WEBDRIVER_READY__ = true

  const C = window.CanvasPatchContext;
      if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
  
  // // --- nativization provider is initialized in RTCPeerConnection.js ---
  const safeDefine = (function() {
    const sd = (window && typeof window.__safeDefine === 'function') ? window.__safeDefine : null;
    if (typeof sd !== 'function') {
      throw new Error('[HideWebdriverPatchModule] safeDefine missing');
    }
    return sd;
  })();

  const markAsNative = (function() {
    const ensure = (window && typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : window.markAsNative;
    if (typeof m !== 'function') {
      throw new Error('[HideWebdriverPatchModule] markAsNative missing');
    }
    return m;
  })();

  // --- keep natives once ---
  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;

  // window.external protection
  try {
    Object.defineProperty(window, 'external', {
      get: markAsNative(() => {
        const fakeExternal = {};
        Object.defineProperty(fakeExternal, 'toString', {
          value: markAsNative(() => '[object External]', 'toString'),
          configurable: true,
          enumerable: false
        });
        return fakeExternal;
      }, "get external"),
      configurable: true,
      enumerable: false
    });
  } catch (e) {
    console.warn("[stealth] external patch failed:", e);
    if (typeof env !== "undefined" && env && env.DEBUG_DEGRADES && typeof __DEGRADE__ === "function") __DEGRADE__("hide_webdriver.js:external_patch:define_failed", e);
  }


  const proto = Navigator.prototype;

  // navigator.webdriver → undefined (preserve descriptor layout when present)
  const wdDesc = Object.getOwnPropertyDescriptor(proto, 'webdriver');
  if (wdDesc && wdDesc.configurable === false) {
    throw new TypeError('[HideWebdriverPatchModule] webdriver non-configurable');
  }
  if ('webdriver' in navigator || wdDesc) {
    safeDefine(proto, 'webdriver', {
      get: markAsNative(() => undefined, "get webdriver"),
      set: wdDesc && wdDesc.set,
      configurable: wdDesc ? !!wdDesc.configurable : true,
      enumerable: false
    });
  }

  // --- keep natives once ---
  const nativeGOPD = nativeGetOwnProp;
  const nativeHas  = Reflect.has;

  // one predicate
  const isWebdriver = (obj, prop) =>
    prop === 'webdriver' && (obj === navigator || obj === Navigator.prototype);

  // one wrapper factory
  function wrapNative(name, nativeFn, implFn) {
    function wrapped() {
      return implFn.apply(this, arguments);
    }

    markAsNative(wrapped, name);

    const lenDesc = nativeGetOwnProp(wrapped, 'length');
    if (lenDesc && lenDesc.configurable) {
      try { Object.defineProperty(wrapped, 'length', { value: nativeFn.length }); } catch (e) {
        if (typeof env !== "undefined" && env && env.DEBUG_DEGRADES && typeof __DEGRADE__ === "function") __DEGRADE__("hide_webdriver.js:wrapNative:length_define_failed", e);
      }
    }
    const nameDesc = nativeGetOwnProp(wrapped, 'name');
    if (nameDesc && nameDesc.configurable) {
      try { Object.defineProperty(wrapped, 'name', { value: name }); } catch (e) {
        if (typeof env !== "undefined" && env && env.DEBUG_DEGRADES && typeof __DEGRADE__ === "function") __DEGRADE__("hide_webdriver.js:wrapNative:name_define_failed", e);
      }
    }

    return wrapped;
  }

  // --- apply patches ---
  Object.getOwnPropertyDescriptor = wrapNative(
    'getOwnPropertyDescriptor',
    nativeGOPD,
    function (obj, prop) {
      if (isWebdriver(obj, prop)) return undefined;
      return nativeGOPD(obj, prop);
    }
  );

  Reflect.has = wrapNative(
    'has',
    nativeHas,
    function (target, prop) {
      if (target === navigator && prop === 'webdriver') return false;
      return nativeHas(target, prop);
    }
  );

}
