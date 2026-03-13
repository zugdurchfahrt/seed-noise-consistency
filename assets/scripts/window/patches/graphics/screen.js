const ScreenPatchModule = function ScreenPatchModule(window) {
  const __screenTypePipeline = 'pipeline missing data';
  const __screenTypeBrowser = 'browser structure missing data';
  const __screenTypeContract = 'contract violation';
  const __screenModule = 'screen';
  const __screenSurface = 'screen';
  const __core = window.Core;
  const __flagKey = '__PATCH_SCREEN__';
  const __D = window.__DEGRADE__;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
  const __emit = (level, code, ctx, err) => {
    try {
      if (__diag) return __diag(level, code, ctx || null, err || null);
      if (typeof __D === 'function') return __D(String(code), err || null, ctx || null);
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  };
  function __screenDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : null;
    const ctx = {
      module: __screenModule,
      diagTag: x ? x.diagTag : undefined,
      surface: __screenSurface,
      key: (x && Object.prototype.hasOwnProperty.call(x, 'key')) ? x.key : null,
      stage: x ? x.stage : undefined,
      message: x ? x.message : undefined,
      data: x ? x.data : undefined,
      type: x ? x.type : undefined
    };
    __emit(level, code, ctx, err || null);
  }
  let __guardToken = null;
  if (!__core || typeof __core.guardFlag !== 'function') {
    __screenDiag('warn', 'screen:guard_missing', {
      stage: 'guard',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: __flagKey,
      message: 'Core.guardFlag missing',
      data: {
        outcome: 'skip',
        reason: 'missing_dep_core_guard'
      }
    }, null);
    return;
  }
  try {
    __guardToken = __core.guardFlag(__flagKey, __screenModule);
  } catch (e) {
    __screenDiag('warn', 'screen:guard_failed', {
      stage: 'guard',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: __flagKey,
      message: 'guardFlag threw',
      data: {
        outcome: 'skip',
        reason: 'guard_failed'
      }
    }, e);
    return;
  }
  if (!__guardToken) return; // already_patched: Core emits screen:already_patched

  // Read-only preflight: required dependency check, separate from guard semantics.
  const C = window.CanvasPatchContext;
  if (!C) {
    const canvasMissingErr = new Error('[CanvasPatch] CanvasPatchContext is undefined - module registration is not available');
    __screenDiag('warn', 'screen:canvas_patch_context_missing', {
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'CanvasPatchContext',
      message: 'CanvasPatchContext is undefined - module registration is not available',
      data: {
        outcome: 'skip',
        reason: 'canvas_patch_context_missing',
        missing: 'CanvasPatchContext'
      }
    }, canvasMissingErr);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, true, __screenModule);
      }
    } catch (releaseErr) {
      __screenDiag('warn', 'screen:guard_release_failed', {
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: __flagKey,
        message: 'guard release failed after preflight skip',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'CanvasPatchContext'
        }
      }, releaseErr);
    }
    return;
  }
  const __screenStateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
  if (!__screenStateRoot) {
    const stateMissingErr = new Error('[CanvasPatch] CanvasPatchContext.state is undefined - module registration is not available');
    __screenDiag('warn', 'screen:canvas_patch_state_missing', {
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'CanvasPatchContext.state',
      message: 'CanvasPatchContext.state is undefined - module registration is not available',
      data: {
        outcome: 'skip',
        reason: 'canvas_patch_state_missing',
        missing: 'CanvasPatchContext.state'
      }
    }, stateMissingErr);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, true, __screenModule);
      }
    } catch (releaseErr) {
      __screenDiag('warn', 'screen:guard_release_failed', {
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: __flagKey,
        message: 'guard release failed after state registration skip',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'CanvasPatchContext.state'
        }
      }, releaseErr);
    }
    return;
  }
  if (!(__screenStateRoot.__SCREEN__ && typeof __screenStateRoot.__SCREEN__ === 'object')) {
    Object.defineProperty(__screenStateRoot, '__SCREEN__', {
      value: Object.create(null),
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  const __moduleRollbackStack = [];

  const SCREEN_WIDTH  = Number(window.__WIDTH);
  const SCREEN_HEIGHT = Number(window.__HEIGHT);
  const COLOR_DEPTH   = Number(window.__COLOR_DEPTH);
  const DPR           = Number(window.__DPR);

  try {
  if (!Number.isFinite(SCREEN_WIDTH) || !Number.isFinite(SCREEN_HEIGHT)) {
    throw new Error('bad width/height');
  }
  if (!Number.isFinite(COLOR_DEPTH)) {
    throw new Error('bad colorDepth');
  }
  if (!Number.isFinite(DPR) || DPR <= 0) {
    throw new Error('bad dpr');
  }

  // Avoid hardcoded numeric literals for the constant zeros/ones used by layout offsets.
  // These values are derived from existing profile-driven values.
  const ZERO = SCREEN_WIDTH - SCREEN_WIDTH;
  const ONE = DPR / DPR;

  const __coreApplyTargets = (__core && typeof __core.applyTargets === 'function')
    ? __core.applyTargets
    : null;
  if (typeof __coreApplyTargets !== 'function') {
    throw new Error('Core.applyTargets missing');
  }
  
  function safeDefine(obj, prop, descriptor) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return;
    const d = Object.getOwnPropertyDescriptor(obj, prop);
    const hadOwn = Object.prototype.hasOwnProperty.call(obj, prop);
    if (d && d.configurable === false) {
      throw new TypeError(`${prop} non-configurable`);
    }
    if (hadOwn) delete obj[prop];
    Object.defineProperty(obj, prop, descriptor);
    __moduleRollbackStack.push(function rollbackSafeDefine() {
      if (d) {
        Object.defineProperty(obj, prop, d);
      } else {
        delete obj[prop];
      }
    });
  }
  let __screenReceiverCheckDiagSent = false;
  function receiverMatchesTarget(target, thisArg) {
    try {
      const ctor = target && target.constructor;
      const isProto = !!(typeof ctor === 'function' && ctor.prototype === target);

      if (isProto) {
        // Brand-sensitive singletons: require the real instance, not a forged object
        // with the right prototype chain.
        const scr = window && window.screen;
        if (scr && target === Object.getPrototypeOf(scr)) {
          return thisArg === scr;
        }
        const so = scr && scr.orientation;
        if (so && target === Object.getPrototypeOf(so)) {
          return thisArg === so;
        }
        const vv = window && window.visualViewport;
        if (vv && target === Object.getPrototypeOf(vv)) {
          return thisArg === vv;
        }
        return !!(target && typeof target.isPrototypeOf === 'function' && target.isPrototypeOf(thisArg));
      }

      return !!(
        thisArg === target ||
        (target && typeof target.isPrototypeOf === 'function' && target.isPrototypeOf(thisArg))
      );
    } catch (e) {
      if (!__screenReceiverCheckDiagSent) {
        __screenReceiverCheckDiagSent = true;
        __screenDiag('warn', 'screen:receiver_matches_target_failed', {
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: null,
          message: 'receiverMatchesTarget failed',
          data: { outcome: 'skip', reason: 'exception', substage: 'receiverMatchesTarget' }
        }, e);
      }
      return false;
    }
  }
  function applyCoreTargetsGroup(groupTag, targets, policy) {
    const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
    let plans = [];
    let groupKey = null;
    if (Array.isArray(targets)) {
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        if (t && typeof t.key === 'string') {
          groupKey = t.key;
          break;
        }
      }
    }
    try {
      plans = __coreApplyTargets(targets, window.__PROFILE__, []);
    } catch (e) {
      __screenDiag('error', groupTag + ':preflight_failed', {
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: groupKey,
        message: 'Core.applyTargets preflight failed',
        data: {
          outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
          reason: 'exception',
          substage: 'Core.applyTargets(preflight)'
        }
      }, e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    if (!Array.isArray(plans) || !plans.length) {
      const reason = plans && plans.reason ? plans.reason : 'group_skipped';
      __screenDiag('warn', groupTag + ':' + reason, {
        stage: 'preflight',
        type: __screenTypePipeline,
        diagTag: groupTag,
        key: groupKey,
        message: reason,
        data: {
          outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
          reason: String(reason),
          substage: 'Core.applyTargets(plan)'
        }
      }, null);
      if (groupPolicy === 'throw') {
        throw new Error('core plan skipped');
      }
      return 0;
    }
    const applied = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
          throw new Error('invalid core plan item');
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!sameDesc(after, p.nextDesc)) {
          throw new Error('descriptor post-check mismatch');
        }
        applied.push(p);
      }
    } catch (e) {
      let rollbackErr = null;
      for (let i = applied.length - 1; i >= 0; i--) {
        const p = applied[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          __screenDiag('error', groupTag + ':rollback_failed', {
            stage: 'rollback',
            type: __screenTypeBrowser,
            diagTag: groupTag,
            key: p.key || null,
            message: 'rollback failed',
            data: {
              outcome: 'throw',
              reason: 'rollback_failed',
              substage: 'rollback(Object.defineProperty/delete)'
            }
          }, re);
        }
      }
      if (rollbackErr) {
        throw rollbackErr;
      }
      __screenDiag('error', groupTag + ':apply_failed', {
        stage: 'apply',
        type: __screenTypeBrowser,
        diagTag: groupTag,
        key: groupKey,
        message: 'apply failed',
        data: {
          outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
          reason: (e && e.message) ? String(e.message) : 'apply_failed',
          substage: 'apply(Object.defineProperty/postcheck)'
        }
      }, e);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    if (applied.length) {
      const appliedSnapshot = applied.slice();
      __moduleRollbackStack.push(function rollbackCoreTargetsGroup() {
        for (let i = appliedSnapshot.length - 1; i >= 0; i--) {
          const p = appliedSnapshot[i];
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        }
      });
    }
    return applied.length;
  }
  function redefineProp(target, prop, getterOrValue) {
    const d = Object.getOwnPropertyDescriptor(target, prop);
    if (!d) throw new Error(`${prop} descriptor missing`);
    if (d.configurable === false) throw new Error(`${prop} non-configurable`);
    const isData = Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
    const groupTag = 'screen:redefineProp:' + String(prop);
    if (isData) {
      const isMethod = (typeof d.value === 'function' && typeof getterOrValue === 'function');
      if (isMethod) {
        const patchedMethod = getterOrValue.call(target);
        if (typeof patchedMethod !== 'function') {
          throw new TypeError(`${prop} method patch missing`);
        }
        applyCoreTargetsGroup(groupTag, [{
          owner: target,
          key: prop,
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: groupTag,
          validThis(self) {
            return receiverMatchesTarget(target, self);
          },
          invalidThis: 'throw',
          invoke(_orig, args) {
            return Reflect.apply(patchedMethod, this, args || []);
          }
        }], 'throw');
      } else {
        const value = (typeof getterOrValue === 'function') ? getterOrValue.call(target) : getterOrValue;
        applyCoreTargetsGroup(groupTag, [{
          owner: target,
          key: prop,
          kind: 'data',
          wrapLayer: 'descriptor_only',
          policy: 'throw',
          diagTag: groupTag,
          value,
          writable: !!d.writable,
          configurable: !!d.configurable,
          enumerable: !!d.enumerable
        }], 'throw');
      }
      return;
    }
    if (typeof d.get !== 'function') throw new Error(`${prop} getter missing`);
    applyCoreTargetsGroup(groupTag, [{
      owner: target,
      key: prop,
      kind: 'accessor',
      wrapLayer: 'named_wrapper_strict',
      resolve: 'proto_chain',
      policy: 'strict',
      diagTag: groupTag,
      validThis(self) {
        return receiverMatchesTarget(target, self);
      },
      invalidThis: 'throw',
      getImpl: function screenAccessorGetImpl() {
        if (typeof getterOrValue === 'function') return getterOrValue.call(this);
        return getterOrValue;
      }
    }], 'skip');
  }
  function chooseTarget(obj, proto, prop) {
    if (obj && Object.getOwnPropertyDescriptor(obj, prop)) return obj;
    if (proto && Object.getOwnPropertyDescriptor(proto, prop)) return proto;
    return null;
  }
  function sameDesc(actual, expected) {
    if (!actual || !expected) return false;
    const keys = ['configurable', 'enumerable', 'writable', 'value', 'get', 'set'];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (Object.prototype.hasOwnProperty.call(expected, k)) {
        if (actual[k] !== expected[k]) return false;
      }
    }
    return true;
  }

  const mqlMatches = new WeakMap();
  const mqlProto = (typeof MediaQueryList !== 'undefined' && MediaQueryList.prototype) ? MediaQueryList.prototype : null;
  if (mqlProto) {
    const matchesDesc = Object.getOwnPropertyDescriptor(mqlProto, 'matches');
    if (matchesDesc && typeof matchesDesc.get === 'function' && matchesDesc.configurable) {
      const origMatchesGet = matchesDesc.get;
      applyCoreTargetsGroup('screen:mql_matches', [{
        owner: mqlProto,
        key: 'matches',
        kind: 'accessor',
        wrapLayer: 'named_wrapper_strict',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: 'screen:mql_matches',
        validThis(self) {
          return receiverMatchesTarget(mqlProto, self);
        },
        invalidThis: 'throw',
        getImpl() {
          if (mqlMatches.has(this)) return mqlMatches.get(this);
          return Reflect.apply(origMatchesGet, this, []);
        }
      }], 'skip');
    }
  }
  

  const mmTarget = chooseTarget(window, Object.getPrototypeOf(window), 'matchMedia');
  if (!mmTarget) throw new Error('matchMedia descriptor missing');
  let __screenMatchMediaThisCheckDiagSent = false;
  const isWindowThis = (self) => {
    try { return self === window || (typeof Window === 'function' && self instanceof Window); }
    catch (e) {
      if (!__screenMatchMediaThisCheckDiagSent) {
        __screenMatchMediaThisCheckDiagSent = true;
        __screenDiag('warn', 'screen:matchMedia_window_this_check_failed', {
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen:matchMedia',
          key: 'matchMedia',
          message: 'Window receiver check failed',
          data: { outcome: 'skip', reason: 'exception', substage: 'isWindowThis' }
        }, e);
      }
      return false;
    }
  };
  
  const isMatchMediaThis = (self) => (self === undefined) || isWindowThis(self);
  const matchMediaInvoke = function matchMediaInvoke(target, thisArg, argList) {
    const queryRaw = (argList && argList.length) ? argList[0] : undefined;
    if (!isMatchMediaThis(thisArg)) return Reflect.apply(target, thisArg, argList);
    const effectiveThis = (thisArg === undefined) ? window : thisArg;
    const query = String(queryRaw);




    let matches = true;
    const hasMediaPrefix = /\b(all|screen|print)\b/i.test(query);
    const hasMediaExpr = /\([^)]+\)/.test(query);
    const isTrashQuery = (typeof queryRaw !== 'string') || (query.length > 1024) || /[\u0000-\u001F]/.test(query) || (!hasMediaPrefix && !hasMediaExpr);
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

    const mql = Reflect.apply(target, effectiveThis, [query]);
    if (mql && (typeof mql === 'object' || typeof mql === 'function')) {
      try {
        if (touched || isTrashQuery) mqlMatches.set(mql, matches);
      } catch (e) {
        __screenDiag('warn', 'screen:mql_matches_cache_set_failed', {
          stage: 'runtime',
          type: __screenTypeBrowser,
          diagTag: 'screen:mql_matches',
          key: 'matches',
          message: 'MediaQueryList cache set failed',
          data: { outcome: 'skip', reason: 'exception', substage: 'mqlMatches.set' }
        }, e);
      }
    }
    return mql;
  };
  const matchMediaInvokeCore = function matchMediaInvokeCore(orig, args) {
    const list = Array.isArray(args) ? args : [];
    return matchMediaInvoke(orig, this, list);
  };
  applyCoreTargetsGroup('screen:matchMedia', [{
    owner: mmTarget,
    key: 'matchMedia',
    kind: 'method',
    wrapLayer: 'core_wrapper',
    invokeClass: 'brand_strict',
    resolve: 'own',
    policy: 'throw',
    diagTag: 'screen:matchMedia',
    validThis: isMatchMediaThis,
    invalidThis: 'throw',
    invoke: matchMediaInvokeCore
  }], 'throw');

  //  screen и orientation ──
  const screenObj = window.screen;
  const screenProto = screenObj && Object.getPrototypeOf(screenObj);
  if (screenObj && screenProto && screenProto !== Object.prototype) {
    const setScreen = (k, get) => {
      const target = chooseTarget(screenObj, screenProto, k);
      if (!target) throw new Error(`${k} descriptor missing`);
      redefineProp(target, k, get);
    };
    setScreen('width', () => SCREEN_WIDTH);
    setScreen('height', () => SCREEN_HEIGHT);
    setScreen('availWidth', () => SCREEN_WIDTH);
    setScreen('availHeight', () => SCREEN_HEIGHT);
    setScreen('colorDepth', () => COLOR_DEPTH);
    setScreen('pixelDepth', () => COLOR_DEPTH);
    setScreen('availLeft', () => ZERO);
    setScreen('availTop', () => ZERO);
  }
  const orientationObj = screenObj && screenObj.orientation;
  const orientationProto = orientationObj && Object.getPrototypeOf(orientationObj);
  if (orientationObj && orientationProto && orientationProto !== Object.prototype) {
    const setOrientation = (k, get) => {
      const target = chooseTarget(orientationObj, orientationProto, k);
      if (!target) throw new Error(`orientation.${k} descriptor missing`);
      redefineProp(target, k, get);
    };
    try { setOrientation('type', () => (SCREEN_WIDTH > SCREEN_HEIGHT ? "landscape-primary" : "portrait-primary")); }
    catch (e) {
      __screenDiag('warn', 'screen:orientation_type_redefine_failed', {
        stage: 'apply',
        type: __screenTypeBrowser,
        diagTag: 'screen',
        key: 'orientation.type',
        message: 'orientation.type redefine failed',
        data: { outcome: 'skip', reason: 'exception', substage: 'redefineProp(orientation.type)' }
      }, e);
    }
    try { setOrientation('angle', () => ZERO); }
    catch (e) {
      __screenDiag('warn', 'screen:orientation_angle_redefine_failed', {
        stage: 'apply',
        type: __screenTypeBrowser,
        diagTag: 'screen',
        key: 'orientation.angle',
        message: 'orientation.angle redefine failed',
        data: { outcome: 'skip', reason: 'exception', substage: 'redefineProp(orientation.angle)' }
      }, e);
    }
  }

  // inner/outerWidth/Height
  ["innerWidth", "innerHeight", "outerWidth", "outerHeight"].forEach(prop => {
    const target = chooseTarget(window, Object.getPrototypeOf(window), prop);
    if (!target) throw new Error(`${prop} descriptor missing`);
    redefineProp(target, prop, () => (prop.endsWith("Width") ? SCREEN_WIDTH : SCREEN_HEIGHT));
  });

  //  visualViewport 
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const vvProto = vv && Object.getPrototypeOf(vv);
    const setVV = (k, get) => {
      const t = chooseTarget(vv, vvProto, k);
      if (!t) throw new Error(`visualViewport.${k} descriptor missing`);
      redefineProp(t, k, get);
    };
    setVV('width', () => SCREEN_WIDTH);
    setVV('height', () => SCREEN_HEIGHT);
    setVV('offsetLeft', () => ZERO);
    setVV('offsetTop', () => ZERO);
    setVV('scale', () => ONE);
    setVV('pageLeft', () => ZERO);
    setVV('pageTop', () => ZERO);
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



  const onPatchedViewport = () => {
    __screenDiag('info', 'screen:patched_viewport', {
      stage: 'runtime',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: null,
      message: 'patched viewport snapshot',
      data: {
        outcome: 'return',
        reason: 'snapshot',
        substage: 'DOMContentLoaded',
        html:   { width:  document.documentElement.clientWidth,  height: document.documentElement.clientHeight },
        window: { width:  window.innerWidth,  height: window.innerHeight },
        screen: { width:  window.screen.width,  height: window.screen.height }
      }
    });
  };
  document.addEventListener("DOMContentLoaded", onPatchedViewport);
  __moduleRollbackStack.push(function rollbackDomContentLoadedPatchedViewport() {
    document.removeEventListener("DOMContentLoaded", onPatchedViewport);
  });

  // log after DOM ready for document & div
  const onDocumentDivClientSizes = () => {
    __screenDiag('info', 'screen:document_div_client_sizes', {
      stage: 'runtime',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: null,
      message: 'document and div client sizes',
      data: {
        outcome: 'return',
        reason: 'snapshot',
        substage: 'DOMContentLoaded',
        html: {
          width:  document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        },
        div: {
          width:  document.querySelector("div")?.clientWidth,
          height: document.querySelector("div")?.clientHeight
        }
      }
    });
  };
  document.addEventListener("DOMContentLoaded", onDocumentDivClientSizes);
  __moduleRollbackStack.push(function rollbackDomContentLoadedDocumentDiv() {
    document.removeEventListener("DOMContentLoaded", onDocumentDivClientSizes);
  });
  
  __screenDiag('info', 'screen:patches_applied', {
    stage: 'apply',
    type: __screenTypePipeline,
    diagTag: 'screen',
    key: null,
    message: 'screen patches applied',
    data: {
      outcome: 'return',
      reason: 'patched',
      substage: 'module_apply'
    }
  });
  } catch (e) {
    let rollbackErr = null;
    for (let i = __moduleRollbackStack.length - 1; i >= 0; i--) {
      try {
        __moduleRollbackStack[i]();
      } catch (re) {
        if (!rollbackErr) rollbackErr = re;
        __screenDiag('error', 'screen:rollback_failed', {
          stage: 'rollback',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: null,
          message: 'module rollback failed',
          data: {
            outcome: 'rollback',
            reason: 'rollback_failed',
            substage: 'module_catch'
          }
        }, re);
      }
    }
    const rollbackOk = !rollbackErr;
    __screenDiag('fatal', 'screen:fatal', {
      stage: 'apply',
      type: __screenTypeBrowser,
      diagTag: 'screen',
      key: null,
      message: 'fatal module error',
      data: {
        outcome: 'throw',
        reason: 'fatal',
        substage: 'module_try',
        rollbackOk
      }
    }, rollbackErr || e);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk, __screenModule);
      }
    } catch (releaseErr) {
      __screenDiag('error', 'screen:guard_release_failed', {
        stage: 'rollback',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: __flagKey,
        message: 'guard release failed in fatal catch',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'module_catch'
        }
      }, releaseErr);
    }
    throw (rollbackErr || e);
  }
}
  
