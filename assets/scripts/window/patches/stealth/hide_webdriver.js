const HideWebdriverPatchModule = function HideWebdriverPatchModule(window) {  
  if (window && window.__HIDE_WEBDRIVER_READY__) return;

  const C = window.CanvasPatchContext;
      if (!C) throw new Error('[HideWebdriverPatchModule] CanvasPatchContext is undefined — module registration is not available');
  const G = (typeof globalThis !== 'undefined' && globalThis)
        || (typeof self       !== 'undefined' && self)
        || (typeof window     !== 'undefined' && window)
        || (typeof global     !== 'undefined' && global)
        || {};
  
  // // --- nativization provider  ---
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


  // navigator.webdriver → spoof value without global patching:
  // - do not patch Object.getOwnPropertyDescriptor / Reflect.has globally (descriptor invariants)
  // - do not introduce Navigator.prototype.webdriver if it doesn't exist anywhere in the chain
  // - preserve descriptor flags when possible
  const nav = navigator;
  let wdTarget = null;
  let wdDesc = null;
  try {
    let cur = nav;
    while (cur) {
      const d = nativeGetOwnProp(cur, 'webdriver');
      if (d) { wdTarget = cur; wdDesc = d; break; }
      cur = Object.getPrototypeOf(cur);
    }
  } catch (_) {}

  if (wdDesc && wdDesc.configurable === false) {
    throw new TypeError('[HideWebdriverPatchModule] webdriver non-configurable');
  }
  if (wdTarget) {
    const getWebdriver = Object.getOwnPropertyDescriptor(({ get webdriver() {
      // keep native-like brand-check semantics
      if (this !== nav && this !== wdTarget) {
        throw new TypeError();
      }
      return false;
    }}), 'webdriver').get;
    safeDefine(wdTarget, 'webdriver', {
      get: markAsNative(getWebdriver, "get webdriver"),
      set: wdDesc && wdDesc.set,
      configurable: wdDesc ? !!wdDesc.configurable : true,
      enumerable: wdDesc ? !!wdDesc.enumerable : false
    });
  }

  safeDefine(window, '__HIDE_WEBDRIVER_READY__', {
    value: true,
    writable: true,
    configurable: true,
    enumerable: false
  });
}
