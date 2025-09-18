// WebgpuWL.js
function WebgpuWLBootstrap() {
  if (!window.__WEBGPU_WHITELIST__) {
  window.__WEBGPU_WHITELIST__ = true;

  const C = window.CanvasPatchContext;
    if (!C) throw new Error('[WebGPUPatch] CanvasPatchContext is undefined — no further execution');

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
    'clip-distances','dual-source-blending','subgroups','subgroups-f16',
    'texture-component-swizzle','texture-formats-tier1','texture-formats-tier2',
    'chromium-experimental-timestamp-query-inside-passes',
    'chromium-experimental-subgroups',
    'chromium-experimental-subgroup-uniform-control-flow',
    'chromium-experimental-multi-draw-indirect',
    'chromium-experimental-unorm16-texture-formats',
    'chromium-experimental-snorm16-texture-formats',
    'chromium-experimental-primitive-id'
  ];
  window.__WEBGPU_FEATURES_WHITELIST__ = [
    ...STABLE_FEATURES,
    ...(window.__ALLOW_CHROMIUM_EXPERIMENTAL__ ? EXPERIMENTAL_FEATURES : [])
  ];

  // === LIMITS WHITELIST (use Only YOR device specification) ===
  window.__WEBGPU_LIMITS_WHITELIST__ = [
    'maxTextureDimension1D','maxTextureDimension2D','maxTextureDimension3D',
    'maxTextureArrayLayers','maxBindGroups','maxBindingsPerBindGroup',
    'maxDynamicUniformBuffersPerPipelineLayout','maxDynamicStorageBuffersPerPipelineLayout',
    'maxSampledTexturesPerShaderStage','maxSamplersPerShaderStage',
    'maxStorageBuffersPerShaderStage','maxStorageTexturesPerShaderStage',
    'maxUniformBuffersPerShaderStage','maxUniformBufferBindingSize',
    'maxStorageBufferBindingSize','minUniformBufferOffsetAlignment',
    'minStorageBufferOffsetAlignment','maxVertexBuffers','maxBufferSize',
    'maxVertexAttributes','maxVertexBufferArrayStride',
    'maxInterStageShaderVariables','maxColorAttachments',
    'maxColorAttachmentBytesPerSample','maxComputeWorkgroupStorageSize',
    'maxComputeInvocationsPerWorkgroup','maxComputeWorkgroupSizeX',
    'maxComputeWorkgroupSizeY','maxComputeWorkgroupSizeZ',
    'maxComputeWorkgroupsPerDimension'
  ];

  // === TEXTURE FORMATS WHITELIST (as it is, without "guessing") ===
  window.__WEBGPU_FORMATS_WHITELIST__ = window.__WEBGPU_FORMATS_WHITELIST__ || [
    'r8unorm','r8snorm','r8uint','r8sint',
    'rg8unorm','rg8snorm','rg8uint','rg8sint',
    'rgba8unorm','rgba8unorm-srgb','rgba8snorm','rgba8uint','rgba8sint',
    'bgra8unorm','bgra8unorm-srgb',
    'r16uint','r16sint','r16float',
    'rg16uint','rg16sint','rg16float',
    'rgba16uint','rgba16sint','rgba16float',
    'r32uint','r32sint','r32float',
    'rg32uint','rg32sint','rg32float',
    'rgba32uint','rgba32sint','rgba32float',
    'rgb10a2unorm','rgb10a2uint','rg11b10ufloat','rgb9e5ufloat',
    'depth16unorm','depth24plus','depth24plus-stencil8','depth32float','stencil8',
    'bc1-rgba-unorm','bc1-rgba-unorm-srgb','bc2-rgba-unorm','bc2-rgba-unorm-srgb',
    'bc3-rgba-unorm','bc3-rgba-unorm-srgb','bc4-r-unorm','bc4-r-snorm',
    'bc5-rg-unorm','bc5-rg-snorm','bc6h-rgb-ufloat','bc6h-rgb-float',
    'bc7-rgba-unorm','bc7-rgba-unorm-srgb',
    'etc2-rgb8unorm','etc2-rgb8unorm-srgb','etc2-rgb8a1unorm','etc2-rgb8a1unorm-srgb',
    'etc2-rgba8unorm','etc2-rgba8unorm-srgb','eac-r11unorm','eac-r11snorm',
    'eac-rg11unorm','eac-rg11snorm',
    'astc-4x4-unorm','astc-4x4-unorm-srgb','astc-5x4-unorm','astc-5x4-unorm-srgb',
    'astc-5x5-unorm','astc-5x5-unorm-srgb','astc-6x5-unorm','astc-6x5-unorm-srgb',
    'astc-6x6-unorm','astc-6x6-unorm-srgb','astc-8x5-unorm','astc-8x5-unorm-srgb',
    'astc-8x6-unorm','astc-8x6-unorm-srgb','astc-8x8-unorm','astc-8x8-unorm-srgb',
    'astc-10x5-unorm','astc-10x5-unorm-srgb','astc-10x6-unorm','astc-10x6-unorm-srgb',
    'astc-10x8-unorm','astc-10x8-unorm-srgb','astc-10x10-unorm','astc-10x10-unorm-srgb',
    'astc-12x10-unorm','astc-12x10-unorm-srgb','astc-12x12-unorm','astc-12x12-unorm-srgb'
  ];

  // === Snapshot helper ===
  window.__collectWebGPUSnapshot__ = async function collectWebGPUSnapshot() {
    if (!('gpu' in navigator)) return { error: 'WebGPU not available' };
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
                  || await navigator.gpu.requestAdapter();
    if (!adapter) return { error: 'No adapter' };

    let adapterInfo = null;
    if (typeof adapter.requestAdapterInfo === 'function') {
      try { adapterInfo = await adapter.requestAdapterInfo(); } catch (_) {}
    }

    const device = await adapter.requestDevice();

    // combine the native features of the adapter and device, then filter WL
    const nativeFeatures = new Set([ ...adapter.features, ...device.features ]);
    const features = (window.__WEBGPU_FEATURES_WHITELIST__ || [])
      .filter(f => nativeFeatures.has(f));

    const pickLimits = (limits) => {
      const out = {};
      for (const k of (window.__WEBGPU_LIMITS_WHITELIST__ || [])) {
        if (k in limits) out[k] = limits[k];
      }
      return out;
    };
    const adapterLimits = pickLimits(adapter.limits || {});
    const deviceLimits  = pickLimits(device.limits || {});

    const formats = (window.__WEBGPU_FORMATS_WHITELIST__ || []).slice();
    const preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

    const summary = {
      preferredCanvasFormat,
      isFallbackAdapter: adapter.isFallbackAdapter ?? null
    };

    return (window.__WEBGPU_SNAPSHOT__ = {
      adapterInfo, features, formats,
      adapterLimits, deviceLimits, summary
    });
  };
}
  console.log('[WebGPUPatchModule] WL ready & snapshot installed');
}
