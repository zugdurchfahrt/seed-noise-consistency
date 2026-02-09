(function(){
  'use strict';
  const g = window;
  const Core = g && g.Core;
  if (!Core || typeof Core.applyTargets !== 'function') {
    throw new Error('[UADOverride] Core.applyTargets is required');
  }

  const D = (typeof g.__DEGRADE__ === 'function') ? g.__DEGRADE__ : null;
  function degrade(code, err, extra){
    try { if (D) D(code, err || null, extra || null); } catch(_e) {}
  }

  function cloneDesc(d){
    if (!d) return null;
    const out = {};
    if ('configurable' in d) out.configurable = d.configurable;
    if ('enumerable' in d) out.enumerable = d.enumerable;
    if ('writable' in d) out.writable = d.writable;
    if ('value' in d) out.value = d.value;
    if ('get' in d) out.get = d.get;
    if ('set' in d) out.set = d.set;
    return out;
  }

  function isSameDescriptor(actual, expected){
    if (!actual || !expected) return false;
    const keys = ['configurable', 'enumerable', 'writable', 'value', 'get', 'set'];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (Object.prototype.hasOwnProperty.call(expected, k) && actual[k] !== expected[k]) return false;
    }
    return true;
  }

  function applyTargetGroup(groupTag, targets, policy){
    const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
    let plans = [];
    try {
      plans = Core.applyTargets(targets, g.__PROFILE__, []);
    } catch (e) {
      degrade(groupTag + ':preflight_failed', e, null);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    if (!Array.isArray(plans) || !plans.length) {
      if (plans && plans.ok === false) {
        degrade(groupTag + ':group_skipped', new Error('[UADOverride] group skipped'), { reason: plans.reason || null });
      }
      return 0;
    }

    const done = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
          throw new Error('[UADOverride] invalid plan item');
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          throw new Error('[UADOverride] descriptor post-check mismatch');
        }
        done.push(p);
      }
      return done.length;
    } catch (e) {
      for (let i = done.length - 1; i >= 0; i--) {
        const p = done[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, cloneDesc(p.origDesc));
          else delete p.owner[p.key];
        } catch (_) {}
      }
      degrade(groupTag + ':apply_failed', e, null);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
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

  function sanitizeBrands(brands){
    return brands.map(function (x) { return { brand: x.brand, version: String(x.version) }; });
  }

  function sanitizeHighEntropyFromHints(hints, keys, base){
    const out = isObj(base) ? Object.assign({}, base) : {};
    const requested = Array.isArray(keys) ? keys : [];
    for (let i = 0; i < requested.length; i++) {
      const k = requested[i];
      if (typeof k !== 'string' || !k) throw new TypeError('UADOverride: bad keys');
      if (k === 'architecture' && typeof hints.architecture === 'string') out.architecture = hints.architecture;
      else if (k === 'bitness' && typeof hints.bitness === 'string') out.bitness = hints.bitness;
      else if (k === 'model' && typeof hints.model === 'string') out.model = hints.model;
      else if (k === 'platformVersion' && typeof hints.platformVersion === 'string') out.platformVersion = hints.platformVersion;
      else if (k === 'uaFullVersion' && typeof hints.uaFullVersion === 'string') out.uaFullVersion = hints.uaFullVersion;
      else if (k === 'fullVersionList' && Array.isArray(hints.fullVersionList)) out.fullVersionList = sanitizeBrands(hints.fullVersionList);
      else if (k === 'wow64' && typeof hints.wow64 === 'boolean') out.wow64 = hints.wow64;
      else if (k === 'formFactors' && Array.isArray(hints.formFactors)) out.formFactors = hints.formFactors.slice(0);
    }
    return out;
  }

  const patchedUADProtos = (typeof WeakSet === 'function') ? new WeakSet() : null;

  function patchUADPrototype(nativeUAD, hints){
    if (!isObj(nativeUAD)) return;
    const proto = Object.getPrototypeOf(nativeUAD);
    if (!isObj(proto)) return;
    if (patchedUADProtos && patchedUADProtos.has(proto)) return;

    function validUADThis(self){
      return !!self && proto.isPrototypeOf(self);
    }

    const targets = [
      {
        owner: proto,
        key: 'brands',
        kind: 'accessor',
        resolve: 'own',
        policy: 'skip',
        diagTag: 'uad_override:brands',
        validThis: validUADThis,
        invalidThis: 'native',
        getImpl: function getBrands(origGet){
          const base = Reflect.apply(origGet, this, []);
          if (!Array.isArray(hints.brands)) return base;
          return sanitizeBrands(hints.brands);
        }
      },
      {
        owner: proto,
        key: 'mobile',
        kind: 'accessor',
        resolve: 'own',
        policy: 'skip',
        diagTag: 'uad_override:mobile',
        validThis: validUADThis,
        invalidThis: 'native',
        getImpl: function getMobile(origGet){
          const base = Reflect.apply(origGet, this, []);
          if (typeof hints.mobile !== 'boolean') return base;
          return hints.mobile;
        }
      },
      {
        owner: proto,
        key: 'platform',
        kind: 'accessor',
        resolve: 'own',
        policy: 'skip',
        diagTag: 'uad_override:platform',
        validThis: validUADThis,
        invalidThis: 'native',
        getImpl: function getPlatform(origGet){
          const base = Reflect.apply(origGet, this, []);
          if (typeof hints.platform !== 'string' || !hints.platform) return base;
          return hints.platform;
        }
      },
      {
        owner: proto,
        key: 'getHighEntropyValues',
        kind: 'promise_method',
        invokeClass: 'brand_strict',
        resolve: 'own',
        policy: 'skip',
        diagTag: 'uad_override:getHighEntropyValues',
        validThis: validUADThis,
        invalidThis: 'native',
        invoke: function invokeGetHE(orig, args){
          const p = Reflect.apply(orig, this, args || []);
          if (!p || typeof p.then !== 'function') {
            throw new TypeError('UADOverride: getHighEntropyValues must return Promise');
          }
          const keys = args && args.length ? args[0] : [];
          return p.then(function(res){
            return sanitizeHighEntropyFromHints(hints, keys, res);
          });
        }
      }
    ];

    const applied = applyTargetGroup('uad_override:uad_proto', targets, 'skip');
    if (applied > 0 && patchedUADProtos) patchedUADProtos.add(proto);
  }

  try {
    const nav = navigator;
    const proto = Object.getPrototypeOf(nav) || (typeof Navigator !== 'undefined' && Navigator && Navigator.prototype);
    if (!proto) return;

    function validNavThis(self){
      return !!self && (self === nav || proto.isPrototypeOf(self));
    }

    const targets = [];
    if (typeof g.__USER_AGENT === 'string' && g.__USER_AGENT) {
      targets.push({
        owner: proto,
        key: 'userAgent',
        kind: 'accessor',
        resolve: 'own',
        policy: 'skip',
        diagTag: 'uad_override:userAgent',
        validThis: validNavThis,
        invalidThis: 'native',
        getImpl: function getUAImpl(origGet){
          if (!isObj(this)) return Reflect.apply(origGet, this, []);
          return g.__USER_AGENT;
        }
      });
    }

    targets.push({
      owner: proto,
      key: 'userAgentData',
      kind: 'accessor',
      resolve: 'own',
      policy: 'skip',
      diagTag: 'uad_override:userAgentData',
      validThis: validNavThis,
      invalidThis: 'native',
      getImpl: function getUADImpl(origGet){
        const nativeUAD = Reflect.apply(origGet, this, []);
        const H = g.__EXPECTED_CLIENT_HINTS;
        if (!isObj(H)) return nativeUAD;
        try {
          const hints = {
            brands: mustBrands(H),
            mobile: mustBool(H, 'mobile'),
            platform: mustStr(H, 'platform', false),
            architecture: mustStr(H, 'architecture', false),
            bitness: mustStr(H, 'bitness', false),
            model: mustStr(H, 'model', true),
            platformVersion: mustStr(H, 'platformVersion', false),
            uaFullVersion: mustStr(H, 'uaFullVersion', false),
            fullVersionList: mustFullVersionList(H),
            wow64: (typeof H.wow64 === 'boolean') ? H.wow64 : false,
            formFactors: Array.isArray(H.formFactors) ? H.formFactors.slice(0) : ['Desktop']
          };
          patchUADPrototype(nativeUAD, hints);
          return nativeUAD;
        } catch (e) {
          degrade('uad_override:contract_invalid', e, { prop: 'userAgentData' });
          return nativeUAD;
        }
      }
    });

    applyTargetGroup('uad_override:navigator', targets, 'skip');
  } catch(e) {
    degrade('uad_override:exception', e, null);
  }
})();
