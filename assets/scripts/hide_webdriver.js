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

  // Single Proxy for Function.prototype.toString, reading from the general WeakMap
  if (!window.__TOSTRING_PROXY_INSTALLED__) {
    Function.prototype.toString = new Proxy(nativeToString, {
      apply(target, thisArg, args) {
        if (toStringOverrideMap.has(thisArg)) {
          return toStringOverrideMap.get(thisArg);
        }
        return target.apply(thisArg, args);
      }
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

  // Object.getOwnPropertyDescriptor
  Object.getOwnPropertyDescriptor = new Proxy(nativeGetOwnProp, {
    apply(target, thisArg, args) {
      if (args[0] === navigator && args[1] === 'webdriver') return undefined;
      return target.apply(thisArg, args);
    }
  });

  // Reflect.has
  Reflect.has = new Proxy(Reflect.has, {
    apply(target, thisArg, args) {
      if (args[0] === navigator && args[1] === 'webdriver') return false;
      return target.apply(thisArg, args);
    }
  });

  // Object.hasOwn
  const realHasOwn = Object.hasOwn;
  Object.hasOwn = new Proxy(realHasOwn, {
    apply(target, thisArg, args) {
      if (args[0] === navigator && args[1] === "webdriver") return false;
      return target.apply(thisArg, args);
    }
  });
}