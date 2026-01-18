function HideWebdriverPatchModule() {

  function safeDefine(obj, prop, descriptor) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
    const d = Object.getOwnPropertyDescriptor(obj, prop);
    if (d && d.configurable === false) {
      throw new TypeError(`[stealth] ${prop} non-configurable`);
    }
    if (Object.prototype.hasOwnProperty.call(obj, prop)) delete obj[prop];
    Object.defineProperty(obj, prop, descriptor);
  }

  // ——— Global mask "native" + general WeakMap ———
  const nativeToString = window.__NativeToString || Function.prototype.toString;
  window.__NativeToString = nativeToString;
  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;

  // general WeakMap, available to all modules
  const toStringOverrideMap = (window.__NativeToStringMap instanceof WeakMap)
    ? window.__NativeToStringMap
    : new WeakMap();
  window.__NativeToStringMap = toStringOverrideMap;

  // Unified global function-mask
  function baseMarkAsNative(func, name = "") {
    if (typeof func !== 'function') return func;
    try {
      const n = name || func.name || "";
      const label = n ? `function ${n}() { [native code] }` : 'function () { [native code] }';
      toStringOverrideMap.set(func, label);
    } catch (_) {}
    return func;
  }
  function ensureMarkAsNative() {
    const existing = (typeof window.markAsNative === 'function') ? window.markAsNative : null;
    if (!existing) {
      baseMarkAsNative.__TOSTRING_BRIDGE__ = true;
      window.markAsNative = baseMarkAsNative;
      return baseMarkAsNative;
    }
    if (existing.__TOSTRING_BRIDGE__) return existing;
    const wrapped = function markAsNative(func, name = "") {
      const out = existing(func, name);
      return baseMarkAsNative(out, name);
    };
    wrapped.__TOSTRING_BRIDGE__ = true;
    window.markAsNative = wrapped;
    return wrapped;
  }
  if (!window.__ensureMarkAsNative) window.__ensureMarkAsNative = ensureMarkAsNative;
  const markAsNative = ensureMarkAsNative();

  // compatibility with the old name (do not change the structure of the calls below)
  function fakeNative(func, name = "") { return markAsNative(func, name); }

  // Single wrapper for Function.prototype.toString, reading from the general WeakMap
  if (!window.__TOSTRING_PROXY_INSTALLED__) {
    const toStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
    const toString = ({ toString() {
      // IMPORTANT: do not touch WeakMap for primitives/null/undefined
      const t = typeof this;
      const isObj = (this !== null) && (t === 'function' || t === 'object');

      if (isObj) {
        const v = toStringOverrideMap.get(this);
        if (v !== undefined) return v;
      }
      // preserve native TypeError + semantics
      return nativeToString.call(this);
    } }).toString;

    // make wrapper look native via the same mechanism
    markAsNative(toString, 'toString');

    Object.defineProperty(Function.prototype, 'toString', {
      value: toString,
      writable: toStringDesc ? !!toStringDesc.writable : true,
      configurable: toStringDesc ? !!toStringDesc.configurable : true,
      enumerable: toStringDesc ? !!toStringDesc.enumerable : false
    });
    window.__TOSTRING_PROXY_INSTALLED__ = true;
  }


  // window.external protection
  try {
    Object.defineProperty(window, 'external', {
      get: fakeNative(() => {
        const fakeExternal = {};
        Object.defineProperty(fakeExternal, 'toString', {
          value: fakeNative(() => '[object External]', 'toString'),
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
  }

  //  chrome.runtime protection -may not work in chrome
  const desc = Object.getOwnPropertyDescriptor(window, "chrome");

  if (!desc) {
    Object.defineProperty(window, 'chrome', {
      get: fakeNative(() => ({}), 'get chrome'),
      configurable: true
    });
  } else if (desc.configurable) {
    const chromeProxy = new Proxy(window.chrome, {
      get(target, prop) {
        if (prop === 'runtime' || prop === 'loadTimes') return undefined;
        return Reflect.get(target, prop);
      },
      has(target, prop) {
        if (prop === 'runtime' || prop === 'loadTimes') return false;
        return prop in target;
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === 'runtime' || prop === 'loadTimes') return undefined;
        return Object.getOwnPropertyDescriptor(target, prop);
      }
    });

    Object.defineProperty(window, 'chrome', {
      get: fakeNative(() => chromeProxy, 'get chrome'),
      configurable: true
    });
  }

  const proto = Navigator.prototype;

  // navigator.webdriver → undefined
  safeDefine(proto, 'webdriver', {
    get: fakeNative(() => undefined, "get webdriver"),
    configurable: true,
    enumerable: false
  });

  // Object.getOwnPropertyDescriptor
  Object.getOwnPropertyDescriptor = (function(nativeGOPD){
    function getOwnPropertyDescriptor(obj, prop) {
      if ((obj === navigator || obj === Navigator.prototype) && prop === 'webdriver') return undefined;
      return nativeGOPD(obj, prop);
    }
    markAsNative(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
    return getOwnPropertyDescriptor;
  })(nativeGetOwnProp);

  // Reflect.has
  Reflect.has = (function(nativeHas){
    function has(target, prop) {
      if (target === navigator && prop === 'webdriver') return false;
      return nativeHas(target, prop);
    }
    markAsNative(has, 'has');
    return has;
  })(Reflect.has);

  // Object.hasOwn
  const realHasOwn = Object.hasOwn;
  Object.hasOwn = (function(nativeHasOwn){
    function hasOwn(obj, prop) {
      if (obj === navigator && prop === 'webdriver') return false;
      return nativeHasOwn(obj, prop);
    }
    markAsNative(hasOwn, 'hasOwn');
    return hasOwn;
  })(realHasOwn);
}
