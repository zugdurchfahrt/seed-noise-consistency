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
    const mark = (typeof window.markAsNative === 'function') ? window.markAsNative : (f) => f;
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
    let chPlatform = meta.platform || gen || '';
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
      try {
        const d = Object.getOwnPropertyDescriptor(target, key);
        if (d && d.configurable === false) throw new TypeError('non-configurable');
        Object.defineProperty(target, key, {
          get: mark(getter, `get ${key}`),
          set: d && d.set,
          configurable: true,
          enumerable: d ? !!d.enumerable : !!enumerable
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    
    function defineAccWithFallback(objOrProto, key, getter, { enumerable = false } = {}) {
      // use for non-critical fields; для E/F/G Do not use(см. ниже)
      if (safeDefineAcc(objOrProto, key, getter, { enumerable })) return true;
      try {
        Object.defineProperty(navigator, key, { get: mark(getter, `get ${key}`), configurable: true, enumerable });
        return true;
      } catch (e) {
        console.warn('[nav patch skip]', key, String(e && e.message || e));
        return false;
      }
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
        const has = !!Object.getOwnPropertyDescriptor(navProto, key);
      // Important: like native - not enumerable
      (has ? redefineAcc : safeDefineAcc)(navProto, key, getter, { enumerable: false });
      };
      patch('userAgent', () => userAgent);
      patch('platform',  () => navPlatformOut);
      patch('vendor',    () => vendor);
      patch('appVersion',() => (userAgent.split("Mozilla/")[1] || ""));
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
        try {
          Object.defineProperty(window, 'devicePixelRatio', { get: mark(() => dpr, 'get devicePixelRatio'), configurable: true });
          return;
        } catch (_) {}
      }
      try { redefineAcc(Window.prototype, 'devicePixelRatio', () => dpr); } catch (_) {}
    })();

    // screen.* — First try prototype, in case of refuse — own window.screen
    (function () {
      const scrProto = Screen && Screen.prototype;
      const setScreen = (k, get) => {
        try { redefineAcc(scrProto, k, get); }
        catch (_) { try { Object.defineProperty(window.screen, k, { get: mark(get, `get screen.${k}`), configurable: true }); } catch (__) {} }
      };
      setScreen('width',       () => width);
      setScreen('height',      () => height);
      setScreen('colorDepth',  () => colorDepth);
      setScreen('pixelDepth',  () => colorDepth);
      setScreen('availWidth',  () => width);
      setScreen('availHeight', () => height);
      try {
        Object.defineProperty(window.screen, 'orientation', {
          get: mark(() => ({
            type: orientationDom,
            angle: 0,
            toString: mark(function() { return this.type; }, 'toString')
          }), 'get screen.orientation'),
          configurable: true
        });
      } catch (_) {}
    })();

    // oscpu (только если есть в прототипе)
    if ('oscpu' in navProto) {
      defineAccWithFallback(navProto, 'oscpu', () => undefined);
    }
    // ——— E. userAgentData (low + high entropy) ———
    if ('userAgentData' in navigator) {
      const overrideUaData = {
        platform: chPlatform,
        brands:   meta.brands,
        mobile:   meta.mobile
      };
      Object.defineProperty(overrideUaData, 'getHighEntropyValues', {
        value: mark(async function (hints) {
          const map = {
            architecture:        meta.architecture,
            bitness:             meta.bitness,
            model:               meta.model,
            platformVersion:     meta.platformVersion,
            uaFullVersion:       meta.uaFullVersion,
            fullVersionList:     meta.fullVersionList,
            deviceMemory:        mem,
            hardwareConcurrency: cpu,
            wow64:               meta.wow64 ?? false,
            formFactors:         meta.formFactors
          };
          const result = {};
          for (const hint of hints || []) {
            if (map[hint] !== undefined) result[hint] = map[hint];
          }
          return result;
        }, 'getHighEntropyValues'),
        configurable: true,
        enumerable: false
      });

    Object.defineProperty(overrideUaData, 'toJSON', {
      value: mark(function () {return { platform: this.platform, brands: this.brands, mobile: this.mobile };}, 'toJSON'),
      configurable: true,
      enumerable: false
    });

    // IMPORTANT: getter — on PROTOTYPE, without own-fallback
    (Object.getOwnPropertyDescriptor(navProto, 'userAgentData') ? redefineAcc
      : (p,k,g)=>safeDefineAcc(p,k,g,{ enumerable: false }))
    (navProto, 'userAgentData', mark(function get_userAgentData(){ return overrideUaData; }, 'get userAgentData'));
    console.info('userAgentData.toJSON correctly implemented');
    }

    // ——— F. deviceMemory/hardwareConcurrency ———
    (Object.getOwnPropertyDescriptor(navProto,'deviceMemory') ? redefineAcc
      : (p,k,g,o)=>safeDefineAcc(p,k,g,o))
    (navProto, 'deviceMemory', () => mem, { enumerable: true });
    
    (Object.getOwnPropertyDescriptor(navProto,'hardwareConcurrency') ? redefineAcc
      : (p,k,g,o)=>safeDefineAcc(p,k,g,o))
    (navProto, 'hardwareConcurrency', () => cpu, { enumerable: true });
    
    // ——— G. language(s) ———
    (Object.getOwnPropertyDescriptor(navProto,'language') ? redefineAcc
      : (p,k,g,o)=>safeDefineAcc(p,k,g,o))
    (navProto, 'language', () => window.__primaryLanguage,  { enumerable: true });
    
    (Object.getOwnPropertyDescriptor(navProto,'languages') ? redefineAcc
      : (p,k,g,o)=>safeDefineAcc(p,k,g,o))
    (navProto, 'languages', () => window.__normalizedLanguages, { enumerable: true });

    // ——— H. permissions.query ———
    if ('permissions' in navigator && navigator.permissions && typeof navigator.permissions.query === 'function') {
      const origQuery = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = mark(function query(parameters) {
        const name = parameters && parameters.name;
        if (name === 'persistent-storage')
          return Promise.resolve({ state: 'granted', onchange: null });
        if (['geolocation', 'camera', 'audiooutput', 'microphone', 'notifications'].includes(name))
          return Promise.resolve({ state: 'prompt', onchange: null });
        return origQuery ? origQuery(parameters) : Promise.resolve({ state: 'prompt', onchange: null });
      }, 'query');
    }

    // ——— I. mediaDevices.enumerateDevices ———
    if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
      navigator.mediaDevices.enumerateDevices = mark(async function enumerateDevices() {
        try {
        } catch (_) {}
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
    }

    // ——— J. storage.estimate & webkitTemporaryStorage ———
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      // Конфигурация: берём из глобалов (как и прочие параметры в модуле), иначе безопасные дефолты
      const QUOTA_MB   = Number(window.__STORAGE_QUOTA_MB   ?? 120);
      const USED_PCT   = Math.max(0, Math.min(100, Number(window.__STORAGE_USED_PCT ?? 3))); // ~3% занято
      const quotaBytes = Math.floor(QUOTA_MB * 1024 * 1024);
      let usageBytes   = Math.max(0, Math.floor(quotaBytes * USED_PCT / 100));

      // Monotonous “jitter” of usage within a few KB, on R(), so as not to break the module’s entropy
      const tickUsage = mark(function tickUsage() {
        usageBytes = Math.min(quotaBytes - 4096, usageBytes + Math.floor(R() * 4096));
      }, 'tickUsage');

      Object.defineProperty(navigator.storage, 'estimate', {
        configurable: true,
        value: mark(() => {
          tickUsage();
          return Promise.resolve({ quota: quotaBytes, usage: usageBytes });
        }, 'estimate')
      });

      if (navigator.webkitTemporaryStorage) {
        navigator.webkitTemporaryStorage.queryUsageAndQuota = mark(function (success, error) {
          try { tickUsage(); success(usageBytes, quotaBytes); }
          catch (e) { if (typeof error === 'function') error(e); }
        }, 'queryUsageAndQuota');
      }

      // Consistent “persistence”
      if (typeof navigator.storage.persist   === 'function') {
        navigator.storage.persist = mark(function persist()   { return Promise.resolve(true); }, 'persist');
      }
      if (typeof navigator.storage.persisted === 'function') {
        navigator.storage.persisted = mark(function persisted() { return Promise.resolve(true); }, 'persisted');
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
          try { Object.defineProperty(performance, 'memory', { get: getMemory, configurable: true }); } catch (__){}
        }
      }
    }

    // ——— K. WebAuthn (stub) ———
    if (!window.PublicKeyCredential) {
      window.PublicKeyCredential = function () {};
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable =
        mark(function isUserVerifyingPlatformAuthenticatorAvailable() { return Promise.resolve(true); },
             'isUserVerifyingPlatformAuthenticatorAvailable');
    }
    if (navigator.credentials) {
      const origCreate = navigator.credentials.create;
      const origGet    = navigator.credentials.get;
      navigator.credentials.create = mark(function create(options) {
        if (options && options.publicKey) {
          return origCreate ? origCreate.call(this, options) : Promise.resolve(new PublicKeyCredential());
        }
        return origCreate ? origCreate.call(this, options) : Promise.resolve(undefined);
      }, 'create');
      navigator.credentials.get = mark(function get(options) {
        if (options && options.publicKey) {
          return origGet ? origGet.call(this, options) : Promise.resolve(new PublicKeyCredential());
        }
        return origGet ? origGet.call(this, options) : Promise.resolve(undefined);
      }, 'get');
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
            suffixes:    safeString(d.suffixes || ''),
            description: safeString(d.description || ''),
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
            suffixes:     { value: String(m.suffixes||''),enumerable: true, configurable: true },
            description:  { value: String(m.description||''), enumerable: true, configurable: true },
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
            suffixes:     { value: String(m.suffixes||''),enumerable: true, configurable: true },
            description:  { value: String(m.description||''), enumerable: true, configurable: true },
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
    console.log("navigator.userAgentData:", navigator.userAgentData);
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