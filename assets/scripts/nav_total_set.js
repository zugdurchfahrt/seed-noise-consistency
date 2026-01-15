function NavTotalSetPatchModule() {
  if (!window.__PATCH_NAVTOTALSET__) {
    window.__PATCH_NAVTOTALSET__ = true;

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
      const fn = ensure ? ensure() : window.markAsNative;
      if (typeof fn !== 'function') {
        throw new Error('[NavTotalSetPatchModule] markAsNative missing');
      }
      return fn;
    })();
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
        console.warn(`[nav_total_set] normalizing CH.platform '${chPlatform}' → '${normalized}'`);
        chPlatform = normalized;
      }
    }

    const expectedNavPlat = asDom(gen);
    if (navPlat !== expectedNavPlat) {
      const msg = `[nav_total_set] NAV_PLATFORM__ (${navPlat}) inconsistent with ${gen} (expected ${expectedNavPlat})`;
      if (STRICT) throw new Error(msg); else console.warn(msg);
    }
    const navPlatformOut = STRICT ? navPlat : expectedNavPlat;
    if (!window.__COLOR_DEPTH) console.warn("[uaData] Color_Depth is not defined, set by default", colorDepth);

    // ——— B. Safe helpers ———
    const navProto = Object.getPrototypeOf(navigator);
    function safeDefineAcc(target, key, getter, { enumerable = false } = {}) {
      const warnOrThrow = (err) => {
        if (STRICT) throw err;
        if (DEBUG) console.warn(err);
        return false;
      };
      try {
        const d = Object.getOwnPropertyDescriptor(target, key);
        if (d && d.configurable === false) {
          return warnOrThrow(new TypeError(`[nav_total_set] ${key}: non-configurable`));
        }
        let getFn = getter;
        if (typeof getter === 'function' && getter.name === '') {
          const acc = ({ get [key]() { return getter.call(this); } });
          getFn = Object.getOwnPropertyDescriptor(acc, key).get;
        }
        Object.defineProperty(target, key, {
          get: mark(getFn, `get ${key}`),
          set: d && d.set,
          configurable: true,
          enumerable: d ? !!d.enumerable : !!enumerable
        });
        return true;
      } catch (e) {
        const reason = (e && e.message) ? e.message : String(e);
        return warnOrThrow(new TypeError(`[nav_total_set] failed to define ${key}: ${reason}`));
      }
    }

    function defineAccWithFallback(objOrProto, key, getter, { enumerable = false } = {}) {
      // use for non-critical fields; для E/F/G Do not use(см. ниже)
      if (safeDefineAcc(objOrProto, key, getter, { enumerable })) return true;
      throw new TypeError(`[nav_total_set] failed to define ${key}`);
    }
    function redefineAcc(proto, key, getImpl) {
      const d = Object.getOwnPropertyDescriptor(proto, key);
      Object.defineProperty(proto, key, {
        get: mark(getImpl, `get ${key}`),
        set: d && d.set,
        configurable: d ? d.configurable : true,
        enumerable: d ? d.enumerable : false
      });
    }

    // Critical - only a prototype (without a phallback)
    const critical = new Set(['userAgent','platform','vendor','appVersion']);
    (function patchCriticalOnProto(){
      const patch = (key, getter) => {
        const d = Object.getOwnPropertyDescriptor(navProto, key);
        if (!d) throw new TypeError(`[nav_total_set] ${key}: descriptor missing`);
      // Important: like native - not enumerable
      const ok = (redefineAcc(navProto, key, getter, { enumerable: false }), true);
      if (ok === false) throw new TypeError(`[nav_total_set] failed to define ${key}`);
      };
      patch('userAgent', () => userAgent);
      patch('platform',  () => navPlatformOut);
      patch('vendor',    () => vendor);
      patch('appVersion', () => (userAgent.split("Mozilla/")[1]));
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
      defineAccWithFallback(navProto, prop, getter);
    });

    // ——— D. devicePixelRatio & screen.* ———
    // dpr: first we try to redefine own in window (often own), then — prototype
    (function () {
      const desc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
      if (desc && desc.configurable !== false) {
        Object.defineProperty(window, 'devicePixelRatio', { get: mark(() => dpr, 'get devicePixelRatio'), configurable: true });
        return;
      }
      redefineAcc(Window.prototype, 'devicePixelRatio', () => dpr);
    })();

    // screen.* — First try prototype, in case of refuse — own window.screen
    (function () {
      const scrProto = Screen && Screen.prototype;
      const setScreen = (k, get) => {
        redefineAcc(scrProto, k, get);
      };
      setScreen('width',       () => width);
      setScreen('height',      () => height);
      setScreen('colorDepth',  () => colorDepth);
      setScreen('pixelDepth',  () => colorDepth);
      setScreen('availWidth',  () => width);
      setScreen('availHeight', () => height);
      const orientationObj = window.screen && window.screen.orientation;
      const orientationProto = orientationObj && Object.getPrototypeOf(orientationObj);
      if (orientationProto && orientationProto !== Object.prototype) {
        const typeDesc = Object.getOwnPropertyDescriptor(orientationProto, 'type');
        if (typeDesc && typeDesc.configurable) {
          Object.defineProperty(orientationProto, 'type', {
            get: mark(() => orientationDom, 'get type'),
            set: typeDesc.set,
            configurable: typeDesc.configurable,
            enumerable: typeDesc.enumerable
          });
        }
        const angleDesc = Object.getOwnPropertyDescriptor(orientationProto, 'angle');
        if (angleDesc && angleDesc.configurable) {
          Object.defineProperty(orientationProto, 'angle', {
            get: mark(() => 0, 'get angle'),
            set: angleDesc.set,
            configurable: angleDesc.configurable,
            enumerable: angleDesc.enumerable
          });
        }
      }
    })();

    // oscpu (только если есть в прототипе)
    if ('oscpu' in navProto) {
      defineAccWithFallback(navProto, 'oscpu', () => undefined);
    }
    // ——— E. userAgentData (low + high entropy) ———
    if ('userAgentData' in navigator) {
      const nativeUAD = navigator.userAgentData;
      if (!nativeUAD) throw new Error('THW: window navigator.userAgentData missing');
      const uadProto = Object.getPrototypeOf(nativeUAD);
      if (!uadProto) throw new Error('THW: window navigator.userAgentData proto missing');
      const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands');
      const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile');
      const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform');
      if (!dBrands || !dMobile || !dPlatform) {
        throw new Error('THW: window navigator.userAgentData descriptor missing');
      }
      Object.defineProperties(uadProto, {
        brands: {
          get: mark(function getBrands(){
            if (!Array.isArray(meta.brands) || !meta.brands.length) throw new Error('THW: uaData.brands missing');
            return meta.brands;
          }, 'get brands'),
          enumerable: true,
          configurable: true
        },
        mobile: {
          get: mark(function getMobile(){
            if (typeof meta.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing');
            return meta.mobile;
          }, 'get mobile'),
          enumerable: true,
          configurable: true
        },
        platform: {
          get: mark(function getPlatform(){
            if (typeof chPlatform !== 'string' || !chPlatform) throw new Error('THW: uaData.platform missing');
            return chPlatform;
          }, 'get platform'),
          enumerable: true,
          configurable: true
        }
      });
      const deep = v => v == null ? v : JSON.parse(JSON.stringify(v));
      const getFullVersionList = mark(function getFullVersionList(){
        if (!Array.isArray(meta.fullVersionList) || !meta.fullVersionList.length) {
          throw new Error('THW: uaData.fullVersionList missing');
        }
        return deep(meta.fullVersionList);
      }, 'get fullVersionList');
      const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList')
        || Object.getOwnPropertyDescriptor(nativeUAD, 'fullVersionList')
        || { configurable: true, enumerable: false };
      Object.defineProperty(uadProto, 'fullVersionList', {
        get: getFullVersionList,
        enumerable: dFull.enumerable,
        configurable: dFull.configurable
      });
      const getUaFullVersion = mark(function getUaFullVersion(){
        if (typeof meta.uaFullVersion !== 'string' || !meta.uaFullVersion) {
          throw new Error('THW: uaData.uaFullVersion missing');
        }
        return meta.uaFullVersion;
      }, 'get uaFullVersion');
      const dUaFull = Object.getOwnPropertyDescriptor(uadProto, 'uaFullVersion')
        || Object.getOwnPropertyDescriptor(nativeUAD, 'uaFullVersion')
        || { configurable: true, enumerable: false };
      Object.defineProperty(uadProto, 'uaFullVersion', {
        get: getUaFullVersion,
        enumerable: dUaFull.enumerable,
        configurable: dUaFull.configurable
      });
      const getHighEntropyValues = mark(function getHighEntropyValues(keys) {
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
        }, 'getHighEntropyValues');
      if (!Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues')) {
        throw new Error('THW: uaData.getHighEntropyValues descriptor missing');
      }
      const ghevDesc = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
      Object.defineProperty(uadProto, 'getHighEntropyValues', {
        value: getHighEntropyValues,
        configurable: ghevDesc ? ghevDesc.configurable : true,
        enumerable: ghevDesc ? ghevDesc.enumerable : false,
        writable: ghevDesc && Object.prototype.hasOwnProperty.call(ghevDesc, 'writable') ? ghevDesc.writable : true
      });


      const toJSON = mark(function toJSON() {return { platform: this.platform, brands: this.brands, mobile: this.mobile };}, 'toJSON');
      if (!Object.getOwnPropertyDescriptor(uadProto, 'toJSON')) {
        throw new Error('THW: uaData.toJSON descriptor missing');
      }
      const toJsonDesc = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
      Object.defineProperty(uadProto, 'toJSON', {
        value: toJSON,
        configurable: toJsonDesc ? toJsonDesc.configurable : true,
        enumerable: toJsonDesc ? toJsonDesc.enumerable : false,
        writable: toJsonDesc && Object.prototype.hasOwnProperty.call(toJsonDesc, 'writable') ? toJsonDesc.writable : true
      });

    // IMPORTANT: getter — on PROTOTYPE, without own-fallback
    const dUaData = Object.getOwnPropertyDescriptor(navProto, 'userAgentData');
    if (!dUaData) throw new TypeError('[nav_total_set] userAgentData descriptor missing');
    const okUaData = (redefineAcc(navProto, 'userAgentData', function get_userAgentData(){ return nativeUAD; }, { enumerable: false }), true);
    if (okUaData === false) throw new TypeError('[nav_total_set] failed to define userAgentData');
    const uadTag = Object.prototype.toString.call(nativeUAD);
    if (uadTag === '[object Object]') throw new Error('THW: window navigator.userAgentData tag');
    const uadCtor = Object.getPrototypeOf(nativeUAD) && Object.getPrototypeOf(nativeUAD).constructor;
    if (!uadCtor || uadCtor.name === 'Object') throw new Error('THW: window navigator.userAgentData proto');
    console.info('userAgentData.toJSON correctly implemented');
    }

    // ——— F. deviceMemory/hardwareConcurrency ———
    const okDeviceMemory = (Object.getOwnPropertyDescriptor(navProto,'deviceMemory') ?
      (redefineAcc(navProto, 'deviceMemory', () => mem, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'deviceMemory', () => mem, { enumerable: true }));
    if (okDeviceMemory === false) throw new TypeError('[nav_total_set] failed to define deviceMemory');

    const okHardwareConcurrency = (Object.getOwnPropertyDescriptor(navProto,'hardwareConcurrency') ?
      (redefineAcc(navProto, 'hardwareConcurrency', () => cpu, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'hardwareConcurrency', () => cpu, { enumerable: true }));
    if (okHardwareConcurrency === false) throw new TypeError('[nav_total_set] failed to define hardwareConcurrency');

    // ——— G. language(s) ———
    const okLanguage = (Object.getOwnPropertyDescriptor(navProto,'language') ?
      (redefineAcc(navProto, 'language', () => window.__primaryLanguage, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'language', () => window.__primaryLanguage,  { enumerable: true }));
    if (okLanguage === false) throw new TypeError('[nav_total_set] failed to define language');

    const okLanguages = (Object.getOwnPropertyDescriptor(navProto,'languages') ?
      (redefineAcc(navProto, 'languages', () => window.__normalizedLanguages, { enumerable: true }), true) :
      safeDefineAcc(navProto, 'languages', () => window.__normalizedLanguages, { enumerable: true }));
    if (okLanguages === false) throw new TypeError('[nav_total_set] failed to define languages');

    // ——— H. permissions.query ———
    if ('permissions' in navigator && navigator.permissions && typeof navigator.permissions.query === 'function') {
      const permProto = Object.getPrototypeOf(navigator.permissions) || navigator.permissions;
      const permDesc = Object.getOwnPropertyDescriptor(permProto, 'query')
        || Object.getOwnPropertyDescriptor(navigator.permissions, 'query');
      if (!permDesc) throw new TypeError('[nav_total_set] permissions.query descriptor missing');
      const origQuery = permDesc.value || navigator.permissions.query;
      const patchedQuery = mark(function query(parameters) {
        if (new.target) {
          throw new TypeError('Illegal constructor');
        }
        const isPermThis = (this === navigator.permissions || this === permProto);
        if (!isPermThis) {
          return origQuery.call(this, parameters);
        }
        if (!parameters || typeof parameters !== 'object') {
          return Promise.resolve({ state: 'prompt', onchange: null });
        }
        const name = parameters && parameters.name;
        if (name === 'persistent-storage')
          return Promise.resolve({ state: 'granted', onchange: null });
        if (['geolocation', 'camera', 'audiooutput', 'microphone', 'notifications'].includes(name))
          return Promise.resolve({ state: 'prompt', onchange: null });
        return origQuery ? origQuery.call(this, parameters) : Promise.resolve({ state: 'prompt', onchange: null });
      }, 'query');
      Object.defineProperty(permProto, 'query', {
        value: patchedQuery,
        configurable: permDesc.configurable,
        enumerable: permDesc.enumerable,
        writable: permDesc.writable
      });
    }

    // ——— I. mediaDevices.enumerateDevices ———
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      const mediaProto = Object.getPrototypeOf(navigator.mediaDevices) || navigator.mediaDevices;
      const mediaDesc = Object.getOwnPropertyDescriptor(mediaProto, 'enumerateDevices')
        || Object.getOwnPropertyDescriptor(navigator.mediaDevices, 'enumerateDevices');
      if (!mediaDesc) throw new TypeError('[nav_total_set] mediaDevices.enumerateDevices descriptor missing');
      const patchedEnumerate = mark(async function enumerateDevices() {
        const generateHexId = (len = 64) => {
          let s = '';
          for (let i = 0; i < len; ++i) s += Math.floor(R() * 16).toString(16);
          return s;
        };
        const groupId = generateHexId(64);
        return [
          { kind: 'audioinput',  label: devicesLabels.audioinput,  deviceId: generateHexId(64), groupId },
          { kind: 'videoinput',  label: devicesLabels.videoinput,  deviceId: generateHexId(64), groupId },
          { kind: 'audiooutput', label: devicesLabels.audiooutput, deviceId: generateHexId(64), groupId: generateHexId(64) }
        ];
      }, 'enumerateDevices');
      Object.defineProperty(mediaProto, 'enumerateDevices', {
        value: patchedEnumerate,
        configurable: mediaDesc.configurable,
        enumerable: mediaDesc.enumerable,
        writable: mediaDesc.writable
      });
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

      Object.defineProperty(storageProto, 'estimate', {
        configurable: storageDesc.configurable,
        enumerable: storageDesc.enumerable,
        writable: storageDesc.writable,
        value: mark(() => {
          tickUsage();
          return Promise.resolve({ quota: quotaBytes, usage: usageBytes });
        }, 'estimate')
      });

      if (navigator.webkitTemporaryStorage) {
        const tmpProto = Object.getPrototypeOf(navigator.webkitTemporaryStorage) || navigator.webkitTemporaryStorage;
        const tmpDesc = Object.getOwnPropertyDescriptor(tmpProto, 'queryUsageAndQuota')
          || Object.getOwnPropertyDescriptor(navigator.webkitTemporaryStorage, 'queryUsageAndQuota');
        if (!tmpDesc) throw new TypeError('[nav_total_set] webkitTemporaryStorage.queryUsageAndQuota descriptor missing');
        const patchedQueryUsage = mark(function (success, error) {
          try { tickUsage(); success(usageBytes, quotaBytes); }
          catch (e) { if (typeof error === 'function') error(e); }
        }, 'queryUsageAndQuota');
        Object.defineProperty(tmpProto, 'queryUsageAndQuota', {
          configurable: tmpDesc.configurable,
          enumerable: tmpDesc.enumerable,
          writable: tmpDesc.writable,
          value: patchedQueryUsage
        });
      }

      // Consistent “persistence”
      if (typeof navigator.storage.persist   === 'function') {
        const persistDesc = Object.getOwnPropertyDescriptor(storageProto, 'persist')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persist');
        if (!persistDesc) throw new TypeError('[nav_total_set] storage.persist descriptor missing');
        Object.defineProperty(storageProto, 'persist', {
          configurable: persistDesc.configurable,
          enumerable: persistDesc.enumerable,
          writable: persistDesc.writable,
          value: mark(function persist()   { return Promise.resolve(true); }, 'persist')
        });
      }
      if (typeof navigator.storage.persisted === 'function') {
        const persistedDesc = Object.getOwnPropertyDescriptor(storageProto, 'persisted')
          || Object.getOwnPropertyDescriptor(navigator.storage, 'persisted');
        if (!persistedDesc) throw new TypeError('[nav_total_set] storage.persisted descriptor missing');
        Object.defineProperty(storageProto, 'persisted', {
          configurable: persistedDesc.configurable,
          enumerable: persistedDesc.enumerable,
          writable: persistedDesc.writable,
          value: mark(function persisted() { return Promise.resolve(true); }, 'persisted')
        });
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
          try {
            Object.defineProperty(performance, 'memory', { get: getMemory, configurable: true });
          } catch (__) {
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
      const patchedCreate = mark(function create(options) {
        if (options && options.publicKey) {
          return origCreate ? origCreate.call(this, options) : Promise.resolve(new PublicKeyCredential());
        }
        return origCreate ? origCreate.call(this, options) : Promise.resolve(undefined);
      }, 'create');
      const patchedGet = mark(function get(options) {
        if (options && options.publicKey) {
          return origGet ? origGet.call(this, options) : Promise.resolve(new PublicKeyCredential());
        }
        return origGet ? origGet.call(this, options) : Promise.resolve(undefined);
      }, 'get');
      Object.defineProperty(credProto, 'create', {
        configurable: createDesc.configurable,
        enumerable: createDesc.enumerable,
        writable: createDesc.writable,
        value: patchedCreate
      });
      Object.defineProperty(credProto, 'get', {
        configurable: getDesc.configurable,
        enumerable: getDesc.enumerable,
        writable: getDesc.writable,
        value: patchedGet
      });
    }
    console.log('Web Auth API mock applied');

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

    // 4.3. PluginArray (enumerable fields, compatible with JSON/assign)
    function createPluginArray(plugins) {
      if (__PLUGIN_ARRAY_SINGLETON__) return __PLUGIN_ARRAY_SINGLETON__;

      const arr = [];
      for (let i = 0; i < plugins.length; i++) {
        const p = plugins[i];

        // Create a “plugin” with strictly enumerable properties
        const pluginObj = Object.create(Plugin.prototype, {
          name:        { value: String(p.name),        enumerable: true,  configurable: true },
          filename:    { value: String(p.filename),    enumerable: true,  configurable: true },
          description: { value: String(p.description), enumerable: true,  configurable: true },
          length:      { value: p.mimeTypes.length,    enumerable: true,  configurable: true },
          item: {
            value: mark(function(index){ return this[index] || null; }, 'item'),
            enumerable: false, configurable: true
          },
          namedItem: {
            value: mark(function(type){
              for (let j = 0; j < this.length; j++) if (this[j]?.type === type) return this[j];
              return null;
            }, 'namedItem'),
            enumerable: false, configurable: true
          }
        });

        // mime-объекты (enumerable поля, enabledPlugin → на pluginObj)
        for (let j = 0; j < p.mimeTypes.length; j++) {
          const m = p.mimeTypes[j];
          const mimeObj = Object.create(MimeType.prototype, {
            type:         { value: String(m.type),        enumerable: true, configurable: true },
            suffixes: { value: String(m.suffixes ?? ''),enumerable: true, configurable: true },
            description: { value: String(m.description ?? ''), enumerable: true, configurable: true },
            enabledPlugin:{ value: pluginObj,             enumerable: true, configurable: true }
          });
          // index on the plugin itself — enumerable
          Object.defineProperty(pluginObj, String(j), { value: mimeObj, enumerable: true, configurable: true });
        }

        arr.push(pluginObj);
      }

      // array of plugins
      const pluginArray = Object.create(PluginArray.prototype, {
        length:    { value: arr.length, enumerable: true, configurable: true }, // ORIG делал enumerable
        item:      { value: mark((i)=>pluginArray[String(i)]||null, 'item'), enumerable: false, configurable: true },
        namedItem: { value: mark((name)=>{ for (let i=0;i<arr.length;i++) if (pluginArray[String(i)]?.name===name) return pluginArray[String(i)]; return null; }, 'namedItem'), enumerable: false, configurable: true }
      });

      // Indexes — enumerable
      for (let i = 0; i < arr.length; i++) {
        Object.defineProperty(pluginArray, String(i), { value: arr[i], enumerable: true, configurable: true });
      }

      __PLUGIN_ARRAY_SINGLETON__ = pluginArray;
      return pluginArray;
    }

    // MimeTypeArray (in same time - for case of direct circulation)
    function createMimeTypeArray(plugins) {
      if (__MIMETYPE_ARRAY_SINGLETON__) return __MIMETYPE_ARRAY_SINGLETON__;

      const mimes = [];
      const mimeArray = Object.create(MimeTypeArray.prototype, {
        length:    { value: 0, enumerable: true, configurable: true },
        item:      { value: mark((i)=>mimeArray[String(i)]||null, 'item'), enumerable: false, configurable: true },
        namedItem: { value: mark((type)=>{ for (let i=0;i<mimes.length;i++) if (mimeArray[String(i)]?.type===type) return mimeArray[String(i)]; return null; }, 'namedItem'), enumerable: false, configurable: true }
      });

      // fill and connect enabledPlugin → The nearest plugin (by name)
      const pluginByType = new Map();
      for (let i = 0; i < plugins.length; i++) {
        const p = plugins[i];
        for (const m of p.mimeTypes) pluginByType.set(m.type, i);
      }

      for (let i = 0; i < plugins.length; i++) {
        const p = plugins[i];
        for (const m of p.mimeTypes) {
          const mimeObj = Object.create(MimeType.prototype, {
            type:         { value: String(m.type),        enumerable: true, configurable: true },
            suffixes: { value: String(m.suffixes ?? ''),enumerable: true, configurable: true },
            description: { value: String(m.description ?? ''), enumerable: true, configurable: true },
            enabledPlugin:{ value: null,                    enumerable: true, configurable: true }
          });
          const idx = (mimeArray.length);
          Object.defineProperty(mimeArray, String(idx), { value: mimeObj, enumerable: true, configurable: true });
          Object.defineProperty(mimeArray, 'length', { value: idx+1, enumerable: true, configurable: true });
          mimes.push(mimeObj);
        }
      }

      // enabledPlugin → link to plugin from PluginArray singleton
      const pluginArr = createPluginArray(plugins);
      for (let i = 0; i < mimes.length; i++) {
        const type = mimes[i].type;
        const pIndex = pluginByType.get(type);
        if (pIndex != null) {
          Object.defineProperty(mimes[i], 'enabledPlugin', { value: pluginArr[String(pIndex)], enumerable: true, configurable: true });
        }
      }

      __MIMETYPE_ARRAY_SINGLETON__ = mimeArray;
      return mimeArray;
    }

    // Getters - like in ORIG: enumerable: true
    Object.defineProperty(navigator, 'plugins', {
      get: mark(() => createPluginArray(fakePlugins), 'get plugins'),
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(navigator, 'mimeTypes', {
      get: mark(() => createMimeTypeArray(fakePlugins), 'get mimeTypes'),
      configurable: true,
      enumerable: true
    });

    //  ——— Debug information to console ———
  if (G.__DEBUG__) {
    console.group("Client Hints Debug");
    console.log("meta:", meta);
    const hasUAD = ('userAgentData' in navigator);
    console.log("navigator.userAgentData:", hasUAD ? navigator.userAgentData : undefined);
    if (!hasUAD) {
      console.log("navigator.userAgentData unavailable (secureContext:", G.isSecureContext, ")");
    }
    console.log("navigator.language(s):", navigator.language, navigator.languages);
    console.log("navigator.deviceMemory:", navigator.deviceMemory);
    console.log("navigator.hardwareConcurrency:", navigator.hardwareConcurrency);
    if (navigator.connection) {
      console.log("navigator.connection:", {
        saveData: navigator.connection.saveData,
        effectiveType: navigator.connection.effectiveType
      });
    }
    console.groupEnd();
    console.info('Client Hints and Navigator setting applied in JS');
  }
  }
}
