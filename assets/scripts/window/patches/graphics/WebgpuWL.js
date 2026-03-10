// WebgpuWL.js
const WebgpuWLBootstrap = function WebgpuWLBootstrap(window) {
  const __module = 'webgpu_wl';
  const __surface = 'webgpu';
  const __flagKey = '__WEBGPU_WHITELIST__';
  const __core = window && window.Core;
  const __degrade = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  const __diag = (__degrade && typeof __degrade.diag === 'function') ? __degrade.diag.bind(__degrade) : null;

  function __emit(level, code, ctx, err) {
    try {
      if (__diag) return __diag(level, code, ctx, err || null);
      if (typeof __degrade === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        return __degrade(code, err || null, Object.assign({}, safeCtx, { level: level || 'info' }));
      }
    } catch (emitErr) {
      return undefined;
    }
    return undefined;
  }

  function __moduleDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    return __emit(level, code, {
      module: __module,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __module,
      surface: __surface,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage,
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type
    }, err || null);
  }

  let __guardToken = null;
  if (!__core || typeof __core.guardFlag !== 'function') {
    __moduleDiag('warn', __module + ':guard_missing', {
      stage: 'guard',
      key: __flagKey,
      message: 'Core.guardFlag missing',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
    }, null);
    return;
  }
  try {
    __guardToken = __core.guardFlag(__flagKey, __module);
  } catch (e) {
    __moduleDiag('warn', __module + ':guard_failed', {
      stage: 'guard',
      key: __flagKey,
      message: 'guardFlag threw',
      type: 'pipeline missing data',
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e);
    return;
  }
  if (!__guardToken) return;

  function __releaseGuard(rollbackOk) {
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, !!rollbackOk, __module);
      }
    } catch (e) {
      __moduleDiag('warn', __module + ':guard_release_exception', {
        stage: 'rollback',
        key: __flagKey,
        message: 'releaseGuardFlag failed',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'guard_release_exception' }
      }, e);
    }
  }

  function __captureDescriptorState(key) {
    return {
      key: key,
      exists: Object.prototype.hasOwnProperty.call(window, key),
      desc: Object.getOwnPropertyDescriptor(window, key) || null
    };
  }

  function __restoreDescriptorState(state) {
    try {
      if (state.exists && state.desc) {
        Object.defineProperty(window, state.key, state.desc);
      } else {
        delete window[state.key];
      }
      return true;
    } catch (e) {
      __moduleDiag('error', __module + ':rollback_failed', {
        stage: 'rollback',
        key: state.key,
        message: 'rollback failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'rollback_failed' }
      }, e);
      return false;
    }
  }

  function __hideOwnSurface(key) {
    try {
      if (!Object.prototype.hasOwnProperty.call(window, key)) return true;
      const d = Object.getOwnPropertyDescriptor(window, key);
      if (!d || d.enumerable === false) return true;
      if (d.configurable === false) {
        __moduleDiag('warn', __module + ':hide_surface_nonconfigurable', {
          stage: 'apply',
          key: key,
          message: 'hide surface skipped: non-configurable',
          type: 'browser structure missing data',
          data: { outcome: 'skip', reason: 'hide_surface_nonconfigurable' }
        }, null);
        return false;
      }
      if ('value' in d) {
        Object.defineProperty(window, key, {
          value: d.value,
          writable: !!d.writable,
          configurable: !!d.configurable,
          enumerable: false
        });
      } else {
        Object.defineProperty(window, key, {
          get: d.get,
          set: d.set,
          configurable: !!d.configurable,
          enumerable: false
        });
      }
      return true;
    } catch (e) {
      __moduleDiag('warn', __module + ':hide_surface_failed', {
        stage: 'apply',
        key: key,
        message: 'hide surface failed',
        type: 'browser structure missing data',
        data: { outcome: 'skip', reason: 'hide_surface_failed' }
      }, e);
      return false;
    }
  }

  function __setHiddenValue(key, value) {
    try {
      const own = Object.prototype.hasOwnProperty.call(window, key);
      const d = own ? (Object.getOwnPropertyDescriptor(window, key) || null) : null;
      if (d && d.configurable === false) {
        window[key] = value;
        return __hideOwnSurface(key);
      }
      Object.defineProperty(window, key, {
        value: value,
        writable: d ? !!d.writable : true,
        configurable: d ? !!d.configurable : true,
        enumerable: false
      });
      return true;
    } catch (e) {
      __moduleDiag('error', __module + ':define_hidden_failed', {
        stage: 'apply',
        key: key,
        message: 'define hidden value failed',
        type: 'browser structure missing data',
        data: { outcome: 'throw', reason: 'define_hidden_failed' }
      }, e);
      throw e;
    }
  }

  let __state = null;
  try {
    const C = window.CanvasPatchContext;
    if (!C) {
      const preflightErr = new Error('[WebGPUPatch] CanvasPatchContext is undefined - no further execution');
      __moduleDiag('error', __module + ':preflight_failed', {
        stage: 'preflight',
        key: 'CanvasPatchContext',
        message: 'CanvasPatchContext is undefined',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'missing_canvas_patch_context' }
      }, preflightErr);
      __releaseGuard(true);
      return;
    }

    __state = {
      features: __captureDescriptorState('__WEBGPU_FEATURES_WHITELIST__'),
      limits: __captureDescriptorState('__WEBGPU_LIMITS_WHITELIST__'),
      formats: __captureDescriptorState('__WEBGPU_FORMATS_WHITELIST__'),
      collect: {
        key: '__collectWebGPUSnapshot__',
        exists: Object.prototype.hasOwnProperty.call(window, '__collectWebGPUSnapshot__'),
        desc: Object.getOwnPropertyDescriptor(window, '__collectWebGPUSnapshot__') || null
      }
    };

    // === FEATURES WHITELIST (use YOR device specification list) ===
    const STABLE_FEATURES = [
      'depth-clip-control',
      'depth32float-stencil8',
      'texture-compression-bc',
      'texture-compression-etc2',
      'texture-compression-astc',
      'timestamp-query',
      'indirect-first-instance',
      'shader-f16',
      'rg11b10ufloat-renderable',
      'bgra8unorm-storage',
      'float32-filterable',
      'float32-blendable',
    ];
    const EXPERIMENTAL_FEATURES = [
      'clip-distances', 'dual-source-blending', 'subgroups', 'subgroups-f16',
      'texture-component-swizzle', 'texture-formats-tier1', 'texture-formats-tier2',
      'chromium-experimental-timestamp-query-inside-passes',
      'chromium-experimental-subgroups',
      'chromium-experimental-subgroup-uniform-control-flow',
      'chromium-experimental-multi-draw-indirect',
      'chromium-experimental-unorm16-texture-formats',
      'chromium-experimental-snorm16-texture-formats',
      'chromium-experimental-primitive-id'
    ];
    const __hasFeaturesWL = Object.prototype.hasOwnProperty.call(window, '__WEBGPU_FEATURES_WHITELIST__')
      && window.__WEBGPU_FEATURES_WHITELIST__ !== undefined;
    if (!__hasFeaturesWL) {
      __setHiddenValue('__WEBGPU_FEATURES_WHITELIST__', [
        ...STABLE_FEATURES,
        ...(window.__ALLOW_CHROMIUM_EXPERIMENTAL__ ? EXPERIMENTAL_FEATURES : [])
      ]);
    } else {
      __moduleDiag('info', __module + ':features_whitelist_already_set', {
        stage: 'apply',
        key: '__WEBGPU_FEATURES_WHITELIST__',
        message: 'features whitelist already set',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'already_set' }
      }, null);
    }
    __hideOwnSurface('__WEBGPU_FEATURES_WHITELIST__');

    // === LIMITS WHITELIST (use only YOR device specification) ===
    const __hasLimitsWL = Object.prototype.hasOwnProperty.call(window, '__WEBGPU_LIMITS_WHITELIST__')
      && window.__WEBGPU_LIMITS_WHITELIST__ !== undefined;
    if (!__hasLimitsWL) {
      __setHiddenValue('__WEBGPU_LIMITS_WHITELIST__', [
        'maxTextureDimension1D', 'maxTextureDimension2D', 'maxTextureDimension3D',
        'maxTextureArrayLayers', 'maxBindGroups', 'maxBindingsPerBindGroup',
        'maxDynamicUniformBuffersPerPipelineLayout', 'maxDynamicStorageBuffersPerPipelineLayout',
        'maxSampledTexturesPerShaderStage', 'maxSamplersPerShaderStage',
        'maxStorageBuffersPerShaderStage', 'maxStorageTexturesPerShaderStage',
        'maxUniformBuffersPerShaderStage', 'maxUniformBufferBindingSize',
        'maxStorageBufferBindingSize', 'minUniformBufferOffsetAlignment',
        'minStorageBufferOffsetAlignment', 'maxVertexBuffers', 'maxBufferSize',
        'maxVertexAttributes', 'maxVertexBufferArrayStride',
        'maxInterStageShaderVariables', 'maxColorAttachments',
        'maxColorAttachmentBytesPerSample', 'maxComputeWorkgroupStorageSize',
        'maxComputeInvocationsPerWorkgroup', 'maxComputeWorkgroupSizeX',
        'maxComputeWorkgroupSizeY', 'maxComputeWorkgroupSizeZ',
        'maxComputeWorkgroupsPerDimension'
      ]);
    } else {
      __moduleDiag('info', __module + ':limits_whitelist_already_set', {
        stage: 'apply',
        key: '__WEBGPU_LIMITS_WHITELIST__',
        message: 'limits whitelist already set',
        type: 'pipeline missing data',
        data: { outcome: 'skip', reason: 'already_set' }
      }, null);
    }
    __hideOwnSurface('__WEBGPU_LIMITS_WHITELIST__');

    // === TEXTURE FORMATS WHITELIST (as is, without guessing) ===
    if (!window.__WEBGPU_FORMATS_WHITELIST__) {
      __setHiddenValue('__WEBGPU_FORMATS_WHITELIST__', [
        'r8unorm', 'r8snorm', 'r8uint', 'r8sint',
        'rg8unorm', 'rg8snorm', 'rg8uint', 'rg8sint',
        'rgba8unorm', 'rgba8unorm-srgb', 'rgba8snorm', 'rgba8uint', 'rgba8sint',
        'bgra8unorm', 'bgra8unorm-srgb',
        'r16uint', 'r16sint', 'r16float',
        'rg16uint', 'rg16sint', 'rg16float',
        'rgba16uint', 'rgba16sint', 'rgba16float',
        'r32uint', 'r32sint', 'r32float',
        'rg32uint', 'rg32sint', 'rg32float',
        'rgba32uint', 'rgba32sint', 'rgba32float',
        'rgb10a2unorm', 'rgb10a2uint', 'rg11b10ufloat', 'rgb9e5ufloat',
        'depth16unorm', 'depth24plus', 'depth24plus-stencil8', 'depth32float', 'stencil8',
        'bc1-rgba-unorm', 'bc1-rgba-unorm-srgb', 'bc2-rgba-unorm', 'bc2-rgba-unorm-srgb',
        'bc3-rgba-unorm', 'bc3-rgba-unorm-srgb', 'bc4-r-unorm', 'bc4-r-snorm',
        'bc5-rg-unorm', 'bc5-rg-snorm', 'bc6h-rgb-ufloat', 'bc6h-rgb-float',
        'bc7-rgba-unorm', 'bc7-rgba-unorm-srgb',
        'etc2-rgb8unorm', 'etc2-rgb8unorm-srgb', 'etc2-rgb8a1unorm', 'etc2-rgb8a1unorm-srgb',
        'etc2-rgba8unorm', 'etc2-rgba8unorm-srgb', 'eac-r11unorm', 'eac-r11snorm',
        'eac-rg11unorm', 'eac-rg11snorm',
        'astc-4x4-unorm', 'astc-4x4-unorm-srgb', 'astc-5x4-unorm', 'astc-5x4-unorm-srgb',
        'astc-5x5-unorm', 'astc-5x5-unorm-srgb', 'astc-6x5-unorm', 'astc-6x5-unorm-srgb',
        'astc-6x6-unorm', 'astc-6x6-unorm-srgb', 'astc-8x5-unorm', 'astc-8x5-unorm-srgb',
        'astc-8x6-unorm', 'astc-8x6-unorm-srgb', 'astc-8x8-unorm', 'astc-8x8-unorm-srgb',
        'astc-10x5-unorm', 'astc-10x5-unorm-srgb', 'astc-10x6-unorm', 'astc-10x6-unorm-srgb',
        'astc-10x8-unorm', 'astc-10x8-unorm-srgb', 'astc-10x10-unorm', 'astc-10x10-unorm-srgb',
        'astc-12x10-unorm', 'astc-12x10-unorm-srgb', 'astc-12x12-unorm', 'astc-12x12-unorm-srgb'
      ]);
    }
    __hideOwnSurface('__WEBGPU_FORMATS_WHITELIST__');

    // === Snapshot helper ===
    if (!Object.prototype.hasOwnProperty.call(window, '__collectWebGPUSnapshot__')) {
      Object.defineProperty(window, '__collectWebGPUSnapshot__', {
        value: async function collectWebGPUSnapshot() {
          if (!('gpu' in navigator)) return { error: 'WebGPU not available' };
          const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
                        || await navigator.gpu.requestAdapter();
          if (!adapter) return { error: 'No adapter' };

          let adapterInfo = null;
          if (typeof adapter.requestAdapterInfo === 'function') {
            try {
              adapterInfo = await adapter.requestAdapterInfo();
            } catch (e) {
              __moduleDiag('warn', __module + ':requestAdapterInfo_failed', {
                stage: 'runtime',
                key: 'GPUAdapter.requestAdapterInfo',
                message: 'requestAdapterInfo failed',
                type: 'browser structure missing data',
                data: { outcome: 'return', reason: 'adapter_info_unavailable' }
              }, e);
            }
          } else {
            __moduleDiag('info', __module + ':requestAdapterInfo_missing', {
              stage: 'runtime',
              key: 'GPUAdapter.requestAdapterInfo',
              message: 'requestAdapterInfo is not available',
              type: 'browser structure missing data',
              data: { outcome: 'return', reason: 'missing_requestAdapterInfo' }
            }, null);
          }
          if (adapterInfo == null && ('info' in adapter)) {
            try {
              adapterInfo = adapter.info;
            } catch (e) {
              __moduleDiag('warn', __module + ':adapter_info_getter_failed', {
                stage: 'runtime',
                key: 'GPUAdapter.info',
                message: 'adapter.info getter failed',
                type: 'browser structure missing data',
                data: { outcome: 'return', reason: 'adapter_info_getter_failed' }
              }, e);
            }
          }

          const device = await adapter.requestDevice();

          const nativeFeatures = new Set([...adapter.features, ...device.features]);
          const features = (window.__WEBGPU_FEATURES_WHITELIST__ || [])
            .filter(function hasFeature(featureName) { return nativeFeatures.has(featureName); });

          const pickLimits = function pickLimits(limits) {
            const out = {};
            for (const key of (window.__WEBGPU_LIMITS_WHITELIST__ || [])) {
              if (key in limits) out[key] = limits[key];
            }
            return out;
          };
          const adapterLimits = pickLimits(adapter.limits || {});
          const deviceLimits = pickLimits(device.limits || {});

          const formats = (window.__WEBGPU_FORMATS_WHITELIST__ || []).slice();
          const preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

          const summary = {
            preferredCanvasFormat,
            isFallbackAdapter: adapter.isFallbackAdapter ?? null
          };

          return (window.__WEBGPU_SNAPSHOT__ = {
            adapterInfo: adapterInfo,
            features: features,
            formats: formats,
            adapterLimits: adapterLimits,
            deviceLimits: deviceLimits,
            summary: summary
          });
        },
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    __hideOwnSurface('__collectWebGPUSnapshot__');

    __moduleDiag('info', __module + ':ready', {
      stage: 'apply',
      key: null,
      message: 'WL ready & snapshot installed',
      type: 'ok',
      data: { outcome: 'return' }
    }, null);
  } catch (e) {
    let rollbackOk = true;
    if (__state) {
      rollbackOk = __restoreDescriptorState(__state.features) && rollbackOk;
      rollbackOk = __restoreDescriptorState(__state.limits) && rollbackOk;
      rollbackOk = __restoreDescriptorState(__state.formats) && rollbackOk;
      rollbackOk = __restoreDescriptorState(__state.collect) && rollbackOk;
    }

    __moduleDiag('error', __module + ':fatal', {
      stage: 'apply',
      key: null,
      message: 'fatal module error',
      type: 'browser structure missing data',
      data: { outcome: 'skip', reason: 'fatal', rollbackOk: !!rollbackOk }
    }, e);

    __releaseGuard(rollbackOk);
    return;
  }
};
