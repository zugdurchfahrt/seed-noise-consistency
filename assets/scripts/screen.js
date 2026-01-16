function ScreenPatchModule() {
  if (!window.__PATCH_SCREEN__) {
  window.__PATCH_SCREEN__ = true;
  
  const C = window.CanvasPatchContext;
  if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
    
  const SCREEN_WIDTH  = window.__WIDTH;
  const SCREEN_HEIGHT = window.__HEIGHT;
  const COLOR_DEPTH   = window.__COLOR_DEPTH;
  const DPR           = Number(window.__DPR);
  
  function safeDefine(obj, prop, descriptor) {
    try {
      if (!obj || typeof obj !== 'object') return;
      if (Object.prototype.hasOwnProperty.call(obj, prop)) delete obj[prop];
      Object.defineProperty(obj, prop, descriptor);
    } catch (e) {
      console.warn(`[Screen] safeDefine failed for ${prop}:`, e);
    }
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
    const getFn = (typeof getterOrValue === 'function')
      ? makeNamedGetter(prop, getterOrValue)
      : makeNamedGetter(prop, function(){ return getterOrValue; });
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
      const origMatchesGet = matchesDesc.get;
      Object.defineProperty(mqlProto, 'matches', {
        get: function matches() {
          if (mqlMatches.has(this)) return mqlMatches.get(this);
          return origMatchesGet.call(this);
        },
        set: matchesDesc.set,
        configurable: matchesDesc.configurable,
        enumerable: matchesDesc.enumerable
      });
    }
  }

  const origMatchMedia = window.matchMedia;
  window.matchMedia = function (query) {
    let matches = true;

    
    const deviceW = query.match(/\(device-width:\s*(\d+)px\)/);
    if (deviceW) matches = matches && SCREEN_WIDTH === parseInt(deviceW[1], 10);

    const deviceH = query.match(/\(device-height:\s*(\d+)px\)/);
    if (deviceH) matches = matches && SCREEN_HEIGHT === parseInt(deviceH[1], 10);
    
    const maxW = query.match(/\(max-width:\s*(\d+)px\)/);
    if (maxW) matches = matches && SCREEN_WIDTH <= parseInt(maxW[1], 10);
    const minW = query.match(/\(min-width:\s*(\d+)px\)/);
    if (minW) matches = matches && SCREEN_WIDTH >= parseInt(minW[1], 10);
    const maxH = query.match(/\(max-height:\s*(\d+)px\)/);
    if (maxH) matches = matches && SCREEN_HEIGHT <= parseInt(maxH[1], 10);
    const minH = query.match(/\(min-height:\s*(\d+)px\)/);
    if (minH) matches = matches && SCREEN_HEIGHT >= parseInt(minH[1], 10);

    // aspect-ratio safe
    const aspectRatio = query.match(/\(aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (aspectRatio && typeof SCREEN_WIDTH === 'number' && typeof SCREEN_HEIGHT === 'number') {
      const wInt = parseInt(aspectRatio[1], 10);
      const hInt = parseInt(aspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt === SCREEN_HEIGHT * wInt);
    } else if (aspectRatio) {
      matches = false;
    }
    const maxAspectRatio = query.match(/\(max-aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (maxAspectRatio) {
      const wInt = parseInt(maxAspectRatio[1], 10);
      const hInt = parseInt(maxAspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt <= SCREEN_HEIGHT * wInt);
    }
    const minAspectRatio = query.match(/\(min-aspect-ratio:\s*(\d+)\/(\d+)\)/);
    if (minAspectRatio) {
      const wInt = parseInt(minAspectRatio[1], 10);
      const hInt = parseInt(minAspectRatio[2], 10);
      matches = matches && (SCREEN_WIDTH * hInt >= SCREEN_HEIGHT * wInt);
    }

    const orientation = query.match(/\(orientation:\s*(portrait|landscape)\)/);
    if (orientation) {
      const actual = (SCREEN_WIDTH > SCREEN_HEIGHT) ? "landscape" : "portrait";
      matches = matches && actual === orientation[1];
    }
    const actualOrientationDom = (SCREEN_WIDTH > SCREEN_HEIGHT) ? "landscape-primary" : "portrait-primary";
    window.__ORIENTATION = actualOrientationDom;

    const color = query.match(/\(color:\s*(\d+)\)/);
    if (color) {
      matches = matches && COLOR_DEPTH === parseInt(color[1], 10);
    }

    const resolution = query.match(/\(resolution:\s*(\d+)dpi\)/);
    if (resolution) {
      const dpi = 96 * DPR;
      matches = matches && dpi === parseInt(resolution[1], 10);
    }

    const mql = origMatchMedia.call(this, query);
    if (mql && (typeof mql === 'object' || typeof mql === 'function')) {
      try { mqlMatches.set(mql, matches); } catch {}
    }
    return mql;
  };

  //  screen и orientation ──
  const screenObj = window.screen;
  const screenProto = screenObj && Object.getPrototypeOf(screenObj);
  if (screenObj && screenProto && screenProto !== Object.prototype) {
    const setScreen = (k, get) => {
      const target = chooseTarget(screenObj, screenProto, k);
      if (!target) throw new Error(`[Screen] ${k} descriptor missing`);
      redefineProp(target, k, get);
    };
    try { setScreen('width', () => SCREEN_WIDTH); } catch (e) { console.warn('[Screen] width redefine failed:', e); }
    try { setScreen('height', () => SCREEN_HEIGHT); } catch (e) { console.warn('[Screen] height redefine failed:', e); }
    try { setScreen('availWidth', () => SCREEN_WIDTH); } catch (e) { console.warn('[Screen] availWidth redefine failed:', e); }
    try { setScreen('availHeight', () => SCREEN_HEIGHT); } catch (e) { console.warn('[Screen] availHeight redefine failed:', e); }
    try { setScreen('colorDepth', () => COLOR_DEPTH); } catch (e) { console.warn('[Screen] colorDepth redefine failed:', e); }
    try { setScreen('pixelDepth', () => COLOR_DEPTH); } catch (e) { console.warn('[Screen] pixelDepth redefine failed:', e); }
    try { setScreen('availLeft', () => 0); } catch (e) { console.warn('[Screen] availLeft redefine failed:', e); }
    try { setScreen('availTop', () => 0); } catch (e) { console.warn('[Screen] availTop redefine failed:', e); }
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
    catch (e) { console.warn('[Screen] orientation.type redefine failed:', e); }
    try { setOrientation('angle', () => 0); }
    catch (e) { console.warn('[Screen] orientation.angle redefine failed:', e); }
  }

  // inner/outerWidth/Height
  ["innerWidth", "innerHeight", "outerWidth", "outerHeight"].forEach(prop => {
    safeDefine(window, prop, {
      get: () => (prop.endsWith("Width") ? SCREEN_WIDTH : SCREEN_HEIGHT),
      configurable: true,
      enumerable: true
    });
  });

  //  visualViewport 
  if (window.visualViewport) {
    safeDefine(window.visualViewport, "width", {
      get: () => SCREEN_WIDTH,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "height", {
      get: () => SCREEN_HEIGHT,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "offsetLeft", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "offsetTop", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
    //  viewport:
    safeDefine(window.visualViewport, "scale", {
      get: () => 1,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "pageLeft", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
    safeDefine(window.visualViewport, "pageTop", {
      get: () => 0,
      configurable: true,
      enumerable: true
    });
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
    console.log("[Screen] patched screen/viewport:", {
      html:   { width:  document.documentElement.clientWidth,  height: document.documentElement.clientHeight },
      window: { width:  window.innerWidth,  height: window.innerHeight },
      screen: { width:  window.screen.width,  height: window.screen.height }
    });
  });

  // log after DOM ready for document & div
  document.addEventListener("DOMContentLoaded", () => {
    console.log("[Screen] document & div client sizes →", {
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
  
  console.log('[Screen] patches applied');
  } 
}
  
