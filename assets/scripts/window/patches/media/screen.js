const ScreenPatchModule = function ScreenPatchModule(window) {
  if (!window.__PATCH_SCREEN__) {
  
  const C = window.CanvasPatchContext;
  if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
    
  const SCREEN_WIDTH  = Number(window.__WIDTH);
  const SCREEN_HEIGHT = Number(window.__HEIGHT);
  const COLOR_DEPTH   = Number(window.__COLOR_DEPTH);
  const DPR           = Number(window.__DPR);

  const __screenDegrade = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  const __screenLogArr = Array.isArray(window._myDebugLog) ? window._myDebugLog : null;
  function __screenDiag(level, code, extra, err) {
    if ((level === 'warn' || level === 'error') && typeof __screenDegrade === 'function') {
      __screenDegrade(code || 'screen', err || null, extra || null);
      return;
    }
    try {
      if (__screenLogArr) {
        __screenLogArr.push({
          type: 'screen_' + level,
          code: code || null,
          extra: extra || null,
          error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack || null } : null,
          timestamp: new Date().toISOString()
        });
      }
    } catch (_) {}
  }

  if (!Number.isFinite(SCREEN_WIDTH) || !Number.isFinite(SCREEN_HEIGHT)) {
    throw new Error('[Screen] bad width/height');
  }
  if (!Number.isFinite(COLOR_DEPTH)) {
    throw new Error('[Screen] bad colorDepth');
  }
  if (!Number.isFinite(DPR) || DPR <= 0) {
    throw new Error('[Screen] bad dpr');
  }

  const __wrapNativeApply = window.__wrapNativeApply;
  const __wrapNativeAccessor = window.__wrapNativeAccessor;
  if (typeof __wrapNativeApply !== 'function' || typeof __wrapNativeAccessor !== 'function') {
    throw new Error('[Screen] core wrappers missing');
  }
  const __corePreflightTarget = (window.Core && typeof window.Core.preflightTarget === 'function')
    ? window.Core.preflightTarget
    : null;
  function ensurePreflight(owner, key, kind, diagTag) {
    if (typeof __corePreflightTarget !== 'function') return;
    const pre = __corePreflightTarget({
      owner,
      key,
      kind,
      policy: 'throw',
      diagTag
    });
    if (!pre || pre.ok !== true) {
      const err = (pre && pre.error instanceof Error) ? pre.error : new Error(`[Screen] preflight failed for ${String(key)}`);
      const reason = pre && pre.reason ? pre.reason : 'preflight_failed';
      __screenDiag('warn', `${diagTag}:${reason}`, { key, kind }, err);
      throw err;
    }
  }
  
  function safeDefine(obj, prop, descriptor) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
    const d = Object.getOwnPropertyDescriptor(obj, prop);
    if (d && d.configurable === false) {
      throw new TypeError(`[Screen] ${prop} non-configurable`);
    }
    if (Object.prototype.hasOwnProperty.call(obj, prop)) delete obj[prop];
    Object.defineProperty(obj, prop, descriptor);
  }
  function makeNamedGetter(prop, getter) {
    if (typeof getter === 'function' && getter.name) return getter;
    const acc = ({ get [prop]() { return getter.call(this); } });
    return Object.getOwnPropertyDescriptor(acc, prop).get;
  }
  function redefineProp(target, prop, getterOrValue) {
    const d = Object.getOwnPropertyDescriptor(target, prop);
    if (!d) throw new Error(`[Screen] ${prop} descriptor missing`);
    if (d.configurable === false) throw new Error(`[Screen] ${prop} non-configurable`);
    const isData = Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
    const kind = isData
      ? ((typeof d.value === 'function' && typeof getterOrValue === 'function') ? 'method' : 'data')
      : 'accessor';
    ensurePreflight(target, prop, kind, 'screen:redefineProp');
    if (isData) {
      const value = (typeof getterOrValue === 'function') ? getterOrValue.call(target) : getterOrValue;
      Object.defineProperty(target, prop, {
        value,
        writable: !!d.writable,
        configurable: !!d.configurable,
        enumerable: !!d.enumerable
      });
      return;
    }
    if (typeof d.get !== 'function') throw new Error(`[Screen] ${prop} getter missing`);
    const origGet = d.get;
    const getFn = __wrapNativeAccessor(origGet, origGet.name || '', (targetGet, thisArg, argList) => {
      try {
        const ctor = target && target.constructor;
        const isProto = !!(typeof ctor === 'function' && ctor.prototype === target);
        const ok = isProto
          ? (target && typeof target.isPrototypeOf === 'function' && target.isPrototypeOf(thisArg))
          : ((thisArg === target) || (target && typeof target.isPrototypeOf === 'function' && target.isPrototypeOf(thisArg)));
        if (!ok) {
          return Reflect.apply(targetGet, thisArg, argList);
        }
      } catch (_) {
        // If guard fails for any reason, fall back to native semantics.
        return Reflect.apply(targetGet, thisArg, argList);
      }

      if (typeof getterOrValue === 'function') {
        return getterOrValue.call(thisArg);
      }
      return getterOrValue;
    });
    Object.defineProperty(target, prop, {
      get: getFn,
      set: d.set,
      configurable: d.configurable,
      enumerable: d.enumerable
    });
  }
  function chooseTarget(obj, proto, prop) {
    if (obj && Object.getOwnPropertyDescriptor(obj, prop)) return obj;
    if (proto && Object.getOwnPropertyDescriptor(proto, prop)) return proto;
    return null;
  }

  const mqlMatches = new WeakMap();
  const mqlProto = (typeof MediaQueryList !== 'undefined' && MediaQueryList.prototype) ? MediaQueryList.prototype : null;
  if (mqlProto) {
    const matchesDesc = Object.getOwnPropertyDescriptor(mqlProto, 'matches');
    if (matchesDesc && typeof matchesDesc.get === 'function' && matchesDesc.configurable) {
      ensurePreflight(mqlProto, 'matches', 'accessor', 'screen:mql_matches');
      const origMatchesGet = matchesDesc.get;
      Object.defineProperty(mqlProto, 'matches', {
        get: __wrapNativeAccessor(origMatchesGet, origMatchesGet.name || '', (target, thisArg, argList) => {
          if (mqlMatches.has(thisArg)) return mqlMatches.get(thisArg);
          return Reflect.apply(target, thisArg, argList);
        }),
        set: matchesDesc.set,
        configurable: matchesDesc.configurable,
        enumerable: matchesDesc.enumerable
      });
    }
  }

  const origMatchMedia = window.matchMedia;
  const mmTarget = chooseTarget(window, Object.getPrototypeOf(window), 'matchMedia');
  if (!mmTarget) throw new Error(`[Screen] matchMedia descriptor missing`);
  const isWindowThis = (self) => {
    try { return self === window || (typeof Window === 'function' && self instanceof Window); }
    catch (_) { return false; }
  };
  const patchedMatchMedia = __wrapNativeApply(origMatchMedia, 'matchMedia', (target, thisArg, argList) => {
    let query = (argList && argList.length) ? argList[0] : undefined;
    if (!isWindowThis(thisArg)) return Reflect.apply(target, thisArg, argList);
    query = String(query);
    let matches = true;
    const isTrashQuery = (query.length > 1024 || /[\u0000-\u001F]/.test(query));
    if (isTrashQuery) matches = false;
    const q = query.toLowerCase().replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s*:\s*/g, ':');
    let touched = false;

    
    const deviceW = q.match(/\(device-width:\s*(\d+)px\)/);
    if (deviceW) { touched = true; matches = matches && SCREEN_WIDTH === parseInt(deviceW[1], 10); }

    const deviceH = q.match(/\(device-height:\s*(\d+)px\)/);
    if (deviceH) { touched = true; matches = matches && SCREEN_HEIGHT === parseInt(deviceH[1], 10); }
    
    const maxW = q.match(/\(max-width:\s*(\d+)px\)/);
    if (maxW) { touched = true; matches = matches && SCREEN_WIDTH <= parseInt(maxW[1], 10); }
    const minW = q.match(/\(min-width:\s*(\d+)px\)/);
    if (minW) { touched = true; matches = matches && SCREEN_WIDTH >= parseInt(minW[1], 10); }
    const maxH = q.match(/\(max-height:\s*(\d+)px\)/);
    if (maxH) { touched = true; matches = matches && SCREEN_HEIGHT <= parseInt(maxH[1], 10); }
    const minH = q.match(/\(min-height:\s*(\d+)px\)/);
    if (minH) { touched = true; matches = matches && SCREEN_HEIGHT >= parseInt(minH[1], 10); }

    // aspect-ratio safe
    const aspectRatio = q.match(/\(aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (aspectRatio && typeof SCREEN_WIDTH === 'number' && typeof SCREEN_HEIGHT === 'number') {
      touched = true;
      const wInt = parseInt(aspectRatio[1], 10);
      const hInt = parseInt(aspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt === SCREEN_HEIGHT * wInt);
    } else if (aspectRatio) {
      touched = true;
      matches = false;
    }
    const maxAspectRatio = q.match(/\(max-aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (maxAspectRatio) {
      touched = true;
      const wInt = parseInt(maxAspectRatio[1], 10);
      const hInt = parseInt(maxAspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt <= SCREEN_HEIGHT * wInt);
    }
    const minAspectRatio = q.match(/\(min-aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (minAspectRatio) {
      touched = true;
      const wInt = parseInt(minAspectRatio[1], 10);
      const hInt = parseInt(minAspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt >= SCREEN_HEIGHT * wInt);
    }

    const orientation = q.match(/\(orientation:\s*(portrait|landscape)\)/);
    if (orientation) {
      touched = true;
      const actual = (SCREEN_WIDTH > SCREEN_HEIGHT) ? "landscape" : "portrait";
      matches = matches && actual === orientation[1];
    }
    const actualOrientationDom = (SCREEN_WIDTH > SCREEN_HEIGHT) ? "landscape-primary" : "portrait-primary";
    window.__ORIENTATION = actualOrientationDom;

    const color = q.match(/\(color:\s*(\d+)\)/);
    if (color) {
      touched = true;
      matches = matches && COLOR_DEPTH === parseInt(color[1], 10);
    }

    const resolution = q.match(/\(resolution:\s*(\d+)dpi\)/);
    if (resolution) {
      touched = true;
      const dpi = 96 * DPR;
      matches = matches && dpi === parseInt(resolution[1], 10);
    }

    const mql = Reflect.apply(target, thisArg, [query]);
    if (mql && (typeof mql === 'object' || typeof mql === 'function')) {
      try {
        if (touched || isTrashQuery) mqlMatches.set(mql, matches);
      } catch {}
    }
    return mql;
  });
  redefineProp(mmTarget, 'matchMedia', () => patchedMatchMedia);

  //  screen и orientation ──
  const screenObj = window.screen;
  const screenProto = screenObj && Object.getPrototypeOf(screenObj);
  if (screenObj && screenProto && screenProto !== Object.prototype) {
    const setScreen = (k, get) => {
      const target = chooseTarget(screenObj, screenProto, k);
      if (!target) throw new Error(`[Screen] ${k} descriptor missing`);
      redefineProp(target, k, get);
    };
    setScreen('width', () => SCREEN_WIDTH);
    setScreen('height', () => SCREEN_HEIGHT);
    setScreen('availWidth', () => SCREEN_WIDTH);
    setScreen('availHeight', () => SCREEN_HEIGHT);
    setScreen('colorDepth', () => COLOR_DEPTH);
    setScreen('pixelDepth', () => COLOR_DEPTH);
    setScreen('availLeft', () => 0);
    setScreen('availTop', () => 0);
  }
  const orientationObj = screenObj && screenObj.orientation;
  const orientationProto = orientationObj && Object.getPrototypeOf(orientationObj);
  if (orientationObj && orientationProto && orientationProto !== Object.prototype) {
    const setOrientation = (k, get) => {
      const target = chooseTarget(orientationObj, orientationProto, k);
      if (!target) throw new Error(`[Screen] orientation.${k} descriptor missing`);
      redefineProp(target, k, get);
    };
    try { setOrientation('type', () => (SCREEN_WIDTH > SCREEN_HEIGHT ? "landscape-primary" : "portrait-primary")); }
    catch (e) { __screenDiag('warn', 'screen:orientation_type_redefine_failed', null, e); }
    try { setOrientation('angle', () => 0); }
    catch (e) { __screenDiag('warn', 'screen:orientation_angle_redefine_failed', null, e); }
  }

  // inner/outerWidth/Height
  ["innerWidth", "innerHeight", "outerWidth", "outerHeight"].forEach(prop => {
    const target = chooseTarget(window, Object.getPrototypeOf(window), prop);
    if (!target) throw new Error(`[Screen] ${prop} descriptor missing`);
    redefineProp(target, prop, () => (prop.endsWith("Width") ? SCREEN_WIDTH : SCREEN_HEIGHT));
  });

  //  visualViewport 
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const vvProto = vv && Object.getPrototypeOf(vv);
    const setVV = (k, get) => {
      const t = chooseTarget(vv, vvProto, k);
      if (!t) throw new Error(`[Screen] visualViewport.${k} descriptor missing`);
      redefineProp(t, k, get);
    };
    setVV('width', () => SCREEN_WIDTH);
    setVV('height', () => SCREEN_HEIGHT);
    setVV('offsetLeft', () => 0);
    setVV('offsetTop', () => 0);
    setVV('scale', () => 1);
    setVV('pageLeft', () => 0);
    setVV('pageTop', () => 0);
  }

  // — make screen serializable
  safeDefine(window.screen, "toJSON", {
    value: () => ({
      width:        SCREEN_WIDTH,
      height:       SCREEN_HEIGHT,
      availWidth:   SCREEN_WIDTH,
      availHeight:  SCREEN_HEIGHT,
      colorDepth:   COLOR_DEPTH,
      pixelDepth:   COLOR_DEPTH,
      devicePixelRatio: DPR
    }),
    writable:    false,
    enumerable:  false,
    configurable: true
  });

  // — make visualViewport serializable
  if (window.visualViewport) {
    safeDefine(window.visualViewport, "toJSON", {
      value: () => ({
        width:      SCREEN_WIDTH,
        height:     SCREEN_HEIGHT,
        scale:      window.visualViewport.scale,
        pageLeft:   window.visualViewport.pageLeft,
        pageTop:    window.visualViewport.pageTop
      }),
      writable:    false,
      enumerable:  false,
      configurable: true
    });
  }


  // clientWidth / clientHeight for <html> ──
  const clientWidthDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
  const origClientWidth = clientWidthDesc && clientWidthDesc.get;
  redefineProp(Element.prototype, 'clientWidth', function clientWidth() {
    if (this === document.documentElement || this === document.body) return SCREEN_WIDTH;
    if (typeof origClientWidth === 'function') return origClientWidth.call(this);
    return SCREEN_WIDTH;
  });
  const clientHeightDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
  const origClientHeight = clientHeightDesc && clientHeightDesc.get;
  redefineProp(Element.prototype, 'clientHeight', function clientHeight() {
    if (this === document.documentElement || this === document.body) return SCREEN_HEIGHT;
    if (typeof origClientHeight === 'function') return origClientHeight.call(this);
    return SCREEN_HEIGHT;
  });



  document.addEventListener("DOMContentLoaded", () => {
    __screenDiag('debug', 'screen:patched_viewport', {
      html:   { width:  document.documentElement.clientWidth,  height: document.documentElement.clientHeight },
      window: { width:  window.innerWidth,  height: window.innerHeight },
      screen: { width:  window.screen.width,  height: window.screen.height }
    });
  });

  // log after DOM ready for document & div
  document.addEventListener("DOMContentLoaded", () => {
    __screenDiag('debug', 'screen:document_div_client_sizes', {
      html: {
        width:  document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      },
      div: {
        width:  document.querySelector("div")?.clientWidth,
        height: document.querySelector("div")?.clientHeight
      }
    });
  });
  
  __screenDiag('info', 'screen:patches_applied');
  window.__PATCH_SCREEN__ = true;
  } 
}
  
