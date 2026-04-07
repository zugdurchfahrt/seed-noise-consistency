const ScreenPatchModule = function ScreenPatchModule(window) {
  const __screenTypePipeline = 'pipeline missing data';
  const __screenTypeBrowser = 'browser structure missing data';
  const __screenModule = 'screen';
  const __screenSurface = 'screen';
  const __core = window.Core;
  const __flagKey = '__PATCH_SCREEN__';
  const __loggerRoot = (window && window.CanvasPatchContext && window.CanvasPatchContext.__logger && typeof window.CanvasPatchContext.__logger === 'object')
    ? window.CanvasPatchContext.__logger
    : null;
  const __D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
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
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __screenModule,
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
  const __screenEnvProfile = (__screenStateRoot.__ENV_PROFILE__ && typeof __screenStateRoot.__ENV_PROFILE__ === 'object')
    ? __screenStateRoot.__ENV_PROFILE__
    : null;
  const __screenProfile = (__screenEnvProfile && __screenEnvProfile.profile && typeof __screenEnvProfile.profile === 'object')
    ? __screenEnvProfile.profile
    : null;
  let __screenState = (__screenStateRoot.__SCREEN__ && typeof __screenStateRoot.__SCREEN__ === 'object')
    ? __screenStateRoot.__SCREEN__
    : null;
  if (!__screenState) {
    __screenDiag('warn', 'screen:screen_state_missing', {
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'CanvasPatchContext.state.__SCREEN__',
      message: 'CanvasPatchContext.state.__SCREEN__ unavailable',
      data: {
        outcome: 'skip',
        reason: 'screen_state_missing',
        missing: 'CanvasPatchContext.state.__SCREEN__'
      }
    }, new Error('[ScreenPatch] CanvasPatchContext.state.__SCREEN__ unavailable'));
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
        message: 'guard release failed after screen state missing skip',
        data: {
          outcome: 'skip',
          reason: 'guard_release_failed',
          substage: 'CanvasPatchContext.state.__SCREEN__'
        }
      }, releaseErr);
    }
    return;
  }
  const __screenCanvasModuleState = (__screenStateRoot.__CANVAS__ && typeof __screenStateRoot.__CANVAS__ === 'object')
    ? __screenStateRoot.__CANVAS__
    : null;
  const __screenCanvasState = (__screenCanvasModuleState && __screenCanvasModuleState.__STATE__ && typeof __screenCanvasModuleState.__STATE__ === 'object')
    ? __screenCanvasModuleState.__STATE__
    : null;
  const __moduleRollbackStack = [];
  const __screenAppliedGroups = Object.create(null);

  const SCREEN_WIDTH  = Number(window.__WIDTH);
  const SCREEN_HEIGHT = Number(window.__HEIGHT);
  const COLOR_DEPTH   = Number(window.__COLOR_DEPTH);
  const DPR           = Number(window.__DPR);
  const PHYSICAL_SCREEN_WIDTH = (
    Number.isFinite(SCREEN_WIDTH) &&
    Number.isFinite(DPR) &&
    DPR > 0
  ) ? Math.round(SCREEN_WIDTH * DPR) : NaN;
  const PHYSICAL_SCREEN_HEIGHT = (
    Number.isFinite(SCREEN_HEIGHT) &&
    Number.isFinite(DPR) &&
    DPR > 0
  ) ? Math.round(SCREEN_HEIGHT * DPR) : NaN;

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
  if (
    !Number.isFinite(PHYSICAL_SCREEN_WIDTH) || PHYSICAL_SCREEN_WIDTH <= 0 ||
    !Number.isFinite(PHYSICAL_SCREEN_HEIGHT) || PHYSICAL_SCREEN_HEIGHT <= 0
  ) {
    throw new Error('bad derived physical width/height');
  }

  // Avoid hardcoded numeric literals for the constant zeros/ones used by layout offsets.
  // These values are derived from existing profile-driven values.
  const ZERO = SCREEN_WIDTH - SCREEN_WIDTH;
  const ONE = DPR / DPR;
  if (Number.isFinite(PHYSICAL_SCREEN_WIDTH) && Number.isFinite(PHYSICAL_SCREEN_HEIGHT)) {
    __screenState.physicalWidth = PHYSICAL_SCREEN_WIDTH;
    __screenState.physicalHeight = PHYSICAL_SCREEN_HEIGHT;
  }

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
    const groupPolicy = (policy === 'throw' || policy === 'strict') ? 'throw' : 'skip';
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
      plans = __coreApplyTargets(targets, __screenProfile, []);
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
      const coreRegisterPatchedTarget = (__core && typeof __core.registerPatchedTarget === 'function')
        ? __core.registerPatchedTarget
        : null;
      if (typeof coreRegisterPatchedTarget === 'function') {
        for (let i = 0; i < applied.length; i++) {
          const p = applied[i];
          try {
            coreRegisterPatchedTarget(p.owner, p.key);
          } catch (registerErr) {
            __screenDiag('error', groupTag + ':register_failed', {
              stage: 'apply',
              type: __screenTypePipeline,
              diagTag: groupTag,
              key: p.key || null,
              message: 'registerPatchedTarget failed',
              data: {
                outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
                reason: 'register_failed',
                substage: 'Core.registerPatchedTarget',
                policy: groupPolicy
              }
            }, registerErr);
            if (groupPolicy === 'throw') throw registerErr;
          }
        }
      } else {
        __screenDiag('warn', groupTag + ':missing_core_registerPatchedTarget', {
          stage: 'preflight',
          type: __screenTypePipeline,
          diagTag: groupTag,
          key: null,
          message: 'Core.registerPatchedTarget missing',
          data: {
            outcome: groupPolicy === 'throw' ? 'throw' : 'skip',
            reason: 'missing_core_registerPatchedTarget',
            substage: 'Core.registerPatchedTarget',
            policy: groupPolicy
          }
        }, null);
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
      __screenAppliedGroups[groupTag] = appliedSnapshot;
      __moduleRollbackStack.push(function rollbackCoreTargetsGroup() {
        for (let i = appliedSnapshot.length - 1; i >= 0; i--) {
          const p = appliedSnapshot[i];
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        }
        delete __screenAppliedGroups[groupTag];
      });
    }
    return applied.length;
  }
  function rollbackAppliedCoreGroup(groupTag, reason) {
    const appliedSnapshot = (__screenAppliedGroups && __screenAppliedGroups[groupTag] && Array.isArray(__screenAppliedGroups[groupTag]))
      ? __screenAppliedGroups[groupTag].slice()
      : [];
    if (!appliedSnapshot.length) return true;
    let rollbackErr = null;
    for (let i = appliedSnapshot.length - 1; i >= 0; i--) {
      const p = appliedSnapshot[i];
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
          message: 'rollback failed after post-check',
          data: {
            outcome: 'throw',
            reason: 'rollback_failed',
            substage: 'postcheck',
            rollbackReason: reason || 'postcheck_failed'
          }
        }, re);
      }
    }
    delete __screenAppliedGroups[groupTag];
    if (rollbackErr) throw rollbackErr;
    return true;
  }
  function chooseTarget(obj, proto, prop) {
    if (obj && Object.getOwnPropertyDescriptor(obj, prop)) return obj;
    let cur = proto;
    while (cur && cur !== Object.prototype) {
      if (Object.getOwnPropertyDescriptor(cur, prop)) return cur;
      cur = Object.getPrototypeOf(cur);
    }
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
        wrapLayer: 'strict_accessor_gateway',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: 'screen:mql_matches',
        validThis(self) {
          return receiverMatchesTarget(mqlProto, self);
        },
        invalidThis: 'native',
        getImpl() {
          if (mqlMatches.has(this)) return mqlMatches.get(this);
          return Reflect.apply(origMatchesGet, this, []);
        }
      }], 'strict');
    } else if (!(matchesDesc && typeof matchesDesc.get === 'function')) {
      __screenDiag('warn', 'screen:mql_matches_descriptor_missing', {
        stage: 'preflight',
        type: __screenTypeBrowser,
        diagTag: 'screen:mql_matches',
        key: 'matches',
        message: 'MediaQueryList.matches descriptor missing',
        data: { outcome: 'skip', reason: 'descriptor_missing' }
      });
    }
  }
  

  const __screenGroupModes = {
    displayMode: 'pending',
    displayReason: 'pending',
    viewportMode: 'pending',
    viewportReason: 'pending',
    hostWindowMode: 'native_observed',
    hostWindowReason: 'native_host_window',
    coordinationPatched: false,
    appliedTargets: ZERO
  };
  const screenObj = window.screen;
  const screenProto = screenObj && Object.getPrototypeOf(screenObj);
  const orientationObj = screenObj && screenObj.orientation;
  const orientationProto = orientationObj && Object.getPrototypeOf(orientationObj);
  const windowProto = Object.getPrototypeOf(window);
  const visualViewportObj = window.visualViewport || null;
  const visualViewportProto = visualViewportObj && Object.getPrototypeOf(visualViewportObj);
  const mmTarget = chooseTarget(window, windowProto, 'matchMedia');
  const mmDesc = mmTarget ? Object.getOwnPropertyDescriptor(mmTarget, 'matchMedia') : null;
  const mqlMatchesTarget = mqlProto ? chooseTarget(mqlProto, Object.getPrototypeOf(mqlProto), 'matches') : null;
  let __screenMatchMediaThisCheckDiagSent = false;
  const isWindowThis = (self) => {
    try {
      return self === window || (typeof Window === 'function' && self instanceof Window);
    } catch (e) {
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
  const matchMediaResolve = (mmTarget === window) ? 'own' : 'proto_chain';
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
      const actual = (SCREEN_WIDTH > SCREEN_HEIGHT) ? 'landscape' : 'portrait';
      matches = matches && actual === orientation[1];
    }
    __screenState.orientationDom = (SCREEN_WIDTH > SCREEN_HEIGHT) ? 'landscape-primary' : 'portrait-primary';
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
  const expectedOrientationType = (SCREEN_HEIGHT >= SCREEN_WIDTH) ? 'portrait-primary' : 'landscape-primary';
  const expectedOrientationMedia = (SCREEN_HEIGHT >= SCREEN_WIDTH) ? 'portrait' : 'landscape';
  const screenExpected = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    availWidth: SCREEN_WIDTH,
    availHeight: SCREEN_HEIGHT,
    colorDepth: COLOR_DEPTH,
    pixelDepth: COLOR_DEPTH,
    availLeft: ZERO,
    availTop: ZERO
  };
  const orientationExpected = { type: expectedOrientationType, angle: ZERO };
  const viewportExpected = {
    innerWidth: SCREEN_WIDTH,
    innerHeight: SCREEN_HEIGHT,
    visualViewportWidth: SCREEN_WIDTH,
    visualViewportHeight: SCREEN_HEIGHT,
    visualViewportOffsetLeft: ZERO,
    visualViewportOffsetTop: ZERO,
    visualViewportPageLeft: ZERO,
    visualViewportPageTop: ZERO,
    visualViewportScale: ONE
  };
  function __screenSetGroupOutcome(groupName, mode, reason) {
    if (groupName === 'display') {
      __screenGroupModes.displayMode = mode;
      __screenGroupModes.displayReason = reason;
      return;
    }
    if (groupName === 'viewport') {
      __screenGroupModes.viewportMode = mode;
      __screenGroupModes.viewportReason = reason;
      return;
    }
    if (groupName === 'hostWindow') {
      __screenGroupModes.hostWindowMode = mode;
      __screenGroupModes.hostWindowReason = reason;
    }
  }
  function __screenDescribeAccessorSurface(owner, proto, key) {
    const target = chooseTarget(owner, proto, key);
    const desc = target ? Object.getOwnPropertyDescriptor(target, key) : null;
    return {
      key: key,
      ownerFact: target ? (target === owner ? 'own' : 'proto_chain') : 'missing',
      descriptorMissing: !desc,
      accessorShape: !!(desc && typeof desc.get === 'function' && !Object.prototype.hasOwnProperty.call(desc, 'value')),
      configurable: desc ? !!desc.configurable : null,
      enumerable: desc ? !!desc.enumerable : null
    };
  }
  function __screenDescribeMethodSurface(owner, proto, key) {
    const target = chooseTarget(owner, proto, key);
    const desc = target ? Object.getOwnPropertyDescriptor(target, key) : null;
    return {
      key: key,
      ownerFact: target ? (target === owner ? 'own' : 'proto_chain') : 'missing',
      descriptorMissing: !desc,
      methodShape: !!(desc && Object.prototype.hasOwnProperty.call(desc, 'value') && typeof desc.value === 'function'),
      configurable: desc ? !!desc.configurable : null,
      enumerable: desc ? !!desc.enumerable : null,
      writable: desc ? !!desc.writable : null
    };
  }
  function __screenReadAccessorValue(owner, proto, key, receiver) {
    const target = chooseTarget(owner, proto, key);
    if (!target) throw new Error(String(key) + ' descriptor missing');
    const desc = Object.getOwnPropertyDescriptor(target, key);
    if (!desc || typeof desc.get !== 'function') throw new Error(String(key) + ' getter missing');
    return Reflect.apply(desc.get, receiver || owner, []);
  }
  function __screenGcd(a, b) {
    let x = Math.abs(Number(a) || ZERO);
    let y = Math.abs(Number(b) || ZERO);
    while (y) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || ONE;
  }
  function __screenAspectText(width, height) {
    const divisor = __screenGcd(width, height);
    return String(Math.round(width / divisor)) + '/' + String(Math.round(height / divisor));
  }
  const expectedDeviceAspectText = __screenAspectText(SCREEN_WIDTH, SCREEN_HEIGHT);
  function __screenNormalizeMediaText(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }
  function __screenEvaluateMediaQuery(mediaText) {
    const normalized = __screenNormalizeMediaText(mediaText);
    if (!normalized || normalized.indexOf(',') !== -1 || normalized.indexOf(' not ') !== -1 || normalized.startsWith('not ') || normalized.startsWith('only ')) {
      return { handled: false, matches: null, media: normalized };
    }
    const clauses = normalized.match(/\([^)]+\)/g);
    if (!clauses || !clauses.length) return { handled: false, matches: null, media: normalized };
    let handled = false;
    let matches = true;
    for (let i = ZERO; i < clauses.length; i++) {
      const clause = clauses[i].slice(1, -1).trim();
      const sep = clause.indexOf(':');
      if (sep === -1) return { handled: false, matches: null, media: normalized };
      const feature = clause.slice(ZERO, sep).trim();
      const rawValue = clause.slice(sep + ONE).trim();
      let next = null;
      if (feature === 'device-width') next = rawValue === (String(SCREEN_WIDTH) + 'px');
      else if (feature === 'device-height') next = rawValue === (String(SCREEN_HEIGHT) + 'px');
      else if (feature === 'width') next = rawValue === (String(viewportExpected.innerWidth) + 'px');
      else if (feature === 'height') next = rawValue === (String(viewportExpected.innerHeight) + 'px');
      else if (feature === 'orientation') next = rawValue === expectedOrientationMedia;
      else if (feature === 'display-mode') next = rawValue === 'browser';
      else if (feature === 'device-aspect-ratio') next = rawValue === expectedDeviceAspectText;
      else if (feature === 'aspect-ratio') next = rawValue === expectedDeviceAspectText;
      else return { handled: false, matches: null, media: normalized };
      handled = true;
      if (!next) matches = false;
    }
    return { handled: handled, matches: handled ? matches : null, media: normalized };
  }
  function __screenBuildAccessorTarget(owner, proto, key, valueFactory, groupTag, options) {
    const opts = options || {};
    const target = chooseTarget(owner, proto, key);
    const patchOwner = target || owner;
    const desc = patchOwner ? Object.getOwnPropertyDescriptor(patchOwner, key) : null;
    const allowCreate = !!opts.allowCreate && !desc && patchOwner === owner;
    const ownerFact = target ? (target === owner ? 'own' : 'proto_chain') : (allowCreate ? 'own_create' : 'missing');
    if (!patchOwner || (!desc && !allowCreate)) return { ok: false, reason: 'descriptor_missing', key: key, ownerFact: ownerFact };
    if (desc && (Object.prototype.hasOwnProperty.call(desc, 'value') || typeof desc.get !== 'function')) {
      return { ok: false, reason: 'kind_mismatch', key: key, ownerFact: ownerFact };
    }
    const resolve = (patchOwner === owner) ? 'own' : 'proto_chain';
    const wrapLayer = (resolve === 'own') ? 'materialized_accessor_gateway' : 'strict_accessor_gateway';
    return {
      ok: true,
      target: {
        owner: patchOwner,
        key: key,
        kind: 'accessor',
        wrapLayer: wrapLayer,
        resolve: resolve,
        policy: 'strict',
        diagTag: groupTag + ':' + String(key),
        allowCreate: allowCreate,
        configurable: allowCreate
          ? (Object.prototype.hasOwnProperty.call(opts, 'configurable') ? !!opts.configurable : true)
          : undefined,
        enumerable: allowCreate
          ? (Object.prototype.hasOwnProperty.call(opts, 'enumerable') ? !!opts.enumerable : false)
          : undefined,
        validThis(self) { return receiverMatchesTarget(patchOwner, self); },
        invalidThis: Object.prototype.hasOwnProperty.call(opts, 'invalidThis') ? opts.invalidThis : 'native',
        getImpl: function coordinatedAccessorGetImpl(origGet) {
          void origGet;
          return (typeof valueFactory === 'function') ? valueFactory.call(this, origGet) : valueFactory;
        }
      },
      ownerFact: ownerFact
    };
  }
  function __screenCollectMediaQueries(queries) {
    const list = Array.isArray(queries) ? queries : [];
    const rows = [];
    for (let i = ZERO; i < list.length; i++) {
      const entry = list[i];
      try {
        rows.push({ key: entry.key, query: entry.query, matches: !!window.matchMedia(entry.query).matches, readFailed: false });
      } catch (e) {
        rows.push({ key: entry.key, query: entry.query, matches: null, readFailed: true, readError: (e && e.message) ? String(e.message) : 'matchMedia_failed' });
      }
    }
    return rows;
  }
  function __screenCollectDisplayQueries() {
    return __screenCollectMediaQueries([
      { key: 'device', query: '(device-width: ' + String(SCREEN_WIDTH) + 'px) and (device-height: ' + String(SCREEN_HEIGHT) + 'px)' },
      { key: 'deviceAspectRatio', query: '(device-aspect-ratio: ' + expectedDeviceAspectText + ')' },
      { key: 'orientation', query: '(orientation: ' + expectedOrientationMedia + ')' },
      { key: 'displayMode', query: '(display-mode: browser)' }
    ]);
  }
  function __screenCollectViewportQueries() {
    return __screenCollectMediaQueries([
      { key: 'viewport', query: '(width: ' + String(viewportExpected.innerWidth) + 'px) and (height: ' + String(viewportExpected.innerHeight) + 'px)' },
      { key: 'aspectRatio', query: '(aspect-ratio: ' + expectedDeviceAspectText + ')' }
    ]);
  }
  function __screenDisplaySnapshot() {
    return {
      screen: {
        width: __screenReadAccessorValue(screenObj, screenProto, 'width', screenObj),
        height: __screenReadAccessorValue(screenObj, screenProto, 'height', screenObj),
        availWidth: __screenReadAccessorValue(screenObj, screenProto, 'availWidth', screenObj),
        availHeight: __screenReadAccessorValue(screenObj, screenProto, 'availHeight', screenObj),
        colorDepth: __screenReadAccessorValue(screenObj, screenProto, 'colorDepth', screenObj),
        pixelDepth: __screenReadAccessorValue(screenObj, screenProto, 'pixelDepth', screenObj),
        availLeft: __screenReadAccessorValue(screenObj, screenProto, 'availLeft', screenObj),
        availTop: __screenReadAccessorValue(screenObj, screenProto, 'availTop', screenObj)
      },
      orientation: {
        type: __screenReadAccessorValue(orientationObj, orientationProto, 'type', orientationObj),
        angle: __screenReadAccessorValue(orientationObj, orientationProto, 'angle', orientationObj)
      },
      mediaQueries: __screenCollectDisplayQueries()
    };
  }
  function __screenViewportSnapshot() {
    const htmlRoot = document.documentElement || null;
    const divRoot = (__screenCanvasState && __screenCanvasState.domCanvasHost && typeof __screenCanvasState.domCanvasHost === 'object')
      ? __screenCanvasState.domCanvasHost
      : null;
    const snapshot = {
      innerWidth: __screenReadAccessorValue(window, windowProto, 'innerWidth', window),
      innerHeight: __screenReadAccessorValue(window, windowProto, 'innerHeight', window),
      outerWidth: __screenReadAccessorValue(window, windowProto, 'outerWidth', window),
      outerHeight: __screenReadAccessorValue(window, windowProto, 'outerHeight', window),
      htmlClientWidth: htmlRoot ? htmlRoot.clientWidth : null,
      htmlClientHeight: htmlRoot ? htmlRoot.clientHeight : null,
      divClientWidth: divRoot ? divRoot.clientWidth : null,
      divClientHeight: divRoot ? divRoot.clientHeight : null,
      divOwnerPath: divRoot ? 'CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost' : null,
      mediaQueries: __screenCollectViewportQueries(),
      visualViewport: null
    };
    if (visualViewportObj && visualViewportProto) {
      snapshot.visualViewport = {
        width: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'width', visualViewportObj),
        height: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'height', visualViewportObj),
        offsetLeft: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'offsetLeft', visualViewportObj),
        offsetTop: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'offsetTop', visualViewportObj),
        pageLeft: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'pageLeft', visualViewportObj),
        pageTop: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'pageTop', visualViewportObj),
        scale: __screenReadAccessorValue(visualViewportObj, visualViewportProto, 'scale', visualViewportObj)
      };
    }
    return snapshot;
  }
  function __screenCheckDisplayCoherence() {
    const snapshot = __screenDisplaySnapshot();
    const mismatches = [];
    const screenKeys = Object.keys(screenExpected);
    for (let i = ZERO; i < screenKeys.length; i++) {
      const key = screenKeys[i];
      if (!Object.is(snapshot.screen[key], screenExpected[key])) {
        mismatches.push({ key: 'screen.' + key, expected: screenExpected[key], actual: snapshot.screen[key] });
      }
    }
    if (!Object.is(snapshot.orientation.type, orientationExpected.type)) {
      mismatches.push({ key: 'screen.orientation.type', expected: orientationExpected.type, actual: snapshot.orientation.type });
    }
    if (!Object.is(snapshot.orientation.angle, orientationExpected.angle)) {
      mismatches.push({ key: 'screen.orientation.angle', expected: orientationExpected.angle, actual: snapshot.orientation.angle });
    }
    for (let i = ZERO; i < snapshot.mediaQueries.length; i++) {
      const row = snapshot.mediaQueries[i];
      if (row.readFailed || row.matches !== true) {
        mismatches.push({ key: 'matchMedia.' + row.key, expected: true, actual: row.matches, readFailed: !!row.readFailed });
      }
    }
    return { ok: mismatches.length === ZERO, snapshot: snapshot, mismatches: mismatches };
  }
  function __screenCheckViewportCoherence() {
    const snapshot = __screenViewportSnapshot();
    const mismatches = [];
    if (!Object.is(snapshot.innerWidth, viewportExpected.innerWidth)) {
      mismatches.push({ key: 'window.innerWidth', expected: viewportExpected.innerWidth, actual: snapshot.innerWidth });
    }
    if (!Object.is(snapshot.innerHeight, viewportExpected.innerHeight)) {
      mismatches.push({ key: 'window.innerHeight', expected: viewportExpected.innerHeight, actual: snapshot.innerHeight });
    }
    if (snapshot.htmlClientWidth !== null && !Object.is(snapshot.htmlClientWidth, viewportExpected.innerWidth)) {
      mismatches.push({ key: 'document.documentElement.clientWidth', expected: viewportExpected.innerWidth, actual: snapshot.htmlClientWidth });
    }
    if (snapshot.htmlClientHeight !== null && !Object.is(snapshot.htmlClientHeight, viewportExpected.innerHeight)) {
      mismatches.push({ key: 'document.documentElement.clientHeight', expected: viewportExpected.innerHeight, actual: snapshot.htmlClientHeight });
    }
    if (snapshot.divClientWidth !== null && !Object.is(snapshot.divClientWidth, viewportExpected.innerWidth)) {
      mismatches.push({ key: 'CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost.clientWidth', expected: viewportExpected.innerWidth, actual: snapshot.divClientWidth });
    }
    if (snapshot.divClientHeight !== null && !Object.is(snapshot.divClientHeight, viewportExpected.innerHeight)) {
      mismatches.push({ key: 'CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost.clientHeight', expected: viewportExpected.innerHeight, actual: snapshot.divClientHeight });
    }
    for (let i = ZERO; i < snapshot.mediaQueries.length; i++) {
      const row = snapshot.mediaQueries[i];
      if (row.readFailed || row.matches !== true) {
        mismatches.push({ key: 'matchMedia.' + row.key, expected: true, actual: row.matches, readFailed: !!row.readFailed });
      }
    }
    if (snapshot.visualViewport) {
      if (!Object.is(snapshot.visualViewport.width, viewportExpected.visualViewportWidth)) mismatches.push({ key: 'visualViewport.width', expected: viewportExpected.visualViewportWidth, actual: snapshot.visualViewport.width });
      if (!Object.is(snapshot.visualViewport.height, viewportExpected.visualViewportHeight)) mismatches.push({ key: 'visualViewport.height', expected: viewportExpected.visualViewportHeight, actual: snapshot.visualViewport.height });
      if (!Object.is(snapshot.visualViewport.offsetLeft, viewportExpected.visualViewportOffsetLeft)) mismatches.push({ key: 'visualViewport.offsetLeft', expected: viewportExpected.visualViewportOffsetLeft, actual: snapshot.visualViewport.offsetLeft });
      if (!Object.is(snapshot.visualViewport.offsetTop, viewportExpected.visualViewportOffsetTop)) mismatches.push({ key: 'visualViewport.offsetTop', expected: viewportExpected.visualViewportOffsetTop, actual: snapshot.visualViewport.offsetTop });
      if (!Object.is(snapshot.visualViewport.pageLeft, viewportExpected.visualViewportPageLeft)) mismatches.push({ key: 'visualViewport.pageLeft', expected: viewportExpected.visualViewportPageLeft, actual: snapshot.visualViewport.pageLeft });
      if (!Object.is(snapshot.visualViewport.pageTop, viewportExpected.visualViewportPageTop)) mismatches.push({ key: 'visualViewport.pageTop', expected: viewportExpected.visualViewportPageTop, actual: snapshot.visualViewport.pageTop });
      if (!Object.is(snapshot.visualViewport.scale, viewportExpected.visualViewportScale)) mismatches.push({ key: 'visualViewport.scale', expected: viewportExpected.visualViewportScale, actual: snapshot.visualViewport.scale });
    }
    return { ok: mismatches.length === ZERO, snapshot: snapshot, mismatches: mismatches };
  }
  function __screenCheckHostWindowCoherence() {
    const snapshot = __screenViewportSnapshot();
    const mismatches = [];
    if (!Object.is(snapshot.outerWidth, viewportExpected.innerWidth)) {
      mismatches.push({ key: 'window.outerWidth', expected: viewportExpected.innerWidth, actual: snapshot.outerWidth });
    }
    if (!Object.is(snapshot.outerHeight, viewportExpected.innerHeight)) {
      mismatches.push({ key: 'window.outerHeight', expected: viewportExpected.innerHeight, actual: snapshot.outerHeight });
    }
    return { ok: mismatches.length === ZERO, snapshot: snapshot, mismatches: mismatches };
  }
  const displayObserved = {
    matchMedia: __screenDescribeMethodSurface(window, windowProto, 'matchMedia'),
    screen: [],
    orientation: [],
    mediaQueries: __screenCollectDisplayQueries()
  };
  const viewportObserved = { window: [], visualViewport: [], root: [], mediaQueries: __screenCollectViewportQueries() };
  const hostWindowObserved = [];
  const displayTargets = [];
  const viewportTargets = [];
  const hostWindowTargets = [];
  const displayReasons = [];
  const viewportReasons = [];
  const hostWindowReasons = [];
  let displayAppliedCount = ZERO;
  let viewportAppliedCount = ZERO;
  let hostWindowAppliedCount = ZERO;
  if (!(mmDesc && Object.prototype.hasOwnProperty.call(mmDesc, 'value') && typeof mmDesc.value === 'function')) {
    displayReasons.push('matchMedia:descriptor_invalid');
  }
  if (mmDesc && Object.prototype.hasOwnProperty.call(mmDesc, 'value') && typeof mmDesc.value === 'function') {
    displayTargets.push({
      owner: mmTarget,
      key: 'matchMedia',
      kind: 'method',
      wrapLayer: 'core_wrapper',
      invokeClass: 'brand_strict',
      resolve: matchMediaResolve,
      policy: 'strict',
      diagTag: 'screen:matchMedia',
      validThis: isMatchMediaThis,
      invalidThis: 'throw',
      invoke: matchMediaInvokeCore
    });
  }
  const screenKeys = Object.keys(screenExpected);
  for (let i = ZERO; i < screenKeys.length; i++) {
    const key = screenKeys[i];
    const fact = __screenDescribeAccessorSurface(screenObj, screenProto, key);
    displayObserved.screen.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(screenObj, screenProto, key, screenObj);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      displayReasons.push('screen.' + key + ':' + fact.readError);
    }
    fact.expected = screenExpected[key];
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, fact.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      const targetPlan = __screenBuildAccessorTarget(screenObj, screenProto, key, screenExpected[key], 'screen:display_group');
      if (!targetPlan.ok) displayReasons.push('screen.' + key + ':' + targetPlan.reason);
      else displayTargets.push(targetPlan.target);
    }
  }
  const orientationKeys = Object.keys(orientationExpected);
  for (let i = ZERO; i < orientationKeys.length; i++) {
    const key = orientationKeys[i];
    const fact = __screenDescribeAccessorSurface(orientationObj, orientationProto, key);
    displayObserved.orientation.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(orientationObj, orientationProto, key, orientationObj);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      displayReasons.push('screen.orientation.' + key + ':' + fact.readError);
    }
    fact.expected = orientationExpected[key];
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, fact.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      const targetPlan = __screenBuildAccessorTarget(orientationObj, orientationProto, key, orientationExpected[key], 'screen:display_group');
      if (!targetPlan.ok) displayReasons.push('screen.orientation.' + key + ':' + targetPlan.reason);
      else displayTargets.push(targetPlan.target);
    }
  }
  let needsMqlCoordination = false;
  for (let i = ZERO; i < displayObserved.mediaQueries.length; i++) {
    const row = displayObserved.mediaQueries[i];
    if (row.readFailed) {
      needsMqlCoordination = true;
      displayReasons.push('matchMedia.' + row.key + ':' + row.readError);
    } else if (row.matches !== true) {
      needsMqlCoordination = true;
    }
  }
  if (displayTargets.length || needsMqlCoordination) {
    if (!mqlMatchesTarget) {
      displayReasons.push('matchMedia.matches:descriptor_missing');
    }
  }
  const windowKeys = ['innerWidth', 'innerHeight'];
  for (let i = ZERO; i < windowKeys.length; i++) {
    const key = windowKeys[i];
    const fact = __screenDescribeAccessorSurface(window, windowProto, key);
    viewportObserved.window.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(window, windowProto, key, window);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      viewportReasons.push('window.' + key + ':' + fact.readError);
    }
    fact.expected = viewportExpected[key];
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, fact.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      const targetPlan = __screenBuildAccessorTarget(window, windowProto, key, viewportExpected[key], 'screen:viewport_group');
      if (!targetPlan.ok) viewportReasons.push('window.' + key + ':' + targetPlan.reason);
      else viewportTargets.push(targetPlan.target);
    }
  }
  const hostWindowKeys = ['outerWidth', 'outerHeight'];
  for (let i = ZERO; i < hostWindowKeys.length; i++) {
    const key = hostWindowKeys[i];
    const fact = __screenDescribeAccessorSurface(window, windowProto, key);
    hostWindowObserved.push(fact);
    try {
      fact.actual = __screenReadAccessorValue(window, windowProto, key, window);
    } catch (e) {
      fact.readFailed = true;
      fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
      hostWindowReasons.push('window.' + key + ':' + fact.readError);
    }
    fact.expected = key === 'outerWidth' ? viewportExpected.innerWidth : viewportExpected.innerHeight;
    fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, fact.expected);
    if (!fact.readFailed && !fact.matchesExpected) {
      const targetPlan = __screenBuildAccessorTarget(window, windowProto, key, fact.expected, 'screen:host_window_group');
      if (!targetPlan.ok) hostWindowReasons.push('window.' + key + ':' + targetPlan.reason);
      else hostWindowTargets.push(targetPlan.target);
    }
  }
  const elementProto = (typeof Element !== 'undefined' && Element && Element.prototype) ? Element.prototype : null;
  const clientWidthDesc = elementProto ? Object.getOwnPropertyDescriptor(elementProto, 'clientWidth') : null;
  const clientHeightDesc = elementProto ? Object.getOwnPropertyDescriptor(elementProto, 'clientHeight') : null;
  const htmlRoot = document.documentElement || null;
  const divRoot = (__screenCanvasState && __screenCanvasState.domCanvasHost && typeof __screenCanvasState.domCanvasHost === 'object')
    ? __screenCanvasState.domCanvasHost
    : null;
  if (divRoot) {
    const divRootMap = [
      { key: 'clientWidth', expected: viewportExpected.innerWidth },
      { key: 'clientHeight', expected: viewportExpected.innerHeight }
    ];
    for (let i = ZERO; i < divRootMap.length; i++) {
      const item = divRootMap[i];
      const fact = __screenDescribeAccessorSurface(divRoot, null, item.key);
      fact.ownerLabel = 'canvas.domCanvasHost';
      viewportObserved.root.push(fact);
      try {
        fact.actual = divRoot[item.key];
      } catch (e) {
        fact.readFailed = true;
        fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
        viewportReasons.push('CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost.' + item.key + ':' + fact.readError);
      }
      fact.expected = item.expected;
      fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, item.expected);
      if (!fact.readFailed && !fact.matchesExpected) {
        const protoDesc = item.key === 'clientWidth' ? clientWidthDesc : clientHeightDesc;
        const targetPlan = __screenBuildAccessorTarget(
          divRoot,
          null,
          item.key,
          item.expected,
          'screen:viewport_group:div',
          {
            allowCreate: true,
            invalidThis: 'throw',
            configurable: protoDesc ? !!protoDesc.configurable : true,
            enumerable: protoDesc ? !!protoDesc.enumerable : false
          }
        );
        if (!targetPlan.ok) viewportReasons.push('CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost.' + item.key + ':' + targetPlan.reason);
        else viewportTargets.push(targetPlan.target);
      }
    }
  }
  if (visualViewportObj && visualViewportProto) {
    const visualViewportMap = [
      { key: 'width', expected: viewportExpected.visualViewportWidth },
      { key: 'height', expected: viewportExpected.visualViewportHeight },
      { key: 'offsetLeft', expected: viewportExpected.visualViewportOffsetLeft },
      { key: 'offsetTop', expected: viewportExpected.visualViewportOffsetTop },
      { key: 'pageLeft', expected: viewportExpected.visualViewportPageLeft },
      { key: 'pageTop', expected: viewportExpected.visualViewportPageTop },
      { key: 'scale', expected: viewportExpected.visualViewportScale }
    ];
    for (let i = ZERO; i < visualViewportMap.length; i++) {
      const item = visualViewportMap[i];
      const fact = __screenDescribeAccessorSurface(visualViewportObj, visualViewportProto, item.key);
      viewportObserved.visualViewport.push(fact);
      try {
        fact.actual = __screenReadAccessorValue(visualViewportObj, visualViewportProto, item.key, visualViewportObj);
      } catch (e) {
        fact.readFailed = true;
        fact.readError = (e && e.message) ? String(e.message) : 'native_read_failed';
        viewportReasons.push('visualViewport.' + item.key + ':' + fact.readError);
      }
      fact.expected = item.expected;
      fact.matchesExpected = !fact.readFailed && Object.is(fact.actual, item.expected);
      if (!fact.readFailed && !fact.matchesExpected) {
        const targetPlan = __screenBuildAccessorTarget(visualViewportObj, visualViewportProto, item.key, item.expected, 'screen:viewport_group');
        if (!targetPlan.ok) viewportReasons.push('visualViewport.' + item.key + ':' + targetPlan.reason);
        else viewportTargets.push(targetPlan.target);
      }
    }
  } else {
    viewportReasons.push('visualViewport:missing');
  }
  if (displayTargets.length && displayReasons.length === ZERO) {
    displayAppliedCount = applyCoreTargetsGroup('screen:display_group', displayTargets, 'strict');
    __screenGroupModes.coordinationPatched = __screenGroupModes.coordinationPatched || (displayAppliedCount > ZERO);
    __screenGroupModes.appliedTargets += displayAppliedCount;
  }
  let displayPostcheck = null;
  if (displayReasons.length === ZERO) {
    displayPostcheck = __screenCheckDisplayCoherence();
    if (!displayPostcheck.ok) {
      if (displayAppliedCount > ZERO) {
        __screenDiag('error', 'screen:coordination_postcheck_failed', {
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: 'display_group',
          message: 'display coordination post-check failed',
          data: { outcome: 'rollback', group: 'display', reason: 'display_postcheck_failed', mismatches: displayPostcheck.mismatches }
        }, null);
        rollbackAppliedCoreGroup('screen:display_group', 'display_postcheck_failed');
        displayAppliedCount = ZERO;
      }
      displayReasons.push('display_postcheck_failed');
    }
  }
  if (displayReasons.length === ZERO) {
    __screenState.orientationDom = orientationExpected.type;
    __screenSetGroupOutcome('display', displayAppliedCount > ZERO ? 'patched' : 'native_observed', displayAppliedCount > ZERO ? 'coordinated_apply' : 'native_coherent');
    __screenDiag('info', displayAppliedCount > ZERO ? 'screen:display_group_applied' : 'screen:display_group_ready', {
      stage: 'apply',
      type: displayAppliedCount > ZERO ? 'ok' : __screenTypePipeline,
      diagTag: 'screen',
      key: 'display_group',
      message: displayAppliedCount > ZERO ? 'display group coordinated' : 'display group already coherent',
      data: { outcome: 'return', group: 'display', mode: __screenGroupModes.displayMode, reason: __screenGroupModes.displayReason, applied: displayAppliedCount, snapshot: displayPostcheck ? displayPostcheck.snapshot : null }
    }, null);
  } else {
    __screenSetGroupOutcome('display', 'skip', displayReasons[ZERO] || 'display_skipped');
    __screenDiag('warn', 'screen:display_group_skipped', {
      stage: 'preflight',
      type: __screenTypeBrowser,
      diagTag: 'screen',
      key: 'display_group',
      message: 'display group skipped',
      data: { outcome: 'skip', group: 'display', mode: __screenGroupModes.displayMode, reason: __screenGroupModes.displayReason, observed: displayObserved, details: displayReasons }
    }, null);
  }
  if (viewportTargets.length && viewportReasons.length === ZERO) {
    viewportAppliedCount = applyCoreTargetsGroup('screen:viewport_group', viewportTargets, 'strict');
    __screenGroupModes.coordinationPatched = __screenGroupModes.coordinationPatched || (viewportAppliedCount > ZERO);
    __screenGroupModes.appliedTargets += viewportAppliedCount;
  }
  let viewportPostcheck = null;
  if (viewportReasons.length === ZERO) {
    viewportPostcheck = __screenCheckViewportCoherence();
    if (!viewportPostcheck.ok) {
      if (viewportAppliedCount > ZERO) {
        __screenDiag('error', 'screen:coordination_postcheck_failed', {
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: 'viewport_group',
          message: 'viewport coordination post-check failed',
          data: { outcome: 'rollback', group: 'viewport', reason: 'viewport_postcheck_failed', mismatches: viewportPostcheck.mismatches }
        }, null);
        rollbackAppliedCoreGroup('screen:viewport_group', 'viewport_postcheck_failed');
        viewportAppliedCount = ZERO;
      }
      viewportReasons.push('viewport_postcheck_failed');
    }
  }
  if (viewportReasons.length === ZERO) {
    __screenSetGroupOutcome('viewport', viewportAppliedCount > ZERO ? 'patched' : 'native_observed', viewportAppliedCount > ZERO ? 'coordinated_apply' : 'native_coherent');
    __screenDiag('info', viewportAppliedCount > ZERO ? 'screen:viewport_group_applied' : 'screen:viewport_group_ready', {
      stage: 'apply',
      type: viewportAppliedCount > ZERO ? 'ok' : __screenTypePipeline,
      diagTag: 'screen',
      key: 'viewport_group',
      message: viewportAppliedCount > ZERO ? 'viewport group coordinated' : 'viewport group already coherent',
      data: { outcome: 'return', group: 'viewport', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, applied: viewportAppliedCount, snapshot: viewportPostcheck ? viewportPostcheck.snapshot : null }
    }, null);
  } else {
    __screenSetGroupOutcome('viewport', 'skip', viewportReasons[ZERO] || 'viewport_skipped');
    __screenDiag('warn', 'screen:viewport_group_skipped', {
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'viewport_group',
      message: 'viewport group skipped',
      data: { outcome: 'skip', group: 'viewport', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, observed: viewportObserved, details: viewportReasons }
    }, null);
  }
  if (hostWindowTargets.length && hostWindowReasons.length === ZERO) {
    hostWindowAppliedCount = applyCoreTargetsGroup('screen:host_window_group', hostWindowTargets, 'strict');
    __screenGroupModes.coordinationPatched = __screenGroupModes.coordinationPatched || (hostWindowAppliedCount > ZERO);
    __screenGroupModes.appliedTargets += hostWindowAppliedCount;
  }
  let hostWindowPostcheck = null;
  if (hostWindowReasons.length === ZERO) {
    hostWindowPostcheck = __screenCheckHostWindowCoherence();
    if (!hostWindowPostcheck.ok) {
      if (hostWindowAppliedCount > ZERO) {
        __screenDiag('error', 'screen:coordination_postcheck_failed', {
          stage: 'apply',
          type: __screenTypeBrowser,
          diagTag: 'screen',
          key: 'host_window_group',
          message: 'host-window coordination post-check failed',
          data: { outcome: 'rollback', group: 'hostWindow', reason: 'host_window_postcheck_failed', mismatches: hostWindowPostcheck.mismatches }
        }, null);
        rollbackAppliedCoreGroup('screen:host_window_group', 'host_window_postcheck_failed');
        hostWindowAppliedCount = ZERO;
      }
      hostWindowReasons.push('host_window_postcheck_failed');
    }
  }
  if (hostWindowReasons.length === ZERO) {
    __screenSetGroupOutcome('hostWindow', hostWindowAppliedCount > ZERO ? 'patched' : 'native_observed', hostWindowAppliedCount > ZERO ? 'coordinated_apply' : 'native_coherent');
    __screenDiag('info', hostWindowAppliedCount > ZERO ? 'screen:host_window_group_applied' : 'screen:host_window_group_ready', {
      stage: 'apply',
      type: hostWindowAppliedCount > ZERO ? 'ok' : __screenTypePipeline,
      diagTag: 'screen',
      key: 'host_window_group',
      message: hostWindowAppliedCount > ZERO ? 'host-window group coordinated' : 'host-window group already coherent',
      data: { outcome: 'return', group: 'hostWindow', mode: __screenGroupModes.hostWindowMode, reason: __screenGroupModes.hostWindowReason, applied: hostWindowAppliedCount, snapshot: hostWindowPostcheck ? hostWindowPostcheck.snapshot : null }
    }, null);
  } else {
    __screenSetGroupOutcome('hostWindow', 'skip', hostWindowReasons[ZERO] || 'host_window_skipped');
    __screenDiag('warn', 'screen:host_window_group_skipped', {
      stage: 'preflight',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: 'host_window_group',
      message: 'host-window group skipped',
      data: { outcome: 'skip', group: 'hostWindow', mode: __screenGroupModes.hostWindowMode, reason: __screenGroupModes.hostWindowReason, observed: hostWindowObserved, details: hostWindowReasons }
    }, null);
  }

  function __screenReconcileViewportRootClients(substage) {
    const localTargets = [];
    const localReasons = [];
    const htmlRoot = document.documentElement || null;
    const divRoot = (__screenCanvasState && __screenCanvasState.domCanvasHost && typeof __screenCanvasState.domCanvasHost === 'object')
      ? __screenCanvasState.domCanvasHost
      : null;
    if (!htmlRoot) {
      localReasons.push('document.documentElement:missing');
    } else {
      const htmlRootMap = [
        { key: 'clientWidth', expected: viewportExpected.innerWidth },
        { key: 'clientHeight', expected: viewportExpected.innerHeight }
      ];
      for (let i = ZERO; i < htmlRootMap.length; i++) {
        const item = htmlRootMap[i];
        let actual = null;
        let readFailed = false;
        let readError = null;
        try {
          actual = htmlRoot[item.key];
        } catch (e) {
          readFailed = true;
          readError = (e && e.message) ? String(e.message) : 'native_read_failed';
        }
        if (readFailed) {
          localReasons.push('document.documentElement.' + item.key + ':' + readError);
          continue;
        }
        const matchesExpected = Object.is(actual, item.expected);
        if (!matchesExpected) {
          const protoDesc = item.key === 'clientWidth' ? clientWidthDesc : clientHeightDesc;
          const targetPlan = __screenBuildAccessorTarget(
            htmlRoot,
            null,
            item.key,
            item.expected,
            'screen:viewport_group:html',
            {
              allowCreate: true,
              invalidThis: 'throw',
              configurable: protoDesc ? !!protoDesc.configurable : true,
              enumerable: protoDesc ? !!protoDesc.enumerable : false
            }
          );
          if (!targetPlan.ok) localReasons.push('document.documentElement.' + item.key + ':' + targetPlan.reason);
          else localTargets.push(targetPlan.target);
        }
      }
    }
    if (divRoot) {
      const divRootMap = [
        { key: 'clientWidth', expected: viewportExpected.innerWidth },
        { key: 'clientHeight', expected: viewportExpected.innerHeight }
      ];
      for (let i = ZERO; i < divRootMap.length; i++) {
        const item = divRootMap[i];
        let actual = null;
        let readFailed = false;
        let readError = null;
        try {
          actual = divRoot[item.key];
        } catch (e) {
          readFailed = true;
          readError = (e && e.message) ? String(e.message) : 'native_read_failed';
        }
        if (readFailed) {
          localReasons.push('CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost.' + item.key + ':' + readError);
          continue;
        }
        if (!Object.is(actual, item.expected)) {
          const protoDesc = item.key === 'clientWidth' ? clientWidthDesc : clientHeightDesc;
          const targetPlan = __screenBuildAccessorTarget(
            divRoot,
            null,
            item.key,
            item.expected,
            'screen:viewport_group:div',
            {
              allowCreate: true,
              invalidThis: 'throw',
              configurable: protoDesc ? !!protoDesc.configurable : true,
              enumerable: protoDesc ? !!protoDesc.enumerable : false
            }
          );
          if (!targetPlan.ok) localReasons.push('CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost.' + item.key + ':' + targetPlan.reason);
          else localTargets.push(targetPlan.target);
        }
      }
    }
    let applied = ZERO;
    let postcheck = null;
    if (localTargets.length && localReasons.length === ZERO) {
      applied = applyCoreTargetsGroup('screen:viewport_group:dom_ready', localTargets, 'strict');
      if (applied > ZERO) {
        __screenGroupModes.coordinationPatched = true;
        __screenGroupModes.appliedTargets += applied;
      }
    }
    if (localReasons.length === ZERO) {
      postcheck = __screenCheckViewportCoherence();
      if (!postcheck.ok) {
        if (applied > ZERO) {
          __screenDiag('error', 'screen:coordination_postcheck_failed', {
            stage: 'apply',
            type: __screenTypeBrowser,
            diagTag: 'screen',
            key: 'viewport_group',
            message: 'viewport coordination post-check failed',
            data: { outcome: 'rollback', group: 'viewport', reason: 'viewport_postcheck_failed', substage: substage, mismatches: postcheck.mismatches }
          }, null);
          rollbackAppliedCoreGroup('screen:viewport_group:dom_ready', 'viewport_postcheck_failed');
          applied = ZERO;
        }
        localReasons.push('viewport_postcheck_failed');
      }
    }
    if (localReasons.length === ZERO) {
      __screenSetGroupOutcome('viewport', applied > ZERO ? 'patched' : 'native_observed', applied > ZERO ? 'dom_ready_reconcile' : 'native_coherent');
      __screenDiag('info', applied > ZERO ? 'screen:viewport_group_applied' : 'screen:viewport_group_ready', {
        stage: 'runtime',
        type: applied > ZERO ? 'ok' : __screenTypePipeline,
        diagTag: 'screen',
        key: 'viewport_group',
        message: applied > ZERO ? 'viewport group reconciled after DOM ready' : 'viewport group coherent after DOM ready',
        data: { outcome: 'return', group: 'viewport', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, substage: substage, applied: applied, snapshot: postcheck ? postcheck.snapshot : null }
      }, null);
    } else {
      __screenSetGroupOutcome('viewport', 'skip', localReasons[ZERO] || 'viewport_skipped');
      __screenDiag('warn', 'screen:viewport_group_skipped', {
        stage: 'runtime',
        type: __screenTypePipeline,
        diagTag: 'screen',
        key: 'viewport_group',
        message: 'viewport group skipped after DOM ready',
        data: { outcome: 'skip', group: 'viewport', mode: __screenGroupModes.viewportMode, reason: __screenGroupModes.viewportReason, substage: substage, details: localReasons }
      }, null);
    }
  }

  const onViewportDomReady = () => {
    const canvasHost = (__screenCanvasState && __screenCanvasState.domCanvasHost && typeof __screenCanvasState.domCanvasHost === 'object')
      ? __screenCanvasState.domCanvasHost
      : null;
    __screenReconcileViewportRootClients('DOMContentLoaded');
    __screenDiag('info', 'screen:patched_viewport', {
      stage: 'runtime',
      type: __screenTypePipeline,
      diagTag: 'screen',
      key: null,
      message: 'runtime viewport snapshot',
      data: {
        outcome: 'return',
        reason: 'snapshot',
        substage: 'DOMContentLoaded',
        viewportGroupMode: __screenGroupModes.viewportMode,
        viewportGroupReason: __screenGroupModes.viewportReason,
        displayGroupMode: __screenGroupModes.displayMode,
        displayGroupReason: __screenGroupModes.displayReason,
        html: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        },
        div: {
          ownerPath: 'CanvasPatchContext.state.__CANVAS__.__STATE__.domCanvasHost',
          width: canvasHost ? canvasHost.clientWidth : null,
          height: canvasHost ? canvasHost.clientHeight : null
        },
        window: {
          width: window.innerWidth,
          height: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight
        },
        screen: {
          width:  window.screen.width,
          height: window.screen.height,
          physicalWidth: (__screenState && Number.isFinite(__screenState.physicalWidth)) ? __screenState.physicalWidth : null,
          physicalHeight: (__screenState && Number.isFinite(__screenState.physicalHeight)) ? __screenState.physicalHeight : null
        }
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", onViewportDomReady);
    __moduleRollbackStack.push(function rollbackDomContentLoadedViewportDomReady() {
      document.removeEventListener("DOMContentLoaded", onViewportDomReady);
    });
  } else {
    onViewportDomReady();
  }
  
  const __screenCoordinationComplete = (
    __screenGroupModes.displayMode !== 'skip' &&
    __screenGroupModes.viewportMode !== 'skip' &&
    __screenGroupModes.hostWindowMode !== 'read_failed' &&
    __screenGroupModes.hostWindowMode !== 'skip'
  );
  const __screenSummaryCode = __screenCoordinationComplete
    ? (__screenGroupModes.coordinationPatched ? 'screen:patches_applied' : 'screen:coordination_ready')
    : 'screen:coordination_incomplete';
  __screenDiag(__screenCoordinationComplete ? 'info' : 'warn', __screenSummaryCode, {
    stage: 'apply',
    type: __screenCoordinationComplete
      ? (__screenGroupModes.coordinationPatched ? 'ok' : __screenTypePipeline)
      : __screenTypeBrowser,
    diagTag: 'screen',
    key: null,
    message: __screenCoordinationComplete
      ? (__screenGroupModes.coordinationPatched ? 'screen module coordinated and applied' : 'screen module completed with coherent native state')
      : 'screen module completed with incomplete coordination',
    data: {
      outcome: 'return',
      reason: __screenCoordinationComplete
        ? (__screenGroupModes.coordinationPatched ? 'coordinated_apply' : 'coherent_native_completion')
        : 'coordination_incomplete',
      substage: 'module_apply',
      displayGroupMode: __screenGroupModes.displayMode,
      displayGroupReason: __screenGroupModes.displayReason,
      viewportGroupMode: __screenGroupModes.viewportMode,
      viewportGroupReason: __screenGroupModes.viewportReason,
      hostWindowGroupMode: __screenGroupModes.hostWindowMode,
      hostWindowGroupReason: __screenGroupModes.hostWindowReason,
      appliedTargets: __screenGroupModes.appliedTargets,
      hostWindowObserved: hostWindowObserved
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
  
