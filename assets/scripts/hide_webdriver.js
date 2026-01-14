function HideWebdriverPatchModule() {

  function safeDefine(obj, prop, descriptor) {
    try {
      if (!obj || typeof obj !== 'object') return;
      if (Object.prototype.hasOwnProperty.call(obj, prop)) delete obj[prop];
      Object.defineProperty(obj, prop, descriptor);
    } catch (e) {
      console.warn(`[stealth] safeDefine failed for ${prop}:`, e);
    }
  }

  // ——— Global mask "native" + general WeakMap ———
  const nativeToString = Function.prototype.toString;
  const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
  const nativeReflectHas = Reflect.has;
  const nativeHasOwn = Object.hasOwn;
  const toStringDesc = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
  const getOwnPropDesc = Object.getOwnPropertyDescriptor(Object, 'getOwnPropertyDescriptor');
  const reflectHasDesc = Object.getOwnPropertyDescriptor(Reflect, 'has');
  const hasOwnDesc = Object.getOwnPropertyDescriptor(Object, 'hasOwn');
  let toStringDepth = 0;

  // general WeakMap, available to all modules
  const toStringOverrideMap = (window.__NativeToStringMap =
    window.__NativeToStringMap || new WeakMap());

  // Unified global function-mask
  function markAsNative(func, name = "") {
    try {
      const n = name || func.name || "";
      toStringOverrideMap.set(func, `function ${n}() { [native code] }`);
    } catch (_) {}
    return func;
  }
  if (!window.markAsNative) window.markAsNative = markAsNative;

  // compatibility with the old name (do not change the structure of the calls below)
  function fakeNative(func, name = "") { return markAsNative(func, name); }

  // Single override for Function.prototype.toString, reading from the general WeakMap
  if (!window.__TOSTRING_PROXY_INSTALLED__) {
    if (!toStringDesc) throw new Error('[stealth] Function.prototype.toString descriptor missing');
    const wrappedToString = markAsNative(({ toString() {
      if (toStringDepth) return Reflect.apply(nativeToString, this, arguments);
      toStringDepth++;
      try {
        if (toStringOverrideMap.has(this)) return toStringOverrideMap.get(this);
        return Reflect.apply(nativeToString, this, arguments);
      } finally {
        toStringDepth--;
      }
    } }).toString, 'toString');
    Object.defineProperty(Function.prototype, 'toString', {
      configurable: toStringDesc.configurable,
      enumerable: toStringDesc.enumerable,
      writable: toStringDesc.writable,
      value: wrappedToString
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
  try {
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
    } else {
  //    console.info("[stealth] window.chrome защищён (configurable: false), патч невозможен");
    }
  } catch (e) {
    console.warn("[stealth] chrome.runtime patch failed:", e);
  }

  const proto = Navigator.prototype;

  // navigator.webdriver → undefined
  safeDefine(proto, 'webdriver', {
    get: fakeNative(() => undefined, "get webdriver"),
    configurable: true,
    enumerable: false
  });

  if (!getOwnPropDesc) throw new Error('[stealth] Object.getOwnPropertyDescriptor descriptor missing');
  const wrappedGetOwnProp = markAsNative(({ getOwnPropertyDescriptor(target, prop) {
    if (target === navigator && prop === 'webdriver') return undefined;
    return Reflect.apply(nativeGetOwnProp, Object, [target, prop]);
  } }).getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
  Object.defineProperty(Object, 'getOwnPropertyDescriptor', {
    configurable: getOwnPropDesc.configurable,
    enumerable: getOwnPropDesc.enumerable,
    writable: getOwnPropDesc.writable,
    value: wrappedGetOwnProp
  });

  if (!reflectHasDesc) throw new Error('[stealth] Reflect.has descriptor missing');
  const wrappedReflectHas = markAsNative(({ has(target, prop) {
    if (target === navigator && prop === 'webdriver') return false;
    return Reflect.apply(nativeReflectHas, Reflect, [target, prop]);
  } }).has, 'has');
  Object.defineProperty(Reflect, 'has', {
    configurable: reflectHasDesc.configurable,
    enumerable: reflectHasDesc.enumerable,
    writable: reflectHasDesc.writable,
    value: wrappedReflectHas
  });

  if (!hasOwnDesc) throw new Error('[stealth] Object.hasOwn descriptor missing');
  const wrappedHasOwn = markAsNative(({ hasOwn(target, prop) {
    if (target === navigator && prop === "webdriver") return false;
    return Reflect.apply(nativeHasOwn, Object, [target, prop]);
  } }).hasOwn, 'hasOwn');
  Object.defineProperty(Object, 'hasOwn', {
    configurable: hasOwnDesc.configurable,
    enumerable: hasOwnDesc.enumerable,
    writable: hasOwnDesc.writable,
    value: wrappedHasOwn
  });
}
