const WebGPUPatchModule = function WebGPUPatchModule(window) {
  const __module = 'webgpu';
  const __surface = 'webgpu';
  const __tag = 'webgpu';
  const __flagKey = '__PATCH_WEBGPU__';
  const __webgpuTypePipeline = 'pipeline missing data';
  const __webgpuTypeBrowser = 'browser structure missing data';
  const __webgpuDegrade = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  const __webgpuDegradeDiag = (__webgpuDegrade && typeof __webgpuDegrade.diag === 'function')
    ? __webgpuDegrade.diag.bind(__webgpuDegrade)
    : null;

  function emitDegrade(level, code, ctx, err) {
    const d = __webgpuDegrade;
    if (!__webgpuDegradeDiag && typeof d !== 'function') return;

    if (__webgpuDegradeDiag) {
      try { __webgpuDegradeDiag(level, code, ctx, err || null); } catch (diagErr) { return undefined; }
      return;
    }

    try {
      d(code, err || null, {
        level: level,
        module: ctx.module,
        diagTag: ctx.diagTag,
        surface: ctx.surface,
        key: ctx.key,
        stage: ctx.stage,
        message: ctx.message,
        data: ctx.data,
        type: ctx.type
      });
    } catch (emitErr) {
      return undefined;
    }
  }

  function degrade(level, code, err, extra) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    emitDegrade(level, code, {
      module: __module,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __tag,
      surface: __surface,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage,
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type
    }, err || null);
  }

  const __core = window && window.Core;
  let __guardToken = null;
  if (!__core || typeof __core.guardFlag !== 'function') {
    degrade('warn', __tag + ':guard_missing', null, {
      stage: 'guard',
      type: __webgpuTypePipeline,
      key: __flagKey,
      message: 'Core.guardFlag missing',
      data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
    });
    return;
  }
  try {
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    degrade('warn', __tag + ':guard_failed', e, {
      stage: 'guard',
      type: __webgpuTypePipeline,
      key: __flagKey,
      message: 'guardFlag threw',
      data: { outcome: 'skip', reason: 'guard_failed' }
    });
    return;
  }
  if (!__guardToken) return;

  function releaseEntryGuard(rollbackOk) {
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, !!rollbackOk, __tag);
      }
    } catch (e) {
      degrade('warn', __tag + ':guard_release_exception', e, {
        stage: 'rollback',
        type: __webgpuTypePipeline,
        key: __flagKey,
        message: 'releaseGuardFlag failed',
        data: { outcome: 'skip', reason: 'guard_release_exception' }
      });
    }
  }

  const C = window.CanvasPatchContext;
  if (!C) {
    degrade('fatal', 'webgpu:canvas_patch_context_missing', new Error('[CanvasPatch] CanvasPatchContext is undefined - module registration is not available'), {
      stage: 'preflight',
      type: __webgpuTypePipeline,
      key: 'CanvasPatchContext',
      message: 'CanvasPatchContext is undefined',
      data: { outcome: 'skip', reason: 'missing_canvas_patch_context' }
    });
    releaseEntryGuard(true);
    return;
  }

  const Core = __core;
  if (!Core || typeof Core.applyTargets !== 'function') {
    degrade('fatal', 'webgpu:core_missing', new Error('[WebGPUPatchModule] Core.applyTargets is required'), {
      stage: 'preflight',
      type: __webgpuTypePipeline,
      key: 'Core.applyTargets',
      message: 'Core.applyTargets is required',
      data: { outcome: 'skip', reason: 'missing_dep_core_applyTargets' }
    });
    releaseEntryGuard(true);
    return;
  }
  const markNative = (function resolveMarkNative() {
    const ensure = typeof window.__ensureMarkAsNative === 'function' ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      degrade('fatal', 'webgpu:mark_native_missing', new Error('[WebGPUPatchModule] markAsNative missing'), {
        stage: 'preflight',
        type: __webgpuTypePipeline,
        key: 'markAsNative',
        message: 'markAsNative missing',
        data: { outcome: 'skip', reason: 'missing_dep_markAsNative' }
      });
      return null;
    }
    return m;
  })();
  if (!markNative) {
    releaseEntryGuard(true);
    return;
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
      let plans = [];
      try {
        plans = Core.applyTargets(targets, window.__PROFILE__, []);
      } catch (e) {
        e.__rollbackOk = true;
        degrade('error', groupTag + ':preflight_failed', e, {
          stage: 'preflight',
          type: __webgpuTypePipeline,
          diagTag: groupTag,
          key: null,
          message: 'Core.applyTargets preflight failed',
          data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'preflight_failed' }
        });
        if (groupPolicy === 'throw') throw e;
        return 0;
      }

      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : 'group_skipped';
        const err = new Error('[WebGPU] target group skipped: ' + reason);
        err.__rollbackOk = true;
        degrade('warn', groupTag + ':' + reason, err, {
          stage: 'preflight',
          type: __webgpuTypeBrowser,
          diagTag: groupTag,
          key: null,
          message: 'target group skipped',
          data: { outcome: 'skip', reason: reason }
        });
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
            degrade('error', groupTag + ':rollback_failed', re, {
              stage: 'rollback',
              type: __webgpuTypePipeline,
              diagTag: groupTag,
              key: p.key || null,
              message: 'rollback failed',
              data: { outcome: 'rollback', reason: 'rollback_failed' }
            });
          }
        }
        if (rollbackErr) {
          rollbackErr.__rollbackOk = false;
          if (groupPolicy === 'throw') throw rollbackErr;
          return 0;
        }
        e.__rollbackOk = true;
        degrade('error', groupTag + ':apply_failed', e, {
          stage: 'apply',
          type: __webgpuTypePipeline,
          diagTag: groupTag,
          key: null,
          message: 'apply failed',
          data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'apply_failed' }
        });
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
        } catch (e) {
          degrade('warn', 'webgpu:proto_chain:getPrototypeOf_failed', e, {
            stage: 'guard',
            type: __webgpuTypePipeline,
            diagTag: 'webgpu',
            key: 'Object.getPrototypeOf',
            message: 'Object.getPrototypeOf failed',
            data: { outcome: 'skip', reason: 'getPrototypeOf_failed' }
          });
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
        get(target, prop, receiver) {
          if (receiver !== proxy && receiver !== target) {
            return Reflect.get(target, prop, receiver);
          }
          if (typeof prop === 'string'
              && Object.prototype.hasOwnProperty.call(target, prop)
              && !__WL_LIMITS__.has(prop)) {
            const desc = Reflect.getOwnPropertyDescriptor(target, prop);
            if (!Reflect.isExtensible(target) || (desc && desc.configurable === false)) {
              return Reflect.get(target, prop, target);
            }
            return undefined;
          }
          return Reflect.get(target, prop, target);
        },
        has(target, prop) {
          if (!Reflect.has(target, prop)) return false;
          if (typeof prop === 'string'
              && Object.prototype.hasOwnProperty.call(target, prop)
              && !__WL_LIMITS__.has(prop)) {
            const desc = Reflect.getOwnPropertyDescriptor(target, prop);
            if (!Reflect.isExtensible(target) || (desc && desc.configurable === false)) return true;
            return false;
          }
          return Reflect.has(target, prop);
        },
        getOwnPropertyDescriptor(target, prop) {
          const desc = Reflect.getOwnPropertyDescriptor(target, prop);
          if (!desc) return desc;
          if (typeof prop === 'string'
              && Object.prototype.hasOwnProperty.call(target, prop)
              && !__WL_LIMITS__.has(prop)
              && desc.configurable !== false
              && Reflect.isExtensible(target)) {
            return undefined;
          }
          return desc;
        },
        ownKeys(target) {
          const keys = Reflect.ownKeys(target);
          if (!Reflect.isExtensible(target)) return keys;
          const out = [];
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (typeof k === 'string' && !__WL_LIMITS__.has(k)) {
              const desc = Reflect.getOwnPropertyDescriptor(target, k);
              if (desc && desc.configurable === false) out.push(k);
              continue;
            }
            out.push(k);
          }
          return out;
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
      const methodCache = Object.create(null);

      const proxy = new Proxy(nativeFeatures, {
        getPrototypeOf(target) {
          return Reflect.getPrototypeOf(target);
        },
        get(target, prop, receiver) {
          if (receiver !== proxy && receiver !== target) {
            return Reflect.get(target, prop, receiver);
          }
          if (prop === 'has') {
            if (!methodCache.has) {
              const nativeHas = Reflect.get(target, 'has', target);
              if (typeof nativeHas !== 'function') {
                degrade('warn', 'webgpu:features:has_missing', new Error('[WebGPU] GPUSupportedFeatures.has missing'), {
                  stage: 'contract',
                  type: __webgpuTypeBrowser,
                  diagTag: 'webgpu',
                  key: 'GPUSupportedFeatures.has',
                  message: 'GPUSupportedFeatures.has missing',
                  data: { outcome: 'skip', reason: 'missing_features_has' }
                });
                return nativeHas;
              }
              methodCache.has = markNative(function has(feature) {
                try {
                  if (this !== proxy && this !== target) return Reflect.apply(nativeHas, this, [feature]);
                  return __WL_FEATURES__.has(feature) && Reflect.apply(nativeHas, target, [feature]);
                } catch (e) {
                  degrade('warn', 'webgpu:features:has_native_throw', e, {
                    stage: 'runtime',
                    type: __webgpuTypeBrowser,
                    diagTag: 'webgpu',
                    key: 'GPUSupportedFeatures.has',
                    message: 'GPUSupportedFeatures.has threw',
                    data: { outcome: 'throw', reason: 'native_throw' }
                  });
                  throw e;
                }
              }, 'has');
            }
            return methodCache.has;
          }
          if (prop === 'forEach') {
            if (!methodCache.forEach) {
              const nativeForEach = Reflect.get(target, 'forEach', target);
              methodCache.forEach = markNative(function forEach(cb, thisArg) {
                if (this !== proxy && this !== target) {
                  if (typeof nativeForEach === 'function') {
                    try {
                      return Reflect.apply(nativeForEach, this, [cb, thisArg]);
                    } catch (e) {
                      degrade('warn', 'webgpu:features:forEach_native_throw', e, {
                        stage: 'runtime',
                        type: __webgpuTypeBrowser,
                        diagTag: 'webgpu',
                        key: 'GPUSupportedFeatures.forEach',
                        message: 'GPUSupportedFeatures.forEach threw',
                        data: { outcome: 'throw', reason: 'native_throw' }
                      });
                      throw e;
                    }
                  }
                }
                const allowed = __collectAllowedFeatures(target);
                for (const v of allowed) cb.call(thisArg, v, v, proxy);
              }, 'forEach');
            }
            return methodCache.forEach;
          }
          if (prop === Symbol.iterator || prop === 'values' || prop === 'keys') {
            const key = (prop === 'keys') ? 'keys' : ((prop === 'values') ? 'values' : 'iterator');
            if (!methodCache[key]) {
              const name = prop === 'keys' ? 'keys' : 'values';
              const nativeIter = Reflect.get(target, prop, target);
              methodCache[key] = markNative(function* iterator() {
                if (this !== proxy && this !== target) {
                  if (typeof nativeIter === 'function') {
                    try {
                      return yield* Reflect.apply(nativeIter, this, []);
                    } catch (e) {
                      degrade('warn', 'webgpu:features:' + String(name) + '_native_throw', e, {
                        stage: 'runtime',
                        type: __webgpuTypeBrowser,
                        diagTag: 'webgpu',
                        key: 'GPUSupportedFeatures.' + String(name),
                        message: 'GPUSupportedFeatures.' + String(name) + ' threw',
                        data: { outcome: 'throw', reason: 'native_throw' }
                      });
                      throw e;
                    }
                  }
                }
                const allowed = __collectAllowedFeatures(target);
                for (const v of allowed) yield v;
              }, name);
            }
            return methodCache[key];
          }
          if (prop === 'entries') {
            if (!methodCache.entries) {
              const nativeEntries = Reflect.get(target, 'entries', target);
              methodCache.entries = markNative(function* entries() {
                if (this !== proxy && this !== target) {
                  if (typeof nativeEntries === 'function') {
                    try {
                      return yield* Reflect.apply(nativeEntries, this, []);
                    } catch (e) {
                      degrade('warn', 'webgpu:features:entries_native_throw', e, {
                        stage: 'runtime',
                        type: __webgpuTypeBrowser,
                        diagTag: 'webgpu',
                        key: 'GPUSupportedFeatures.entries',
                        message: 'GPUSupportedFeatures.entries threw',
                        data: { outcome: 'throw', reason: 'native_throw' }
                      });
                      throw e;
                    }
                  }
                }
                const allowed = __collectAllowedFeatures(target);
                for (const v of allowed) yield [v, v];
              }, 'entries');
            }
            return methodCache.entries;
          }
          if (prop === 'size') {
            return __collectAllowedFeatures(target).size;
          }
          return Reflect.get(target, prop, target);
        },
        has(target, prop) {
          if (!Reflect.has(target, prop)) return false;
          if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(target, prop)) {
            if (!Reflect.isExtensible(target)) return true;
            return __WL_FEATURES__.has(prop);
          }
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
        try {
          return Reflect.apply(nativeInfoGet, adapter, []);
        } catch (e) {
          degrade('warn', 'webgpu:adapter:info_native_throw', e, {
            stage: 'runtime',
            type: __webgpuTypeBrowser,
            diagTag: 'webgpu',
            key: 'GPUAdapter.info',
            message: 'GPUAdapter.info getter threw',
            data: { outcome: 'throw', reason: 'native_throw' }
          });
          throw e;
        }
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
        degrade('error', 'webgpu:device:features_getter_missing', new Error('[WebGPU] GPUDevice.features getter missing'), {
          stage: 'preflight',
          type: __webgpuTypeBrowser,
          diagTag: 'webgpu',
          key: 'GPUDevice.features',
          message: 'GPUDevice.features getter missing',
          data: { outcome: 'skip', reason: 'missing_device_features_getter' }
        });
        return;
      }
      if (!deviceLimitsDesc || typeof deviceLimitsDesc.get !== 'function') {
        degrade('error', 'webgpu:device:limits_getter_missing', new Error('[WebGPU] GPUDevice.limits getter missing'), {
          stage: 'preflight',
          type: __webgpuTypeBrowser,
          diagTag: 'webgpu',
          key: 'GPUDevice.limits',
          message: 'GPUDevice.limits getter missing',
          data: { outcome: 'skip', reason: 'missing_device_limits_getter' }
        });
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
            let nativeFeatures;
            try {
              nativeFeatures = Reflect.apply(origGet, this, []);
            } catch (e) {
              degrade('warn', 'webgpu:device:features_native_throw', e, {
                stage: 'runtime',
                type: __webgpuTypeBrowser,
                diagTag: 'webgpu',
                key: 'GPUDevice.features',
                message: 'GPUDevice.features getter threw',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
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
            let nativeLimits;
            try {
              nativeLimits = Reflect.apply(origGet, this, []);
            } catch (e) {
              degrade('warn', 'webgpu:device:limits_native_throw', e, {
                stage: 'runtime',
                type: __webgpuTypeBrowser,
                diagTag: 'webgpu',
                key: 'GPUDevice.limits',
                message: 'GPUDevice.limits getter threw',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            return __maskLimits(nativeLimits);
          }
        }
      ];

      let applied = 0;
      try {
        applied = applyCoreTargetsGroup('webgpu:device_proto', targets, 'throw');
      } catch (e) {
        degrade('error', 'webgpu:device:apply_failed', e, {
          stage: 'apply',
          type: __webgpuTypePipeline,
          diagTag: 'webgpu',
          key: 'GPUDevice',
          message: 'GPUDevice patch failed',
          data: { outcome: 'skip', reason: 'apply_failed', rollbackOk: e && e.__rollbackOk !== false }
        });
        return;
      }
      if (applied !== targets.length) {
        degrade('error', 'webgpu:device:apply_count_mismatch', new Error('[WebGPU] GPUDevice patch apply count mismatch'), {
          stage: 'apply',
          type: __webgpuTypePipeline,
          diagTag: 'webgpu',
          key: 'GPUDevice',
          message: 'GPUDevice patch apply count mismatch',
          data: { outcome: 'skip', reason: 'apply_count_mismatch' }
        });
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
        degrade('error', 'webgpu:adapter:requestDevice_missing', new Error('[WebGPU] adapter.requestDevice missing'), {
          stage: 'preflight',
          type: __webgpuTypeBrowser,
          diagTag: 'webgpu',
          key: 'GPUAdapter.requestDevice',
          message: 'adapter.requestDevice missing',
          data: { outcome: 'skip', reason: 'missing_adapter_requestDevice' }
        });
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

            let out;
            try {
              out = Reflect.apply(orig, this, nextArgs);
            } catch (e) {
              degrade('warn', 'webgpu:adapter:requestDevice:native_throw', e, {
                stage: 'runtime',
                type: __webgpuTypeBrowser,
                diagTag: 'webgpu',
                key: 'GPUAdapter.requestDevice',
                message: 'GPUAdapter.requestDevice threw',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            return out.then(function onDevice(device) {
              if (!device) return null;
              patchDevicePrototype(device);
              return device;
            }, function onDeviceReject(err) {
              degrade('warn', 'webgpu:adapter:requestDevice:rejected', err, {
                stage: 'runtime',
                type: 'runtime rejection',
                diagTag: 'webgpu',
                key: 'GPUAdapter.requestDevice',
                message: 'GPUAdapter.requestDevice rejected',
                data: { outcome: 'throw', reason: 'runtime_rejection' }
              });
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
            let pending;
            try {
              pending = Reflect.apply(orig, this, input);
            } catch (e) {
              degrade('warn', 'webgpu:adapter:requestAdapterInfo:native_throw', e, {
                stage: 'runtime',
                type: __webgpuTypeBrowser,
                diagTag: 'webgpu',
                key: 'GPUAdapter.requestAdapterInfo',
                message: 'GPUAdapter.requestAdapterInfo threw',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            const promise = pending.then((nativeInfo) => {
              const built = buildAdapterInfo(nativeInfo);
              __adapterInfoValueCache__.set(this, built);
              return built;
            }, (err) => {
              degrade('warn', 'webgpu:adapter:requestAdapterInfo:rejected', err, {
                stage: 'runtime',
                type: 'runtime rejection',
                diagTag: 'webgpu',
                key: 'GPUAdapter.requestAdapterInfo',
                message: 'GPUAdapter.requestAdapterInfo rejected',
                data: { outcome: 'throw', reason: 'runtime_rejection' }
              });
              throw err;
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
            let nativeInfo = {};
            if (typeof origGet === 'function') {
              try {
                nativeInfo = Reflect.apply(origGet, this, []);
              } catch (e) {
                degrade('warn', 'webgpu:adapter:info_native_throw', e, {
                  stage: 'runtime',
                  type: __webgpuTypeBrowser,
                  diagTag: 'webgpu',
                  key: 'GPUAdapter.info',
                  message: 'GPUAdapter.info getter threw',
                  data: { outcome: 'throw', reason: 'native_throw' }
                });
                throw e;
              }
            }
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
            let nativeFeatures;
            try {
              nativeFeatures = Reflect.apply(origGet, this, []);
            } catch (e) {
              degrade('warn', 'webgpu:adapter:features_native_throw', e, {
                stage: 'runtime',
                type: __webgpuTypeBrowser,
                diagTag: 'webgpu',
                key: 'GPUAdapter.features',
                message: 'GPUAdapter.features getter threw',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
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
            let nativeLimits;
            try {
              nativeLimits = Reflect.apply(origGet, this, []);
            } catch (e) {
              degrade('warn', 'webgpu:adapter:limits_native_throw', e, {
                stage: 'runtime',
                type: __webgpuTypeBrowser,
                diagTag: 'webgpu',
                key: 'GPUAdapter.limits',
                message: 'GPUAdapter.limits getter threw',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            return __maskLimits(nativeLimits);
          }
        });
      }

      let applied = 0;
      try {
        applied = applyCoreTargetsGroup('webgpu:adapter_proto', targets, 'throw');
      } catch (e) {
        degrade('error', 'webgpu:adapter:apply_failed', e, {
          stage: 'apply',
          type: __webgpuTypePipeline,
          diagTag: 'webgpu',
          key: 'GPUAdapter',
          message: 'GPUAdapter patch failed',
          data: { outcome: 'skip', reason: 'apply_failed', rollbackOk: e && e.__rollbackOk !== false }
        });
        return;
      }
      if (applied !== targets.length) {
        degrade('error', 'webgpu:adapter:apply_count_mismatch', new Error('[WebGPU] GPUAdapter patch apply count mismatch'), {
          stage: 'apply',
          type: __webgpuTypePipeline,
          diagTag: 'webgpu',
          key: 'GPUAdapter',
          message: 'GPUAdapter patch apply count mismatch',
          data: { outcome: 'skip', reason: 'apply_count_mismatch' }
        });
        return;
      }
      __adapterProtoPatched__.add(adapterProto);
    }

    const nav = window.navigator;
    const gpu = nav && nav.gpu;
    if (!gpu || typeof gpu.requestAdapter !== 'function') {
      degrade('warn', 'webgpu:navigator:requestAdapter_missing', null, {
        stage: 'preflight',
        type: __webgpuTypeBrowser,
        diagTag: 'webgpu',
        key: 'navigator.gpu.requestAdapter',
        message: 'navigator.gpu.requestAdapter missing',
        data: { outcome: 'skip', reason: 'missing_navigator_gpu_requestAdapter' }
      });
      releaseEntryGuard(true);
      return;
    }

    const requestAdapterTargets = [{
      owner: gpu,
      key: 'requestAdapter',
      kind: 'promise_method',
      wrapLayer: 'named_wrapper',
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
        let out;
        try {
          out = Reflect.apply(orig, this, input);
        } catch (e) {
          degrade('warn', 'webgpu:navigator:requestAdapter:native_throw', e, {
            stage: 'runtime',
            type: __webgpuTypeBrowser,
            diagTag: 'webgpu',
            key: 'navigator.gpu.requestAdapter',
            message: 'navigator.gpu.requestAdapter threw',
            data: { outcome: 'throw', reason: 'native_throw' }
          });
          throw e;
        }
        return out.then(function onAdapter(adapter) {
          if (!adapter) return null;
          patchAdapterPrototype(adapter);
          return adapter;
        }, function onAdapterReject(err) {
          degrade('warn', 'webgpu:navigator:requestAdapter:rejected', err, {
            stage: 'runtime',
            type: 'runtime rejection',
            diagTag: 'webgpu',
            key: 'navigator.gpu.requestAdapter',
            message: 'navigator.gpu.requestAdapter rejected',
            data: { outcome: 'throw', reason: 'runtime_rejection' }
          });
          throw err;
        });
      }
    }];

    let applied = 0;
    try {
      applied = applyCoreTargetsGroup('webgpu:navigator_gpu', requestAdapterTargets, 'throw');
    } catch (e) {
      const rollbackOk = !(e && e.__rollbackOk === false);
      degrade('error', 'webgpu:navigator:requestAdapter_apply_failed', e, {
        stage: 'apply',
        type: __webgpuTypePipeline,
        diagTag: 'webgpu',
        key: 'navigator.gpu.requestAdapter',
        message: 'navigator.gpu.requestAdapter patch failed',
        data: { outcome: 'skip', reason: 'apply_failed', rollbackOk: rollbackOk }
      });
      releaseEntryGuard(rollbackOk);
      return;
    }
    if (applied !== requestAdapterTargets.length) {
      degrade('error', 'webgpu:navigator:requestAdapter_apply_failed', new Error('[WebGPU] navigator.gpu.requestAdapter patch failed'), {
        stage: 'apply',
        type: __webgpuTypePipeline,
        diagTag: 'webgpu',
        key: 'navigator.gpu.requestAdapter',
        message: 'navigator.gpu.requestAdapter patch apply count mismatch',
        data: { outcome: 'skip', reason: 'apply_count_mismatch' }
      });
      releaseEntryGuard(true);
      return;
    }

    degrade('info', 'webgpu:ready', null, {
      stage: 'apply',
      type: 'ok',
      diagTag: 'webgpu',
      key: null,
      message: 'webgpu patch ready',
      data: { outcome: 'return' }
    });
};
