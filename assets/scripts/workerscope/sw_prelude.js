(() => {
  'use strict';

  const G = globalThis;
  const __MODULE = 'sw_prelude';
  const __SURFACE = 'service_worker';
  const __D = G && G.__DEGRADE__;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
  const __applied = [];

  function __emit(level, code, ctx, err) {
    try {
      if (__diag) return __diag(level, code, ctx, err);
      if (typeof __D === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        const safeErr = (err === undefined || err === null) ? null : err;
        return __D(code, safeErr, Object.assign({}, safeCtx, { level: level || 'info' }));
      }
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  }

  function __swDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    return __emit(level, code, {
      module: __MODULE,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
      surface: (typeof x.surface === 'string' && x.surface) ? x.surface : __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage,
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type
    }, err || null);
  }

  function __fail(code, extra, err) {
    const failure = err || new Error(String(code || __MODULE));
    __swDiag('error', code, extra, failure);
    throw failure;
  }

  function __reportNativeThrow(code, key, message, err) {
    __swDiag('warn', code, {
      stage: 'runtime',
      key: key || null,
      message: message,
      type: 'browser structure missing data',
      data: { outcome: 'throw', reason: 'native_throw' }
    }, err || null);
  }

  function __trackDefineProperty(obj, key, desc) {
    const hadOwn = Object.prototype.hasOwnProperty.call(obj, key);
    const prevDesc = hadOwn ? Object.getOwnPropertyDescriptor(obj, key) : null;
    Object.defineProperty(obj, key, desc);
    __applied.push({ obj, key, hadOwn, prevDesc });
  }

  function __trackDeleteOwnIfConfigurable(obj, key) {
    const ownDesc = Object.getOwnPropertyDescriptor(obj, key);
    if (!ownDesc || ownDesc.configurable !== true) return;
    delete obj[key];
    __applied.push({ obj, key, hadOwn: true, prevDesc: ownDesc });
  }

  function __rollbackApplied() {
    for (let i = __applied.length - 1; i >= 0; i -= 1) {
      const item = __applied[i];
      if (!item || !item.obj) continue;
      if (item.hadOwn && item.prevDesc) {
        Object.defineProperty(item.obj, item.key, item.prevDesc);
      } else {
        delete item.obj[item.key];
      }
    }
  }

  function __resolveDescriptor(startObj, key) {
    for (let cur = startObj; cur; cur = Object.getPrototypeOf(cur)) {
      let desc = null;
      try {
        desc = Object.getOwnPropertyDescriptor(cur, key) || null;
      } catch (e) {
        desc = null;
      }
      if (desc) return { owner: cur, desc };
    }
    return { owner: null, desc: null };
  }

  try {
    const env = G.__SW_ENV__;
    if (!env || typeof env !== 'object') {
      __fail('sw_prelude:env_missing', {
        stage: 'preflight',
        key: '__SW_ENV__',
        message: 'service worker env missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'env_missing' }
      }, new Error('SW env missing'));
    }

    const primary = env.primary;
    const langs = env.langs;
    const hc = env.hc;
    const dm = env.dm;
    const meta = env.meta;

    if (typeof primary !== 'string' || !primary) {
      __fail('sw_prelude:language_invalid', {
        stage: 'preflight',
        key: 'primary',
        message: 'service worker language invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'language_invalid' }
      }, new Error('SW language invalid'));
    }
    if (!Array.isArray(langs) || !langs.length) {
      __fail('sw_prelude:languages_invalid', {
        stage: 'preflight',
        key: 'langs',
        message: 'service worker languages invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'languages_invalid' }
      }, new Error('SW languages invalid'));
    }
    if (!Number.isFinite(Number(hc)) || Number(hc) <= 0) {
      __fail('sw_prelude:hardware_concurrency_invalid', {
        stage: 'preflight',
        key: 'hc',
        message: 'service worker hardwareConcurrency invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'hardware_concurrency_invalid' }
      }, new Error('SW hardwareConcurrency invalid'));
    }
    if (!Number.isFinite(Number(dm)) || Number(dm) <= 0) {
      __fail('sw_prelude:device_memory_invalid', {
        stage: 'preflight',
        key: 'dm',
        message: 'service worker deviceMemory invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'device_memory_invalid' }
      }, new Error('SW deviceMemory invalid'));
    }
    if (!meta || typeof meta !== 'object') {
      __fail('sw_prelude:meta_invalid', {
        stage: 'preflight',
        key: 'meta',
        message: 'service worker uaData meta invalid',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'meta_invalid' }
      }, new Error('SW uaData meta invalid'));
    }

    try {
      Object.freeze(langs);
    } catch (e) {
      __swDiag('warn', 'sw_prelude:languages_freeze_failed', {
        stage: 'apply',
        key: 'langs',
        message: 'languages freeze failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'languages_freeze_failed' }
      }, e);
    }

    const nav = G.navigator;
    if (!nav) {
      __fail('sw_prelude:navigator_missing', {
        stage: 'preflight',
        key: 'navigator',
        message: 'service worker navigator missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'navigator_missing' }
      }, new Error('SW navigator missing'));
    }
    const protoInfo = __resolveDescriptor(Object.getPrototypeOf(nav), 'language');
    const proto = Object.getPrototypeOf(nav);
    if (!proto) {
      __fail('sw_prelude:navigator_proto_missing', {
        stage: 'preflight',
        key: 'navigator',
        message: 'service worker navigator proto missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'navigator_proto_missing' }
      }, new Error('SW navigator proto missing'));
    }

    const uad = nav.userAgentData;
    if (!uad) {
      __fail('sw_prelude:uadata_missing', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker navigator.userAgentData missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_missing' }
      }, new Error('SW navigator.userAgentData missing'));
    }
    const uadProto = Object.getPrototypeOf(uad);
    if (!uadProto) {
      __fail('sw_prelude:uadata_proto_missing', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker uaData proto missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_proto_missing' }
      }, new Error('SW uaData proto missing'));
    }

    const chPlatform = meta.platform;
    if (typeof chPlatform !== 'string' || !chPlatform) {
      __fail('sw_prelude:uadata_platform_missing', {
        stage: 'preflight',
        key: 'platform',
        message: 'service worker uaData.platform missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_platform_missing' }
      }, new Error('SW uaData.platform missing'));
    }
    if (!Array.isArray(meta.brands) || !meta.brands.length) {
      __fail('sw_prelude:uadata_brands_missing', {
        stage: 'preflight',
        key: 'brands',
        message: 'service worker uaData.brands missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_brands_missing' }
      }, new Error('SW uaData.brands missing'));
    }
    if (typeof meta.mobile !== 'boolean') {
      __fail('sw_prelude:uadata_mobile_missing', {
        stage: 'preflight',
        key: 'mobile',
        message: 'service worker uaData.mobile missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_mobile_missing' }
      }, new Error('SW uaData.mobile missing'));
    }
    if (!Array.isArray(meta.fullVersionList) || !meta.fullVersionList.length) {
      __fail('sw_prelude:uadata_full_version_list_missing', {
        stage: 'preflight',
        key: 'fullVersionList',
        message: 'service worker uaData.fullVersionList missing',
        type: 'pipeline missing data',
        data: { outcome: 'throw', reason: 'uadata_full_version_list_missing' }
      }, new Error('SW uaData.fullVersionList missing'));
    }

    const uadGetterInfo = __resolveDescriptor(proto, 'userAgentData');
    if (!uadGetterInfo.desc) {
      __fail('sw_prelude:uadata_descriptor_missing', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker userAgentData descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_descriptor_missing' }
      }, new Error('SW userAgentData descriptor missing'));
    }
    if (uadGetterInfo.desc.configurable === false) {
      __fail('sw_prelude:uadata_descriptor_nonconfigurable', {
        stage: 'preflight',
        key: 'userAgentData',
        message: 'service worker userAgentData descriptor non-configurable',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_descriptor_nonconfigurable' }
      }, new Error('SW userAgentData non-configurable'));
    }

    const dBrands = Object.getOwnPropertyDescriptor(uadProto, 'brands') || Object.getOwnPropertyDescriptor(uad, 'brands');
    const dMobile = Object.getOwnPropertyDescriptor(uadProto, 'mobile') || Object.getOwnPropertyDescriptor(uad, 'mobile');
    const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform') || Object.getOwnPropertyDescriptor(uad, 'platform');
    if (!dBrands || !dMobile || !dPlatform) {
      __fail('sw_prelude:uadata_leaf_descriptor_missing', {
        stage: 'preflight',
        key: 'brands',
        message: 'service worker uaData descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_leaf_descriptor_missing' }
      }, new Error('SW uaData descriptor missing'));
    }
    if (dBrands.configurable === false || dMobile.configurable === false || dPlatform.configurable === false) {
      __fail('sw_prelude:uadata_leaf_descriptor_nonconfigurable', {
        stage: 'preflight',
        key: 'brands',
        message: 'service worker uaData descriptor non-configurable',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'uadata_leaf_descriptor_nonconfigurable' }
      }, new Error('SW uaData non-configurable'));
    }

    const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList')
      || Object.getOwnPropertyDescriptor(uad, 'fullVersionList')
      || { configurable: true, enumerable: false };
    if (dFull.configurable === false) {
      __fail('sw_prelude:full_version_list_nonconfigurable', {
        stage: 'preflight',
        key: 'fullVersionList',
        message: 'service worker fullVersionList non-configurable',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'full_version_list_nonconfigurable' }
      }, new Error('SW uaData fullVersionList non-configurable'));
    }

    const ghevDesc = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
    if (!ghevDesc || ghevDesc.configurable === false || typeof ghevDesc.value !== 'function') {
      __fail('sw_prelude:get_high_entropy_values_missing', {
        stage: 'preflight',
        key: 'getHighEntropyValues',
        message: 'service worker getHighEntropyValues descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'get_high_entropy_values_missing' }
      }, new Error('SW uaData.getHighEntropyValues original missing'));
    }
    const origGHEV = ghevDesc.value;

    const toJsonDesc = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
    if (!toJsonDesc || toJsonDesc.configurable === false || typeof toJsonDesc.value !== 'function') {
      __fail('sw_prelude:tojson_missing', {
        stage: 'preflight',
        key: 'toJSON',
        message: 'service worker toJSON descriptor missing',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'tojson_missing' }
      }, new Error('SW uaData.toJSON original missing'));
    }
    const origToJSON = toJsonDesc.value;

    const deep = v => v == null ? v : JSON.parse(JSON.stringify(v));
    const brandsValue = deep(meta.brands);
    const mobileValue = meta.mobile;
    const platformValue = chPlatform;
    const isUadThis = recv => (recv === uad);

    function defAcc(key, getter) {
      const resolved = __resolveDescriptor(proto, key);
      if (resolved.desc && resolved.desc.configurable === false) {
        __fail('sw_prelude:descriptor_nonconfigurable', {
          stage: 'preflight',
          key,
          message: 'service worker descriptor non-configurable',
          type: 'browser structure missing data',
          data: { outcome: 'throw', reason: 'descriptor_nonconfigurable' }
        }, new Error('SW ' + key + ' non-configurable'));
      }
      const owner = resolved.owner || proto;
      const origGet = resolved.desc && (typeof resolved.desc.get === 'function') ? resolved.desc.get : null;
      const guardedGet = function() {
        const recv = this;
        if (recv === nav) {
          try {
            return getter.call(recv);
          } catch (e) {
            __swDiag('warn', 'sw_prelude:getter_runtime_failed', {
              stage: 'runtime',
              key,
              message: 'service worker getter runtime failed',
              type: 'browser structure missing data',
              data: { outcome: 'skip', reason: 'getter_runtime_failed' }
            }, e);
            if (typeof origGet === 'function') return Reflect.apply(origGet, recv, []);
            throw e;
          }
        }
        if (typeof origGet === 'function') {
          try {
            return Reflect.apply(origGet, recv, []);
          } catch (e) {
            __reportNativeThrow('sw_prelude:illegal_invocation', key, 'service worker getter illegal invocation', e);
            throw e;
          }
        }
        const illegalInvocationErr = new TypeError('Illegal invocation');
        __reportNativeThrow('sw_prelude:illegal_invocation', key, 'service worker getter illegal invocation', illegalInvocationErr);
        throw illegalInvocationErr;
      };
      __trackDefineProperty(owner, key, {
        get: guardedGet,
        configurable: resolved.desc ? !!resolved.desc.configurable : true,
        enumerable: resolved.desc ? !!resolved.desc.enumerable : false,
        set: resolved.desc && Object.prototype.hasOwnProperty.call(resolved.desc, 'set') ? resolved.desc.set : undefined
      });
    }

    function guardedUadGetter(value, origGet, origValue) {
      return function() {
        const recv = this;
        if (isUadThis(recv)) return value;
        if (typeof origGet === 'function') {
          try {
            return Reflect.apply(origGet, recv, []);
          } catch (e) {
            __reportNativeThrow('sw_prelude:illegal_invocation', null, 'service worker uaData illegal invocation', e);
            throw e;
          }
        }
        if (origValue !== undefined) return origValue;
        const illegalInvocationErr = new TypeError('Illegal invocation');
        __reportNativeThrow('sw_prelude:illegal_invocation', null, 'service worker uaData illegal invocation', illegalInvocationErr);
        throw illegalInvocationErr;
      };
    }

    if (Object.prototype.hasOwnProperty.call(dBrands, 'value') && !dBrands.get && !dBrands.set) {
      __trackDefineProperty(uadProto, 'brands', {
        value: brandsValue,
        writable: !!dBrands.writable,
        configurable: !!dBrands.configurable,
        enumerable: !!dBrands.enumerable
      });
    } else {
      __trackDefineProperty(uadProto, 'brands', {
        get: guardedUadGetter(brandsValue, dBrands.get, dBrands.value),
        set: dBrands.set,
        configurable: !!dBrands.configurable,
        enumerable: !!dBrands.enumerable
      });
    }
    if (Object.prototype.hasOwnProperty.call(dMobile, 'value') && !dMobile.get && !dMobile.set) {
      __trackDefineProperty(uadProto, 'mobile', {
        value: mobileValue,
        writable: !!dMobile.writable,
        configurable: !!dMobile.configurable,
        enumerable: !!dMobile.enumerable
      });
    } else {
      __trackDefineProperty(uadProto, 'mobile', {
        get: guardedUadGetter(mobileValue, dMobile.get, dMobile.value),
        set: dMobile.set,
        configurable: !!dMobile.configurable,
        enumerable: !!dMobile.enumerable
      });
    }
    if (Object.prototype.hasOwnProperty.call(dPlatform, 'value') && !dPlatform.get && !dPlatform.set) {
      __trackDefineProperty(uadProto, 'platform', {
        value: platformValue,
        writable: !!dPlatform.writable,
        configurable: !!dPlatform.configurable,
        enumerable: !!dPlatform.enumerable
      });
    } else {
      __trackDefineProperty(uadProto, 'platform', {
        get: guardedUadGetter(platformValue, dPlatform.get, dPlatform.value),
        set: dPlatform.set,
        configurable: !!dPlatform.configurable,
        enumerable: !!dPlatform.enumerable
      });
    }

    __trackDefineProperty(uadProto, 'fullVersionList', {
      get: guardedUadGetter(deep(meta.fullVersionList), dFull.get, dFull.value),
      enumerable: !!dFull.enumerable,
      configurable: !!dFull.configurable
    });

    const getHighEntropyValues = function(keys) {
      if (!isUadThis(this)) {
        try {
          return Reflect.apply(origGHEV, this, [keys]);
        } catch (e) {
          __reportNativeThrow('sw_prelude:illegal_invocation', 'getHighEntropyValues', 'service worker getHighEntropyValues illegal invocation', e);
          throw e;
        }
      }
      if (!Array.isArray(keys)) {
        return Reflect.apply(origGHEV, this, [keys]);
      }
      for (const hint of keys) {
        if (typeof hint !== 'string' || !hint) {
          return Reflect.apply(origGHEV, this, [keys]);
        }
      }
      const map = {
        architecture: meta.architecture,
        bitness: meta.bitness,
        model: meta.model,
        brands: brandsValue,
        mobile: mobileValue,
        platform: platformValue,
        platformVersion: meta.platformVersion,
        fullVersionList: deep(meta.fullVersionList),
        deviceMemory: Number(dm),
        hardwareConcurrency: Number(hc),
        wow64: meta.wow64,
        formFactors: meta.formFactors
      };
      const result = {};
      for (const hint of keys) {
        if (!(hint in map)) continue;
        const val = map[hint];
        if (val === undefined || val === null || (typeof val === 'string' && !val && hint !== 'model') || (Array.isArray(val) && !val.length)) {
          __swDiag('warn', 'sw_prelude:get_high_entropy_values_native_fallback', {
            stage: 'runtime',
            key: hint,
            message: 'service worker getHighEntropyValues fallback to native',
            type: 'pipeline missing data',
            data: { outcome: 'skip', reason: 'get_high_entropy_values_native_fallback' }
          }, null);
          return Reflect.apply(origGHEV, this, [keys]);
        }
        result[hint] = val;
      }
      return Promise.resolve(result);
    };
    __trackDeleteOwnIfConfigurable(uad, 'getHighEntropyValues');
    __trackDefineProperty(uadProto, 'getHighEntropyValues', {
      value: getHighEntropyValues,
      configurable: !!ghevDesc.configurable,
      enumerable: !!ghevDesc.enumerable,
      writable: Object.prototype.hasOwnProperty.call(ghevDesc, 'writable') ? ghevDesc.writable : true
    });

    const toJSON = function() {
      if (!isUadThis(this)) {
        try {
          return Reflect.apply(origToJSON, this, []);
        } catch (e) {
          __reportNativeThrow('sw_prelude:illegal_invocation', 'toJSON', 'service worker toJSON illegal invocation', e);
          throw e;
        }
      }
      return { platform: this.platform, brands: this.brands, mobile: this.mobile };
    };
    __trackDeleteOwnIfConfigurable(uad, 'toJSON');
    __trackDefineProperty(uadProto, 'toJSON', {
      value: toJSON,
      configurable: !!toJsonDesc.configurable,
      enumerable: !!toJsonDesc.enumerable,
      writable: Object.prototype.hasOwnProperty.call(toJsonDesc, 'writable') ? toJsonDesc.writable : true
    });

    defAcc('userAgentData', function() { return uad; });
    defAcc('language', function() { return primary; });
    defAcc('languages', function() { return langs; });
    defAcc('hardwareConcurrency', function() { return Number(hc); });
    defAcc('deviceMemory', function() { return Number(dm); });

    if (nav.languages[0] !== nav.language) {
      __fail('sw_prelude:language_contract_mismatch', {
        stage: 'contract',
        key: 'languages',
        message: 'service worker language contract mismatch',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'language_contract_mismatch' }
      }, new Error('SW language != languages[0]'));
    }

    __swDiag('info', 'sw_prelude:return', {
      stage: 'apply',
      key: 'navigator',
      message: 'service worker mirror installed',
      type: 'pipeline missing data',
      data: { outcome: 'return' }
    }, null);
  } catch (e) {
    let rollbackErr = null;
    try {
      __rollbackApplied();
    } catch (re) {
      rollbackErr = re;
    }
    __swDiag('error', 'sw_prelude:rollback', {
      stage: rollbackErr ? 'rollback' : 'apply',
      key: 'navigator',
      message: rollbackErr ? 'service worker rollback failed' : 'service worker apply failed',
      type: 'browser structure missing data',
      data: { outcome: rollbackErr ? 'throw' : 'rollback', reason: rollbackErr ? 'rollback_failed' : 'apply_failed', rollbackOk: !rollbackErr }
    }, rollbackErr || e);
    throw (rollbackErr || e);
  }
})();

//# sourceURL=sw_prelude.js
