function WebGPUPatchModule() {
  if (!window.__PATCH_WEBGPU__) {
    window.__PATCH_WEBGPU__ = true;
    const C = window.CanvasPatchContext;
      if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module is registration is not available');
    const markNative = (window.markAsNative || ((f) => f));

     // --- Определение браузера ---
    function getBrowser() {
        const ua = navigator.userAgent;
        if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "safari";
        if (/Edg\//.test(ua)) return "edge";
        if (/Chrome/.test(ua)) return "chrome";
        return "other";
    }

    const WHITELISTS = {
        chrome: { ADAPTER: [
            "vendor","description","architecture","device","label",
            "name","adapterType","driverVersion","isFallbackAdapter",
            "limits","features","requestDevice"
        ], DEVICE: [
            "limits","features","label","lost","createTexture",
        ]},
        edge:   { ADAPTER: [
            "vendor","description","architecture","device","label",
            "adapterType","driverVersion","isFallbackAdapter",
            "limits","features","requestDevice"
        ], DEVICE: [
            "limits","features","label","lost","createTexture",
        ]},
        safari: { ADAPTER: [
            "vendor","description","device","label",
            "adapterType","isFallbackAdapter","limits","features",
            "requestDevice"
        ], DEVICE: [
            "limits","features","label","createTexture",
        ]},
        other:  { ADAPTER: [
            "vendor","description","device","label","limits","features",
            "requestDevice"
        ], DEVICE: [
            "limits","features","createTexture","then"
        ]}
    };
    const browser = getBrowser();
    const ADAPTER_WHITELIST = WHITELISTS[browser]?.ADAPTER || WHITELISTS.other.ADAPTER;
    const DEVICE_WHITELIST  = WHITELISTS[browser]?.DEVICE  || WHITELISTS.other.DEVICE;

    // ===  Система логирования  ===
    if (!window.__WEBGPU_LOGS__) window.__WEBGPU_LOGS__ = [];
    function logAccess(type, prop) {
      if (prop === 'then') return; // избегаем шума от Promise
      (window.__WEBGPU_LOGS__ || (window.__WEBGPU_LOGS__ = []))
        .push({ type, prop, time: Date.now() });
      if (window.__DEBUG__) console.warn(`[WebGPU][${type}] access: ${String(prop)}`);
    }
  
    // Хелперы пересечения множеств (используемся ТОЛЬКО для features)
    function __toSet(x){
      return new Set(Array.isArray(x) ? x : (x instanceof Set ? Array.from(x) : []));
    }
    function __intersectSets(a,b){
      const A = __toSet(a); const B = __toSet(b); const out = new Set();
      for (const v of A) if (B.has(v)) out.add(v);
      return out;
    }
    // Примечание по Texture Format Capabilities:
    // в рамках интеграции ИТЕРАТО-блока мы НЕ меняем поведение createTexture и не вводим новые поля,
    // а лишь сохраняем текущую логику ORIGwebgpu.js. WL форматов (если объявлен где-то глобально)
    // остаётся внешним фильтром; поведение не изменяется.
    // === ▲▲▲ Конец интеграции блоков из ITERATOwebgpu.js ▲▲▲ ===

    // --- Патч-параметры ---
    function getVendor()        { return window.__GPU_VENDOR__; }
    function getDescription()   { return "empty" }
    function getLimits()        { return window.__WEBGPU_LIMITS_WHITELIST__; }
    // function getLimits()        { return window.__WEBGPU_LIMITS_WHITELIST__  || window.__WEBGL_LIMITS__ || { maxTextureDimension2D: 8192 }; }
    function getFeatures()      { return  window.__WEBGPU_FEATURES_WHITELIST__; }
    // function getFeatures()      { return window.__WEBGPU_FEATURES__|| window.__WEBGL_FEATURES__|| ["texture-compression-bc"]; }
    function getLabel()         { return getDescription(); }
    function getAdapterType()   { return window.__GPU_TYPE__; }
    // function getDriverVersion() { return "24.5.1"; }
    function getIsFallbackAdapter() {return false;}
    function getName()          { return getDescription(); }

    const patch = {
        vendor:            getVendor(),
        description:       getDescription(),
        architecture:      window.__GPU_ARCHITECTURE__,
        device:            window.__WEBGPU_DEVICE__,
        label:             getLabel(),
        name:              getName(),
        adapterType:       getAdapterType(),
        // driverVersion:     getDriverVersion(),
        type:              getAdapterType(),
        isFallbackAdapter: getIsFallbackAdapter(),
        limits:            getLimits(),
        features:          getFeatures()
    };

    if (!window.__WEBGPU_LOGS__) window.__WEBGPU_LOGS__ = [];
    function logNonWhiteList(type, prop) {
        if (prop === "then") return;
        window.__WEBGPU_LOGS__.push({ type, prop, time: Date.now() });
        console.warn(`[WebGPU][${type}] Non-whitelisted property accessed: ${prop}`);
    }


    // === AdapterInfo: сборка с приоритетом твоих глобалов ===
    function __buildAdapterInfo(nativeInfo) {
      const info = nativeInfo && typeof nativeInfo === 'object' ? nativeInfo : {};
      // Берём ровно те ключи, которые ты уже согласуешь глобалами:
      const v  = (window.__GPU_VENDOR__ ?? info.vendor) || undefined;
      const a  = (window.__GPU_ARCHITECTURE__ ?? info.architecture) || undefined;
      const d  = (window.__WEBGPU_DEVICE__ ?? info.device) || undefined;
      const ds = ("empty" /* твой getDescription() */) || info.description || undefined;
      const t  = (window.__GPU_TYPE__ ?? info.type) || undefined;

      // isFallbackAdapter — по Chromium сейчас false
      const isFB = false;

      // Остальное не трогаем (если драйвер не дал — остаётся undefined):
      return {
        vendor: v,
        architecture: a,
        device: d,
        description: ds,
        type: t,
        isFallbackAdapter: isFB,
        driver: info.driver,
        backend: info.backend,
        memoryHeaps: info.memoryHeaps,
        d3dShaderModel: info.d3dShaderModel,
        vkDriverVersion: info.vkDriverVersion,
        subgroupMatrixConfigs: info.subgroupMatrixConfigs,
        subgroupMaxSize: info.subgroupMaxSize,
        subgroupMinSize: info.subgroupMinSize
      };
    }

// === блоки Adapter Features / Texture Format Capabilities ===

// Универсальный ридер свойств с биндингом функций
  function getProp(target, prop, receiver) {
    try {
      const val = Reflect.get(target, prop, receiver);
      return typeof val === 'function' ? val.bind(target) : val;
    } catch { return undefined; }
  }

  // WL по фичам (Adapter Features) + гарантия core features
  const __WL_FEATURES__ = new Set(Array.isArray(window.__WEBGPU_FEATURES_WHITELIST__)
    ? window.__WEBGPU_FEATURES_WHITELIST__ : []);
  for (const cf of ['depth-clip-control','depth32float-stencil8','texture-compression-bc']) {
    __WL_FEATURES__.add(cf);
  }

  // WL по лимитам + гарантия core limits
  const __WL_LIMITS__ = new Set(Array.isArray(window.__WEBGPU_LIMITS_WHITELIST__)
    ? window.__WEBGPU_LIMITS_WHITELIST__ : []);
  for (const cl of ['maxTextureDimension1D','maxTextureDimension2D','maxTextureDimension3D','maxBindGroups']) {
    __WL_LIMITS__.add(cl);
  }

  // === Limits: WL-маскирование поверх нативного объекта (сохраняем бренд) ===
  const __MaskedLimitsCache__ = new WeakMap();
  function __maskLimits(nativeLimits) {
    if (!nativeLimits || typeof nativeLimits !== 'object' || __WL_LIMITS__.size === 0) return nativeLimits;
    if (__MaskedLimitsCache__.has(nativeLimits)) return __MaskedLimitsCache__.get(nativeLimits);

    const proxy = new Proxy(nativeLimits, {
      getPrototypeOf(target) { return Reflect.getPrototypeOf(target); },
      get(target, prop) {
        return (__WL_LIMITS__.has(prop) && prop in target)
          ? Reflect.get(target, prop)
          : undefined;
      },
      has(target, prop) { return __WL_LIMITS__.has(prop) && (prop in target); },
      ownKeys(target)   { return Reflect.ownKeys(target).filter(k => __WL_LIMITS__.has(k)); },
      getOwnPropertyDescriptor(target, prop) {
        if (!__WL_LIMITS__.has(prop) || !Reflect.has(target, prop)) return undefined;
        const d = Reflect.getOwnPropertyDescriptor(target, prop);
        if (!d) return undefined;
        return { ...d, configurable: false, writable: false, enumerable: true };
      },
      set() { return false; },
      defineProperty() { return false; },
      deleteProperty() { return false; }
    });

    __MaskedLimitsCache__.set(nativeLimits, proxy);
    return proxy;
  }


const __MaskedFeaturesCache__ = new WeakMap();

// === Features: прокси без смены типа GPUSupportedFeatures (бренд + «нативный» вид функций)
function __maskFeatures(nativeFeatures) {
  if (!nativeFeatures || __WL_FEATURES__.size === 0) return nativeFeatures;

  // ➜ КЭШ: возвращаем один и тот же прокси для одного и того же объекта
  if (__MaskedFeaturesCache__.has(nativeFeatures)) {
    return __MaskedFeaturesCache__.get(nativeFeatures);
  }

  const hasNative = nativeFeatures.has.bind(nativeFeatures);
  const allowed = new Set();
  for (const f of nativeFeatures) if (__WL_FEATURES__.has(f)) allowed.add(f);

  const proxy = new Proxy(nativeFeatures, {
    getPrototypeOf(target) { return Reflect.getPrototypeOf(target); },
    get(target, prop) {
      if (prop === 'has') {
        return markNative((k) => __WL_FEATURES__.has(k) && hasNative(k), 'has');
      }
      if (prop === 'forEach') {
        return markNative((cb, thisArg) => { for (const v of allowed) cb.call(thisArg, v, v, target); }, 'forEach');
      }
      if (prop === Symbol.iterator || prop === 'values' || prop === 'keys') {
        const name = prop === 'keys' ? 'keys' : 'values';
        const iter = function* () { for (const v of allowed) yield v; };
        return markNative(iter, name);
      }
      if (prop === 'entries') {
        const iter = function* () { for (const v of allowed) yield [v, v]; };
        return markNative(iter, 'entries');
      }
      if (prop === 'size') return allowed.size;
      return Reflect.get(target, prop);
    }
  });

  __MaskedFeaturesCache__.set(nativeFeatures, proxy);
  return proxy;
}



  // --- Патч navigator.gpu.requestAdapter (внутри — патч requestDevice) ---
  if (navigator.gpu?.requestAdapter) {
    const origRequestAdapter = navigator.gpu.requestAdapter.bind(navigator.gpu);

    const patchedRequestAdapter = async function requestAdapter(options = {}, ...rest) {
      const adapter = await origRequestAdapter(options, ...rest);
      if (!adapter) return null;

      const origRequestDevice = adapter.requestDevice.bind(adapter);
      const origRequestAdapterInfo = typeof adapter.requestAdapterInfo === 'function'
        ? adapter.requestAdapterInfo.bind(adapter)
        : null;

      // — единичный вызов + кеш для .info / requestAdapterInfo()
      let __adapterInfoValue;
      const __adapterInfoPromise = (async () => {
        try {
          const native = origRequestAdapterInfo ? await origRequestAdapterInfo()
                                                : (adapter.info || {});
          const built = __buildAdapterInfo(native);
          __adapterInfoValue = built;
          return built;
        } catch {
          const built = __buildAdapterInfo(adapter.info || {});
          __adapterInfoValue = built;
          return built;
        }
      })();

      // Патчируем requestDevice и маскируем как «нативный»
      // авто-включение фич, если адаптер их поддерживает (безопасное пересечение)
      const __AUTO_ENABLE_ON_DEVICE__ = ['texture-compression-bc','texture-compression-etc2','texture-compression-astc'];

      const patchedRequestDevice = async function requestDevice(options = {}, ...rest) {
        const opts = (options && typeof options === 'object') ? { ...options } : {};
        const req = new Set(Array.isArray(opts.requiredFeatures) ? opts.requiredFeatures : []);

    // авто-добавление только реально поддерживаемых адаптером фич
      for (const f of __AUTO_ENABLE_ON_DEVICE__) {
        try { if (adapter.features && adapter.features.has(f)) req.add(f); } catch {}
      }
      if (req.size > 0) opts.requiredFeatures = Array.from(req);

      const dev = await origRequestDevice(opts, ...rest);
      if (!dev) return null;

      // тени-геттеры без смены бренда
      try {
        const maskedFeatures = __maskFeatures(dev.features);
        Object.defineProperty(dev, 'features', {
          configurable: true,
          get: markNative(function get_features(){ return maskedFeatures; }, 'get features')
        });
      } catch {}

      try {
        const maskedLimits = __maskLimits(dev.limits || {});
        Object.defineProperty(dev, 'limits', {
          configurable: true,
          get: markNative(function get_limits(){ return maskedLimits; }, 'get limits')
        });
      } catch {}

      try {
        Object.defineProperty(dev, 'label', {
          configurable: true,
          get: markNative(function get_label(){ return patch.label; }, 'get label')
        });
      } catch {}

      return dev; // возвращаем нативный GPUDevice (бренд сохраняем)
    };

    adapter.requestDevice = markNative(patchedRequestDevice, 'requestDevice');


      // Прокси адаптера
      const handler = {
        get(target, prop, receiver) {
          logAccess('adapter', prop);
          if (!ADAPTER_WHITELIST.includes(prop)) logNonWhiteList("adapter", prop);

          if (prop === 'limits')   return __maskLimits(target.limits || {});
          if (prop === 'features') return __maskFeatures(target.features);
          if (prop === 'requestAdapterInfo') {
            return markNative(function requestAdapterInfo() { return __adapterInfoPromise; }, 'requestAdapterInfo');
          }
          if (prop === 'info') {
            return (target.info ? (__adapterInfoValue ?? __buildAdapterInfo(target.info || {})) : undefined);
          }
          if (prop === 'label') return patch.label;

          return getProp(target, prop, receiver);
        }
      };

      return new Proxy(adapter, handler);
    };
    navigator.gpu.requestAdapter = markNative(patchedRequestAdapter, 'requestAdapter');
  
};
console.log(`[WebGPU] Patched requestAdapter/requestDevice for browser: ${browser}`);
}
} // ✅ Эта закрывающая скобка завершает функцию корректно

