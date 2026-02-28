const NavTotalSetPatchModule = function NavTotalSetPatchModule(window) {
  if (!window.__PATCH_NAVTOTALSET__) {
    let __navGuardToken = null;
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};
    const __navTypePipeline = 'pipeline missing data';
    const __navTypeBrowser = 'browser structure missing data';

    // [NORMATIVE] local adapter for __DEGRADE__ (no console.*, safe-noop on failure)
    const __D = (G && G.__DEGRADE__) || (window && window.__DEGRADE__) || null;
    const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
    const __emit = (level, code, ctx, err) => {
      try {
        const _err = (typeof err === 'undefined') ? null : err;
        if (__diag) return __diag(level, code, ctx || null, _err);
        if (typeof __D === 'function') {
          const extra = (ctx && typeof ctx === 'object') ? Object.assign({ level }, ctx) : (ctx || { level });
          return __D(code, _err, extra || null);
        }
      } catch (_) {}
    };
    function __navDiag(level, code, extra, err) {
      try {
        const x = (extra && typeof extra === 'object') ? extra : {};
        const ctxKey = (typeof x.key === 'string' || x.key === null) ? x.key : null;
        const ctxDiagTag = (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'nav_total_set';
        const ctxStage = (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime';
        const ctxMessage = (typeof x.message === 'string' && x.message) ? x.message : String(code || 'nav_total_set');
        const ctxType = (typeof x.type === 'string' && x.type) ? x.type : __navTypePipeline;
        let ctxData = Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null;
        if (!ctxData || typeof ctxData !== 'object') {
          ctxData = { outcome: 'return' };
        } else if (typeof ctxData.outcome !== 'string' || !ctxData.outcome) {
          ctxData = Object.assign({ outcome: 'return' }, ctxData);
        }
        const ctx = {
          module: 'nav_total_set',
          diagTag: ctxDiagTag,
          surface: 'navigator',
          key: ctxKey,
          stage: ctxStage,
          message: ctxMessage,
          data: ctxData,
          type: ctxType
        };
        __emit(level, code, ctx, err);
      } catch (_) {
        // safe-noop
      }
    }
    function __navDiagPipeline(level, code, extra, err) {
      const x = (extra && typeof extra === 'object') ? extra : {};
      if (typeof x.type !== 'string' || !x.type) x.type = __navTypePipeline;
      if (typeof x.diagTag !== 'string' || !x.diagTag) x.diagTag = 'nav_total_set';
      __navDiag(level, code, x, err);
    }
    function __navDiagBrowser(level, code, extra, err) {
      const x = (extra && typeof extra === 'object') ? extra : {};
      if (typeof x.type !== 'string' || !x.type) x.type = __navTypeBrowser;
      if (typeof x.diagTag !== 'string' || !x.diagTag) x.diagTag = 'nav_total_set';
      __navDiag(level, code, x, err);
    }

    try {
      const __navCore = window.Core;
      if (__navCore && typeof __navCore.guardFlag === 'function') {
        __navGuardToken = __navCore.guardFlag('__PATCH_NAVTOTALSET__', 'nav_total_set');
      }
    } catch (_) {}
    if (!__navGuardToken) {
      __navDiagPipeline('warn', 'nav_total_set:guard_missing', {
        stage: 'guard',
        message: 'Core.guardFlag missing',
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      });
      return;
    }
    // Must run in Window realm (not Worker)
    if (typeof document === 'undefined' || !window || window.document !== document) {
      __navDiagBrowser('fatal', 'nav_total_set:not_window_realm', {
        stage: 'preflight',
        message: 'not in Window realm',
        data: { outcome: 'skip', reason: 'not_window_realm' }
      });
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
        }
      } catch (_) {}
      return;
    }

    const C = window.CanvasPatchContext;
    if (!C) {
      __navDiagPipeline('warn', 'nav_total_set:canvas_patch_context_missing', {
        stage: 'preflight',
        message: 'CanvasPatchContext missing'
      });
    }

    // basic random from the existing seed initialization
    const R = (window.rand && typeof window.rand.use === 'function') ? window.rand.use('nav') : null;
    if (typeof R !== 'function') {
      __navDiagPipeline('warn', 'nav_total_set:rand_missing', {
        stage: 'preflight',
        message: 'rand source missing'
      });
    }
    let mark = null;
    try {
      mark = (typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative() : null;
    } catch (e) {
      __navDiagPipeline('error', 'nav_total_set:mark_as_native_failed', {
        stage: 'preflight',
        message: '__ensureMarkAsNative failed',
        data: { outcome: 'skip', reason: 'ensure_mark_as_native_failed', policy: 'skip', action: 'native' }
      }, e);
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
        }
      } catch (_) {}
      return;
    }
    if (typeof mark !== 'function') {
      __navDiagPipeline('warn', 'nav_total_set:mark_as_native_missing', {
        stage: 'preflight',
        message: 'markAsNative missing',
        data: { outcome: 'skip', reason: 'missing_dep_mark_as_native', policy: 'skip', action: 'native' }
      });
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
        }
      } catch (_) {}
      return;
    }
    const __navMark = mark;
    const wrapStrictAccessor = (typeof window.__wrapStrictAccessor === 'function') ? window.__wrapStrictAccessor : null;
    if (typeof wrapStrictAccessor !== 'function') {
      __navDiagPipeline('warn', 'nav_total_set:wrap_strict_accessor_missing', {
        stage: 'preflight',
        message: 'wrapStrictAccessor missing',
        data: { outcome: 'skip', reason: 'missing_dep_wrap_strict_accessor', policy: 'skip', action: 'native' }
      });
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
        }
      } catch (_) {}
      return;
    }
    function registerPatchedTarget(owner, key, tag) {
      const coreRegisterPatchedTarget = (window.Core && typeof window.Core.registerPatchedTarget === 'function')
        ? window.Core.registerPatchedTarget
        : null;
      if (typeof coreRegisterPatchedTarget !== 'function') return;
      try {
        coreRegisterPatchedTarget(owner, key);
      } catch (e) {
        __navDiagBrowser('warn', (tag || 'nav_total_set') + ':register_target_failed', {
          stage: 'apply',
          diagTag: (tag || 'nav_total_set'),
          key: key || null,
          message: 'registerPatchedTarget failed'
        }, e);
        if (STRICT) throw e;
      }
    }

    try {
    // ---- Hard consistency for platform ----
    // ——— A. Input/meta ———
    const meta          = window.__EXPECTED_CLIENT_HINTS || {};
    const navPlat       = window.__NAV_PLATFORM__;     // 'Win32' | 'MacIntel'
    const gen           = window.__GENERATED_PLATFORM; // "Windows" | "macOS"
    const userAgent     = window.__USER_AGENT;
    const vendor        = window.__VENDOR;
    const mem           = Number(window.__memory);
    const cpu           = Number(window.__cpu);
    const dpr           = Number(window.__DPR);
    const width         = Number(window.__WIDTH  ?? (window.screen && window.screen.width));
    const height        = Number(window.__HEIGHT ?? (window.screen && window.screen.height));
    const devicesLabels = window.__DEVICES_LABELS;
    const colorDepth    = Number(window.__COLOR_DEPTH);
    const orientationDom = window.__ORIENTATION ?? ((height >= width) ? 'portrait-primary' : 'landscape-primary')

    // strictness & diagnostics
    const STRICT        = (window.__NAV_PATCH_STRICT__ !== undefined) ? !!window.__NAV_PATCH_STRICT__ : true;
    const DEBUG         = !!window.__NAV_PATCH_DEBUG__;
    let mediaDevicesLabelsUnlocked = false;
    let mediaMicGranted = false;
    let mediaCameraGranted = false;
    function syncMediaLabelsUnlocked() {
      mediaDevicesLabelsUnlocked = !!(mediaMicGranted || mediaCameraGranted);
    }

    if (!Number.isFinite(dpr) || dpr <= 0) {
      __navDiagPipeline('fatal', 'nav_total_set:bad_dpr', {
        stage: 'preflight',
        key: 'devicePixelRatio',
        message: 'bad __DPR',
        data: { outcome: 'skip', reason: 'bad_dpr', dpr: dpr }
      });
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
        }
      } catch (_) {}
      return;
    }

    // --- Navigator patch registry + logging (filter noise) ---
    const __navPatchedFns = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __navPatchedKeys = new Set();
    const __navSeen = new Set();
    let __navReceiverCheckDiagSent = false;
    function __navRegisterKey(key) {
      if (key != null) __navPatchedKeys.add(String(key));
    }
    function __navRegisterFn(fn) {
      if (__navPatchedFns && typeof fn === 'function') __navPatchedFns.add(fn);
    }
    function __navLogAccess(key, fn, extra) {
      const k = key != null ? String(key) : null;
      const keyOk = k && __navPatchedKeys.has(k);
      const fnOk = fn && __navPatchedFns && __navPatchedFns.has(fn);
      if (!keyOk && !fnOk) return;
      const token = keyOk ? k : fn;
      if (__navSeen.has(token)) return;
      __navSeen.add(token);
      __navDiag('info', 'nav_total_set:nav_access', {
        stage: 'runtime',
        diagTag: 'nav_total_set',
        key: k || null,
        message: 'nav access',
        data: { outcome: 'return', reason: 'nav_access', extra: extra || null }
      });
    }
    const __isNavigatorThis = (self) => {
      try {
        return self === navigator;
      } catch (e) {
        if (!__navReceiverCheckDiagSent) {
          __navReceiverCheckDiagSent = true;
          __navDiag('warn', 'nav_total_set:navigator_this_check_failed', {
            stage: 'guard',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set',
            key: null,
            message: 'Navigator receiver check failed',
            data: { policy: 'skip', action: 'native' }
          }, e);
        }
        return false;
      }
    };
    function __wrapGetter(key, getter, desc, validThis) {
      __navRegisterKey(key);
      if (typeof wrapStrictAccessor !== 'function') {
        if (desc && typeof desc.get === 'function') return desc.get;
        return getter;
      }
      const wrapped = wrapStrictAccessor(key, getter, desc, validThis, {
        onAccess: function (_, fn) { __navLogAccess(key, fn); }
      });
      if (typeof wrapped === 'function' && wrapped !== getter) __navRegisterFn(wrapped);
      return wrapped;
    }

    // mapping helpers (OS <-> DOM)
    const asDom = (os) => os === 'Windows' ? 'Win32' : (os === 'macOS' ? 'MacIntel' : os);
    const asOS  = (dom) => dom === 'Win32' ? 'Windows' : (dom === 'MacIntel' ? 'macOS' : dom);
    const looksDom = (v) => v === 'Win32' || v === 'MacIntel';

    // guards (inputs must be present)
    if (!gen) {
      __navDiag('fatal', 'nav_total_set:generated_platform_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'platform',
        message: 'GENERATED_PLATFORM missing',
        data: { outcome: 'skip', reason: 'missing_generated_platform' }
      });
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
        }
      } catch (_) {}
      return;
    }
    if (!navPlat) {
      __navDiag('fatal', 'nav_total_set:nav_platform_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'platform',
        message: 'NAV_PLATFORM__ missing',
        data: { outcome: 'skip', reason: 'missing_nav_platform' }
      });
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
        }
      } catch (_) {}
      return;
    }

    // normalize/validate CH.platform (must be OS-string)
    let chPlatform = meta.platform || gen;
    if (looksDom(chPlatform)) {
      const normalized = asOS(chPlatform);
      if (STRICT) {
        __navDiag('fatal', 'nav_total_set:ch_platform_dom_like', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'userAgentData.platform',
          message: `CH.platform '${chPlatform}' is DOM-like; expected OS-string (e.g. 'Windows'/'macOS')`,
          data: { outcome: 'skip', reason: 'ch_platform_dom_like', from: chPlatform, to: normalized }
        });
        try {
          const __navCore = window.Core;
          if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
            __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
          }
        } catch (_) {}
        return;
      } else {
        __navDiag('warn', 'nav_total_set:ch_platform_normalized', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'userAgentData.platform',
          data: { from: chPlatform, to: normalized }
        });
        chPlatform = normalized;
      }
    }

    const expectedNavPlat = asDom(gen);
    if (navPlat !== expectedNavPlat) {
      const msg = `NAV_PLATFORM__ (${navPlat}) inconsistent with ${gen} (expected ${expectedNavPlat})`;
      if (STRICT) {
        __navDiag('fatal', 'nav_total_set:nav_platform_inconsistent', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'platform',
          message: msg,
          data: { outcome: 'skip', reason: 'nav_platform_inconsistent', navPlat, generatedPlatform: gen, expectedNavPlat }
        });
        try {
          const __navCore = window.Core;
          if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
            __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, true, 'nav_total_set');
          }
        } catch (_) {}
        return;
      } else {
        __navDiag('warn', 'nav_total_set:nav_platform_inconsistent', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: 'nav_total_set',
          key: 'platform',
          message: msg,
          data: { navPlat, generatedPlatform: gen, expectedNavPlat }
        });
      }
    }
    const navPlatformOut = STRICT ? navPlat : expectedNavPlat;
    if (!window.__COLOR_DEPTH) {
      __navDiag('warn', 'nav_total_set:color_depth_missing', {
        stage: 'preflight',
        type: __navTypePipeline,
        diagTag: 'nav_total_set',
        key: 'colorDepth',
        message: 'colorDepth missing',
        data: { colorDepth: colorDepth }
      });
    }

    // ——— B. Safe helpers ———
    const navProto = Object.getPrototypeOf(navigator);
    function safeDefineAcc(target, key, getter, { enumerable = false } = {}) {
      if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
        throw new TypeError(`${key}: invalid target`);
      }
      const d = Object.getOwnPropertyDescriptor(target, key);
      if (d && d.configurable === false) {
        throw new TypeError(`${key}: non-configurable`);
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getter === 'function') ? getter.call(target) : getter;
        const applied = applyCoreTargetsGroup('nav_total_set:safeDefineAcc', [{
          owner: target,
          key,
          kind: 'data',
          wrapLayer: 'descriptor_only',
          policy: 'throw',
          diagTag: 'nav_total_set:safeDefineAcc',
          allowCreate: !d,
          value,
          writable: d ? !!d.writable : true,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : !!enumerable
        }], 'throw');
        if (applied !== 1) throw new TypeError(`failed to define ${key}`);
        return true;
      }
      let getFn = getter;
      if (typeof getter === 'function' && getter.name === '') {
        const acc = ({ get [key]() { return getter.call(this); } });
        getFn = Object.getOwnPropertyDescriptor(acc, key).get;
      }
      if (typeof getFn !== 'function') {
        throw new TypeError(`${key}: getter missing`);
      }
      const applied = applyCoreTargetsGroup('nav_total_set:safeDefineAcc', [{
        owner: target,
        key,
        kind: 'accessor',
        wrapLayer: 'named_wrapper',
        policy: 'throw',
        diagTag: 'nav_total_set:safeDefineAcc',
        allowCreate: !d,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : !!enumerable,
        invalidThis: 'throw',
        getImpl: function safeDefineAccGetImpl() {
          return Reflect.apply(getFn, this, []);
        }
      }], 'throw');
      if (applied !== 1) throw new TypeError(`failed to define ${key}`);
      return true;
    }

    function redefineAcc(proto, key, getImpl) {
      const d = Object.getOwnPropertyDescriptor(proto, key);
      if (d && d.configurable === false) {
        throw new TypeError(`${key}: non-configurable`);
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getImpl === 'function') ? getImpl.call(proto) : getImpl;
        const applied = applyCoreTargetsGroup('nav_total_set:redefineAcc', [{
          owner: proto,
          key,
          kind: 'data',
          wrapLayer: 'descriptor_only',
          policy: 'throw',
          diagTag: 'nav_total_set:redefineAcc',
          allowCreate: !d,
          value,
          writable: d ? !!d.writable : true,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : false
        }], 'throw');
        if (applied !== 1) throw new TypeError(`failed to define ${key}`);
        return;
      }
      let getFn = getImpl;
      if (typeof getImpl === 'function' && getImpl.name === '') {
        const acc = ({ get [key]() { return getImpl.call(this); } });
        getFn = Object.getOwnPropertyDescriptor(acc, key).get;
      }
      if (typeof getFn !== 'function') {
        throw new TypeError(`${key}: getter missing`);
      }
      const applied = applyCoreTargetsGroup('nav_total_set:redefineAcc', [{
        owner: proto,
        key,
        kind: 'accessor',
        wrapLayer: 'named_wrapper',
        policy: 'throw',
        diagTag: 'nav_total_set:redefineAcc',
        allowCreate: !d,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false,
        invalidThis: 'throw',
        getImpl: function redefineAccGetImpl() {
          return Reflect.apply(getFn, this, []);
        }
      }], 'throw');
      if (applied !== 1) throw new TypeError(`failed to define ${key}`);
    }

    function isSameDescriptor(actual, expected) {
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

    function cloneDescriptor(desc) {
      if (!desc) return null;
      const copy = {};
      if (Object.prototype.hasOwnProperty.call(desc, 'configurable')) copy.configurable = desc.configurable;
      if (Object.prototype.hasOwnProperty.call(desc, 'enumerable')) copy.enumerable = desc.enumerable;
      if (Object.prototype.hasOwnProperty.call(desc, 'writable')) copy.writable = desc.writable;
      if (Object.prototype.hasOwnProperty.call(desc, 'value')) copy.value = desc.value;
      if (Object.prototype.hasOwnProperty.call(desc, 'get')) copy.get = desc.get;
      if (Object.prototype.hasOwnProperty.call(desc, 'set')) copy.set = desc.set;
      return copy;
    }

    const __navModuleApplied = [];
    const __navModuleAppliedOwners = (typeof WeakMap === 'function') ? new WeakMap() : null;
    function rememberModuleApplied(planItem) {
      if (!planItem || !planItem.owner || typeof planItem.key !== 'string') return;
      const owner = planItem.owner;
      const key = String(planItem.key);
      if (__navModuleAppliedOwners) {
        let bucket = __navModuleAppliedOwners.get(owner);
        if (!bucket) {
          bucket = new Set();
          __navModuleAppliedOwners.set(owner, bucket);
        }
        if (bucket.has(key)) return;
        bucket.add(key);
      } else {
        for (let i = 0; i < __navModuleApplied.length; i++) {
          const row = __navModuleApplied[i];
          if (row && row.owner === owner && row.key === key) return;
        }
      }
      __navModuleApplied.push({
        owner,
        key,
        origDesc: cloneDescriptor(planItem.origDesc)
      });
    }

    function rollbackModuleApplied() {
      let rollbackErr = null;
      for (let i = __navModuleApplied.length - 1; i >= 0; i--) {
        const row = __navModuleApplied[i];
        if (!row || !row.owner || typeof row.key !== 'string') continue;
        try {
          if (row.origDesc) Object.defineProperty(row.owner, row.key, row.origDesc);
          else delete row.owner[row.key];
        } catch (e) {
          if (!rollbackErr) rollbackErr = e;
          __navDiagBrowser('error', 'nav_total_set:module_rollback_failed', {
            stage: 'rollback',
            diagTag: 'nav_total_set',
            key: row.key,
            message: 'module rollback failed'
          }, e);
        }
      }
      if (rollbackErr) throw rollbackErr;
    }

    function applyCoreTargetsGroup(groupTag, targets, policy) {
      const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
      let groupKey;
      if (Array.isArray(targets)) {
        for (let i = 0; i < targets.length; i++) {
          const t = targets[i];
          if (t && typeof t.key === 'string') {
            groupKey = t.key;
            break;
          }
        }
      }
      const Core = window.Core;
      if (!Core || typeof Core.applyTargets !== 'function') {
        const err = new Error('Core.applyTargets missing');
        __navDiag('error', groupTag + ':core_missing', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          message: 'Core.applyTargets missing',
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'core_missing' }
        }, err);
        if (groupPolicy === 'throw') throw err;
        return 0;
      }
      if (typeof Core.registerPatchedTarget !== 'function') {
        const err = new Error('Core.registerPatchedTarget missing');
        __navDiag('warn', groupTag + ':core_registry_missing', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          message: 'Core.registerPatchedTarget missing'
        }, err);
        if (groupPolicy === 'throw') throw err;
      }
      let plans = [];
      try {
        plans = Core.applyTargets(targets, window.__PROFILE__, []);
      } catch (e) {
        __navDiag('error', groupTag + ':preflight_failed', {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'preflight_exception' }
        }, e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }
      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : 'group_skipped';
        __navDiag('warn', groupTag + ':' + reason, {
          stage: 'preflight',
          type: __navTypePipeline,
          diagTag: groupTag,
          key: groupKey,
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: String(reason) }
        }, null);
        if (groupPolicy === 'throw') {
          throw new Error('target group skipped');
        }
        return 0;
      }

      const applied = [];
      let activeKey = groupKey;
      try {
        for (let i = 0; i < plans.length; i++) {
          const p = plans[i];
          if (!p || p.skipApply) continue;
          activeKey = (p && typeof p.key === 'string') ? p.key : activeKey;
          if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
            throw new Error('invalid plan item');
          }
          Object.defineProperty(p.owner, p.key, p.nextDesc);
          const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
          if (!isSameDescriptor(after, p.nextDesc)) {
            throw new Error('descriptor post-check mismatch');
          }
          applied.push(p);
        }

        // Side-effects only after full group apply succeeds (atomicity + registry/dedup invariant).
        for (let i = 0; i < applied.length; i++) {
          const p = applied[i];
          if (typeof p.value === 'function') __navRegisterFn(p.value);
          registerPatchedTarget(p.owner, p.key, groupTag);
          rememberModuleApplied(p);
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
            __navDiag('error', groupTag + ':rollback_failed', {
              stage: 'rollback',
              type: __navTypeBrowser,
              diagTag: groupTag,
              key: p.key || null,
              data: { outcome: 'rollback', reason: 'rollback_failed' }
            }, re);
          }
        }
        if (rollbackErr) {
          throw rollbackErr;
        }
        __navDiag('error', groupTag + ':apply_failed', {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: groupTag,
          key: activeKey,
          data: { outcome: (groupPolicy === 'throw') ? 'throw' : 'skip', reason: 'apply_failed' }
        }, e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }
      return applied.length;
    }

    // Critical - only a prototype (without a fallback)
    // Important: like native - not enumerable
    const critical = new Set(['userAgent','platform','vendor','appVersion']);
    (function patchCriticalOnProto(){
      const patch = (key, getter) => {
        const d = Object.getOwnPropertyDescriptor(navProto, key);
        if (!d) throw new TypeError(`${key}: descriptor missing`);
        if (typeof getter !== 'function') throw new TypeError(`${key}: getter missing`);
        __navRegisterKey(key);
        const applied = applyCoreTargetsGroup('nav_total_set:critical', [{
          owner: navProto,
          key: key,
          kind: 'accessor',
          wrapLayer: 'named_wrapper_strict',
          policy: 'strict',
          diagTag: 'nav_total_set:critical',
          allowCreate: false,
          configurable: !!d.configurable,
          enumerable: !!d.enumerable,
          validThis: __isNavigatorThis,
          invalidThis: 'throw',
          getImpl: function navCriticalGetImpl() {
            __navLogAccess(key, null);
            return getter.call(this);
          }
        }], 'throw');
        if (applied !== 1) throw new TypeError(`failed to define ${key}`);
      };      
      patch('userAgent',  () => userAgent);
      patch('platform',   () => navPlatformOut);
      patch('vendor',     () => vendor);
      patch('appVersion', () => {
        const pfx = "Mozilla/";
        return (typeof userAgent === "string" && userAgent.indexOf(pfx) === 0)
          ? userAgent.slice(pfx.length)
          : userAgent;
      });
    })();


    // rest
    const navigatorPatches = [
      ['productSub',           () => "20030107"],
      ['maxTouchPoints',       () => 0],
      ['buildID',              () => "20230501"],
      ['globalPrivacyControl', () => false],
      ['vendorSub',            () => ""]
    ];
    navigatorPatches.forEach(([prop, getter]) => {
      if (critical.has(prop)) return; 
      if (!(prop in navProto)) return;
      const d = Object.getOwnPropertyDescriptor(navProto, prop);
      const isData = !!(d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set);
      if (d && !isData) {
        __navRegisterKey(prop);
        const namedGet = Object.getOwnPropertyDescriptor(({ get [prop]() {
          __navLogAccess(prop, namedGet);
          if (!__isNavigatorThis(this)) {
            throw new TypeError();
          }
          return getter.call(this);
        }}), prop).get;
        __navRegisterFn(namedGet);
        safeDefineAcc(navProto, prop, namedGet);
      } else {
        const wrapped = __wrapGetter(prop, getter, d, __isNavigatorThis);
        safeDefineAcc(navProto, prop, wrapped);
      }
    });

    // ——— D. devicePixelRatio & screen.* ———
    // dpr: first we try to redefine own in window (often own), then — prototype
    (function () {
      const desc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
      if (desc && desc.configurable !== false) {
        safeDefineAcc(window, 'devicePixelRatio', function(){ return dpr; });
      } else {
        const acc = ({ get devicePixelRatio() { return dpr; } });
        const getDpr = Object.getOwnPropertyDescriptor(acc, 'devicePixelRatio').get;
        redefineAcc(Window.prototype, 'devicePixelRatio', getDpr);
      }
      // Post-apply invariant: devicePixelRatio must match profile DPR
      try {
        const actual = Number(window.devicePixelRatio);
        if (!Number.isFinite(actual) || actual !== dpr) {
          const msg = `devicePixelRatio mismatch (actual=${actual}, expected=${dpr})`;
          if (STRICT) {
            __navDiag('error', 'nav_total_set:dpr_mismatch', {
              stage: 'contract',
              type: __navTypePipeline,
              diagTag: 'nav_total_set',
              key: 'devicePixelRatio',
              message: msg,
              data: { actual: actual, expected: dpr }
            });
            return;
          }
          __navDiag('warn', 'nav_total_set:dpr_mismatch', {
            stage: 'contract',
            type: __navTypePipeline,
            diagTag: 'nav_total_set',
            key: 'devicePixelRatio',
            message: msg,
            data: { actual: actual, expected: dpr }
          });
        }
      } catch (e) {
        __navDiag(STRICT ? 'error' : 'warn', 'nav_total_set:dpr_check_failed', {
          stage: 'contract',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set',
          key: 'devicePixelRatio',
          message: 'devicePixelRatio check failed'
        }, e);
      }
    })();

    // oscpu (только если есть в прототипе)
    if ('oscpu' in navProto) {
      const dOscpu = Object.getOwnPropertyDescriptor(navProto, 'oscpu');
      const wrappedOscpu = __wrapGetter('oscpu', () => undefined, dOscpu, __isNavigatorThis);
      safeDefineAcc(navProto, 'oscpu', wrappedOscpu);
    }
    // ——— E. userAgentData (low + high entropy) ———
    if ('userAgentData' in navigator) {
      const nativeUAD = navigator.userAgentData;
      if (!nativeUAD) {
        __navDiag('error', 'nav_total_set:userAgentData_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData',
          key: 'userAgentData',
          message: 'window navigator.userAgentData missing'
        });
      } else {
        const uadProto = Object.getPrototypeOf(nativeUAD);
        if (!uadProto) {
          __navDiag('error', 'nav_total_set:userAgentData_proto_missing', {
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'window navigator.userAgentData proto missing'
          });
        } else {
          const isUadThis = (self) => (self === nativeUAD);

          const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
          const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
          const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
          if (!dBrands || !dMobile || !dPlatform) {
            __navDiag('error', 'nav_total_set:userAgentData_descriptor_missing', {
              stage: 'preflight',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:userAgentData',
              key: 'userAgentData',
              message: 'window navigator.userAgentData descriptor missing'
            });
          } else {
            const uadOwner = uadProto;
            const uadPolicy = 'throw';
            const uadValidThis = isUadThis;
            const uadInvalidThis = 'throw';
            const primitiveSpecs = [
              {
                key: 'brands',
                desc: dBrands,
                hasValue: function () { return Array.isArray(meta.brands) && meta.brands.length > 0; },
                readValue: function () { return meta.brands; },
                missingPreflightCode: 'nav_total_set:userAgentData_brands_missing',
                missingRuntimeCode: 'nav_total_set:userAgentData_brands_runtime_missing',
                missingMessage: 'uaData.brands missing'
              },
              {
                key: 'mobile',
                desc: dMobile,
                hasValue: function () { return typeof meta.mobile === 'boolean'; },
                readValue: function () { return meta.mobile; },
                missingPreflightCode: 'nav_total_set:userAgentData_mobile_missing',
                missingRuntimeCode: 'nav_total_set:userAgentData_mobile_runtime_missing',
                missingMessage: 'uaData.mobile missing'
              },
              {
                key: 'platform',
                desc: dPlatform,
                hasValue: function () { return typeof chPlatform === 'string' && !!chPlatform; },
                readValue: function () { return chPlatform; },
                missingPreflightCode: 'nav_total_set:userAgentData_platform_missing',
                missingRuntimeCode: 'nav_total_set:userAgentData_platform_runtime_missing',
                missingMessage: 'uaData.platform missing'
              }
            ];

            for (let i = 0; i < primitiveSpecs.length; i++) {
              const spec = primitiveSpecs[i];
              const fullKey = 'userAgentData.' + spec.key;
              const isData = Object.prototype.hasOwnProperty.call(spec.desc, 'value') && !spec.desc.get && !spec.desc.set;
              __navRegisterKey(fullKey);

              if (isData) {
                if (!spec.hasValue()) {
                  __navDiag('error', spec.missingPreflightCode, {
                    stage: 'preflight',
                    type: __navTypePipeline,
                    diagTag: 'nav_total_set:' + fullKey,
                    key: fullKey,
                    message: spec.missingMessage
                  });
                } else {
                  applyCoreTargetsGroup('nav_total_set:' + fullKey, [{
                    owner: uadOwner,
                    key: spec.key,
                    kind: 'data',
                    wrapLayer: 'descriptor_only',
                    policy: uadPolicy,
                    diagTag: 'nav_total_set:' + fullKey,
                    value: spec.readValue(),
                    writable: !!spec.desc.writable,
                    configurable: !!spec.desc.configurable,
                    enumerable: !!spec.desc.enumerable
                  }], 'throw');
                }
              } else {
                const origGet = (typeof spec.desc.get === 'function') ? spec.desc.get : null;
                applyCoreTargetsGroup('nav_total_set:' + fullKey, [{
                  owner: uadOwner,
                  key: spec.key,
                  kind: 'accessor',
                  wrapLayer: 'named_wrapper_strict',
                  policy: 'strict',
                  diagTag: 'nav_total_set:' + fullKey,
                  configurable: !!spec.desc.configurable,
                  enumerable: !!spec.desc.enumerable,
                  validThis: uadValidThis,
                  invalidThis: uadInvalidThis,
                  getImpl: function userAgentDataPrimitiveGetImpl() {
                    if (spec.hasValue()) return spec.readValue();
                    __navDiag('error', spec.missingRuntimeCode, {
                      stage: 'runtime',
                      type: __navTypePipeline,
                      diagTag: 'nav_total_set:' + fullKey,
                      key: fullKey,
                      message: spec.missingMessage
                    });
                    if (typeof origGet === 'function') return Reflect.apply(origGet, this, []);
                    return undefined;
                  }
                }], 'throw');
              }
            }
            // `fullVersionList` is a high-entropy key returned by
            // `getHighEntropyValues()`, not stable NavigatorUAData properties across Chromium.
            // Do not create synthetic descriptors on `NavigatorUAData` here (avoid shape drift).
        function dropOwnIfConfigurable(obj, key) {
          const ownDesc = Object.getOwnPropertyDescriptor(obj, key);
          if (ownDesc && ownDesc.configurable) {
           try {
             delete obj[key];
          } catch (e) {
            __navDiag('error', 'nav_total_set:userAgentData_dropOwn_failed', {
              stage: 'apply',
              type: __navTypeBrowser,
              diagTag: 'nav_total_set:userAgentData',
              key: key || null,
              message: 'dropOwn failed'
            }, e);
          }
        }
      }

      const ghevDesc = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
      const origGHEV = ghevDesc && ghevDesc.value;
      if (!ghevDesc || typeof origGHEV !== 'function') {
        __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
          key: 'userAgentData.getHighEntropyValues',
          message: 'uaData.getHighEntropyValues missing'
        });
      } else {
        __navRegisterKey('userAgentData.getHighEntropyValues');
        dropOwnIfConfigurable(nativeUAD, 'getHighEntropyValues');
        applyCoreTargetsGroup('nav_total_set:userAgentData.getHighEntropyValues', [{
          owner: uadProto,
          key: 'getHighEntropyValues',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
          validThis: isUadThis,
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('userAgentData.getHighEntropyValues', null);
            const keys = (args && args.length) ? args[0] : undefined;
            if (!Array.isArray(keys)) {
              __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_bad_keys', {
                stage: 'runtime',
                type: __navTypePipeline,
                diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                key: 'userAgentData.getHighEntropyValues',
                message: 'bad highEntropy keys',
                data: { outcome: 'return', reason: 'bad_keys' }
              });
              return Reflect.apply(orig, this, args || []);
             }
             const nativeOut = Reflect.apply(orig, this, args || []);
             if (!nativeOut || typeof nativeOut.then !== 'function') {
               const err = new TypeError('promise_contract_failed');
               __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_promise_contract_failed', {
                 stage: 'runtime',
                 type: __navTypePipeline,
                 diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                 key: 'userAgentData.getHighEntropyValues',
                 message: 'promise_contract_failed',
                 data: { outcome: 'return', reason: 'promise_contract_failed' }
               }, err);
               // Public API path must not leak service errors; pass-through native behavior.
               return Reflect.apply(orig, this, args || []);
             }
             const fullVersionList = (meta && meta.fullVersionList != null)
               ? meta.fullVersionList
               : window.__FULL_VERSION_LIST;
              const map = {
                architecture: meta.architecture,
                bitness: meta.bitness,
                model: meta.model,
                brands: meta.brands,
                mobile: meta.mobile,
                platform: chPlatform,
                platformVersion: meta.platformVersion,
                fullVersionList: fullVersionList,
                deviceMemory: mem,
                hardwareConcurrency: cpu,
                wow64: meta.wow64,
                formFactors: meta.formFactors
              };
             const result = {};
             for (const hint of keys) {
               if (typeof hint !== 'string' || !hint) {
                 __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_bad_hint', {
                   stage: 'runtime',
                   type: __navTypePipeline,
                   diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                   key: 'userAgentData.getHighEntropyValues',
                   message: 'bad highEntropy key item',
                   data: { outcome: 'return', reason: 'bad_hint' }
                 });
                 return nativeOut;
               }
               const val = map[hint];
               if (val === undefined || val === null || (typeof val === 'string' && !val && hint !== 'model') || (Array.isArray(val) && !val.length)) {
                 continue;
               }
               result[hint] = val;
             }
             return nativeOut.then(function userAgentDataGetHighEntropyValuesPost(nativeResolved) {
               try {
                 const base = (nativeResolved && typeof nativeResolved === 'object') ? nativeResolved : {};
                 const out = Object.assign({}, base, result);
                 return out;
               } catch (e) {
                 __navDiag('error', 'nav_total_set:userAgentData_getHighEntropyValues_hooksPost_failed', {
                   stage: 'runtime',
                   type: __navTypePipeline,
                   diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
                   key: 'userAgentData.getHighEntropyValues',
                   message: 'hooksPost_failed',
                   data: { outcome: 'return', reason: 'hooksPost_failed' }
                 }, e);
                 return nativeResolved;
               }
             });
            }
          }], 'throw');
       }

      const toJsonDesc = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
      const origToJSON = toJsonDesc && toJsonDesc.value;
      if (!toJsonDesc || typeof origToJSON !== 'function') {
        __navDiag('error', 'nav_total_set:userAgentData_toJSON_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData.toJSON',
          key: 'userAgentData.toJSON',
          message: 'uaData.toJSON missing'
        });
      } else {
        __navRegisterKey('userAgentData.toJSON');
        dropOwnIfConfigurable(nativeUAD, 'toJSON');
        applyCoreTargetsGroup('nav_total_set:userAgentData.toJSON', [{
          owner: uadProto,
          key: 'toJSON',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:userAgentData.toJSON',
          validThis: isUadThis,
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('userAgentData.toJSON', null);
            try {
              return { platform: this.platform, brands: this.brands, mobile: this.mobile };
            } catch (e) {
              __navDiag('error', 'nav_total_set:userAgentData_toJSON_runtime_failed', {
                stage: 'runtime',
                type: __navTypeBrowser,
                diagTag: 'nav_total_set:userAgentData.toJSON',
                key: 'userAgentData.toJSON',
                message: 'uaData.toJSON runtime failed'
              }, e);
              return Reflect.apply(orig, this, args || []);
            }
          }
        }], 'throw');
      }

    // IMPORTANT: getter — on PROTOTYPE, without own-fallback
    const dUaData = Object.getOwnPropertyDescriptor(navProto, 'userAgentData');
    if (!dUaData) {
      __navDiag('error', 'nav_total_set:userAgentData_getter_descriptor_missing', {
        stage: 'preflight',
        type: __navTypeBrowser,
        diagTag: 'nav_total_set:userAgentData',
        key: 'userAgentData',
        message: 'userAgentData descriptor missing'
      });
    } else {
      __navRegisterKey('userAgentData');
      const getUserAgentData = Object.getOwnPropertyDescriptor(({ get userAgentData() {
        __navLogAccess('userAgentData', getUserAgentData);
        if (!__isNavigatorThis(this)) {
          throw new TypeError();
        }
        return nativeUAD;
      }}), 'userAgentData').get;
      __navRegisterFn(getUserAgentData);
      const appliedUaData = applyCoreTargetsGroup('nav_total_set:userAgentData', [{
        owner: navProto,
        key: 'userAgentData',
        kind: 'accessor',
        wrapLayer: 'named_wrapper_strict',
        policy: 'strict',
        diagTag: 'nav_total_set:userAgentData',
        configurable: !!dUaData.configurable,
        enumerable: !!dUaData.enumerable,
        validThis: __isNavigatorThis,
        invalidThis: 'throw',
        getImpl: function getUserAgentDataImpl() {
          return Reflect.apply(getUserAgentData, this, []);
        }
      }], 'throw');
      if (appliedUaData !== 1) {
        __navDiag('error', 'nav_total_set:userAgentData_define_failed', {
          stage: 'apply',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:userAgentData',
          key: 'userAgentData',
          message: 'failed to define userAgentData'
        });
      } else {
        const uadTag = Object.prototype.toString.call(nativeUAD);
        if (uadTag === '[object Object]') {
          __navDiag('warn', 'nav_total_set:userAgentData_tag_suspicious', {
            stage: 'contract',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'window navigator.userAgentData tag'
          });
        }
        const uadCtor = Object.getPrototypeOf(nativeUAD) && Object.getPrototypeOf(nativeUAD).constructor;
        if (!uadCtor || uadCtor.name === 'Object') {
          __navDiag('warn', 'nav_total_set:userAgentData_proto_suspicious', {
            stage: 'contract',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:userAgentData',
            key: 'userAgentData',
            message: 'window navigator.userAgentData proto'
          });
        }
        __navDiag('info', 'nav_total_set:uaData_toJSON_ok', {
          stage: 'apply',
          type: __navTypePipeline,
          diagTag: 'nav_total_set:userAgentData',
          key: 'userAgentData'
        });
      }
    }
    }
    }
    }

    // ——— F. deviceMemory/hardwareConcurrency ———
    const hasDeviceMemory = ('deviceMemory' in navigator);
    const dDeviceMemory = Object.getOwnPropertyDescriptor(navProto, 'deviceMemory');
    const getDeviceMemory = Object.getOwnPropertyDescriptor(({ get deviceMemory() {
      __navLogAccess('deviceMemory', getDeviceMemory);
      if (!__isNavigatorThis(this)) {
        throw new TypeError();
      }
      return mem;
    }}), 'deviceMemory').get;
    __navRegisterKey('deviceMemory');
    __navRegisterFn(getDeviceMemory);
    if (hasDeviceMemory) {
      if (!dDeviceMemory) {
        __navDiag('error', 'nav_total_set:deviceMemory_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set',
          key: 'deviceMemory',
          message: 'deviceMemory descriptor missing'
        });
      } else {
        const dmIsData = Object.prototype.hasOwnProperty.call(dDeviceMemory, 'value') && !dDeviceMemory.get && !dDeviceMemory.set;
        const appliedDeviceMemory = applyCoreTargetsGroup('nav_total_set:deviceMemory', [{
          owner: navProto,
          key: 'deviceMemory',
          kind: 'accessor',
          wrapLayer: 'named_wrapper_strict',
          policy: 'strict',
          diagTag: 'nav_total_set:deviceMemory',
          configurable: !!dDeviceMemory.configurable,
          enumerable: !!dDeviceMemory.enumerable,
          allowShapeChange: !!dmIsData,
          validThis: __isNavigatorThis,
          invalidThis: 'throw',
          getImpl: function deviceMemoryGetImpl() {
            return Reflect.apply(getDeviceMemory, this, []);
          }
        }], 'throw');
        if (appliedDeviceMemory !== 1) {
          __navDiag('error', 'nav_total_set:deviceMemory_define_failed', {
            stage: 'apply',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set',
            key: 'deviceMemory',
            message: 'failed to define deviceMemory'
          });
        }
      }
    }

    const hasHardwareConcurrency = ('hardwareConcurrency' in navigator);
    const dHardwareConcurrency = Object.getOwnPropertyDescriptor(navProto, 'hardwareConcurrency');
    const getHardwareConcurrency = Object.getOwnPropertyDescriptor(({ get hardwareConcurrency() {
      __navLogAccess('hardwareConcurrency', getHardwareConcurrency);
      if (!__isNavigatorThis(this)) {
        throw new TypeError();
      }
      return cpu;
    }}), 'hardwareConcurrency').get;
    __navRegisterKey('hardwareConcurrency');
    __navRegisterFn(getHardwareConcurrency);
    if (hasHardwareConcurrency) {
      if (!dHardwareConcurrency) {
        __navDiag('error', 'nav_total_set:hardwareConcurrency_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set',
          key: 'hardwareConcurrency',
          message: 'hardwareConcurrency descriptor missing'
        });
      } else {
        const hcIsData = Object.prototype.hasOwnProperty.call(dHardwareConcurrency, 'value') && !dHardwareConcurrency.get && !dHardwareConcurrency.set;
        const appliedHardwareConcurrency = applyCoreTargetsGroup('nav_total_set:hardwareConcurrency', [{
          owner: navProto,
          key: 'hardwareConcurrency',
          kind: 'accessor',
          wrapLayer: 'named_wrapper_strict',
          policy: 'strict',
          diagTag: 'nav_total_set:hardwareConcurrency',
          configurable: !!dHardwareConcurrency.configurable,
          enumerable: !!dHardwareConcurrency.enumerable,
          allowShapeChange: !!hcIsData,
          validThis: __isNavigatorThis,
          invalidThis: 'throw',
          getImpl: function hardwareConcurrencyGetImpl() {
            return Reflect.apply(getHardwareConcurrency, this, []);
          }
        }], 'throw');
        if (appliedHardwareConcurrency !== 1) {
          __navDiag('error', 'nav_total_set:hardwareConcurrency_define_failed', {
            stage: 'apply',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set',
            key: 'hardwareConcurrency',
            message: 'failed to define hardwareConcurrency'
          });
        }
      }
    }

    // ——— G. language(s) ———
    const hasLanguage = ('language' in navigator);
    const dLanguage = Object.getOwnPropertyDescriptor(navProto, 'language');
    const getLanguage = Object.getOwnPropertyDescriptor(({ get language() {
      __navLogAccess('language', getLanguage);
      if (!__isNavigatorThis(this)) {
        throw new TypeError();
      }
      return window.__primaryLanguage;
    }}), 'language').get;
    __navRegisterKey('language');
    __navRegisterFn(getLanguage);
    if (hasLanguage) {
      if (!dLanguage) {
        __navDiag('error', 'nav_total_set:language_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set',
          key: 'language',
          message: 'language descriptor missing'
        });
      } else {
        const langIsData = Object.prototype.hasOwnProperty.call(dLanguage, 'value') && !dLanguage.get && !dLanguage.set;
        const appliedLanguage = applyCoreTargetsGroup('nav_total_set:language', [{
          owner: navProto,
          key: 'language',
          kind: 'accessor',
          wrapLayer: 'named_wrapper_strict',
          policy: 'strict',
          diagTag: 'nav_total_set:language',
          configurable: !!dLanguage.configurable,
          enumerable: !!dLanguage.enumerable,
          allowShapeChange: !!langIsData,
          validThis: __isNavigatorThis,
          invalidThis: 'throw',
          getImpl: function languageGetImpl() {
            return Reflect.apply(getLanguage, this, []);
          }
        }], 'throw');
        if (appliedLanguage !== 1) {
          __navDiag('error', 'nav_total_set:language_define_failed', {
            stage: 'apply',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set',
            key: 'language',
            message: 'failed to define language'
          });
        }
      }
    }

    const hasLanguages = ('languages' in navigator);
    const dLanguages = Object.getOwnPropertyDescriptor(navProto, 'languages');
    const getLanguages = Object.getOwnPropertyDescriptor(({ get languages() {
      __navLogAccess('languages', getLanguages);
      if (!__isNavigatorThis(this)) {
        throw new TypeError();
      }
      return window.__normalizedLanguages;
    }}), 'languages').get;
    __navRegisterKey('languages');
    __navRegisterFn(getLanguages);
    if (hasLanguages) {
      if (!dLanguages) {
        __navDiag('error', 'nav_total_set:languages_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set',
          key: 'languages',
          message: 'languages descriptor missing'
        });
      } else {
        const langsIsData = Object.prototype.hasOwnProperty.call(dLanguages, 'value') && !dLanguages.get && !dLanguages.set;
        const appliedLanguages = applyCoreTargetsGroup('nav_total_set:languages', [{
          owner: navProto,
          key: 'languages',
          kind: 'accessor',
          wrapLayer: 'named_wrapper_strict',
          policy: 'strict',
          diagTag: 'nav_total_set:languages',
          configurable: !!dLanguages.configurable,
          enumerable: !!dLanguages.enumerable,
          allowShapeChange: !!langsIsData,
          validThis: __isNavigatorThis,
          invalidThis: 'throw',
          getImpl: function languagesGetImpl() {
            return Reflect.apply(getLanguages, this, []);
          }
        }], 'throw');
        if (appliedLanguages !== 1) {
          __navDiag('error', 'nav_total_set:languages_define_failed', {
            stage: 'apply',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set',
            key: 'languages',
            message: 'failed to define languages'
          });
        }
      }
    }

  
   
    // ——— H. permissions.query ———
    if ('permissions' in navigator && navigator.permissions && typeof navigator.permissions.query === 'function') {
      const permProto = Object.getPrototypeOf(navigator.permissions) || navigator.permissions;
      const permDesc = Object.getOwnPropertyDescriptor(permProto, 'query')
        || Object.getOwnPropertyDescriptor(navigator.permissions, 'query');
      if (!permDesc) {
        __navDiag('error', 'nav_total_set:permissions_query_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:permissions.query',
          key: 'permissions.query',
          message: 'permissions.query descriptor missing'
        });
      } else {
        __navRegisterKey('permissions.query');
        applyCoreTargetsGroup('nav_total_set:permissions.query', [{
        owner: permProto,
        key: 'query',
        kind: 'promise_method',
        wrapLayer: 'named_wrapper',
        invokeClass: 'brand_strict',
        wrapperClass: 'synthetic_named',
        policy: 'throw',
        diagTag: 'nav_total_set:permissions.query',
        validThis(self) {
          return self === navigator.permissions;
        },
        invalidThis: 'throw',
        invoke(orig, args) {
          const parameters = (args && args.length) ? args[0] : undefined;
          const permName = (parameters && typeof parameters === 'object' && typeof parameters.name === 'string')
            ? parameters.name
            : null;
          if (permName === 'microphone') {
            const sourceName = 'audioinput';

          const label = (devicesLabels && typeof devicesLabels === 'object') ? devicesLabels[sourceName] : undefined;
          const out = Reflect.apply(orig, this, args || []);
          if (!label) {
            __navDiag('warn', 'nav_total_set:permissions_query_devices_label_missing', {
              stage: 'runtime',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:permissions.query',
              key: 'permissions.query',
              message: 'devices_labels.audioinput missing for permissions.query("microphone")'
            });
          }

          return Promise.resolve(out).then(function onPermissionsQueryResolved(status) {
            const state = (status && typeof status === 'object' && typeof status.state === 'string') ? status.state : null;
            mediaMicGranted = state === 'granted';
            syncMediaLabelsUnlocked();
            __navLogAccess('permissions.query', null, {
              permission: permName,
              source: sourceName,
              state,
              mediaDevicesLabelsUnlocked
            });
            return status;
          });

          }
          if (permName === 'camera') {
            const out = Reflect.apply(orig, this, args || []);
            return Promise.resolve(out).then(function onPermissionsQueryResolved(status) {
              const state = (status && typeof status === 'object' && typeof status.state === 'string') ? status.state : null;
              mediaCameraGranted = state === 'granted';
              syncMediaLabelsUnlocked();
              __navLogAccess('permissions.query', null, {
                permission: permName,
                state,
                mediaDevicesLabelsUnlocked
              });
              return status;
            });
          }
          __navLogAccess('permissions.query', null);
          return Reflect.apply(orig, this, args || []);
        }
      }], 'throw');
      }
    }

    // ——— I. mediaDevices.enumerateDevices ———
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      const mediaProto = Object.getPrototypeOf(navigator.mediaDevices) || navigator.mediaDevices;
      const mediaDesc = Object.getOwnPropertyDescriptor(mediaProto, 'enumerateDevices')
        || Object.getOwnPropertyDescriptor(navigator.mediaDevices, 'enumerateDevices');
      if (!mediaDesc) {
        __navDiag('error', 'nav_total_set:mediaDevices_enumerateDevices_descriptor_missing', {
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
          key: 'mediaDevices.enumerateDevices',
          message: 'mediaDevices.enumerateDevices descriptor missing'
        });
      } else {
        __navRegisterKey('mediaDevices.enumerateDevices');
        applyCoreTargetsGroup('nav_total_set:mediaDevices.enumerateDevices', [{
        owner: mediaProto,
        key: 'enumerateDevices',
        kind: 'promise_method',
        wrapLayer: 'named_wrapper',
        invokeClass: 'brand_strict',
        wrapperClass: 'synthetic_named',
        policy: 'throw',
        diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
        validThis(self) {
          return self === navigator.mediaDevices;
        },
        invalidThis: 'throw',
        invoke(orig, args) {
          if (!devicesLabels || typeof devicesLabels !== 'object') {
            __navDiag('error', 'nav_total_set:mediaDevices_devices_labels_missing', {
              stage: 'runtime',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
              key: 'mediaDevices.enumerateDevices',
              message: 'devices labels missing'
            });
            return Reflect.apply(orig, this, args || []);
          }
          if (typeof devicesLabels.audioinput !== 'string'
            || typeof devicesLabels.videoinput !== 'string'
            || typeof devicesLabels.audiooutput !== 'string') {
            __navDiag('error', 'nav_total_set:mediaDevices_devices_labels_invalid', {
              stage: 'runtime',
              type: __navTypePipeline,
              diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
              key: 'mediaDevices.enumerateDevices',
              message: 'devices labels invalid'
            });
            return Reflect.apply(orig, this, args || []);
          }
          if (typeof R !== 'function') {
            return Reflect.apply(orig, this, args || []);
          }
          const generateHexId = (len = 64) => {
            let s = '';
            for (let i = 0; i < len; ++i) s += Math.floor(R() * 16).toString(16);
            return s;
          };
          const audioUnlocked = !!mediaMicGranted;
          const videoUnlocked = !!mediaCameraGranted;
          __navLogAccess('mediaDevices.enumerateDevices', null, {
            multimediaDevices: { speakers: 1, micros: 1, webcams: 1 },
            labelsHidden: !(audioUnlocked || videoUnlocked),
            audioUnlocked,
            videoUnlocked
          });
          const groupId = generateHexId(64);
          return Promise.resolve([
            {
              kind: 'audioinput',
              label: audioUnlocked ? devicesLabels.audioinput : '',
              deviceId: audioUnlocked ? generateHexId(64) : '',
              groupId: audioUnlocked ? groupId : ''
            },
            {
              kind: 'videoinput',
              label: videoUnlocked ? devicesLabels.videoinput : '',
              deviceId: videoUnlocked ? generateHexId(64) : '',
              groupId: videoUnlocked ? groupId : ''
            },
            {
              kind: 'audiooutput',
              label: audioUnlocked ? devicesLabels.audiooutput : '',
              deviceId: audioUnlocked ? generateHexId(64) : '',
              groupId: audioUnlocked ? generateHexId(64) : ''
            }
          ]);
        }
      }], 'throw');
      }
    }

    // ——— J. storage.estimate & webkitTemporaryStorage ———
     // Конфигурация: берём из глобалов (как и прочие параметры в модуле), иначе безопасные дефолты
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      const storageProto = Object.getPrototypeOf(navigator.storage) || navigator.storage;
      const storageDesc = Object.getOwnPropertyDescriptor(storageProto, 'estimate')
        || Object.getOwnPropertyDescriptor(navigator.storage, 'estimate');
      if (!storageDesc) {
        __navDiag('error', 'nav_total_set:storage_estimate_descriptor_missing', {
          surface: 'storage',
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:storage.estimate',
          key: 'storage.estimate',
          message: 'storage.estimate descriptor missing'
        });
      } else {
      const QUOTA_MB   = Number(window.__STORAGE_QUOTA_MB   ?? 120);
      const USED_PCT   = Math.max(0, Math.min(100, Number(window.__STORAGE_USED_PCT ?? 3))); // ~3% занято
      const quotaBytes = Math.floor(QUOTA_MB * 1024 * 1024);
      let usageBytes   = Math.max(0, Math.floor(quotaBytes * USED_PCT / 100));

      // Monotonous “jitter” of usage within a few KB, on R(), so as not to break the module’s entropy
      const tickUsage = __navMark(function tickUsage() {
        if (typeof R === 'function') {
          usageBytes = Math.min(quotaBytes - 4096, usageBytes + Math.floor(R() * 4096));
        }
      }, 'tickUsage');

      const origEstimate = storageDesc.value || navigator.storage.estimate;
      if (typeof origEstimate !== 'function') {
        __navDiag('error', 'nav_total_set:storage_estimate_original_missing', {
          surface: 'storage',
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:storage.estimate',
          key: 'storage.estimate',
          message: 'storage.estimate original missing'
        });
      } else {
        __navRegisterKey('storage.estimate');
        applyCoreTargetsGroup('nav_total_set:storage.estimate', [{
        owner: storageProto,
        key: 'estimate',
        kind: 'promise_method',
        wrapLayer: 'named_wrapper',
        invokeClass: 'brand_strict',
        wrapperClass: 'synthetic_named',
        policy: 'throw',
        diagTag: 'nav_total_set:storage.estimate',
        validThis(self) {
          return self === navigator.storage;
        },
        invalidThis: 'throw',
        invoke(_orig, _args) {
          __navLogAccess('storage.estimate', null);
          tickUsage();
          return Promise.resolve({ quota: quotaBytes, usage: usageBytes });
        }
      }], 'throw');
      }
      if (navigator.webkitTemporaryStorage) {
        const tmpProto = Object.getPrototypeOf(navigator.webkitTemporaryStorage) || navigator.webkitTemporaryStorage;
        const tmpDesc = Object.getOwnPropertyDescriptor(tmpProto, 'queryUsageAndQuota')
          || Object.getOwnPropertyDescriptor(navigator.webkitTemporaryStorage, 'queryUsageAndQuota');
        if (!tmpDesc) {
          __navDiag('error', 'nav_total_set:webkitTemporaryStorage_queryUsageAndQuota_descriptor_missing', {
            surface: 'storage',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
            key: 'webkitTemporaryStorage.queryUsageAndQuota',
            message: 'webkitTemporaryStorage.queryUsageAndQuota descriptor missing'
          });
        } else {
          __navRegisterKey('webkitTemporaryStorage.queryUsageAndQuota');
          applyCoreTargetsGroup('nav_total_set:webkitTemporaryStorage.queryUsageAndQuota', [{
          owner: tmpProto,
          key: 'queryUsageAndQuota',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
          validThis(self) {
            return self === navigator.webkitTemporaryStorage || self === tmpProto;
          },
          invalidThis: 'throw',
          invoke(_orig, args) {
            __navLogAccess('webkitTemporaryStorage.queryUsageAndQuota', null);
            const success = (args && args.length) ? args[0] : undefined;
            const error = (args && args.length > 1) ? args[1] : undefined;
            try {
              tickUsage();
            } catch (e) {
              __navDiag('error', 'nav_total_set:webkitTemporaryStorage_queryUsageAndQuota', {
                surface: 'storage',
                stage: 'runtime',
                type: __navTypeBrowser,
                diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
                key: 'webkitTemporaryStorage.queryUsageAndQuota',
                message: 'webkitTemporaryStorage.queryUsageAndQuota failed'
              }, e);
              if (typeof _orig === 'function') return Reflect.apply(_orig, this, args || []);
              if (typeof error === 'function') error(e);
              return undefined;
            }
            if (typeof success === 'function') success(usageBytes, quotaBytes);
            return undefined;
          }
        }], 'throw');
        }
      }

      // Consistent “persistence”
      if (typeof navigator.storage.persist   === 'function') {
        const persistDesc = Object.getOwnPropertyDescriptor(storageProto, 'persist')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persist');
        if (!persistDesc) {
          __navDiag('error', 'nav_total_set:storage_persist_descriptor_missing', {
            surface: 'storage',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:storage.persist',
            key: 'storage.persist',
            message: 'storage.persist descriptor missing'
          });
        } else {
          __navRegisterKey('storage.persist');
          applyCoreTargetsGroup('nav_total_set:storage.persist', [{
          owner: storageProto,
          key: 'persist',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:storage.persist',
          validThis(self) {
            return self === navigator.storage;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('storage.persist', null);
            const out = Reflect.apply(orig, this, args || []);
            return Promise.resolve(out);
          }
        }], 'throw');
        }
      }
      if (typeof navigator.storage.persisted === 'function') {
        const persistedDesc = Object.getOwnPropertyDescriptor(storageProto, 'persisted')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persisted');
        if (!persistedDesc) {
          __navDiag('error', 'nav_total_set:storage_persisted_descriptor_missing', {
            surface: 'storage',
            stage: 'preflight',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:storage.persisted',
            key: 'storage.persisted',
            message: 'storage.persisted descriptor missing'
          });
        } else {
          __navRegisterKey('storage.persisted');
          applyCoreTargetsGroup('nav_total_set:storage.persisted', [{
          owner: storageProto,
          key: 'persisted',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:storage.persisted',
          validThis(self) {
            return self === navigator.storage;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('storage.persisted', null);
            const out = Reflect.apply(orig, this, args || []);
            return Promise.resolve(out);
          }
        }], 'throw');
        }
      }
      }
    }

      // ———  JS heap sizing from deviceMemory ———
      // if-стиль: патчим только если dm валиден
      // dm: 0.25, 0.5, 1, 2, 4, 8, …
      // читаем dm каждый раз — «жёсткая» привязка к текущему realm
      // dm нелегален → не вмешиваемся (оставляем натив/предыдущее)
    const perfProto = (window.Performance && Performance.prototype) || Object.getPrototypeOf(performance);
    if (perfProto) {
      const dm0 = Number(navigator.deviceMemory);
      if (typeof dm0 === 'number' && isFinite(dm0)) {

        const heapFromDM = __navMark(function heapFromDM(dm) {
          if (!(typeof dm === 'number' && isFinite(dm))) return null;
          if (dm <= 0.5) return 512  * 1024 * 1024;   
          if (dm <= 1)   return 768  * 1024 * 1024;   
          if (dm <= 2)   return 1536 * 1024 * 1024;   
          if (dm <= 4)   return 3072 * 1024 * 1024;   
          return 4096 * 1024 * 1024;                  
        }, 'heapFromDM');
        const getMemory = __navMark(function () {
          const dm = Number(navigator.deviceMemory);
          const limit = heapFromDM(dm);
          if (limit == null) {
            const d = Object.getOwnPropertyDescriptor(perfProto, 'memory')
                    || Object.getOwnPropertyDescriptor(performance, 'memory');
            return d && d.get ? d.get.call(performance) : undefined;
          }
          const total = Math.floor(limit * 0.25);
          const randMix = (typeof R === 'function') ? (0.40 + 0.15 * R()) : 0.40;
          const used  = Math.min(total - 1, Math.floor(total * randMix));
          return { jsHeapSizeLimit: limit, totalJSHeapSize: total, usedJSHeapSize: used };
        }, 'get memory');

        try {
          redefineAcc(perfProto, 'memory', getMemory);
        } catch (e) {
          __navDiag('warn', 'nav_total_set:performance_memory_proto', {
            surface: 'performance',
            stage: 'apply',
            type: __navTypeBrowser,
            diagTag: 'nav_total_set:performance.memory',
            key: 'performance.memory',
            message: 'performance.memory proto define failed',
            data: { policy: 'skip', action: 'native' }
          }, e);
        }
      }
    }

    // ——— K. WebAuthn (stub) ———
    if (!window.PublicKeyCredential) {
      window.PublicKeyCredential = __navMark(function PublicKeyCredential() {}, 'PublicKeyCredential');
      Object.defineProperty(PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: __navMark(function isUserVerifyingPlatformAuthenticatorAvailable() { return Promise.resolve(true); },
             'isUserVerifyingPlatformAuthenticatorAvailable')
      });
    }
    if (navigator.credentials) {
      const origCreate = navigator.credentials.create;
      const origGet    = navigator.credentials.get;
      const credProto = Object.getPrototypeOf(navigator.credentials) || navigator.credentials;
      const createDesc = Object.getOwnPropertyDescriptor(credProto, 'create')
        || Object.getOwnPropertyDescriptor(navigator.credentials, 'create');
      const getDesc = Object.getOwnPropertyDescriptor(credProto, 'get')
        || Object.getOwnPropertyDescriptor(navigator.credentials, 'get');
      if (!createDesc || !getDesc) {
        __navDiag('error', 'nav_total_set:credentials_descriptor_missing', {
          surface: 'credentials',
          stage: 'preflight',
          type: __navTypeBrowser,
          diagTag: 'nav_total_set:credentials',
          key: !createDesc ? 'credentials.create' : 'credentials.get',
          message: 'credentials descriptor missing'
        });
      } else {
        __navRegisterKey('credentials.create');
        __navRegisterKey('credentials.get');
        applyCoreTargetsGroup('nav_total_set:credentials', [
        {
          owner: credProto,
          key: 'create',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:credentials.create',
          validThis(self) {
            return self === navigator.credentials || self === credProto;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('credentials.create', null);
            const options = (args && args.length) ? args[0] : undefined;
            const isCredThis = (this === navigator.credentials || this === credProto);
            if (!isCredThis) return Reflect.apply(orig, this, args || []);
            if (options && options.publicKey) {
              return origCreate ? Reflect.apply(orig, this, args || []) : Promise.resolve(new PublicKeyCredential());
            }
            return origCreate ? Reflect.apply(orig, this, args || []) : Promise.resolve(undefined);
          }
        },
        {
          owner: credProto,
          key: 'get',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          wrapperClass: 'core_proxy',
          policy: 'throw',
          diagTag: 'nav_total_set:credentials.get',
          validThis(self) {
            return self === navigator.credentials || self === credProto;
          },
          invalidThis: 'throw',
          invoke(orig, args) {
            __navLogAccess('credentials.get', null);
            const options = (args && args.length) ? args[0] : undefined;
            const isCredThis = (this === navigator.credentials || this === credProto);
            if (!isCredThis) return Reflect.apply(orig, this, args || []);
            if (options && options.publicKey) {
              return origGet ? Reflect.apply(orig, this, args || []) : Promise.resolve(new PublicKeyCredential());
            }
            return origGet ? Reflect.apply(orig, this, args || []) : Promise.resolve(undefined);
          }
        }
      ], 'throw');
      }
    }
    __navDiag('info', 'nav_total_set:webauthn_mock_applied', {
      stage: 'apply',
      type: __navTypePipeline,
      diagTag: 'nav_total_set'
    });

    // ——— L. Plugins & MimeTypes ———
    const profiles = Array.isArray(window.__PLUGIN_PROFILES__) ? window.__PLUGIN_PROFILES__ : [];
      function safeString(val) { return (typeof val === 'symbol' || typeof val === 'undefined') ? '' : String(val); }

      const fakeMimeTypes = [];
      profiles.forEach((pl, pi) =>
        (pl.mimeTypes || []).forEach(mt => {
          const d = (typeof mt === 'string') ? { type: mt, suffixes: '', description: '' } : mt;
          fakeMimeTypes.push({
            type:        safeString(d.type),
            suffixes: safeString(d.suffixes ?? ''),
            description: safeString(d.description ?? ''),
            pluginIndex: pi
          });
        })
      );

      const fakePlugins = profiles.map((pl, i) => ({
        name:        safeString(pl.name),
        filename:    safeString(pl.filename),
        description: safeString(pl.description),
        mimeTypes:   fakeMimeTypes.filter(m => m.pluginIndex === i)
      }));

      // --- Caching (one instance per page) ---
      let __PLUGIN_ARRAY_SINGLETON__ = null;
      let __MIMETYPE_ARRAY_SINGLETON__ = null;
      let __MIME_OBJECTS_SINGLETON__ = null;

      // 4.3. PluginArray (enumerable fields, compatible with JSON/assign)
      function createPluginArray(plugins) {
        if (__PLUGIN_ARRAY_SINGLETON__) return __PLUGIN_ARRAY_SINGLETON__;

        const arr = [];
        const mimeObjects = [];
        for (let i = 0; i < plugins.length; i++) {
          const p = plugins[i];
          const itemMethod = ({ item(index) { return this[index] || null; } }).item;
          const namedItemMethod = ({ namedItem(type) {
            for (let j = 0; j < this.length; j++) if (this[j]?.type === type) return this[j];
            return null;
          } }).namedItem;

          // Create plugin object: metadata non-enumerable, mime indexes enumerable
          const pluginObj = Object.create(Plugin.prototype, {
            name:        { value: String(p.name),        enumerable: false, configurable: true },
            filename:    { value: String(p.filename),    enumerable: false, configurable: true },
            description: { value: String(p.description), enumerable: false, configurable: true },
            length:      { value: p.mimeTypes.length,    enumerable: false, configurable: true },
            item: {
              value: __navMark(itemMethod, 'item'),
              enumerable: false, configurable: true
            },
            namedItem: {
              value: __navMark(namedItemMethod, 'namedItem'),
              enumerable: false, configurable: true
            }
          });

          // mime-??????? (enumerable ????, enabledPlugin ? ?? pluginObj)
          for (let j = 0; j < p.mimeTypes.length; j++) {
            const m = p.mimeTypes[j];
            const mType = String(m.type);
            const mimeObj = Object.create(MimeType.prototype, {
              type:         { value: mType,                  enumerable: true, configurable: true },
              suffixes: { value: String(m.suffixes ?? ''),enumerable: true, configurable: true },
              description: { value: String(m.description ?? ''), enumerable: true, configurable: true },
              enabledPlugin:{ value: pluginObj,             enumerable: true, configurable: true }
            });
            // index on the plugin itself ? enumerable
            Object.defineProperty(pluginObj, String(j), { value: mimeObj, enumerable: true, configurable: true });
            if (mType) {
              Object.defineProperty(pluginObj, mType, { value: mimeObj, enumerable: false, configurable: true });
            }
            mimeObjects.push(mimeObj);
          }

          arr.push(pluginObj);
        }

        // array of plugins
        const pluginArray = Object.create(PluginArray.prototype, {
          length:    { value: arr.length, enumerable: true, configurable: true },
          item:      { value: __navMark(({ item(index) { return pluginArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: __navMark(({ namedItem(name) { for (let i = 0; i < arr.length; i++) if (pluginArray[String(i)]?.name === name) return pluginArray[String(i)]; return null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
        });

        // Indexes ? enumerable + named props (non-enumerable)
        for (let i = 0; i < arr.length; i++) {
          const pluginObj = arr[i];
          Object.defineProperty(pluginArray, String(i), { value: pluginObj, enumerable: true, configurable: true });
          const pname = pluginObj && pluginObj.name;
          if (pname) {
            Object.defineProperty(pluginArray, pname, { value: pluginObj, enumerable: false, configurable: true });
          }
        }

        __MIME_OBJECTS_SINGLETON__ = mimeObjects;
        __PLUGIN_ARRAY_SINGLETON__ = pluginArray;
        return pluginArray;
      }

      // MimeTypeArray (in same time - for case of direct circulation)
      function createMimeTypeArray(plugins) {
        if (__MIMETYPE_ARRAY_SINGLETON__) return __MIMETYPE_ARRAY_SINGLETON__;

        createPluginArray(plugins);
        const mimes = Array.isArray(__MIME_OBJECTS_SINGLETON__) ? __MIME_OBJECTS_SINGLETON__ : [];
        const mimeArray = Object.create(MimeTypeArray.prototype, {
          length:    { value: mimes.length, enumerable: true, configurable: true },
          item:      { value: __navMark(({ item(index) { return mimeArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: __navMark(({ namedItem(type) { return mimeArray[type] || null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
        });

        for (let i = 0; i < mimes.length; i++) {
          const mimeObj = mimes[i];
          Object.defineProperty(mimeArray, String(i), { value: mimeObj, enumerable: true, configurable: true });
          const type = mimeObj && mimeObj.type;
          if (type) {
            Object.defineProperty(mimeArray, type, { value: mimeObj, enumerable: false, configurable: true });
          }
        }

        __MIMETYPE_ARRAY_SINGLETON__ = mimeArray;
        return mimeArray;
      }

      // Getters - like in ORIG: enumerable: true
      if ('plugins' in navigator) {
        const dPlugins = Object.getOwnPropertyDescriptor(navProto, 'plugins');
        safeDefineAcc(navProto, 'plugins', __wrapGetter('plugins', () => createPluginArray(fakePlugins), dPlugins, __isNavigatorThis), { enumerable: true });
      }
      if ('mimeTypes' in navigator) {
        const dMimeTypes = Object.getOwnPropertyDescriptor(navProto, 'mimeTypes');
        safeDefineAcc(navProto, 'mimeTypes', __wrapGetter('mimeTypes', () => createMimeTypeArray(fakePlugins), dMimeTypes, __isNavigatorThis), { enumerable: true });
      }

   
   
    //  ——— Debug information (unified log) ———
  if (G.__DEBUG__) {
    const hasUAD = ('userAgentData' in navigator);
    __navDiag('debug', 'nav_total_set:debug', {
      stage: 'runtime',
      type: __navTypePipeline,
      diagTag: 'nav_total_set',
      message: 'debug snapshot',
      data: {
        meta: meta,
        hasUAD: hasUAD,
        secureContext: G.isSecureContext
      }
    });
    __navDiag('info', 'nav_total_set:applied', {
      stage: 'apply',
      type: __navTypePipeline,
      diagTag: 'nav_total_set',
      data: { outcome: 'return', reason: 'patched' }
    });
  }

    }
    } catch (e) {
      let rollbackErr = null;
      try {
        rollbackModuleApplied();
      } catch (re) {
        rollbackErr = re;
      }
      __navDiagBrowser('fatal', 'nav_total_set:fatal', {
        stage: 'apply',
        diagTag: 'nav_total_set',
        key: null,
        message: 'fatal module error',
        data: { outcome: 'throw', reason: 'fatal', rollbackOk: !rollbackErr }
      }, rollbackErr || e);
      try {
        const __navCore = window.Core;
        if (__navGuardToken && __navCore && typeof __navCore.releaseGuardFlag === 'function') {
          __navCore.releaseGuardFlag('__PATCH_NAVTOTALSET__', __navGuardToken, !rollbackErr, 'nav_total_set');
        }
      } catch (_) {}
      throw (rollbackErr || e);
    }
  }
}
