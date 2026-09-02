const AudioContextModule = function AudioContextModule(window) {
  const __MODULE = 'audiocontext';
  const __SURFACE = 'audio';
  const __FERNWEH_DIAG__ = function(level, code, extra, err) {
    try {
      const G_ = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || {};
      if (G_.FernwehContext && G_.FernwehContext.__logger && G_.FernwehContext.__logger.__DEGRADE__ && typeof G_.FernwehContext.__logger.__DEGRADE__.diag === 'function') {
        G_.FernwehContext.__logger.__DEGRADE__.diag(level, code, extra, err);
      } else if (G_.__loggerRoot && G_.__loggerRoot.__DEGRADE__ && typeof G_.__loggerRoot.__DEGRADE__.diag === 'function') {
        G_.__loggerRoot.__DEGRADE__.diag(level, code, extra, err);
      }
    } catch (_) {}
  };

  const G = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || {};

  const __audioTypePipeline = 'pipeline missing data';
  const __audioTypeBrowser = 'browser structure missing data';

  const C = window.FernwehContext;
  if (!C) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:pipeline_context_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'FernwehContext',
      data: { outcome: 'skip', reason: 'pipeline_context_missing' }
    }, new Error('[FernwehContext] FernwehContext is undefined — module registration is not available')) : undefined);
    return;
  }
  const __stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
  if (!__stateRoot) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:pipeline_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'FernwehContext.state',
      data: { outcome: 'skip', reason: 'pipeline_state_missing' }
    }, new Error('[FernwehContext] FernwehContext.state is undefined — module registration is not available')) : undefined);
    return;
  }
  const __audioContextRoot = (__stateRoot.__AUDIOCONTEXT__ && typeof __stateRoot.__AUDIOCONTEXT__ === 'object')
    ? __stateRoot.__AUDIOCONTEXT__
    : null;
  if (!__audioContextRoot) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:module_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'FernwehContext.state.__AUDIOCONTEXT__',
      data: { outcome: 'skip', reason: 'module_state_missing', missing: 'FernwehContext.state.__AUDIOCONTEXT__' }
    }, new Error('[AudioContextPatch] FernwehContext.state.__AUDIOCONTEXT__ missing')) : undefined);
    return;
  }
  const __audioContextState = (__audioContextRoot.__STATE__ && typeof __audioContextRoot.__STATE__ === 'object')
    ? __audioContextRoot.__STATE__
    : null;
  if (!__audioContextState) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:module_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'FernwehContext.state.__AUDIOCONTEXT__.__STATE__',
      data: { outcome: 'skip', reason: 'module_state_missing', missing: 'FernwehContext.state.__AUDIOCONTEXT__.__STATE__' }
    }, new Error('[AudioContextPatch] FernwehContext.state.__AUDIOCONTEXT__.__STATE__ missing')) : undefined);
    return;
  }
  const __core = window.Core;
  const __coreInternal = (__core && __core.__internal && typeof __core.__internal === 'object')
    ? __core.__internal
    : null;
  const __prngState = (__coreInternal && __coreInternal.prng && typeof __coreInternal.prng === 'object')
    ? __coreInternal.prng
    : null;
  const __randSource = (__prngState && __prngState.rand && typeof __prngState.rand.use === 'function')
    ? __prngState.rand
    : null;
  if (!__randSource || typeof __randSource.use !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:rand_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'rand.use',
      data: { outcome: 'skip', reason: 'rand_missing' }
    }, new Error('[AudioContextPatch] rand.use missing')) : undefined);
    return;
  }
  let R = null;
  try {
    R = __randSource.use('audio');
  } catch (e) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:rand_use_failed', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'rand.use(audio)',
      data: { outcome: 'skip', reason: 'rand_use_failed' }
    }, e) : undefined);
    return;
  }
  if (typeof R !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:rand_use_not_function', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'rand.use(audio)',
      data: { outcome: 'skip', reason: 'rand_use_not_function' }
    }, new Error('[AudioContextPatch] rand.use("audio") is not a function')) : undefined);
    return;
  }

  const __coreApplyTargets = (__core && typeof __core.applyTargets === 'function')
    ? __core.applyTargets
    : null;
  if (typeof __coreApplyTargets !== 'function') {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:core_apply_targets_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'Core.applyTargets',
      data: { outcome: 'skip', reason: 'core_apply_targets_missing' }
    }, new Error('[AudioContextPatch] Core.applyTargets is required')) : undefined);
    return;
  }

  // ===== MODULE: canonical guard client =====
  const __flagKey = '__PATCH_AUDIOCONTEXT__';
  const __tag = 'audiocontext';
  let __guardToken = null;
  try {
    if (!__core || typeof __core.guardFlag !== 'function') {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_missing', { module: __MODULE, surface: __SURFACE, 
        diagTag: __tag,
        key: 'guard',
        stage: 'guard',
        message: 'Core.guardFlag missing',
        type: __audioTypePipeline,
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null) : undefined);
      return;
    }
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_failed', { module: __MODULE, surface: __SURFACE, 
      diagTag: __tag,
      key: 'guard',
      stage: 'guard',
      message: 'guardFlag threw',
      type: __audioTypePipeline,
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e) : undefined);
    return;
  }
  if (!__guardToken) return; // already_patched: Core emits <tag>:already_patched

  __audioContextState.ready = false;
  __audioContextState.status = 'applying';
  __audioContextState.reason = null;

  function __releaseAudioGuard(rollbackOk, reason) {
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        return __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk === true, __tag);
      }
    } catch (eRelease) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', __tag + ':guard_release_exception', { module: __MODULE, surface: __SURFACE, 
        diagTag: __tag,
        key: 'guard',
        stage: 'rollback',
        message: 'releaseGuardFlag threw',
        type: __audioTypePipeline,
        data: { outcome: 'skip', reason: 'guard_release_exception', sourceReason: reason || null }
      }, eRelease) : undefined);
    }
    return false;
  }

  try {
  function getPropDescriptorDeep(obj, prop) {
    for (let o = obj; o; o = Object.getPrototypeOf(o)) {
      const d = Object.getOwnPropertyDescriptor(o, prop);
      if (d) return d;
    }
    return null;
  }

  function applyCoreTargetsGroup(groupTag, targets, policy) {
    const groupPolicy = policy === 'throw' ? 'throw' : 'skip';
    let plans = [];
    try {
      plans = __coreApplyTargets(targets, null, []);
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':preflight_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'preflight',
        type: __audioTypePipeline,
        diagTag: groupTag,
        key: groupTag,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', policy: groupPolicy }
      }, e) : undefined);
      if (groupPolicy === 'throw') throw e;
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      const reason = plans && plans.reason ? plans.reason : 'group_skipped';
      const err = new Error('[AudioContextPatch] target group skipped: ' + reason);
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':' + reason, { module: __MODULE, surface: __SURFACE, 
        stage: 'preflight',
        type: __audioTypeBrowser,
        diagTag: groupTag,
        key: groupTag,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: reason, policy: groupPolicy }
      }, err) : undefined);
      if (groupPolicy === 'throw') throw err;
      return 0;
    }

    const applied = [];
    try {
      for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        if (!p || p.skipApply) continue;
        if (!p.owner || typeof p.key !== 'string' || !p.nextDesc || typeof p.apply !== 'function') {
          throw new Error('[AudioContextPatch] invalid plan item');
        }
        p.apply();
        applied.push(p);
      }

      // Registry/dedup invariant: only register after full group apply succeeded.
      const coreRegisterPatchedTarget = (__core && typeof __core.registerPatchedTarget === 'function')
        ? __core.registerPatchedTarget
        : null;
      if (typeof coreRegisterPatchedTarget === 'function') {
        for (let i = 0; i < applied.length; i++) {
          const p = applied[i];
          try {
            coreRegisterPatchedTarget(p.owner, p.key);
          } catch (e) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':register_failed', { module: __MODULE, surface: __SURFACE, 
              stage: 'apply',
              type: __audioTypePipeline,
              diagTag: groupTag,
              key: p.key,
              data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'register_failed', policy: groupPolicy }
            }, e) : undefined);
            if (groupPolicy === 'throw') throw e;
          }
        }
      } else {
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':missing_core_registerPatchedTarget', { module: __MODULE, surface: __SURFACE, 
          stage: 'preflight',
          type: __audioTypePipeline,
          diagTag: groupTag,
          key: groupTag,
          data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'missing_core_registerPatchedTarget', policy: groupPolicy }
        }, null) : undefined);
      }
    } catch (e) {
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', groupTag + ':rollback', { module: __MODULE, surface: __SURFACE, 
        stage: 'rollback',
        type: __audioTypeBrowser,
        diagTag: groupTag,
        key: groupTag,
        data: { outcome: 'rollback', policy: groupPolicy }
      }, null) : undefined);
      let rollbackErr = null;
      for (let i = applied.length - 1; i >= 0; i--) {
        const p = applied[i];
        try {
          if (typeof p.rollback !== 'function') throw new Error('[AudioContextPatch] invalid rollback plan item');
          p.rollback();
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':rollback_failed', { module: __MODULE, surface: __SURFACE, 
            stage: 'rollback',
            type: __audioTypeBrowser,
            diagTag: groupTag,
            key: p.key,
            data: { outcome: 'throw', policy: groupPolicy, reason: 'rollback_failed' }
          }, re) : undefined);
        }
      }
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', groupTag + ':apply_failed', { module: __MODULE, surface: __SURFACE, 
        stage: 'apply',
        type: __audioTypeBrowser,
        diagTag: groupTag,
        key: groupTag,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', policy: groupPolicy }
      }, e) : undefined);
      if (rollbackErr) throw rollbackErr;
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    return applied.length;
  }

  let sampleRateMissingNoted = false;

  // 1. Actual list of classes for patch (AudioContext + webkit aliases)
  const CTX_CLASSES = [
    window.AudioContext,
    window.webkitAudioContext,
  ].filter(Boolean);
  const OFFLINE_CTX_CLASSES = [
    window.OfflineAudioContext,
    window.webkitOfflineAudioContext,
  ].filter(Boolean);

  const __seenProtos = new WeakSet();
  const __seenOfflineProtos = new WeakSet();
  const __offlineOscillators__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
  const __offlineOscillatorsAdjusted__ = (typeof WeakSet === 'function') ? new WeakSet() : null;
  let __totalTargets = 0;
  let __totalApplied = 0;

  const AUDIO_SCHEDULED_SOURCE_PROTO = (window.AudioScheduledSourceNode && window.AudioScheduledSourceNode.prototype)
    ? window.AudioScheduledSourceNode.prototype
    : null;
  const OSCILLATOR_PROTO = (window.OscillatorNode && window.OscillatorNode.prototype)
    ? window.OscillatorNode.prototype
    : null;

  function adjustOfflineOscillatorBeforeStart(node) {
    if (!node || !__offlineOscillators__ || !__offlineOscillators__.has(node)) return false;
    if (__offlineOscillatorsAdjusted__ && __offlineOscillatorsAdjusted__.has(node)) return false;
    const detune = node.detune;
    if (!detune || typeof detune.value !== 'number') return false;
    const sampleRate = Number(node.context && node.context.sampleRate);
    const safeSampleRate = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : null;
    if (!(safeSampleRate > 0)) {
      if (!sampleRateMissingNoted) {
        sampleRateMissingNoted = true;
        (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:oscillator:sample_rate_missing', { module: __MODULE, surface: __SURFACE, 
          stage: 'hook',
          type: __audioTypeBrowser,
          diagTag: 'audio:OfflineAudioContext:createOscillator',
          key: 'OfflineAudioContext.sampleRate',
          data: { outcome: 'skip', reason: 'sample_rate_missing' }
        }, new Error('[AudioContextPatch] sampleRate unavailable for offline oscillator adjustment')) : undefined);
      }
      return false;
    }
    const minValue = Number(detune.minValue);
    const maxValue = Number(detune.maxValue);
    const hasBounds = Number.isFinite(minValue) && Number.isFinite(maxValue) && maxValue > minValue;
    const span = hasBounds ? (maxValue - minValue) : Math.max(1, Math.abs(Number(detune.value) || 0));
    const noiseUnit = (R() * 2) - 1;
    const baseMagnitude = span / Math.max(1, safeSampleRate * safeSampleRate);
    const dspResolutionLift = Math.max(1, Math.sqrt(Math.log2(safeSampleRate)));
    const delta = noiseUnit * Math.max(Number.EPSILON, baseMagnitude * dspResolutionLift);
    const nextValue = detune.value + delta;
    if (!Number.isFinite(nextValue)) return false;
    if (hasBounds && (nextValue < minValue || nextValue > maxValue)) return false;
    detune.value = nextValue;
    if (__offlineOscillatorsAdjusted__) __offlineOscillatorsAdjusted__.add(node);
    return true;
  }

  if (!__offlineOscillators__ || !__offlineOscillatorsAdjusted__) {
    __audioContextState.ready = false;
    __audioContextState.status = 'failed';
    __audioContextState.reason = 'weakset_missing';
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', 'audiocontext:offline_oscillator_state_missing', { module: __MODULE, surface: __SURFACE, 
      stage: 'preflight',
      type: __audioTypePipeline,
      key: 'WeakSet',
      data: { outcome: 'skip', reason: 'weakset_missing' }
    }, new Error('[AudioContextPatch] WeakSet state is required')) : undefined);
    __releaseAudioGuard(true, 'weakset_missing');
    return;
  }

  for (const CTX of CTX_CLASSES) {
    const proto = CTX.prototype;
    if (__seenProtos.has(proto)) continue;
    __seenProtos.add(proto);
    const CTX_NAME = CTX && CTX.name ? CTX.name : 'AudioContext';
    const priority = (CTX === window.AudioContext || CTX === window.webkitAudioContext) ? 2 : 1;
    const validAudioContextThis = function validAudioContextThis(self) {
      return !!self && proto.isPrototypeOf(self);
    };
    const targets = [];

    // 3. patch sampleRate/baseLatency: accessor patch via CORE targets
    const sampleRateDesc = Object.getOwnPropertyDescriptor(proto, 'sampleRate') || getPropDescriptorDeep(proto, 'sampleRate');
    if (sampleRateDesc && typeof sampleRateDesc.get === 'function') {
      targets.push({
        owner: proto,
        key: 'sampleRate',
        kind: 'accessor',
        wrapLayer: 'strict_accessor_gateway',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: `audio:${CTX_NAME}:sampleRate`,
        configurable: sampleRateDesc ? !!sampleRateDesc.configurable : true,
          enumerable: sampleRateDesc ? !!sampleRateDesc.enumerable : false,
          invalidThis: 'throw',
          getImpl: function audioSampleRateGet(origGet) {
            let v;
            try {
              v = Reflect.apply(origGet, this, []);
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:sampleRate:native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:sampleRate`,
                key: 'sampleRate',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
            return v;
          }
        });
    }
    if ('baseLatency' in proto) {
      const baseLatencyDesc = Object.getOwnPropertyDescriptor(proto, 'baseLatency') || getPropDescriptorDeep(proto, 'baseLatency');
      if (baseLatencyDesc && typeof baseLatencyDesc.get === 'function') {
        targets.push({
          owner: proto,
          key: 'baseLatency',
          kind: 'accessor',
          wrapLayer: 'strict_accessor_gateway',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: `audio:${CTX_NAME}:baseLatency`,
          configurable: baseLatencyDesc ? !!baseLatencyDesc.configurable : true,
          enumerable: baseLatencyDesc ? !!baseLatencyDesc.enumerable : false,
          invalidThis: 'throw',
          getImpl: function audioBaseLatencyGet(origGet) {
            let v;
            try {
              v = Reflect.apply(origGet, this, []);
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:baseLatency:native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:baseLatency`,
                key: 'baseLatency',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
            return v;
          }
        });
      }
    }


    const dCreateBuffer = Object.getOwnPropertyDescriptor(proto, 'createBuffer') || getPropDescriptorDeep(proto, 'createBuffer');
    if (dCreateBuffer && typeof dCreateBuffer.value === 'function') {
      targets.push({
        owner: proto,
        key: 'createBuffer',
        kind: 'method',
        wrapLayer: 'core_wrapper',
        resolve: 'proto_chain',
        invokeClass: 'brand_strict',
        policy: 'skip',
        diagTag: `audio:${CTX_NAME}:createBuffer`,
        validThis: validAudioContextThis,
        invalidThis: 'throw',
        invoke: function audioCreateBufferInvoke(orig, args) {
          const input = Array.isArray(args) ? args : [];
          try {
            return Reflect.apply(orig, this, input);
          } catch (e) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:createBuffer:native_throw', { module: __MODULE, surface: __SURFACE, 
              stage: 'runtime',
              type: __audioTypeBrowser,
              diagTag: `audio:${CTX_NAME}:createBuffer`,
              key: 'createBuffer',
              data: { outcome: 'throw', reason: 'native_throw' }
            }, e) : undefined);
            throw e;
          }
        }
      });
    }

  // 5. patch AnalyserNode (preserveing invariants)
  const dCreateAnalyser = Object.getOwnPropertyDescriptor(proto, 'createAnalyser') || getPropDescriptorDeep(proto, 'createAnalyser');
  if (dCreateAnalyser && typeof dCreateAnalyser.value === 'function') {
    targets.push({
      owner: proto,
      key: 'createAnalyser',
      kind: 'method',
      wrapLayer: 'core_wrapper',
      resolve: 'proto_chain',
      invokeClass: 'brand_strict',
      policy: 'skip',
      diagTag: `audio:${CTX_NAME}:createAnalyser`,
      validThis: validAudioContextThis,
      invalidThis: 'throw',
      invoke: function audioCreateAnalyserInvoke(orig, args) {
        const input = Array.isArray(args) ? args : [];
        let analyser;
        try {
          analyser = Reflect.apply(orig, this, input);
        } catch (e) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:createAnalyser:native_throw', { module: __MODULE, surface: __SURFACE, 
            stage: 'runtime',
            type: __audioTypeBrowser,
            diagTag: `audio:${CTX_NAME}:createAnalyser`,
            key: 'createAnalyser',
            data: { outcome: 'throw', reason: 'native_throw' }
          }, e) : undefined);
          throw e;
        }
        if (!analyser || (typeof analyser !== 'object' && typeof analyser !== 'function')) return analyser;

        const analyserProto = Object.getPrototypeOf(analyser);
        if (!analyserProto || (typeof analyserProto !== 'object' && typeof analyserProto !== 'function')) return analyser;
        const coreIsTargetRegistered = (__core && typeof __core.isTargetRegistered === 'function')
          ? __core.isTargetRegistered
          : null;
        const analyserProtoTag = `audio:${CTX_NAME}:analyser_proto`;
        const analyserValidThis = function analyserValidThis(self) {
          return !!self && analyserProto.isPrototypeOf(self);
        };

      // --- Byte Spectrum: discrete ±1/0 with compensation of the summ ---
      if (coreIsTargetRegistered && coreIsTargetRegistered(analyserProto, 'getByteFrequencyData')) {
        // already patched on prototype
      } else {
      const origByte = analyser.getByteFrequencyData;
      if (typeof origByte === 'function') {
        applyCoreTargetsGroup(analyserProtoTag + ':getByteFrequencyData', [{
          owner: analyserProto,
          key: 'getByteFrequencyData',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          resolve: 'proto_chain',
          policy: 'skip',
          diagTag: analyserProtoTag + ':getByteFrequencyData',
          validThis: analyserValidThis,
          invalidThis: 'throw',
          invoke: function audioAnalyserGetByteFrequencyDataInvoke(orig, args) {
            const input = Array.isArray(args) ? args : [];
            const array = input[0];
            let result;
            try {
              result = Reflect.apply(orig, this, input);
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:byte_freq_native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteFrequencyData',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
            try {
              let delta = 0;
              const n = array.length | 0;
              for (let i = 0; i < n; i++) {
                const r = R();
                let d = (r < 1 / 3) ? -1 : (r > 2 / 3 ? 1 : 0);
                const v = array[i], nv = v + d;
                if (nv >= 0 && nv <= 255) { array[i] = nv; delta += d; }
              }
              if (delta !== 0) {
                if (delta > 0) {
                  for (let i = 0; i < n && delta > 0; i++) if (array[i] > 0) { array[i] -= 1; delta--; }
                } else {
                  delta = -delta;
                  for (let i = 0; i < n && delta > 0; i++) if (array[i] < 255) { array[i] += 1; delta--; }
                }
              }
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:byte_freq_noise_failed', { module: __MODULE, surface: __SURFACE, 
                stage: 'hook',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteFrequencyData',
                data: { outcome: 'skip', reason: 'byte_freq_noise_failed' }
              }, e) : undefined);
            }
            return result;
          }
        }], 'skip');
      }
      }

      // --- Float Spectrum: pair of zero summary noise, without going out for [min,max] ---
      if (coreIsTargetRegistered && coreIsTargetRegistered(analyserProto, 'getFloatFrequencyData')) {
        // already patched on prototype
      } else {
      const origFloat = analyser.getFloatFrequencyData;
      if (typeof origFloat === 'function') {
        applyCoreTargetsGroup(analyserProtoTag + ':getFloatFrequencyData', [{
          owner: analyserProto,
          key: 'getFloatFrequencyData',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          resolve: 'proto_chain',
          policy: 'skip',
          diagTag: analyserProtoTag + ':getFloatFrequencyData',
          validThis: analyserValidThis,
          invalidThis: 'throw',
          invoke: function audioAnalyserGetFloatFrequencyDataInvoke(orig, args) {
            const input = Array.isArray(args) ? args : [];
            const array = input[0];
            let result;
            try {
              result = Reflect.apply(orig, this, input);
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:float_freq_native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatFrequencyData',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
            try {
              const lo = (typeof this.minDecibels === 'number') ? this.minDecibels : -100;
              const hi = (typeof this.maxDecibels === 'number') ? this.maxDecibels : -30;
              const n  = array.length | 0;
              if (!n) return result;

              const range = Math.max(1e-9, hi - lo);
              const baseAmp = range * (typeof this.smoothingTimeConstant === 'number' ? this.smoothingTimeConstant : 0.8)
                                    / Math.max(1, (this.fftSize || 2048) * 0.5);

              const tiny = range / 1e6;
              for (let i = 0, j = n - 1; i < j; i++, j--) {
                const vi = array[i], vj = array[j];
                const lim_i = Math.max(0, Math.min(vi - lo, hi - vi) - tiny);
                const lim_j = Math.max(0, Math.min(vj - lo, hi - vj) - tiny);
                const amp   = Math.min(baseAmp, lim_i, lim_j);
                if (amp <= 0) continue;

                const d = (R() - 0.5) * 2 * amp;
                array[i] = vi + d;
                array[j] = vj - d;

                if (array[i] < lo) array[i] = lo; else if (array[i] > hi) array[i] = hi;
                if (array[j] < lo) array[j] = lo; else if (array[j] > hi) array[j] = hi;
              }
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:float_freq_noise_failed', { module: __MODULE, surface: __SURFACE, 
                stage: 'hook',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatFrequencyData',
                data: { outcome: 'skip', reason: 'float_freq_noise_failed' }
              }, e) : undefined);
            }
            return result;
          }
        }], 'skip');
      }
      }

      // --- Byte time-domain: paired±1 (The sum preserved) carefully [0..255] ---
      if (coreIsTargetRegistered && coreIsTargetRegistered(analyserProto, 'getByteTimeDomainData')) {
        // already patched on prototype
      } else {
      const origByteTD = analyser.getByteTimeDomainData;
      if (typeof origByteTD === 'function') {
        applyCoreTargetsGroup(analyserProtoTag + ':getByteTimeDomainData', [{
          owner: analyserProto,
          key: 'getByteTimeDomainData',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          resolve: 'proto_chain',
          policy: 'skip',
          diagTag: analyserProtoTag + ':getByteTimeDomainData',
          validThis: analyserValidThis,
          invalidThis: 'throw',
          invoke: function audioAnalyserGetByteTimeDomainDataInvoke(orig, args) {
            const input = Array.isArray(args) ? args : [];
            const array = input[0];
            let result;
            try {
              result = Reflect.apply(orig, this, input);
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:byte_time_native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteTimeDomainData',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
            try {
              const n = array.length | 0;
              for (let i = 0, j = n - 1; i < j; i++, j--) {
                const vi = array[i], vj = array[j];
                let s = (R() < 0.5) ? 1 : -1;
                const can_i = (vi + s) >= 0 && (vi + s) <= 255;
                const can_j = (vj - s) >= 0 && (vj - s) <= 255;
                if (can_i && can_j) {
                  array[i] = vi + s;
                  array[j] = vj - s;
                } else {
                  s = -s;
                  const can_i2 = (vi + s) >= 0 && (vi + s) <= 255;
                  const can_j2 = (vj - s) >= 0 && (vj - s) <= 255;
                  if (can_i2 && can_j2) {
                    array[i] = vi + s;
                    array[j] = vj - s;
                  }
                }
              }
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:byte_time_noise_failed', { module: __MODULE, surface: __SURFACE, 
                stage: 'hook',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteTimeDomainData',
                data: { outcome: 'skip', reason: 'byte_time_noise_failed' }
              }, e) : undefined);
            }
            return result;
          }
        }], 'skip');
      }
      }

      // --- Float time-domain: pair zero-summary noise within [-1..1] ---
      if (coreIsTargetRegistered && coreIsTargetRegistered(analyserProto, 'getFloatTimeDomainData')) {
        // already patched on prototype
      } else {
      const origFloatTD = analyser.getFloatTimeDomainData;
      if (typeof origFloatTD === 'function') {
        applyCoreTargetsGroup(analyserProtoTag + ':getFloatTimeDomainData', [{
          owner: analyserProto,
          key: 'getFloatTimeDomainData',
          kind: 'method',
          wrapLayer: 'core_wrapper',
          invokeClass: 'brand_strict',
          resolve: 'proto_chain',
          policy: 'skip',
          diagTag: analyserProtoTag + ':getFloatTimeDomainData',
          validThis: analyserValidThis,
          invalidThis: 'throw',
          invoke: function audioAnalyserGetFloatTimeDomainDataInvoke(orig, args) {
            const input = Array.isArray(args) ? args : [];
            const array = input[0];
            let result;
            try {
              result = Reflect.apply(orig, this, input);
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:float_time_native_throw', { module: __MODULE, surface: __SURFACE, 
                stage: 'runtime',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatTimeDomainData',
                data: { outcome: 'throw', reason: 'native_throw' }
              }, e) : undefined);
              throw e;
            }
            const n = array.length | 0;
            if (!n) return result;

            try {
              let vmin = Infinity, vmax = -Infinity;
              for (let k = 0; k < n; k++) { const v = array[k]; if (v < vmin) vmin = v; if (v > vmax) vmax = v; }
              const span   = Math.max(1e-9, vmax - vmin);
              const base   = (typeof this.smoothingTimeConstant === 'number' ? this.smoothingTimeConstant : 0.8);
              const amp0   = span * base / Math.max(1, this.fftSize || 2048);
              const lo = -1, hi = 1;
              const tiny = 1 / 1e6;

              for (let i = 0, j = n - 1; i < j; i++, j--) {
                const vi = array[i], vj = array[j];
                const lim_i = Math.max(0, Math.min(vi - lo, hi - vi) - tiny);
                const lim_j = Math.max(0, Math.min(vj - lo, hi - vj) - tiny);
                const amp   = Math.min(amp0, lim_i, lim_j);
                if (amp <= 0) continue;

                const d = (R() - 0.5) * 2 * amp;
                array[i] = vi + d;
                array[j] = vj - d;

                if (array[i] < lo) array[i] = lo; else if (array[i] > hi) array[i] = hi;
                if (array[j] < lo) array[j] = lo; else if (array[j] > hi) array[j] = hi;
              }
            } catch (e) {
              (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:analyser:float_time_noise_failed', { module: __MODULE, surface: __SURFACE, 
                stage: 'hook',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatTimeDomainData',
                data: { outcome: 'skip', reason: 'float_time_noise_failed' }
              }, e) : undefined);
            }
            return result;
          }
        }], 'skip');
      }
      }

      return analyser;
      }
    });
  }


    __totalTargets += targets.length;
    __totalApplied += applyCoreTargetsGroup(`audiocontext:${CTX_NAME}:proto`, targets, 'skip');
  }

  for (const CTX of OFFLINE_CTX_CLASSES) {
    const proto = CTX.prototype;
    if (!proto || __seenOfflineProtos.has(proto)) continue;
    __seenOfflineProtos.add(proto);
    const CTX_NAME = CTX && CTX.name ? CTX.name : 'OfflineAudioContext';
    const validOfflineAudioContextThis = function validOfflineAudioContextThis(self) {
      return !!self && proto.isPrototypeOf(self);
    };
    const targets = [];
    const dCreateOscillator = Object.getOwnPropertyDescriptor(proto, 'createOscillator') || getPropDescriptorDeep(proto, 'createOscillator');
    if (dCreateOscillator && typeof dCreateOscillator.value === 'function') {
      targets.push({
        owner: proto,
        key: 'createOscillator',
        kind: 'method',
        wrapLayer: 'core_wrapper',
        resolve: 'proto_chain',
        invokeClass: 'brand_strict',
        policy: 'skip',
        diagTag: `audio:${CTX_NAME}:createOscillator`,
        validThis: validOfflineAudioContextThis,
        invalidThis: 'throw',
        invoke: function audioOfflineCreateOscillatorInvoke(orig, args) {
          const input = Array.isArray(args) ? args : [];
          let oscillator;
          try {
            oscillator = Reflect.apply(orig, this, input);
          } catch (e) {
            (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:createOscillator:native_throw', { module: __MODULE, surface: __SURFACE, 
              stage: 'runtime',
              type: __audioTypeBrowser,
              diagTag: `audio:${CTX_NAME}:createOscillator`,
              key: 'createOscillator',
              data: { outcome: 'throw', reason: 'native_throw' }
            }, e) : undefined);
            throw e;
          }
          if (oscillator && (typeof oscillator === 'object' || typeof oscillator === 'function')) {
            __offlineOscillators__.add(oscillator);
          }
          return oscillator;
        }
      });
    }
    __totalTargets += targets.length;
    __totalApplied += applyCoreTargetsGroup(`audiocontext:${CTX_NAME}:proto`, targets, 'skip');
  }

  const oscillatorStartOwner = (AUDIO_SCHEDULED_SOURCE_PROTO && Object.getOwnPropertyDescriptor(AUDIO_SCHEDULED_SOURCE_PROTO, 'start'))
    ? AUDIO_SCHEDULED_SOURCE_PROTO
    : OSCILLATOR_PROTO;
  const oscillatorStartDesc = oscillatorStartOwner
    ? (Object.getOwnPropertyDescriptor(oscillatorStartOwner, 'start') || getPropDescriptorDeep(oscillatorStartOwner, 'start'))
    : null;
  if (oscillatorStartOwner && oscillatorStartDesc && typeof oscillatorStartDesc.value === 'function') {
    const validScheduledSourceThis = function validScheduledSourceThis(self) {
      return !!self && oscillatorStartOwner.isPrototypeOf(self);
    };
    const targets = [{
      owner: oscillatorStartOwner,
      key: 'start',
      kind: 'method',
      wrapLayer: 'core_wrapper',
      resolve: 'proto_chain',
      invokeClass: 'brand_strict',
      policy: 'skip',
      diagTag: 'audio:AudioScheduledSourceNode:start',
      validThis: validScheduledSourceThis,
      invalidThis: 'throw',
      invoke: function audioScheduledSourceStartInvoke(orig, args) {
        const input = Array.isArray(args) ? args : [];
        try {
          adjustOfflineOscillatorBeforeStart(this);
        } catch (e) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:oscillator:pre_start_adjust_failed', { module: __MODULE, surface: __SURFACE, 
            stage: 'hook',
            type: __audioTypePipeline,
            diagTag: 'audio:AudioScheduledSourceNode:start',
            key: 'AudioScheduledSourceNode.start',
            data: { outcome: 'skip', reason: 'pre_start_adjust_failed' }
          }, e) : undefined);
        }
        try {
          return Reflect.apply(orig, this, input);
        } catch (e) {
          (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('warn', 'audiocontext:scheduled_source:start_native_throw', { module: __MODULE, surface: __SURFACE, 
            stage: 'runtime',
            type: __audioTypeBrowser,
            diagTag: 'audio:AudioScheduledSourceNode:start',
            key: 'AudioScheduledSourceNode.start',
            data: { outcome: 'throw', reason: 'native_throw' }
          }, e) : undefined);
          throw e;
        }
      }
    }];
    __totalTargets += targets.length;
    __totalApplied += applyCoreTargetsGroup('audiocontext:AudioScheduledSourceNode:proto', targets, 'skip');
  }

    if (__totalApplied <= 0) {
      __audioContextState.ready = false;
      __audioContextState.status = 'failed';
      __audioContextState.reason = 'no_targets_applied';
      (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('fatal', __tag + ':no_targets_applied', { module: __MODULE, surface: __SURFACE, 
        stage: 'preflight',
        type: __audioTypeBrowser,
        key: __tag,
        data: { outcome: 'skip', reason: 'no_targets_applied', targets: __totalTargets, applied: __totalApplied }
      }, new Error('[AudioContextPatch] no targets applied')) : undefined);
      __releaseAudioGuard(true, 'no_targets_applied');
      return;
    }

    const readyStateData = {
      ctxClasses: CTX_CLASSES.length,
      offlineCtxClasses: OFFLINE_CTX_CLASSES.length,
      targets: __totalTargets,
      applied: __totalApplied
    };
    __audioContextState.ready = true;
    __audioContextState.status = 'ready';
    __audioContextState.reason = 'ready';
    __audioContextState.ctxClasses = readyStateData.ctxClasses;
    __audioContextState.offlineCtxClasses = readyStateData.offlineCtxClasses;
    __audioContextState.targets = readyStateData.targets;
    __audioContextState.applied = readyStateData.applied;
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('info', __tag + ':ready', { module: __MODULE, surface: __SURFACE, 
      stage: 'apply',
      key: __tag,
      message: 'ok',
      type: 'ok',
      data: Object.assign({ outcome: 'return' }, readyStateData)
    }, null) : undefined);
  } catch (e) {
    const rollbackErr = e;
    __audioContextState.ready = false;
    __audioContextState.status = 'failed';
    __audioContextState.reason = 'fatal';
    (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__('error', __tag + ':fatal', { module: __MODULE, surface: __SURFACE, 
      diagTag: __tag,
      key: __tag,
      stage: 'apply',
      message: 'fatal module error',
      type: __audioTypeBrowser,
      data: { outcome: 'throw', reason: 'fatal', rollbackOk: false }
    }, rollbackErr) : undefined);
    __releaseAudioGuard(false, 'fatal');
    throw rollbackErr;
  }
};
