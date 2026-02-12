const NavTotalSetPatchModule = function NavTotalSetPatchModule(window) {
  if (!window.__PATCH_NAVTOTALSET__) {
      window.__PATCH_NAVTOTALSET__ = true;
    // Must run in Window realm (not Worker)
    if (typeof document === 'undefined' || !window || window.document !== document) {
      throw new Error('[nav_total_set] not in Window realm');
    }

    const C = window.CanvasPatchContext;
      if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
    const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self !== 'undefined' && self)
      || (typeof window !== 'undefined' && window)
      || {};

    // basic random from the existing seed initialization
    const R = window.rand.use('nav');
    if (typeof R !== 'function') {
      throw new Error('[NavTotalSetPatchModule] "R" is not initialized');
    }
    const mark = (() => {
      const ensure = (typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
      const fn = ensure ? ensure() : null;
      if (typeof fn !== 'function') {
        throw new Error('[NavTotalSetPatchModule] markAsNative missing');
      }
      return fn;
    })();
    const wrapStrictAccessor = (typeof window.__wrapStrictAccessor === 'function') ? window.__wrapStrictAccessor : null;
    if (typeof wrapStrictAccessor !== 'function') {
      throw new Error('[NavTotalSetPatchModule] __wrapStrictAccessor missing');
    }
    const coreRegisterPatchedTarget = (window.Core && typeof window.Core.registerPatchedTarget === 'function')
      ? window.Core.registerPatchedTarget
      : null;
    function registerPatchedTarget(owner, key, tag) {
      if (typeof coreRegisterPatchedTarget !== 'function') return;
      try {
        coreRegisterPatchedTarget(owner, key);
      } catch (e) {
        __navDiag('warn', (tag || 'nav_total_set') + ':register_target_failed', { key: key || null }, e);
        if (STRICT) throw e;
      }
    }
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

    if (!Number.isFinite(dpr) || dpr <= 0) {
      throw new Error('[nav_total_set] bad __DPR');
    }

    // --- Navigator patch registry + logging (filter noise) ---
    const __navPatchedFns = (typeof WeakSet === 'function') ? new WeakSet() : null;
    const __navPatchedKeys = new Set();
    const __navSeen = new Set();
    const __navLogPush = (function () {
      const logArr = Array.isArray(window._myDebugLog) ? window._myDebugLog : null;
      return function (entry) {
        try { if (logArr) logArr.push(entry); } catch (e) {
          if (typeof __navDegrade === 'function') {
            try { __navDegrade('nav_total_set:debuglog_push_failed', e, { entryType: entry && entry.type || null }); } catch (_) {}
          }
        }
      };
    })();
    const __navDegrade = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
    function __navDiag(level, code, extra, err) {
      if ((level === 'warn' || level === 'error') && typeof __navDegrade === 'function') {
        __navDegrade(code || 'nav_total_set', err || null, extra || null);
        return;
      }
      const entry = { type: 'nav_' + level, code: code || null, extra: extra || null, timestamp: new Date().toISOString() };
      if (err instanceof Error) {
        entry.error = { name: err.name, message: err.message, stack: err.stack || null };
      }
      __navLogPush(entry);
    }
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
      __navLogPush({ type: 'nav_access', key: k || null, extra: extra || null, timestamp: new Date().toISOString() });
    }
    const __isNavigatorThis = (self) => {
      try {
        return self === navigator || (typeof Navigator === 'function' && self instanceof Navigator);
      } catch (_) {
        return false;
      }
    };
    function __wrapGetter(key, getter, desc, validThis) {
      __navRegisterKey(key);
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
    if (!gen)            throw new Error('[nav_total_set] GENERATED_PLATFORM missing');
    if (!navPlat)        throw new Error('[nav_total_set] NAV_PLATFORM__ missing');

    // normalize/validate CH.platform (must be OS-string)
    let chPlatform = meta.platform || gen;
    if (looksDom(chPlatform)) {
      const normalized = asOS(chPlatform);
      if (STRICT) {
        throw new Error(`[nav_total_set] CH.platform '${chPlatform}' is DOM-like; expected OS-string (e.g. 'Windows'/'macOS')`);
      } else {
        __navDiag('warn', 'nav_total_set:ch_platform_normalized', { from: chPlatform, to: normalized });
        chPlatform = normalized;
      }
    }

    const expectedNavPlat = asDom(gen);
    if (navPlat !== expectedNavPlat) {
      const msg = `[nav_total_set] NAV_PLATFORM__ (${navPlat}) inconsistent with ${gen} (expected ${expectedNavPlat})`;
      if (STRICT) throw new Error(msg); else __navDiag('warn', 'nav_total_set:nav_platform_inconsistent', { message: msg });
    }
    const navPlatformOut = STRICT ? navPlat : expectedNavPlat;
    if (!window.__COLOR_DEPTH) __navDiag('warn', 'nav_total_set:color_depth_missing', { colorDepth });

    // ——— B. Safe helpers ———
    const navProto = Object.getPrototypeOf(navigator);
    function safeDefineAcc(target, key, getter, { enumerable = false } = {}) {
      if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
        throw new TypeError(`[nav_total_set] ${key}: invalid target`);
      }
      const d = Object.getOwnPropertyDescriptor(target, key);
      if (d && d.configurable === false) {
        throw new TypeError(`[nav_total_set] ${key}: non-configurable`);
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getter === 'function') ? getter.call(target) : getter;
        const applied = applyCoreTargetsGroup('nav_total_set:safeDefineAcc', [{
          owner: target,
          key,
          kind: 'data',
          policy: 'throw',
          diagTag: 'nav_total_set:safeDefineAcc',
          allowCreate: !d,
          value,
          writable: d ? !!d.writable : true,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : !!enumerable
        }], 'throw');
        if (applied !== 1) throw new TypeError(`[nav_total_set] failed to define ${key}`);
        return true;
      }
      let getFn = getter;
      if (typeof getter === 'function' && getter.name === '') {
        const acc = ({ get [key]() { return getter.call(this); } });
        getFn = Object.getOwnPropertyDescriptor(acc, key).get;
      }
      if (typeof getFn !== 'function') {
        throw new TypeError(`[nav_total_set] ${key}: getter missing`);
      }
      const applied = applyCoreTargetsGroup('nav_total_set:safeDefineAcc', [{
        owner: target,
        key,
        kind: 'accessor',
        policy: 'throw',
        diagTag: 'nav_total_set:safeDefineAcc',
        allowCreate: !d,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : !!enumerable,
        invalidThis: 'native',
        getImpl: function safeDefineAccGetImpl() {
          return Reflect.apply(getFn, this, []);
        }
      }], 'throw');
      if (applied !== 1) throw new TypeError(`[nav_total_set] failed to define ${key}`);
      return true;
    }

    function defineAccWithFallback(objOrProto, key, getter, { enumerable } = {}) {
      // use for non-critical fields; для E/F/G Do not use(см. ниже)
      if (safeDefineAcc(objOrProto, key, getter, { enumerable })) return true;
      throw new TypeError(`[nav_total_set] failed to define ${key}`);
    }
    function redefineAcc(proto, key, getImpl) {
      const d = Object.getOwnPropertyDescriptor(proto, key);
      if (d && d.configurable === false) {
        throw new TypeError(`[nav_total_set] ${key}: non-configurable`);
      }
      const isData = d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set;
      if (isData) {
        const value = (typeof getImpl === 'function') ? getImpl.call(proto) : getImpl;
        const applied = applyCoreTargetsGroup('nav_total_set:redefineAcc', [{
          owner: proto,
          key,
          kind: 'data',
          policy: 'throw',
          diagTag: 'nav_total_set:redefineAcc',
          allowCreate: !d,
          value,
          writable: d ? !!d.writable : true,
          configurable: d ? !!d.configurable : true,
          enumerable: d ? !!d.enumerable : false
        }], 'throw');
        if (applied !== 1) throw new TypeError(`[nav_total_set] failed to define ${key}`);
        return;
      }
      let getFn = getImpl;
      if (typeof getImpl === 'function' && getImpl.name === '') {
        const acc = ({ get [key]() { return getImpl.call(this); } });
        getFn = Object.getOwnPropertyDescriptor(acc, key).get;
      }
      if (typeof getFn !== 'function') {
        throw new TypeError(`[nav_total_set] ${key}: getter missing`);
      }
      const applied = applyCoreTargetsGroup('nav_total_set:redefineAcc', [{
        owner: proto,
        key,
        kind: 'accessor',
        policy: 'throw',
        diagTag: 'nav_total_set:redefineAcc',
        allowCreate: !d,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false,
        invalidThis: 'native',
        getImpl: function redefineAccGetImpl() {
          return Reflect.apply(getFn, this, []);
        }
      }], 'throw');
      if (applied !== 1) throw new TypeError(`[nav_total_set] failed to define ${key}`);
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

    function applyCoreTargetsGroup(groupTag, targets, policy) {
      const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
      const Core = window.Core;
      if (!Core || typeof Core.applyTargets !== 'function') {
        const err = new Error('[nav_total_set] Core.applyTargets missing');
        __navDiag('error', groupTag + ':core_missing', null, err);
        if (groupPolicy === 'throw') throw err;
        return 0;
      }
      let plans = [];
      try {
        plans = Core.applyTargets(targets, window.__PROFILE__, []);
      } catch (e) {
        __navDiag('error', groupTag + ':preflight_failed', null, e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }
      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : 'group_skipped';
        __navDiag('warn', groupTag + ':' + reason, null, null);
        if (groupPolicy === 'throw') {
          throw new Error('[nav_total_set] target group skipped');
        }
        return 0;
      }

      const applied = [];
      try {
        for (let i = 0; i < plans.length; i++) {
          const p = plans[i];
          if (!p || p.skipApply) continue;
          if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
            throw new Error('[nav_total_set] invalid plan item');
          }
          Object.defineProperty(p.owner, p.key, p.nextDesc);
          const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
          if (!isSameDescriptor(after, p.nextDesc)) {
            throw new Error('[nav_total_set] descriptor post-check mismatch');
          }
          if (typeof p.value === 'function') __navRegisterFn(p.value);
          registerPatchedTarget(p.owner, p.key, groupTag);
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
            __navDiag('error', groupTag + ':rollback_failed', { key: p.key || null }, re);
          }
        }
        if (rollbackErr) {
          if (groupPolicy === 'throw') throw rollbackErr;
          return 0;
        }
        __navDiag('error', groupTag + ':apply_failed', null, e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }
      return applied.length;
    }


    // Critical - only a prototype (without a phallback)
    const critical = new Set(['userAgent','platform','vendor','appVersion']);
    // Critical - only a prototype (without a fallback)
    (function patchCriticalOnProto(){
      const patch = (key, getter) => {
        const d = Object.getOwnPropertyDescriptor(navProto, key);
        if (!d) throw new TypeError(`[nav_total_set] ${key}: descriptor missing`);
        if (typeof getter !== 'function') throw new TypeError(`[nav_total_set] ${key}: getter missing`);
        // Important: like native - not enumerable
        const origGet = (d && typeof d.get === 'function') ? d.get : null;
        __navRegisterKey(key);
        const namedGet = Object.getOwnPropertyDescriptor(({ get [key]() {
          __navLogAccess(key, namedGet);
          if (!__isNavigatorThis(this)) {
            if (typeof origGet === 'function') return Reflect.apply(origGet, this, arguments);
            throw new TypeError();
          }
          return getter.call(this);
        }}), key).get;
        __navRegisterFn(namedGet);
        const ok = (redefineAcc(navProto, key, namedGet), true);
        if (ok === false) throw new TypeError(`[nav_total_set] failed to define ${key}`);
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
      if (critical.has(prop)) return; // just in case
      if (!(prop in navProto)) return; // do not introduce non-native props (Chrome/Edge: e.g. buildID)
      const d = Object.getOwnPropertyDescriptor(navProto, prop);
      const isData = !!(d && Object.prototype.hasOwnProperty.call(d, 'value') && !d.get && !d.set);
      if (d && !isData) {
        const origGet = (typeof d.get === 'function') ? d.get : null;
        __navRegisterKey(prop);
        const namedGet = Object.getOwnPropertyDescriptor(({ get [prop]() {
          __navLogAccess(prop, namedGet);
          if (!__isNavigatorThis(this)) {
            if (typeof origGet === 'function') return Reflect.apply(origGet, this, arguments);
            throw new TypeError();
          }
          return getter.call(this);
        }}), prop).get;
        __navRegisterFn(namedGet);
        defineAccWithFallback(navProto, prop, namedGet);
      } else {
        const wrapped = __wrapGetter(prop, getter, d, __isNavigatorThis);
        defineAccWithFallback(navProto, prop, wrapped);
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
          const msg = `[nav_total_set] devicePixelRatio mismatch (actual=${actual}, expected=${dpr})`;
          if (STRICT) throw new Error(msg);
          __navDiag('warn', 'nav_total_set:dpr_mismatch', { actual, expected: dpr, message: msg });
        }
      } catch (e) {
        if (STRICT) throw e;
        __navDiag('warn', 'nav_total_set:dpr_check_failed', null, e);
      }
    })();

    // Screen.* is patched by ScreenPatchModule to keep a single patch owner.

    // oscpu (только если есть в прототипе)
    if ('oscpu' in navProto) {
      const dOscpu = Object.getOwnPropertyDescriptor(navProto, 'oscpu');
      const wrappedOscpu = __wrapGetter('oscpu', () => undefined, dOscpu, __isNavigatorThis);
      defineAccWithFallback(navProto, 'oscpu', wrappedOscpu);
    }
    // ——— E. userAgentData (low + high entropy) ———
    if ('userAgentData' in navigator) {
      const nativeUAD = navigator.userAgentData;
      if (!nativeUAD) throw new Error('THW: window navigator.userAgentData missing');
      const uadProto = Object.getPrototypeOf(nativeUAD);
      if (!uadProto) throw new Error('THW: window navigator.userAgentData proto missing');
      const isUadThis = (self) => (self === nativeUAD);

      const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
      const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
      const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
      if (!dBrands || !dMobile || !dPlatform) {
        throw new Error('THW: window navigator.userAgentData descriptor missing');
      }
      if (dBrands) {
        __navRegisterKey('userAgentData.brands');
        const isData = Object.prototype.hasOwnProperty.call(dBrands, 'value') && !dBrands.get && !dBrands.set;
        if (isData) {
          const value = (() => {
            if (!Array.isArray(meta.brands) || !meta.brands.length) throw new Error('THW: uaData.brands missing');
            return meta.brands;
          })();
          applyCoreTargetsGroup('nav_total_set:userAgentData.brands', [{
            owner: uadProto,
            key: 'brands',
            kind: 'data',
            policy: 'throw',
            diagTag: 'nav_total_set:userAgentData.brands',
            value,
            writable: !!dBrands.writable,
            configurable: !!dBrands.configurable,
            enumerable: !!dBrands.enumerable
          }], 'throw');
        } else {
          applyCoreTargetsGroup('nav_total_set:userAgentData.brands', [{
            owner: uadProto,
            key: 'brands',
            kind: 'accessor',
            policy: 'throw',
            diagTag: 'nav_total_set:userAgentData.brands',
            configurable: !!dBrands.configurable,
            enumerable: !!dBrands.enumerable,
            validThis: isUadThis,
            invalidThis: 'native',
            getImpl: function userAgentDataBrandsGetImpl() {
              if (!Array.isArray(meta.brands) || !meta.brands.length) throw new Error('THW: uaData.brands missing');
              return meta.brands;
            }
          }], 'throw');
        }
      }
      if (dMobile) {
        __navRegisterKey('userAgentData.mobile');
        const isData = Object.prototype.hasOwnProperty.call(dMobile, 'value') && !dMobile.get && !dMobile.set;
        if (isData) {
          const value = (() => {
            if (typeof meta.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing');
            return meta.mobile;
          })();
          applyCoreTargetsGroup('nav_total_set:userAgentData.mobile', [{
            owner: uadProto,
            key: 'mobile',
            kind: 'data',
            policy: 'throw',
            diagTag: 'nav_total_set:userAgentData.mobile',
            value,
            writable: !!dMobile.writable,
            configurable: !!dMobile.configurable,
            enumerable: !!dMobile.enumerable
          }], 'throw');
        } else {
          applyCoreTargetsGroup('nav_total_set:userAgentData.mobile', [{
            owner: uadProto,
            key: 'mobile',
            kind: 'accessor',
            policy: 'throw',
            diagTag: 'nav_total_set:userAgentData.mobile',
            configurable: !!dMobile.configurable,
            enumerable: !!dMobile.enumerable,
            validThis: isUadThis,
            invalidThis: 'native',
            getImpl: function userAgentDataMobileGetImpl() {
              if (typeof meta.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing');
              return meta.mobile;
            }
          }], 'throw');
        }
      }
      if (dPlatform) {
        __navRegisterKey('userAgentData.platform');
        const isData = Object.prototype.hasOwnProperty.call(dPlatform, 'value') && !dPlatform.get && !dPlatform.set;
        if (isData) {
          const value = (() => {
            if (typeof chPlatform !== 'string' || !chPlatform) throw new Error('THW: uaData.platform missing');
            return chPlatform;
          })();
          applyCoreTargetsGroup('nav_total_set:userAgentData.platform', [{
            owner: uadProto,
            key: 'platform',
            kind: 'data',
            policy: 'throw',
            diagTag: 'nav_total_set:userAgentData.platform',
            value,
            writable: !!dPlatform.writable,
            configurable: !!dPlatform.configurable,
            enumerable: !!dPlatform.enumerable
          }], 'throw');
        } else {
          applyCoreTargetsGroup('nav_total_set:userAgentData.platform', [{
            owner: uadProto,
            key: 'platform',
            kind: 'accessor',
            policy: 'throw',
            diagTag: 'nav_total_set:userAgentData.platform',
            configurable: !!dPlatform.configurable,
            enumerable: !!dPlatform.enumerable,
            validThis: isUadThis,
            invalidThis: 'native',
            getImpl: function userAgentDataPlatformGetImpl() {
              if (typeof chPlatform !== 'string' || !chPlatform) throw new Error('THW: uaData.platform missing');
              return chPlatform;
            }
          }], 'throw');
        }
      }
      const deep = v => v == null ? v : JSON.parse(JSON.stringify(v));
      const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList')
        || Object.getOwnPropertyDescriptor(nativeUAD, 'fullVersionList')
        || { configurable: true, enumerable: false };
      __navRegisterKey('userAgentData.fullVersionList');
      applyCoreTargetsGroup('nav_total_set:userAgentData.fullVersionList', [{
        owner: uadProto,
        key: 'fullVersionList',
        kind: 'accessor',
        policy: 'throw',
        diagTag: 'nav_total_set:userAgentData.fullVersionList',
        allowCreate: !Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList'),
        configurable: !!dFull.configurable,
        enumerable: !!dFull.enumerable,
        validThis: isUadThis,
        invalidThis: 'native',
        getImpl: function userAgentDataFullVersionListGetImpl() {
          if (!Array.isArray(meta.fullVersionList) || !meta.fullVersionList.length) {
            throw new Error('THW: uaData.fullVersionList missing');
          }
          return deep(meta.fullVersionList);
        }
      }], 'throw');
      const dUaFull = Object.getOwnPropertyDescriptor(uadProto, 'uaFullVersion')
        || Object.getOwnPropertyDescriptor(nativeUAD, 'uaFullVersion')
        || { configurable: true, enumerable: false };
      __navRegisterKey('userAgentData.uaFullVersion');
      applyCoreTargetsGroup('nav_total_set:userAgentData.uaFullVersion', [{
        owner: uadProto,
        key: 'uaFullVersion',
        kind: 'accessor',
        policy: 'throw',
        diagTag: 'nav_total_set:userAgentData.uaFullVersion',
        allowCreate: !Object.getOwnPropertyDescriptor(uadProto, 'uaFullVersion'),
        configurable: !!dUaFull.configurable,
        enumerable: !!dUaFull.enumerable,
        validThis: isUadThis,
        invalidThis: 'native',
        getImpl: function userAgentDataUaFullVersionGetImpl() {
          if (typeof meta.uaFullVersion !== 'string' || !meta.uaFullVersion) {
            throw new Error('THW: uaData.uaFullVersion missing');
          }
          return meta.uaFullVersion;
        }
      }], 'throw');
      function dropOwnIfConfigurable(obj, key) {
        const ownDesc = Object.getOwnPropertyDescriptor(obj, key);
        if (ownDesc && ownDesc.configurable) {
          try {
            delete obj[key];
          } catch (e) {
            __navDiag('error', 'nav_total_set:userAgentData_dropOwn_failed', { key }, e);
            if (STRICT) throw e;
          }
        }
      }

      const ghevDesc = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
      if (!ghevDesc) {
        throw new Error('THW: uaData.getHighEntropyValues descriptor missing');
      }
      const origGHEV = ghevDesc && ghevDesc.value;
      if (typeof origGHEV !== 'function') throw new TypeError('[nav_total_set] uaData.getHighEntropyValues original missing');
      __navRegisterKey('userAgentData.getHighEntropyValues');
      dropOwnIfConfigurable(nativeUAD, 'getHighEntropyValues');
      applyCoreTargetsGroup('nav_total_set:userAgentData.getHighEntropyValues', [{
        owner: uadProto,
        key: 'getHighEntropyValues',
        kind: 'promise_method',
        invokeClass: 'brand_strict',
        policy: 'throw',
        diagTag: 'nav_total_set:userAgentData.getHighEntropyValues',
        validThis: isUadThis,
        invalidThis: 'native',
        invoke(_orig, args) {
          __navLogAccess('userAgentData.getHighEntropyValues', null);
          const keys = (args && args.length) ? args[0] : undefined;
          if (!Array.isArray(keys)) throw new Error('THW: bad keys');
          const map = {
            architecture: meta.architecture,
            bitness: meta.bitness,
            model: meta.model,
            brands: meta.brands,
            mobile: meta.mobile,
            platform: chPlatform,
            platformVersion: meta.platformVersion,
            uaFullVersion: meta.uaFullVersion,
            fullVersionList: meta.fullVersionList,
            deviceMemory: mem,
            hardwareConcurrency: cpu,
            wow64: meta.wow64,
            formFactors: meta.formFactors
          };
          const result = {};
          for (const hint of keys) {
            if (typeof hint !== 'string' || !hint) throw new Error('THW: bad keys');
            if (!(hint in map)) throw new Error(`THW: missing highEntropy.${hint}`);
            const val = map[hint];
            if (val === undefined || val === null) throw new Error(`THW: missing highEntropy.${hint}`);
            if (typeof val === 'string' && !val && hint !== 'model') throw new Error(`THW: missing highEntropy.${hint}`);
            if (Array.isArray(val) && !val.length) throw new Error(`THW: missing highEntropy.${hint}`);
            result[hint] = val;
          }
          return Promise.resolve(result);
        }
      }], 'throw');


      const toJsonDesc = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
      if (!toJsonDesc) {
        throw new Error('THW: uaData.toJSON descriptor missing');
      }
      const origToJSON = toJsonDesc && toJsonDesc.value;
      if (typeof origToJSON !== 'function') throw new TypeError('[nav_total_set] uaData.toJSON original missing');
      __navRegisterKey('userAgentData.toJSON');
      dropOwnIfConfigurable(nativeUAD, 'toJSON');
      applyCoreTargetsGroup('nav_total_set:userAgentData.toJSON', [{
        owner: uadProto,
        key: 'toJSON',
        kind: 'method',
        invokeClass: 'brand_strict',
        policy: 'throw',
        diagTag: 'nav_total_set:userAgentData.toJSON',
        validThis: isUadThis,
        invalidThis: 'native',
        invoke() {
          __navLogAccess('userAgentData.toJSON', null);
          return { platform: this.platform, brands: this.brands, mobile: this.mobile };
        }
      }], 'throw');

    // IMPORTANT: getter — on PROTOTYPE, without own-fallback
    const dUaData = Object.getOwnPropertyDescriptor(navProto, 'userAgentData');
    if (!dUaData) throw new TypeError('[nav_total_set] userAgentData descriptor missing');
    const okUaData = (redefineAcc(navProto, 'userAgentData', __wrapGetter('userAgentData', function get_userAgentData(){ return nativeUAD; }, dUaData, __isNavigatorThis)), true);
    if (okUaData === false) throw new TypeError('[nav_total_set] failed to define userAgentData');
    const uadTag = Object.prototype.toString.call(nativeUAD);
    if (uadTag === '[object Object]') throw new Error('THW: window navigator.userAgentData tag');
    const uadCtor = Object.getPrototypeOf(nativeUAD) && Object.getPrototypeOf(nativeUAD).constructor;
    if (!uadCtor || uadCtor.name === 'Object') throw new Error('THW: window navigator.userAgentData proto');
    __navDiag('info', 'nav_total_set:uaData_toJSON_ok');
    }

    // ——— F. deviceMemory/hardwareConcurrency ———
    const hasDeviceMemory = ('deviceMemory' in navigator);
    const dDeviceMemory = Object.getOwnPropertyDescriptor(navProto, 'deviceMemory');
    const origGetDeviceMemory = (dDeviceMemory && typeof dDeviceMemory.get === 'function') ? dDeviceMemory.get : null;
    const getDeviceMemory = Object.getOwnPropertyDescriptor(({ get deviceMemory() {
      __navLogAccess('deviceMemory', getDeviceMemory);
      if (!__isNavigatorThis(this)) {
        if (typeof origGetDeviceMemory === 'function') return Reflect.apply(origGetDeviceMemory, this, arguments);
        throw new TypeError();
      }
      return mem;
    }}), 'deviceMemory').get;
    __navRegisterKey('deviceMemory');
    __navRegisterFn(getDeviceMemory);
    const okDeviceMemory = hasDeviceMemory ? (dDeviceMemory ?
      (redefineAcc(navProto, 'deviceMemory', getDeviceMemory), true) :
      safeDefineAcc(navProto, 'deviceMemory', getDeviceMemory, { enumerable: true })) : true;
    if (okDeviceMemory === false) throw new TypeError('[nav_total_set] failed to define deviceMemory');

    const hasHardwareConcurrency = ('hardwareConcurrency' in navigator);
    const dHardwareConcurrency = Object.getOwnPropertyDescriptor(navProto, 'hardwareConcurrency');
    const origGetHardwareConcurrency = (dHardwareConcurrency && typeof dHardwareConcurrency.get === 'function') ? dHardwareConcurrency.get : null;
    const getHardwareConcurrency = Object.getOwnPropertyDescriptor(({ get hardwareConcurrency() {
      __navLogAccess('hardwareConcurrency', getHardwareConcurrency);
      if (!__isNavigatorThis(this)) {
        if (typeof origGetHardwareConcurrency === 'function') return Reflect.apply(origGetHardwareConcurrency, this, arguments);
        throw new TypeError();
      }
      return cpu;
    }}), 'hardwareConcurrency').get;
    __navRegisterKey('hardwareConcurrency');
    __navRegisterFn(getHardwareConcurrency);
    const okHardwareConcurrency = hasHardwareConcurrency ? (dHardwareConcurrency ?
      (redefineAcc(navProto, 'hardwareConcurrency', getHardwareConcurrency), true) :
      safeDefineAcc(navProto, 'hardwareConcurrency', getHardwareConcurrency, { enumerable: true })) : true;
    if (okHardwareConcurrency === false) throw new TypeError('[nav_total_set] failed to define hardwareConcurrency');

    // ——— G. language(s) ———
    const hasLanguage = ('language' in navigator);
    const dLanguage = Object.getOwnPropertyDescriptor(navProto, 'language');
    const origGetLanguage = (dLanguage && typeof dLanguage.get === 'function') ? dLanguage.get : null;
    const getLanguage = Object.getOwnPropertyDescriptor(({ get language() {
      __navLogAccess('language', getLanguage);
      if (!__isNavigatorThis(this)) {
        if (typeof origGetLanguage === 'function') return Reflect.apply(origGetLanguage, this, arguments);
        throw new TypeError();
      }
      return window.__primaryLanguage;
    }}), 'language').get;
    __navRegisterKey('language');
    __navRegisterFn(getLanguage);
    const okLanguage = hasLanguage ? (dLanguage ?
      (redefineAcc(navProto, 'language', getLanguage), true) :
      safeDefineAcc(navProto, 'language', getLanguage, { enumerable: dLanguage ? !!dLanguage.enumerable : false })) : true;
    if (okLanguage === false) throw new TypeError('[nav_total_set] failed to define language');

    const hasLanguages = ('languages' in navigator);
    const dLanguages = Object.getOwnPropertyDescriptor(navProto, 'languages');
    const origGetLanguages = (dLanguages && typeof dLanguages.get === 'function') ? dLanguages.get : null;
    const getLanguages = Object.getOwnPropertyDescriptor(({ get languages() {
      __navLogAccess('languages', getLanguages);
      if (!__isNavigatorThis(this)) {
        if (typeof origGetLanguages === 'function') return Reflect.apply(origGetLanguages, this, arguments);
        throw new TypeError();
      }
      return window.__normalizedLanguages;
    }}), 'languages').get;
    __navRegisterKey('languages');
    __navRegisterFn(getLanguages);
    const okLanguages = hasLanguages ? (dLanguages ?
      (redefineAcc(navProto, 'languages', getLanguages), true) :
      safeDefineAcc(navProto, 'languages', getLanguages, { enumerable: dLanguages ? !!dLanguages.enumerable : false })) : true;
    if (okLanguages === false) throw new TypeError('[nav_total_set] failed to define languages');
  
   
    // ——— H. permissions.query ———
    if ('permissions' in navigator && navigator.permissions && typeof navigator.permissions.query === 'function') {
      const permProto = Object.getPrototypeOf(navigator.permissions) || navigator.permissions;
      const permDesc = Object.getOwnPropertyDescriptor(permProto, 'query')
        || Object.getOwnPropertyDescriptor(navigator.permissions, 'query');
      if (!permDesc) throw new TypeError('[nav_total_set] permissions.query descriptor missing');
      __navRegisterKey('permissions.query');
      applyCoreTargetsGroup('nav_total_set:permissions.query', [{
        owner: permProto,
        key: 'query',
        kind: 'promise_method',
        invokeClass: 'brand_strict',
        policy: 'throw',
        diagTag: 'nav_total_set:permissions.query',
        validThis(self) {
          return self === navigator.permissions || self === permProto;
        },
        invalidThis: 'native',
        invoke(orig, args) {
          const parameters = (args && args.length) ? args[0] : undefined;
          const permName = (parameters && typeof parameters === 'object' && typeof parameters.name === 'string')
            ? parameters.name
            : null;
          if (permName === 'microphone') {
            const sourceName = 'audioinput';
            const label = (devicesLabels && typeof devicesLabels === 'object') ? devicesLabels[sourceName] : undefined;
            if (!label) {
              throw new TypeError('[nav_total_set] devices_labels.audioinput missing for permissions.query("microphone")');
            }
            __navLogAccess('permissions.query', null, { permission: permName, source: sourceName });
          } else {
            __navLogAccess('permissions.query', null);
          }
          return Reflect.apply(orig, this, args || []);
        }
      }], 'throw');
    }

    // ——— I. mediaDevices.enumerateDevices ———
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      const mediaProto = Object.getPrototypeOf(navigator.mediaDevices) || navigator.mediaDevices;
      const mediaDesc = Object.getOwnPropertyDescriptor(mediaProto, 'enumerateDevices')
        || Object.getOwnPropertyDescriptor(navigator.mediaDevices, 'enumerateDevices');
      if (!mediaDesc) throw new TypeError('[nav_total_set] mediaDevices.enumerateDevices descriptor missing');
      __navRegisterKey('mediaDevices.enumerateDevices');
      applyCoreTargetsGroup('nav_total_set:mediaDevices.enumerateDevices', [{
        owner: mediaProto,
        key: 'enumerateDevices',
        kind: 'promise_method',
        invokeClass: 'brand_strict',
        policy: 'throw',
        diagTag: 'nav_total_set:mediaDevices.enumerateDevices',
        validThis(self) {
          return self === navigator.mediaDevices || self === mediaProto;
        },
        invalidThis: 'native',
        invoke(_orig, _args) {
          const out = Reflect.apply(_orig, this, _args || []);
          return Promise.resolve(out).then(function onEnumerateDevicesResolved(devices) {
            let speakers = 0;
            let micros = 0;
            let webcams = 0;
            if (Array.isArray(devices)) {
              for (let i = 0; i < devices.length; ++i) {
                const kind = devices[i] && devices[i].kind;
                if (kind === 'audiooutput') speakers += 1;
                else if (kind === 'audioinput') micros += 1;
                else if (kind === 'videoinput') webcams += 1;
              }
              __navLogAccess('mediaDevices.enumerateDevices', null, {
                multimediaDevices: { speakers, micros, webcams }
              });
              return devices;
            }
            __navLogAccess('mediaDevices.enumerateDevices', null, { multimediaDevices: null });
            return devices;
          });
        }
      }], 'throw');
    }

    // ——— J. storage.estimate & webkitTemporaryStorage ———
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      const storageProto = Object.getPrototypeOf(navigator.storage) || navigator.storage;
      const storageDesc = Object.getOwnPropertyDescriptor(storageProto, 'estimate')
        || Object.getOwnPropertyDescriptor(navigator.storage, 'estimate');
      if (!storageDesc) throw new TypeError('[nav_total_set] storage.estimate descriptor missing');
      // Конфигурация: берём из глобалов (как и прочие параметры в модуле), иначе безопасные дефолты
      const QUOTA_MB   = Number(window.__STORAGE_QUOTA_MB   ?? 120);
      const USED_PCT   = Math.max(0, Math.min(100, Number(window.__STORAGE_USED_PCT ?? 3))); // ~3% занято
      const quotaBytes = Math.floor(QUOTA_MB * 1024 * 1024);
      let usageBytes   = Math.max(0, Math.floor(quotaBytes * USED_PCT / 100));

      // Monotonous “jitter” of usage within a few KB, on R(), so as not to break the module’s entropy
      const tickUsage = mark(function tickUsage() {
        usageBytes = Math.min(quotaBytes - 4096, usageBytes + Math.floor(R() * 4096));
      }, 'tickUsage');

      const origEstimate = storageDesc.value || navigator.storage.estimate;
      if (typeof origEstimate !== 'function') throw new TypeError('[nav_total_set] storage.estimate original missing');
      __navRegisterKey('storage.estimate');
      applyCoreTargetsGroup('nav_total_set:storage.estimate', [{
        owner: storageProto,
        key: 'estimate',
        kind: 'promise_method',
        invokeClass: 'brand_strict',
        policy: 'throw',
        diagTag: 'nav_total_set:storage.estimate',
        validThis(self) {
          return self === navigator.storage || self === storageProto;
        },
        invalidThis: 'native',
        invoke(_orig, _args) {
          __navLogAccess('storage.estimate', null);
          tickUsage();
          return Promise.resolve({ quota: quotaBytes, usage: usageBytes });
        }
      }], 'throw');
      if (navigator.webkitTemporaryStorage) {
        const tmpProto = Object.getPrototypeOf(navigator.webkitTemporaryStorage) || navigator.webkitTemporaryStorage;
        const tmpDesc = Object.getOwnPropertyDescriptor(tmpProto, 'queryUsageAndQuota')
          || Object.getOwnPropertyDescriptor(navigator.webkitTemporaryStorage, 'queryUsageAndQuota');
        if (!tmpDesc) throw new TypeError('[nav_total_set] webkitTemporaryStorage.queryUsageAndQuota descriptor missing');
        __navRegisterKey('webkitTemporaryStorage.queryUsageAndQuota');
        applyCoreTargetsGroup('nav_total_set:webkitTemporaryStorage.queryUsageAndQuota', [{
          owner: tmpProto,
          key: 'queryUsageAndQuota',
          kind: 'method',
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: 'nav_total_set:webkitTemporaryStorage.queryUsageAndQuota',
          validThis(self) {
            return self === navigator.webkitTemporaryStorage || self === tmpProto;
          },
          invalidThis: 'native',
          invoke(_orig, args) {
            __navLogAccess('webkitTemporaryStorage.queryUsageAndQuota', null);
            const success = (args && args.length) ? args[0] : undefined;
            const error = (args && args.length > 1) ? args[1] : undefined;
            try {
              tickUsage();
              if (typeof success === 'function') success(usageBytes, quotaBytes);
              return undefined;
            } catch (e) {
              __navDiag('error', 'nav_total_set:webkitTemporaryStorage_queryUsageAndQuota', null, e);
              if (typeof error === 'function') error(e);
              return undefined;
            }
          }
        }], 'throw');
      }

      // Consistent “persistence”
      if (typeof navigator.storage.persist   === 'function') {
        const persistDesc = Object.getOwnPropertyDescriptor(storageProto, 'persist')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persist');
        if (!persistDesc) throw new TypeError('[nav_total_set] storage.persist descriptor missing');
        __navRegisterKey('storage.persist');
        applyCoreTargetsGroup('nav_total_set:storage.persist', [{
          owner: storageProto,
          key: 'persist',
          kind: 'promise_method',
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: 'nav_total_set:storage.persist',
          validThis(self) {
            return self === navigator.storage || self === storageProto;
          },
          invalidThis: 'native',
          invoke(_orig, _args) {
            __navLogAccess('storage.persist', null);
            return Promise.resolve(true);
          }
        }], 'throw');
      }
      if (typeof navigator.storage.persisted === 'function') {
        const persistedDesc = Object.getOwnPropertyDescriptor(storageProto, 'persisted')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persisted');
        if (!persistedDesc) throw new TypeError('[nav_total_set] storage.persisted descriptor missing');
        __navRegisterKey('storage.persisted');
        applyCoreTargetsGroup('nav_total_set:storage.persisted', [{
          owner: storageProto,
          key: 'persisted',
          kind: 'promise_method',
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: 'nav_total_set:storage.persisted',
          validThis(self) {
            return self === navigator.storage || self === storageProto;
          },
          invalidThis: 'native',
          invoke(orig, args) {
            __navLogAccess('storage.persisted', null);
            const isStorageThis = (this === navigator.storage || this === storageProto);
            if (!isStorageThis) return Reflect.apply(orig, this, args || []);
            return Promise.resolve(true);
          }
        }], 'throw');
      }
    }

      // ———  JS heap sizing from deviceMemory ———
    const perfProto = (window.Performance && Performance.prototype) || Object.getPrototypeOf(performance);
    if (perfProto) {
      // if-стиль: патчим только если dm валиден
      const dm0 = Number(navigator.deviceMemory);
      if (typeof dm0 === 'number' && isFinite(dm0)) {

        const heapFromDM = mark(function heapFromDM(dm) {
          // dm: 0.25, 0.5, 1, 2, 4, 8, …
          if (!(typeof dm === 'number' && isFinite(dm))) return null;
          if (dm <= 0.5) return 512  * 1024 * 1024;   // ~512MB
          if (dm <= 1)   return 768  * 1024 * 1024;   // ~768MB
          if (dm <= 2)   return 1536 * 1024 * 1024;   // ~1.5GB
          if (dm <= 4)   return 3072 * 1024 * 1024;   // ~3GB
          return 4096 * 1024 * 1024;                  // cap ~4GB для dm ≥ 8
        }, 'heapFromDM');

        const getMemory = mark(function () {
          // читаем dm каждый раз — «жёсткая» привязка к текущему realm
          const dm = Number(navigator.deviceMemory);
          const limit = heapFromDM(dm);
          if (limit == null) {
            // dm нелегален → не вмешиваемся (оставляем натив/предыдущее)
            const d = Object.getOwnPropertyDescriptor(perfProto, 'memory')
                    || Object.getOwnPropertyDescriptor(performance, 'memory');
            return d && d.get ? d.get.call(performance) : undefined;
          }
          const total = Math.floor(limit * 0.25);
          const used  = Math.min(total - 1, Math.floor(total * (0.40 + 0.15 * R())));
          return { jsHeapSizeLimit: limit, totalJSHeapSize: total, usedJSHeapSize: used };
        }, 'get memory');

        try {
          // first try patch prototype, if rejected — try own on instance
          redefineAcc(perfProto, 'memory', getMemory);
        } catch (_) {
          __navDiag('error', 'nav_total_set:performance_memory_proto', null, _);
          try {
            Object.defineProperty(performance, 'memory', { get: getMemory, configurable: true });
          } catch (__) {
            __navDiag('error', 'nav_total_set:performance_memory_own', null, __);
            throw _;
          }
        }
      }
    }

    // ——— K. WebAuthn (stub) ———
    if (!window.PublicKeyCredential) {
      window.PublicKeyCredential = mark(function PublicKeyCredential() {}, 'PublicKeyCredential');
      Object.defineProperty(PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: mark(function isUserVerifyingPlatformAuthenticatorAvailable() { return Promise.resolve(true); },
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
      if (!createDesc) throw new TypeError('[nav_total_set] credentials.create descriptor missing');
      if (!getDesc) throw new TypeError('[nav_total_set] credentials.get descriptor missing');
      __navRegisterKey('credentials.create');
      __navRegisterKey('credentials.get');
      applyCoreTargetsGroup('nav_total_set:credentials', [
        {
          owner: credProto,
          key: 'create',
          kind: 'promise_method',
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: 'nav_total_set:credentials.create',
          validThis(self) {
            return self === navigator.credentials || self === credProto;
          },
          invalidThis: 'native',
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
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: 'nav_total_set:credentials.get',
          validThis(self) {
            return self === navigator.credentials || self === credProto;
          },
          invalidThis: 'native',
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
    __navDiag('info', 'nav_total_set:webauthn_mock_applied');

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

          // Create a ?plugin? with strictly enumerable properties
          const pluginObj = Object.create(Plugin.prototype, {
            name:        { value: String(p.name),        enumerable: true,  configurable: true },
            filename:    { value: String(p.filename),    enumerable: true,  configurable: true },
            description: { value: String(p.description), enumerable: true,  configurable: true },
            length:      { value: p.mimeTypes.length,    enumerable: true,  configurable: true },
            item: {
              value: mark(itemMethod, 'item'),
              enumerable: false, configurable: true
            },
            namedItem: {
              value: mark(namedItemMethod, 'namedItem'),
              enumerable: false, configurable: true
            }
          });

          // mime-??????? (enumerable ????, enabledPlugin ? ?? pluginObj)
          for (let j = 0; j < p.mimeTypes.length; j++) {
            const m = p.mimeTypes[j];
            const mimeObj = Object.create(MimeType.prototype, {
              type:         { value: String(m.type),        enumerable: true, configurable: true },
              suffixes: { value: String(m.suffixes ?? ''),enumerable: true, configurable: true },
              description: { value: String(m.description ?? ''), enumerable: true, configurable: true },
              enabledPlugin:{ value: pluginObj,             enumerable: true, configurable: true }
            });
            // index on the plugin itself ? enumerable
            Object.defineProperty(pluginObj, String(j), { value: mimeObj, enumerable: true, configurable: true });
            mimeObjects.push(mimeObj);
          }

          arr.push(pluginObj);
        }

        // array of plugins
        const pluginArray = Object.create(PluginArray.prototype, {
          length:    { value: arr.length, enumerable: true, configurable: true },
          item:      { value: mark(({ item(index) { return pluginArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: mark(({ namedItem(name) { for (let i = 0; i < arr.length; i++) if (pluginArray[String(i)]?.name === name) return pluginArray[String(i)]; return null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
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
          item:      { value: mark(({ item(index) { return mimeArray[String(index)] || null; } }).item, 'item'), enumerable: false, configurable: true },
          namedItem: { value: mark(({ namedItem(type) { return mimeArray[type] || null; } }).namedItem, 'namedItem'), enumerable: false, configurable: true }
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
      meta: meta,
      hasUAD,
      secureContext: G.isSecureContext
    });
    __navDiag('info', 'nav_total_set:applied');
  }
  }
}
