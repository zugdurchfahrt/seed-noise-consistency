(function(){
  'use strict';
  const g = window;
  const D = (typeof g.__DEGRADE__ === 'function') ? g.__DEGRADE__ : null;
  function degrade(code, err, extra){
    try { if (D) D(code, err || null, extra || null); } catch(_e) {}
  }
  function isObj(x){ return !!x && (typeof x === 'object' || typeof x === 'function'); }
  function mustStr(obj, k, allowEmpty){
    const v = obj && obj[k];
    if (typeof v !== 'string') throw new Error('UADOverride: bad ' + k);
    if (!allowEmpty && !v.trim()) throw new Error('UADOverride: bad ' + k);
    return v;
  }
  function mustBool(obj, k){
    const v = obj && obj[k];
    if (typeof v !== 'boolean') throw new Error('UADOverride: bad ' + k);
    return v;
  }
  function mustBrands(obj){
    const a = obj && obj.brands;
    if (!Array.isArray(a)) throw new Error('UADOverride: bad brands');
    return a.map(b => {
      if (!b || typeof b !== 'object') throw new Error('UADOverride: bad brands entry');
      const brand = (typeof b.brand === 'string' && b.brand) ? b.brand : null;
      if (!brand) throw new Error('UADOverride: bad brands.brand');
      const version = (b.version != null) ? String(b.version) : '';
      if (!version) throw new Error('UADOverride: bad brands.version');
      return { brand, version };
    });
  }
  function mustFullVersionList(obj){
    const a = obj && obj.fullVersionList;
    if (!Array.isArray(a) || !a.length) throw new Error('UADOverride: bad fullVersionList');
    return a.map(x => {
      if (!x || typeof x !== 'object') throw new Error('UADOverride: bad fullVersionList entry');
      const brand = (typeof x.brand === 'string' && x.brand) ? x.brand : null;
      if (!brand) throw new Error('UADOverride: bad fullVersionList.brand');
      const version = (x.version != null) ? String(x.version) : '';
      if (!version) throw new Error('UADOverride: bad fullVersionList.version');
      return { brand, version };
    });
  }
  try {
    const nav = navigator;
    const proto = Object.getPrototypeOf(nav) || (typeof Navigator !== 'undefined' && Navigator && Navigator.prototype);
    if (!proto) return;

    const dUA = Object.getOwnPropertyDescriptor(proto, 'userAgent');
    const origUAGet = dUA && dUA.get;
    if (dUA && dUA.configurable === true && typeof origUAGet === 'function') {
      if (typeof g.__USER_AGENT === 'string' && g.__USER_AGENT) {
        const getUA = function(){ return g.__USER_AGENT; };
        Object.defineProperty(proto, 'userAgent', {
          get: getUA,
          set: dUA.set,
          configurable: true,
          enumerable: !!dUA.enumerable
        });
      }
    }

    const dUAD = Object.getOwnPropertyDescriptor(proto, 'userAgentData');
    const origUADGet = dUAD && dUAD.get;
    if (!dUAD || dUAD.configurable !== true || typeof origUADGet !== 'function') {
      return; // safe: cannot redefine
    }

    const getUAD = function(){
      // Safe fallback: if contract is missing/invalid, keep native surface.
      const H = g.__EXPECTED_CLIENT_HINTS;
      if (!isObj(H)) return origUADGet.call(this);
      try {
        const brands = mustBrands(H);
        const mobile = !!H.mobile;
        const platform = mustStr(H, 'platform', false);
        const he = {
          architecture: mustStr(H, 'architecture', false),
          bitness: mustStr(H, 'bitness', false),
          model: mustStr(H, 'model', true),
          platformVersion: mustStr(H, 'platformVersion', false),
          uaFullVersion: mustStr(H, 'uaFullVersion', false),
          fullVersionList: mustFullVersionList(H),
          wow64: (typeof H.wow64 === 'boolean') ? H.wow64 : false,
          formFactors: Array.isArray(H.formFactors) ? H.formFactors.slice(0) : ['Desktop'],
        };

        // NOTE: This is still a plain object (not NavigatorUAData instance).
        // Draft goal is to prevent broken values + keep atomic fallback.
        const uad = {
          brands: brands.map(x => ({ brand: x.brand, version: String(x.version) })),
          mobile: mobile,
          platform: platform,
          getHighEntropyValues: async function(keys){
            if (!Array.isArray(keys)) throw new TypeError('UADOverride: bad keys');
            const out = {};
            for (let i = 0; i < keys.length; i++) {
              const k = keys[i];
              if (typeof k !== 'string' || !k) throw new TypeError('UADOverride: bad keys');
              if (k in he) out[k] = he[k];
            }
            return out;
          },
          toJSON: function(){ return { brands: this.brands, mobile: this.mobile, platform: this.platform }; }
        };

        return uad;
      } catch (e) {
        degrade('uad_override:contract_invalid', e, { prop: 'userAgentData' });
        return origUADGet.call(this);
      }
    };

    Object.defineProperty(proto, 'userAgentData', {
      get: getUAD,
      set: dUAD.set,
      configurable: true,
      enumerable: !!dUAD.enumerable
    });
  } catch(e) {
    degrade('uad_override:exception', e, null);
  }
})();
