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
    return {
      matches: matches,
      media: mql.media,
      onchange: null,
      addListener: mql.addListener ? mql.addListener.bind(mql) : () => {},
      removeListener: mql.removeListener ? mql.removeListener.bind(mql) : () => {},
      addEventListener: mql.addEventListener ? mql.addEventListener.bind(mql) : () => {},
      removeEventListener: mql.removeEventListener ? mql.removeEventListener.bind(mql) : () => {},
      dispatchEvent: mql.dispatchEvent ? mql.dispatchEvent.bind(mql) : () => false
    };
  };

  //  screen и orientation ──
  const orientationObj = {};
  safeDefine(orientationObj, "type", {
    get: () => (SCREEN_WIDTH > SCREEN_HEIGHT ? "landscape-primary" : "portrait-primary"),
    configurable: true,
    enumerable: true
  });
  safeDefine(orientationObj, "angle", {
    get: () => 0,
    configurable: true,
    enumerable: true
  });

  const screenObj = {
    width:       SCREEN_WIDTH,
    height:      SCREEN_HEIGHT,
    availWidth:  SCREEN_WIDTH,
    availHeight: SCREEN_HEIGHT,
    availLeft:   0,
    availTop:    0,
    colorDepth:  COLOR_DEPTH,
    pixelDepth:  COLOR_DEPTH,
    orientation: orientationObj
  };
  safeDefine(window, "screen", {
    get: () => screenObj,
    configurable: true,
    enumerable: true
  });

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
  safeDefine(Element.prototype, 'clientWidth', {
    get: () => SCREEN_WIDTH,
    configurable: true,
    enumerable: true
  });
  safeDefine(Element.prototype, 'clientHeight', {
    get: () => SCREEN_HEIGHT,
    configurable: true,
    enumerable: true
  });



  document.addEventListener("DOMContentLoaded", () => {
    console.log("[Screen] patched screen/viewport:", {
      html:   { width:  document.documentElement.clientWidth,  height: document.documentElement.clientHeight },
      window: { width:  window.innerWidth,  height: window.innerHeight },
      screen: { width:  window.screen.width,  height: window.screen.height }
    });
  });

  // clientWidth/Height for HTMLElement.prototype
  safeDefine(HTMLElement.prototype, "clientWidth", {
    get: () => SCREEN_WIDTH, configurable: true, enumerable: true
  });
  safeDefine(HTMLElement.prototype, "clientHeight", {
    get: () => SCREEN_HEIGHT, configurable: true, enumerable: true
  });

  // —————— Document/client patch ——————
  // 1) <html>
  safeDefine(document.documentElement, "clientWidth", {
    get: () => SCREEN_WIDTH, configurable: true, enumerable: true
  });
  safeDefine(document.documentElement, "clientHeight", {
    get: () => SCREEN_HEIGHT, configurable: true, enumerable: true
  });

  // 2) all <div>
  safeDefine(HTMLDivElement.prototype, "clientWidth", {
    get: () => SCREEN_WIDTH, configurable: true, enumerable: true
  });
  safeDefine(HTMLDivElement.prototype, "clientHeight", {
    get: () => SCREEN_HEIGHT, configurable: true, enumerable: true
  });

  // 3) log after DOM ready for document & div
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
  
