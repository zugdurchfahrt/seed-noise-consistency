const WebGPUPatchModule = function WebGPUPatchModule(window) {
  if (window.__PATCH_WEBGPU__) return;

  const C = window.CanvasPatchContext;
  if (!C) {
    try { if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__('webgpu:canvas_patch_context_missing', new Error('[CanvasPatch] CanvasPatchContext is undefined - module registration is not available'), { stage: 'preflight' }); } catch (_) {}
    return;
  }

  const Core = window && window.Core;
  if (!Core || typeof Core.applyTargets !== 'function') {
    try { if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__('webgpu:core_missing', new Error('[WebGPUPatchModule] Core.applyTargets is required'), { stage: 'preflight' }); } catch (_) {}
    return;
  }

  function degrade(code, err, extra) {
    try {
      if (typeof window.__DEGRADE__ === 'function') window.__DEGRADE__(code, err, extra);
    } catch (_) {}
  }

  const markNative = (function resolveMarkNative() {
    const ensure = typeof window.__ensureMarkAsNative === 'function' ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      degrade('webgpu:mark_native_missing', new Error('[WebGPUPatchModule] markAsNative missing'), { stage: 'preflight' });
      return null;
    }
    return m;
  })();
  if (!markNative) return;

  window.__PATCH_WEBGPU__ = true;

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
      let plans = [];
      try {
        plans = Core.applyTargets(targets, window.__PROFILE__, []);
      } catch (e) {
        degrade(groupTag + ':preflight_failed', e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }

      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : 'group_skipped';
        const err = new Error('[WebGPU] target group skipped: ' + reason);
        degrade(groupTag + ':' + reason, err);
        if (groupPolicy === 'throw') throw err;
        return 0;
      }

      const applied = [];
      try {
        for (let i = 0; i < plans.length; i++) {
          const p = plans[i];
          if (!p || p.skipApply) continue;
          if (!p.owner || typeof p.key !== 'string' || !p.nextDesc) {
            throw new Error('[WebGPU] invalid plan item');
          }
          Object.defineProperty(p.owner, p.key, p.nextDesc);
          const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
          if (!isSameDescriptor(after, p.nextDesc)) {
            throw new Error('[WebGPU] descriptor post-check mismatch for ' + p.key);
          }
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
            degrade(groupTag + ':rollback_failed', re, { key: p.key || null });
          }
        }
        if (rollbackErr) {
          if (groupPolicy === 'throw') throw rollbackErr;
          return 0;
        }
        degrade(groupTag + ':apply_failed', e);
        if (groupPolicy === 'throw') throw e;
        return 0;
      }

      return applied.length;
    }

    function resolveDescriptorOnProtoChain(owner, key) {
      let cur = owner;
      while (cur) {
        const desc = Object.getOwnPropertyDescriptor(cur, key);
        if (desc) return { owner: cur, desc: desc };
        cur = Object.getPrototypeOf(cur);
      }
      return { owner: null, desc: null };
    }

    function receiverOnProtoChain(proto, self) {
      if (!proto || (typeof proto !== 'object' && typeof proto !== 'function')) return false;
      if (!self || (typeof self !== 'object' && typeof self !== 'function')) return false;
      const seen = new WeakSet();
      let cur = self;
      while (cur) {
        if (cur === proto) return true;
        if (seen.has(cur)) return false;
        seen.add(cur);
        try {
          cur = Object.getPrototypeOf(cur);
        } catch (_) {
          return false;
        }
      }
      return false;
    }

    function buildAdapterInfo(nativeInfo) {
      const info = nativeInfo && typeof nativeInfo === 'object' ? nativeInfo : {};
      return {
        vendor: (window.__GPU_VENDOR__ !== undefined ? window.__GPU_VENDOR__ : info.vendor),
        architecture: (window.__GPU_ARCHITECTURE__ !== undefined ? window.__GPU_ARCHITECTURE__ : info.architecture),
        device: (window.__WEBGPU_DEVICE__ !== undefined ? window.__WEBGPU_DEVICE__ : info.device),
        description: info.description,
        type: (window.__GPU_TYPE__ !== undefined ? window.__GPU_TYPE__ : info.type),
        isFallbackAdapter: info.isFallbackAdapter,
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

    const __WL_FEATURES__ = new Set(Array.isArray(window.__WEBGPU_FEATURES_WHITELIST__)
      ? window.__WEBGPU_FEATURES_WHITELIST__
      : []);

    const __WL_LIMITS__ = new Set(Array.isArray(window.__WEBGPU_LIMITS_WHITELIST__)
      ? window.__WEBGPU_LIMITS_WHITELIST__
      : []);

    const __MaskedLimitsCache__ = new WeakMap();
    function __maskLimits(nativeLimits) {
      if (!nativeLimits || typeof nativeLimits !== 'object' || __WL_LIMITS__.size === 0) return nativeLimits;
      if (__MaskedLimitsCache__.has(nativeLimits)) return __MaskedLimitsCache__.get(nativeLimits);

      const proxy = new Proxy(nativeLimits, {
        getPrototypeOf(target) {
          return Reflect.getPrototypeOf(target);
        },
        get(target, prop) {
          if (typeof prop === 'string' && !__WL_LIMITS__.has(prop)) return undefined;
          return Reflect.get(target, prop, target);
        },
        has(target, prop) {
          if (typeof prop === 'string') return __WL_LIMITS__.has(prop) && Reflect.has(target, prop);
          return Reflect.has(target, prop);
        }
      });

      __MaskedLimitsCache__.set(nativeLimits, proxy);
      return proxy;
    }

    const __MaskedFeaturesCache__ = new WeakMap();
    function __collectAllowedFeatures(nativeFeatures) {
      const allowed = new Set();
      for (const f of nativeFeatures) {
        if (__WL_FEATURES__.has(f)) allowed.add(f);
      }
      return allowed;
    }

    function __maskFeatures(nativeFeatures) {
      if (!nativeFeatures || typeof nativeFeatures !== 'object' || __WL_FEATURES__.size === 0) return nativeFeatures;
      if (__MaskedFeaturesCache__.has(nativeFeatures)) return __MaskedFeaturesCache__.get(nativeFeatures);

      const proxy = new Proxy(nativeFeatures, {
        getPrototypeOf(target) {
          return Reflect.getPrototypeOf(target);
        },
        get(target, prop) {
          if (prop === 'has') {
            const nativeHas = Reflect.get(target, 'has', target);
            if (typeof nativeHas !== 'function') {
              throw new TypeError('[WebGPU] GPUSupportedFeatures.has missing');
            }
            return markNative(function has(feature) {
              return __WL_FEATURES__.has(feature) && Reflect.apply(nativeHas, target, [feature]);
            }, 'has');
          }
          if (prop === 'forEach') {
            return markNative(function forEach(cb, thisArg) {
              const allowed = __collectAllowedFeatures(target);
              for (const v of allowed) cb.call(thisArg, v, v, target);
            }, 'forEach');
          }
          if (prop === Symbol.iterator || prop === 'values' || prop === 'keys') {
            const name = prop === 'keys' ? 'keys' : 'values';
            return markNative(function* iterator() {
              const allowed = __collectAllowedFeatures(target);
              for (const v of allowed) yield v;
            }, name);
          }
          if (prop === 'entries') {
            return markNative(function* entries() {
              const allowed = __collectAllowedFeatures(target);
              for (const v of allowed) yield [v, v];
            }, 'entries');
          }
          if (prop === 'size') {
            return __collectAllowedFeatures(target).size;
          }
          return Reflect.get(target, prop, target);
        },
        has(target, prop) {
          if (typeof prop === 'string') return __WL_FEATURES__.has(prop) && Reflect.has(target, prop);
          return Reflect.has(target, prop);
        }
      });

      __MaskedFeaturesCache__.set(nativeFeatures, proxy);
      return proxy;
    }

    const __adapterInfoPromiseCache__ = new WeakMap();
    const __adapterInfoValueCache__ = new WeakMap();
    const __adapterProtoPatched__ = new WeakSet();
    const __deviceProtoPatched__ = new WeakSet();
    const __adapterInfoGetterByOwner__ = new WeakMap();

    function readNativeAdapterInfo(adapter) {
      const resolved = resolveDescriptorOnProtoChain(adapter, 'info');
      const nativeInfoGet = resolved && resolved.owner ? __adapterInfoGetterByOwner__.get(resolved.owner) : null;
      if (typeof nativeInfoGet === 'function') {
        return Reflect.apply(nativeInfoGet, adapter, []);
      }
      return {};
    }

    function patchDevicePrototype(device) {
      const deviceProto = Object.getPrototypeOf(device);
      if (!deviceProto || __deviceProtoPatched__.has(deviceProto)) return;

      const validDeviceThis = function validDeviceThis(self) {
        return receiverOnProtoChain(deviceProto, self);
      };

      const deviceFeaturesDesc = resolveDescriptorOnProtoChain(device, 'features').desc;
      const deviceLimitsDesc = resolveDescriptorOnProtoChain(device, 'limits').desc;

      if (!deviceFeaturesDesc || typeof deviceFeaturesDesc.get !== 'function') {
        degrade('webgpu:device:features_getter_missing', new Error('[WebGPU] GPUDevice.features getter missing'), { stage: 'preflight' });
        return;
      }
      if (!deviceLimitsDesc || typeof deviceLimitsDesc.get !== 'function') {
        degrade('webgpu:device:limits_getter_missing', new Error('[WebGPU] GPUDevice.limits getter missing'), { stage: 'preflight' });
        return;
      }

      const targets = [
        {
          owner: device,
          key: 'features',
          kind: 'accessor',
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          policy: 'throw',
          diagTag: 'webgpu:device:features',
          validThis: validDeviceThis,
          invalidThis: 'throw',
          getImpl: function webgpuDeviceFeaturesGet(origGet) {
            const nativeFeatures = Reflect.apply(origGet, this, []);
            return __maskFeatures(nativeFeatures);
          }
        },
        {
          owner: device,
          key: 'limits',
          kind: 'accessor',
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          policy: 'throw',
          diagTag: 'webgpu:device:limits',
          validThis: validDeviceThis,
          invalidThis: 'throw',
          getImpl: function webgpuDeviceLimitsGet(origGet) {
            const nativeLimits = Reflect.apply(origGet, this, []);
            return __maskLimits(nativeLimits);
          }
        }
      ];

      const applied = applyCoreTargetsGroup('webgpu:device_proto', targets, 'skip');
      if (applied !== targets.length) {
        degrade('webgpu:device:apply_count_mismatch', new Error('[WebGPU] GPUDevice patch apply count mismatch'), { stage: 'apply' });
        return;
      }
      __deviceProtoPatched__.add(deviceProto);
    }

    function patchAdapterPrototype(adapter) {
      const adapterProto = Object.getPrototypeOf(adapter);
      if (!adapterProto || __adapterProtoPatched__.has(adapterProto)) return;

      const validAdapterThis = function validAdapterThis(self) {
        return receiverOnProtoChain(adapterProto, self);
      };

      const requestDeviceResolved = resolveDescriptorOnProtoChain(adapter, 'requestDevice');
      if (!requestDeviceResolved.desc || typeof requestDeviceResolved.desc.value !== 'function') {
        degrade('webgpu:adapter:requestDevice_missing', new Error('[WebGPU] adapter.requestDevice missing'), { stage: 'preflight' });
        return;
      }

      const infoResolved = resolveDescriptorOnProtoChain(adapter, 'info');
      if (infoResolved.desc && typeof infoResolved.desc.get === 'function' && infoResolved.owner) {
        __adapterInfoGetterByOwner__.set(infoResolved.owner, infoResolved.desc.get);
      }

      const targets = [
        {
          owner: adapter,
          key: 'requestDevice',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: 'webgpu:adapter:requestDevice',
          validThis: validAdapterThis,
          invalidThis: 'throw',
          invoke: function webgpuRequestDeviceInvoke(orig, args) {
            const input = Array.isArray(args) ? args : [];
            const first = input.length ? input[0] : undefined;
            const opts = (first && typeof first === 'object') ? Object.assign({}, first) : {};
            const req = new Set(Array.isArray(opts.requiredFeatures) ? opts.requiredFeatures : []);
            const autoEnable = Array.isArray(window.__WEBGPU_FEATURES_WHITELIST__) ? window.__WEBGPU_FEATURES_WHITELIST__ : [];

            const thisFeatures = this.features;
            const thisHas = thisFeatures && Reflect.get(thisFeatures, 'has', thisFeatures);
            if (typeof thisHas === 'function') {
              for (const f of autoEnable) {
                if (Reflect.apply(thisHas, thisFeatures, [f])) req.add(f);
              }
            }

            if (req.size > 0) opts.requiredFeatures = Array.from(req);
            const nextArgs = input.slice();
            nextArgs[0] = opts;

            const out = Reflect.apply(orig, this, nextArgs);
            return out.then(function onDevice(device) {
              if (!device) return null;
              patchDevicePrototype(device);
              return device;
            }, function onDeviceReject(err) {
              degrade('webgpu:adapter:requestDevice:rejected', err);
              throw err;
            });
          }
        }
      ];

      const requestAdapterInfoResolved = resolveDescriptorOnProtoChain(adapter, 'requestAdapterInfo');
      if (requestAdapterInfoResolved.desc && typeof requestAdapterInfoResolved.desc.value === 'function') {
        targets.push({
          owner: adapter,
          key: 'requestAdapterInfo',
          kind: 'promise_method',
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          invokeClass: 'brand_strict',
          policy: 'throw',
          diagTag: 'webgpu:adapter:requestAdapterInfo',
          validThis: validAdapterThis,
          invalidThis: 'throw',
          invoke: function webgpuRequestAdapterInfoInvoke(orig, args) {
            if (__adapterInfoPromiseCache__.has(this)) {
              return __adapterInfoPromiseCache__.get(this);
            }
            const input = Array.isArray(args) ? args : [];
            const promise = Reflect.apply(orig, this, input).then((nativeInfo) => {
              const built = buildAdapterInfo(nativeInfo);
              __adapterInfoValueCache__.set(this, built);
              return built;
            }, (err) => {
              degrade('webgpu:adapter:requestAdapterInfo:rejected', err);
              const built = buildAdapterInfo(readNativeAdapterInfo(this));
              __adapterInfoValueCache__.set(this, built);
              return built;
            });
            __adapterInfoPromiseCache__.set(this, promise);
            return promise;
          }
        });
      }

      if (infoResolved.desc && (typeof infoResolved.desc.get === 'function' || typeof infoResolved.desc.set === 'function')) {
        targets.push({
          owner: adapter,
          key: 'info',
          kind: 'accessor',
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          policy: 'throw',
          diagTag: 'webgpu:adapter:info',
          validThis: validAdapterThis,
          invalidThis: 'throw',
          getImpl: function webgpuAdapterInfoGet(origGet) {
            if (__adapterInfoValueCache__.has(this)) {
              return __adapterInfoValueCache__.get(this);
            }
            const nativeInfo = (typeof origGet === 'function') ? Reflect.apply(origGet, this, []) : {};
            const built = buildAdapterInfo(nativeInfo);
            __adapterInfoValueCache__.set(this, built);
            return built;
          }
        });
      }

      const adapterFeaturesDesc = resolveDescriptorOnProtoChain(adapter, 'features').desc;
      if (adapterFeaturesDesc && typeof adapterFeaturesDesc.get === 'function') {
        targets.push({
          owner: adapter,
          key: 'features',
          kind: 'accessor',
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          policy: 'throw',
          diagTag: 'webgpu:adapter:features',
          validThis: validAdapterThis,
          invalidThis: 'throw',
          getImpl: function webgpuAdapterFeaturesGet(origGet) {
            const nativeFeatures = Reflect.apply(origGet, this, []);
            return __maskFeatures(nativeFeatures);
          }
        });
      }

      const adapterLimitsDesc = resolveDescriptorOnProtoChain(adapter, 'limits').desc;
      if (adapterLimitsDesc && typeof adapterLimitsDesc.get === 'function') {
        targets.push({
          owner: adapter,
          key: 'limits',
          kind: 'accessor',
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          policy: 'throw',
          diagTag: 'webgpu:adapter:limits',
          validThis: validAdapterThis,
          invalidThis: 'throw',
          getImpl: function webgpuAdapterLimitsGet(origGet) {
            const nativeLimits = Reflect.apply(origGet, this, []);
            return __maskLimits(nativeLimits);
          }
        });
      }

      const applied = applyCoreTargetsGroup('webgpu:adapter_proto', targets, 'skip');
      if (applied !== targets.length) {
        degrade('webgpu:adapter:apply_count_mismatch', new Error('[WebGPU] GPUAdapter patch apply count mismatch'), { stage: 'apply' });
        return;
      }
      __adapterProtoPatched__.add(adapterProto);
    }

    const nav = window.navigator;
    const gpu = nav && nav.gpu;
    if (!gpu || typeof gpu.requestAdapter !== 'function') return;

    const requestAdapterTargets = [{
      owner: gpu,
      key: 'requestAdapter',
      kind: 'promise_method',
      wrapLayer: 'core_wrapper',
      resolve: 'proto_chain',
      invokeClass: 'brand_strict',
      policy: 'throw',
      diagTag: 'webgpu:navigator:requestAdapter',
      validThis: function validGPUThis(self) {
        return self === gpu;
      },
      invalidThis: 'throw',
      invoke: function webgpuRequestAdapterInvoke(orig, args) {
        const input = Array.isArray(args) ? args : [];
        const out = Reflect.apply(orig, this, input);
        return out.then(function onAdapter(adapter) {
          if (!adapter) return null;
          patchAdapterPrototype(adapter);
          return adapter;
        }, function onAdapterReject(err) {
          degrade('webgpu:navigator:requestAdapter:rejected', err);
          throw err;
        });
      }
    }];

    const applied = applyCoreTargetsGroup('webgpu:navigator_gpu', requestAdapterTargets, 'skip');
    if (applied !== requestAdapterTargets.length) {
      degrade('webgpu:navigator:requestAdapter_apply_failed', new Error('[WebGPU] navigator.gpu.requestAdapter patch failed'), { stage: 'apply' });
      return;
    }
};
