(() => {
  'use strict';
  const G = globalThis;

  const env = G.__SW_ENV__;
  if (!env || typeof env !== 'object') throw new Error('THW: SW env missing');

  const primary = env.primary;
  const langs   = env.langs;
  const hc      = env.hc;
  const dm      = env.dm;
  const meta    = env.meta;

  if (typeof primary !== 'string' || !primary) throw new Error('THW: SW language invalid');
  if (!Array.isArray(langs) || !langs.length) throw new Error('THW: SW languages invalid');
  if (!Number.isFinite(Number(hc)) || Number(hc) <= 0) throw new Error('THW: SW hardwareConcurrency invalid');
  if (!Number.isFinite(Number(dm)) || Number(dm) <= 0) throw new Error('THW: SW deviceMemory invalid');
  if (!meta || typeof meta !== 'object') throw new Error('THW: SW uaData meta invalid');
  try { Object.freeze(langs); } catch(e) {}

  const nav = G.navigator;
  if (!nav) throw new Error('THW: SW navigator missing');
  const proto = Object.getPrototypeOf(nav);
  if (!proto) throw new Error('THW: SW navigator proto missing');

  function defAcc(key, getter) {
    const d = Object.getOwnPropertyDescriptor(proto, key);
    if (d && d.configurable === false) throw new Error('THW: SW ' + key + ' non-configurable');
    const origGet = d && (typeof d.get === 'function') ? d.get : null;
    const guardedGet = function() {
      const recv = this;
      if (recv === nav || recv === proto) return getter.call(recv);
      if (typeof origGet === 'function') return Reflect.apply(origGet, recv, []);
      throw new TypeError('Illegal invocation');
    };
    Object.defineProperty(proto, key, {
      get: guardedGet,
      configurable: d ? !!d.configurable : true,
      enumerable: d ? !!d.enumerable : false,
      set: d && Object.prototype.hasOwnProperty.call(d, 'set') ? d.set : undefined
    });
  }

  const uad = nav.userAgentData;
  if (!uad) throw new Error('THW: SW navigator.userAgentData missing');
  const uadProto = Object.getPrototypeOf(uad);
  if (!uadProto) throw new Error('THW: SW uaData proto missing');
  const isUadThis = (self) => (self === uad || self === uadProto);

  const chPlatform = meta.platform;
  if (typeof chPlatform !== 'string' || !chPlatform) throw new Error('THW: SW uaData.platform missing');
  if (!Array.isArray(meta.brands) || !meta.brands.length) throw new Error('THW: SW uaData.brands missing');
  if (typeof meta.mobile !== 'boolean') throw new Error('THW: SW uaData.mobile missing');
  if (!Array.isArray(meta.fullVersionList) || !meta.fullVersionList.length) throw new Error('THW: SW uaData.fullVersionList missing');
  if (typeof meta.uaFullVersion !== 'string' || !meta.uaFullVersion) throw new Error('THW: SW uaData.uaFullVersion missing');

  const dUad = Object.getOwnPropertyDescriptor(proto, 'userAgentData');
  if (!dUad) throw new Error('THW: SW userAgentData descriptor missing');
  if (dUad.configurable === false) throw new Error('THW: SW userAgentData non-configurable');

  const dBrands   = Object.getOwnPropertyDescriptor(uadProto, 'brands') || Object.getOwnPropertyDescriptor(uad, 'brands');
  const dMobile   = Object.getOwnPropertyDescriptor(uadProto, 'mobile') || Object.getOwnPropertyDescriptor(uad, 'mobile');
  const dPlatform = Object.getOwnPropertyDescriptor(uadProto, 'platform') || Object.getOwnPropertyDescriptor(uad, 'platform');
  if (!dBrands || !dMobile || !dPlatform) throw new Error('THW: SW uaData descriptor missing');
  if (dBrands.configurable === false || dMobile.configurable === false || dPlatform.configurable === false) throw new Error('THW: SW uaData non-configurable');

  const dFull = Object.getOwnPropertyDescriptor(uadProto, 'fullVersionList')
    || Object.getOwnPropertyDescriptor(uad, 'fullVersionList')
    || { configurable: true, enumerable: false };
  if (dFull.configurable === false) throw new Error('THW: SW uaData fullVersionList non-configurable');

  const dUaFull = Object.getOwnPropertyDescriptor(uadProto, 'uaFullVersion')
    || Object.getOwnPropertyDescriptor(uad, 'uaFullVersion')
    || { configurable: true, enumerable: false };
  if (dUaFull.configurable === false) throw new Error('THW: SW uaData uaFullVersion non-configurable');

  const ghevDesc = Object.getOwnPropertyDescriptor(uadProto, 'getHighEntropyValues');
  if (!ghevDesc) throw new Error('THW: SW uaData.getHighEntropyValues descriptor missing');
  if (ghevDesc.configurable === false) throw new Error('THW: SW uaData.getHighEntropyValues non-configurable');
  const origGHEV = ghevDesc && ghevDesc.value;
  if (typeof origGHEV !== 'function') throw new TypeError('THW: SW uaData.getHighEntropyValues original missing');

  const toJsonDesc = Object.getOwnPropertyDescriptor(uadProto, 'toJSON');
  if (!toJsonDesc) throw new Error('THW: SW uaData.toJSON descriptor missing');
  if (toJsonDesc.configurable === false) throw new Error('THW: SW uaData.toJSON non-configurable');
  const origToJSON = toJsonDesc && toJsonDesc.value;
  if (typeof origToJSON !== 'function') throw new TypeError('THW: SW uaData.toJSON original missing');

  function dropOwnIfConfigurable(obj, key) {
    const ownDesc = Object.getOwnPropertyDescriptor(obj, key);
    if (ownDesc && ownDesc.configurable) {
      try { delete obj[key]; } catch (e) {}
    }
  }
  function defineUadProtoMethod(proto, key, fn, desc) {
    const d = desc || Object.getOwnPropertyDescriptor(proto, key);
    Object.defineProperty(proto, key, {
      value: fn,
      configurable: d ? d.configurable : true,
      enumerable: d ? d.enumerable : false,
      writable: d && Object.prototype.hasOwnProperty.call(d, 'writable') ? d.writable : true
    });
  }
  function guardedUadGetter(value, origGet, origValue) {
    return function() {
      const recv = this;
      if (isUadThis(recv)) return value;
      if (typeof origGet === 'function') return Reflect.apply(origGet, recv, []);
      if (origValue !== undefined) return origValue;
      throw new TypeError('Illegal invocation');
    };
  }

  const deep = v => v == null ? v : JSON.parse(JSON.stringify(v));
  const brandsValue = deep(meta.brands);
  const mobileValue = meta.mobile;
  const platformValue = chPlatform;

  if (Object.prototype.hasOwnProperty.call(dBrands, 'value') && !dBrands.get && !dBrands.set) {
    Object.defineProperty(uadProto, 'brands', {
      value: brandsValue,
      writable: !!dBrands.writable,
      configurable: !!dBrands.configurable,
      enumerable: !!dBrands.enumerable
    });
  } else {
    Object.defineProperty(uadProto, 'brands', {
      get: guardedUadGetter(brandsValue, dBrands.get, dBrands.value),
      set: dBrands.set,
      configurable: !!dBrands.configurable,
      enumerable: !!dBrands.enumerable
    });
  }
  if (Object.prototype.hasOwnProperty.call(dMobile, 'value') && !dMobile.get && !dMobile.set) {
    Object.defineProperty(uadProto, 'mobile', {
      value: mobileValue,
      writable: !!dMobile.writable,
      configurable: !!dMobile.configurable,
      enumerable: !!dMobile.enumerable
    });
  } else {
    Object.defineProperty(uadProto, 'mobile', {
      get: guardedUadGetter(mobileValue, dMobile.get, dMobile.value),
      set: dMobile.set,
      configurable: !!dMobile.configurable,
      enumerable: !!dMobile.enumerable
    });
  }
  if (Object.prototype.hasOwnProperty.call(dPlatform, 'value') && !dPlatform.get && !dPlatform.set) {
    Object.defineProperty(uadProto, 'platform', {
      value: platformValue,
      writable: !!dPlatform.writable,
      configurable: !!dPlatform.configurable,
      enumerable: !!dPlatform.enumerable
    });
  } else {
    Object.defineProperty(uadProto, 'platform', {
      get: guardedUadGetter(platformValue, dPlatform.get, dPlatform.value),
      set: dPlatform.set,
      configurable: !!dPlatform.configurable,
      enumerable: !!dPlatform.enumerable
    });
  }

  Object.defineProperty(uadProto, 'fullVersionList', {
    get: guardedUadGetter(deep(meta.fullVersionList), dFull.get, dFull.value),
    enumerable: dFull.enumerable,
    configurable: dFull.configurable
  });
  Object.defineProperty(uadProto, 'uaFullVersion', {
    get: guardedUadGetter(meta.uaFullVersion, dUaFull.get, dUaFull.value),
    enumerable: dUaFull.enumerable,
    configurable: dUaFull.configurable
  });

  const getHighEntropyValues = function(keys) {
    if (!isUadThis(this)) {
      return origGHEV.call(this, keys);
    }
    if (!Array.isArray(keys)) throw new Error('THW: SW uaData bad keys');
    const map = {
      architecture: meta.architecture,
      bitness: meta.bitness,
      model: meta.model,
      brands: brandsValue,
      mobile: mobileValue,
      platform: platformValue,
      platformVersion: meta.platformVersion,
      uaFullVersion: meta.uaFullVersion,
      fullVersionList: deep(meta.fullVersionList),
      deviceMemory: Number(dm),
      hardwareConcurrency: Number(hc),
      wow64: meta.wow64,
      formFactors: meta.formFactors
    };
    const result = {};
    for (const hint of keys) {
      if (typeof hint !== 'string' || !hint) throw new Error('THW: SW uaData bad keys');
      if (!(hint in map)) throw new Error('THW: SW uaData missing ' + hint);
      const val = map[hint];
      if (val === undefined || val === null) throw new Error('THW: SW uaData missing ' + hint);
      if (typeof val === 'string' && !val && hint !== 'model') throw new Error('THW: SW uaData missing ' + hint);
      if (Array.isArray(val) && !val.length) throw new Error('THW: SW uaData missing ' + hint);
      result[hint] = val;
    }
    return Promise.resolve(result);
  };
  dropOwnIfConfigurable(uad, 'getHighEntropyValues');
  defineUadProtoMethod(uadProto, 'getHighEntropyValues', getHighEntropyValues, ghevDesc);

  const toJSON = function() {
    if (!isUadThis(this)) return origToJSON.call(this);
    return { platform: this.platform, brands: this.brands, mobile: this.mobile };
  };
  dropOwnIfConfigurable(uad, 'toJSON');
  defineUadProtoMethod(uadProto, 'toJSON', toJSON, toJsonDesc);

  defAcc('userAgentData', function(){ return uad; });

  defAcc('language',  function(){ return primary; });
  defAcc('languages', function(){ return langs; });
  defAcc('hardwareConcurrency', function(){ return Number(hc); });
  defAcc('deviceMemory', function(){ return Number(dm); });

  if (nav.languages[0] !== nav.language) throw new Error('THW: SW language != languages[0]');
})();

//# sourceURL=sw_prelude.js
