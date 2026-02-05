const HideWebdriverPatchModule = function HideWebdriverPatchModule(window) {
  if (window && window.__HIDE_WEBDRIVER_READY__) return;
  if (window) window.__HIDE_WEBDRIVER_READY__ = true

  const C = window.CanvasPatchContext;
      if (!C) throw new Error('[HideWebdriverPatchModule] CanvasPatchContext is undefined — module registration is not available');
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
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      throw new Error('[HideWebdriverPatchModule] markAsNative missing');
    }
    return m;
  })();

  // --- keep natives once ---
  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;

  // window.external protection (only if it exists in the chain; keep descriptor kind)
  try {
    if ('external' in window) {
      const ownDesc = Object.getOwnPropertyDescriptor(window, 'external');
      const proto = (typeof Window !== 'undefined' && Window.prototype) || Object.getPrototypeOf(window);
      const protoDesc = (!ownDesc && proto) ? Object.getOwnPropertyDescriptor(proto, 'external') : null;
      const target = ownDesc ? window : (protoDesc ? proto : null);
      const desc = ownDesc || protoDesc;
      if (target && !(desc && desc.configurable === false)) {
        const externalObj = (() => {
          const fakeExternal = {};
          Object.defineProperty(fakeExternal, 'toString', {
            value: markAsNative(() => '[object External]', 'toString'),
            configurable: true,
            enumerable: false
          });
          return fakeExternal;
        })();
        const isData = desc && Object.prototype.hasOwnProperty.call(desc, 'value') && !desc.get && !desc.set;
        if (isData) {
          Object.defineProperty(target, 'external', {
            value: externalObj,
            writable: !!desc.writable,
            configurable: !!desc.configurable,
            enumerable: !!desc.enumerable
          });
        } else {
          Object.defineProperty(target, 'external', {
            get: markAsNative(() => externalObj, "get external"),
            set: desc && desc.set,
            configurable: desc ? !!desc.configurable : true,
            enumerable: desc ? !!desc.enumerable : false
          });
        }
      }
    }
  } catch (e) {
    if (typeof __DEGRADE__ === "function") __DEGRADE__("hide_webdriver.js:external_patch:define_failed", e);
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
    const wrap = (typeof window.__wrapNativeApply === 'function') ? window.__wrapNativeApply : null;
    if (typeof wrap !== 'function') {
      throw new Error('[HideWebdriverPatchModule] __wrapNativeApply missing');
    }
    if (typeof nativeFn !== 'function') {
      throw new TypeError('[HideWebdriverPatchModule] wrapNative: nativeFn must be function');
    }
    if (typeof implFn !== 'function') {
      throw new TypeError('[HideWebdriverPatchModule] wrapNative: implFn must be function');
    }
    return wrap(nativeFn, name, function(_nativeFn, thisArg, args) {
      return implFn.apply(thisArg, args);
    });
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
