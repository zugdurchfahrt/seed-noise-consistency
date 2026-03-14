const AudioContextModule = function AudioContextModule(window) {
  const __audioTypePipeline = 'pipeline missing data';
  const __audioTypeBrowser = 'browser structure missing data';

  const __MODULE = 'audiocontext';
  const __SURFACE = 'audio';

  const __loggerRoot = (window && window.CanvasPatchContext && window.CanvasPatchContext.__logger && typeof window.CanvasPatchContext.__logger === 'object')
    ? window.CanvasPatchContext.__logger
    : null;
  const __D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
  const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;
  function __emit(level, code, ctx, err) {
    try {
      if (__diag) return __diag(level, code, ctx, err);
      if (typeof __D === 'function') {
        const safeCtx = (ctx && typeof ctx === 'object') ? ctx : {};
        const safeLevel = (level === undefined || level === null) ? 'info' : level;
        const safeErr = (err === undefined || err === null) ? null : err;
        return __D(code, safeErr, Object.assign({}, safeCtx, { level: safeLevel }));
      }
    } catch (emitErr) {
      return undefined;
    }
  }

  function __moduleDiag(level, code, extra, err) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const ctx = {
      module: __MODULE,
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : __MODULE,
      surface: __SURFACE,
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: x.stage, // no local normalization/re-classification
      message: x.message,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: x.type // no local normalization/re-classification
    };
    return __emit(level, code, ctx, err);
  }

  function emitDegrade(level, code, err, extra) {
    return __moduleDiag(level, code, extra, err);
  }

  function degrade(code, err, extra) {
    const x = (extra && typeof extra === 'object') ? extra : {};
    const lvl = (x.level === 'info' || x.level === 'warn' || x.level === 'error' || x.level === 'fatal')
      ? x.level
      : 'warn';
    emitDegrade(lvl, code, err, x);
  }

  const C = window.CanvasPatchContext;
  if (!C) {
    degrade('audiocontext:canvas_patch_context_missing', new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'CanvasPatchContext',
      data: { outcome: 'skip', reason: 'canvas_patch_context_missing' }
    });
    return;
  }
  const __stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
  if (!__stateRoot) {
    degrade('audiocontext:canvas_patch_state_missing', new Error('[CanvasPatch] CanvasPatchContext.state is undefined — module registration is not available'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'CanvasPatchContext.state',
      data: { outcome: 'skip', reason: 'canvas_patch_state_missing' }
    });
    return;
  }
  if (!(__stateRoot.__AUDIOCONTEXT__ && typeof __stateRoot.__AUDIOCONTEXT__ === 'object')) {
    Object.defineProperty(__stateRoot, '__AUDIOCONTEXT__', {
      value: Object.create(null),
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  const __core = window.Core;
  const __coreInternal = (__core && __core.__internal && typeof __core.__internal === 'object')
    ? __core.__internal
    : null;
  const __prngState = (__coreInternal && __coreInternal.prng && typeof __coreInternal.prng === 'object')
    ? __coreInternal.prng
    : ((__stateRoot.__PRNG_STATE__ && typeof __stateRoot.__PRNG_STATE__ === 'object')
    ? __stateRoot.__PRNG_STATE__
    : ((C && C.__PRNG_STATE__ && typeof C.__PRNG_STATE__ === 'object') ? C.__PRNG_STATE__ : null));
  const __randSource = (__prngState && __prngState.rand && typeof __prngState.rand.use === 'function')
    ? __prngState.rand
    : null;
  if (!__randSource || typeof __randSource.use !== 'function') {
    degrade('audiocontext:rand_missing', new Error('[AudioContextPatch] rand.use missing'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'rand.use',
      data: { outcome: 'skip', reason: 'rand_missing' }
    });
    return;
  }
  let R = null;
  try {
    R = __randSource.use('audio');
  } catch (e) {
    degrade('audiocontext:rand_use_failed', e, {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'rand.use(audio)',
      data: { outcome: 'skip', reason: 'rand_use_failed' }
    });
    return;
  }
  if (typeof R !== 'function') {
    degrade('audiocontext:rand_use_not_function', new Error('[AudioContextPatch] rand.use("audio") is not a function'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'rand.use(audio)',
      data: { outcome: 'skip', reason: 'rand_use_not_function' }
    });
    return;
  }

  const markAsNative = (function() {
    const ensure = (typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      degrade('audiocontext:mark_native_missing', new Error('[AudioContextPatch] markAsNative missing'), {
        stage: 'preflight',
        level: 'fatal',
        type: __audioTypePipeline,
        key: 'markAsNative',
        data: { outcome: 'skip', reason: 'mark_native_missing' }
      });
      return null;
    }
    return m;
  })();
  if (!markAsNative) return;
  const safeDefine = (typeof window.__safeDefine === 'function') ? window.__safeDefine : null;
  const __wrapNativeApply = (typeof window.__wrapNativeApply === 'function') ? window.__wrapNativeApply : null;
  const __wrapNativeAccessor = (typeof window.__wrapNativeAccessor === 'function') ? window.__wrapNativeAccessor : null;
  const __corePreflightTarget = (window.Core && typeof window.Core.preflightTarget === 'function')
    ? window.Core.preflightTarget
    : null;
  const __coreApplyTargets = (window.Core && typeof window.Core.applyTargets === 'function')
    ? window.Core.applyTargets
    : null;
  if (typeof safeDefine !== 'function') {
    degrade('audiocontext:safe_define_missing', new Error('[AudioContextPatch] __safeDefine missing'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: '__safeDefine',
      data: { outcome: 'skip', reason: 'safe_define_missing' }
    });
    return;
  }
  if (typeof __wrapNativeApply !== 'function') {
    degrade('audiocontext:wrap_native_apply_missing', new Error('[AudioContextPatch] __wrapNativeApply missing'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: '__wrapNativeApply',
      data: { outcome: 'skip', reason: 'wrap_native_apply_missing' }
    });
    return;
  }
  if (typeof __wrapNativeAccessor !== 'function') {
    degrade('audiocontext:wrap_native_accessor_missing', new Error('[AudioContextPatch] __wrapNativeAccessor missing'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: '__wrapNativeAccessor',
      data: { outcome: 'skip', reason: 'wrap_native_accessor_missing' }
    });
    return;
  }
  if (typeof __coreApplyTargets !== 'function') {
    degrade('audiocontext:core_apply_targets_missing', new Error('[AudioContextPatch] Core.applyTargets is required'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'Core.applyTargets',
      data: { outcome: 'skip', reason: 'core_apply_targets_missing' }
    });
    return;
  }
  const AUDIO_NOISE_ENABLED = true;

  // ===== MODULE: canonical guard client (GuardFlag.md) =====
  const __flagKey = '__PATCH_AUDIOCONTEXT__';
  const __tag = 'audiocontext';
  const __surface = 'audio';
  let __guardToken = null;
  try {
    if (!__core || typeof __core.guardFlag !== 'function') {
      __D?.diag?.('warn', __tag + ':guard_missing', {
        module: __tag,
        diagTag: __tag,
        surface: __surface,
        key: __flagKey,
        stage: 'guard',
        message: 'Core.guardFlag missing',
        type: __audioTypePipeline,
        data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
      }, null);
      return;
    }
    __guardToken = __core.guardFlag(__flagKey, __tag);
  } catch (e) {
    __D?.diag?.('warn', __tag + ':guard_failed', {
      module: __tag,
      diagTag: __tag,
      surface: __surface,
      key: __flagKey,
      stage: 'guard',
      message: 'guardFlag threw',
      type: __audioTypePipeline,
      data: { outcome: 'skip', reason: 'guard_failed' }
    }, e);
    return;
  }
  if (!__guardToken) return; // already_patched: Core emits <tag>:already_patched

  try {

  const GUARD = {
    counts: {},
    last: null
  };

  function noteIssue(code, detail) {
    const key = String(code);
    GUARD.counts[key] = (GUARD.counts[key] || 0) + 1;
    GUARD.last = { code: key, detail: detail || null, at: Date.now() };
    const type = (key.indexOf('missing_proto:') === 0 || key.indexOf('missing_method:') === 0 || key.indexOf('non_extensible:') === 0 || key.indexOf('non_configurable:') === 0 || key.indexOf('non_writable:') === 0)
      ? __audioTypeBrowser
      : __audioTypePipeline;
    emitDegrade('warn', 'audiocontext:' + key, null, {
      diagTag: 'audiocontext:guard',
      surface: 'audio',
      key,
      stage: 'guard',
      message: key,
      data: { outcome: 'skip', detail: detail || null },
      type
    });
  }


  function canRedefine(proto, prop, ctxName) {
    if (!proto) { noteIssue(`missing_proto:${prop}`, ctxName); return false; }
    if (!Object.isExtensible(proto)) { noteIssue(`non_extensible:${prop}`, ctxName); return false; }
    const d = Object.getOwnPropertyDescriptor(proto, prop);
    if (d && d.configurable === false) { noteIssue(`non_configurable:${prop}`, ctxName); return false; }
    return true;
  }

  function getPropDescriptorDeep(obj, prop) {
    for (let o = obj; o; o = Object.getPrototypeOf(o)) {
      const d = Object.getOwnPropertyDescriptor(o, prop);
      if (d) return d;
    }
    return null;
  }


  function canReplaceMethod(proto, method, ctxName) {
    if (!proto) { noteIssue(`missing_proto:${method}`, ctxName); return false; }
    if (!Object.isExtensible(proto)) { noteIssue(`non_extensible:${method}`, ctxName); return false; }
    const own = Object.getOwnPropertyDescriptor(proto, method);
    if (own) {
      if (own.writable === false && own.configurable === false) {
        noteIssue(`non_writable:${method}`, ctxName);
        return false;
      }
      return true;
    }
    // not an own property: allow shadowing if method exists on prototype chain
    const inherited = getPropDescriptorDeep(proto, method);
    if (!inherited) { noteIssue(`missing_method:${method}`, ctxName); return false; }
    return true;
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
      plans = __coreApplyTargets(targets, window.__PROFILE__, []);
    } catch (e) {
      degrade(groupTag + ':preflight_failed', e, {
        stage: 'preflight',
        level: 'error',
        type: __audioTypePipeline,
        diagTag: groupTag,
        key: null,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', policy: groupPolicy }
      });
      if (groupPolicy === 'throw') throw e;
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      const reason = plans && plans.reason ? plans.reason : 'group_skipped';
      const err = new Error('[AudioContextPatch] target group skipped: ' + reason);
      degrade(groupTag + ':' + reason, err, {
        stage: 'preflight',
        level: 'warn',
        type: __audioTypeBrowser,
        diagTag: groupTag,
        key: null,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: reason, policy: groupPolicy }
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
          throw new Error('[AudioContextPatch] invalid plan item');
        }
        Object.defineProperty(p.owner, p.key, p.nextDesc);
        const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
        if (!isSameDescriptor(after, p.nextDesc)) {
          throw new Error('[AudioContextPatch] descriptor post-check mismatch for ' + p.key);
        }
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
            degrade(groupTag + ':register_failed', e, {
              stage: 'apply',
              level: 'error',
              type: __audioTypePipeline,
              diagTag: groupTag,
              key: p.key,
              data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'register_failed', policy: groupPolicy }
            });
            if (groupPolicy === 'throw') throw e;
          }
        }
      } else {
        degrade(groupTag + ':missing_core_registerPatchedTarget', null, {
          stage: 'preflight',
          level: 'warn',
          type: __audioTypePipeline,
          diagTag: groupTag,
          key: null,
          data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', reason: 'missing_core_registerPatchedTarget', policy: groupPolicy }
        });
      }
    } catch (e) {
      degrade(groupTag + ':rollback', null, {
        stage: 'rollback',
        level: 'warn',
        type: __audioTypeBrowser,
        diagTag: groupTag,
        key: null,
        data: { outcome: 'rollback', policy: groupPolicy }
      });
      let rollbackErr = null;
      for (let i = applied.length - 1; i >= 0; i--) {
        const p = applied[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          degrade(groupTag + ':rollback_failed', re, {
            stage: 'rollback',
            level: 'error',
            type: __audioTypeBrowser,
            diagTag: groupTag,
            key: p.key,
            data: { outcome: 'throw', policy: groupPolicy, reason: 'rollback_failed' }
          });
        }
      }
      degrade(groupTag + ':apply_failed', e, {
        stage: 'apply',
        level: 'error',
        type: __audioTypeBrowser,
        diagTag: groupTag,
        key: null,
        data: { outcome: groupPolicy === 'throw' ? 'throw' : 'skip', policy: groupPolicy }
      });
      if (rollbackErr) throw rollbackErr;
      if (groupPolicy === 'throw') throw e;
      return 0;
    }
    return applied.length;
  }

  // 1. lazy native values for sampleRate/baseLatency (avoid eager AudioContext init)// let sampleRateSource =;  0=default, 1=offline, 2=audio
  let nativeSampleRate = 44100, nativeBaseLatency = 0.0029;
  let sampleRateSource = 0;
  let baseLatencySource = 0;

  // 2. Actual list of classes for patch (AudioContext + webkit aliases)
  const CTX_CLASSES = [
    window.AudioContext,
    window.webkitAudioContext,
  ].filter(Boolean);

  const __seenProtos = new WeakSet();
  let __totalTargets = 0;
  let __totalApplied = 0;

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
    if (sampleRateDesc && typeof sampleRateDesc.get === 'function' && canRedefine(proto, 'sampleRate', CTX_NAME)) {
      targets.push({
        owner: proto,
        key: 'sampleRate',
        kind: 'accessor',
        wrapLayer: 'named_wrapper_strict',
        resolve: 'proto_chain',
        policy: 'strict',
        diagTag: `audio:${CTX_NAME}:sampleRate`,
        allowCreate: true,
        configurable: sampleRateDesc ? !!sampleRateDesc.configurable : true,
          enumerable: sampleRateDesc ? !!sampleRateDesc.enumerable : false,
          invalidThis: 'throw',
          getImpl: function audioSampleRateGet(origGet) {
            let v;
            try {
              v = Reflect.apply(origGet, this, []);
            } catch (e) {
              degrade('audiocontext:sampleRate:native_throw', e, {
                stage: 'runtime',
                level: 'warn',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:sampleRate`,
                key: 'sampleRate',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            if (Number.isFinite(v) && priority >= sampleRateSource) { nativeSampleRate = v; sampleRateSource = priority; }
            return v;
          }
        });
    }
    if ('baseLatency' in proto) {
      const baseLatencyDesc = Object.getOwnPropertyDescriptor(proto, 'baseLatency') || getPropDescriptorDeep(proto, 'baseLatency');
      if (baseLatencyDesc && typeof baseLatencyDesc.get === 'function' && canRedefine(proto, 'baseLatency', CTX_NAME)) {
        targets.push({
          owner: proto,
          key: 'baseLatency',
          kind: 'accessor',
          wrapLayer: 'named_wrapper_strict',
          resolve: 'proto_chain',
          policy: 'strict',
          diagTag: `audio:${CTX_NAME}:baseLatency`,
          allowCreate: true,
          configurable: baseLatencyDesc ? !!baseLatencyDesc.configurable : true,
          enumerable: baseLatencyDesc ? !!baseLatencyDesc.enumerable : false,
          invalidThis: 'throw',
          getImpl: function audioBaseLatencyGet(origGet) {
            let v;
            try {
              v = Reflect.apply(origGet, this, []);
            } catch (e) {
              degrade('audiocontext:baseLatency:native_throw', e, {
                stage: 'runtime',
                level: 'warn',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:baseLatency`,
                key: 'baseLatency',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            if (Number.isFinite(v) && priority >= baseLatencySource) { nativeBaseLatency = v; baseLatencySource = priority; }
            return v;
          }
        });
      }
    }


    const dCreateBuffer = Object.getOwnPropertyDescriptor(proto, 'createBuffer') || getPropDescriptorDeep(proto, 'createBuffer');
    if (dCreateBuffer && typeof dCreateBuffer.value === 'function' && canReplaceMethod(proto, 'createBuffer', CTX_NAME)) {
      targets.push({
        owner: proto,
        key: 'createBuffer',
        kind: 'method',
        wrapLayer: 'core_wrapper',
        resolve: 'proto_chain',
        invokeClass: 'brand_strict',
        policy: 'skip',
        diagTag: `audio:${CTX_NAME}:createBuffer`,
        allowCreate: true,
        validThis: validAudioContextThis,
        invalidThis: 'throw',
        invoke: function audioCreateBufferInvoke(orig, args) {
          const input = Array.isArray(args) ? args : [];
          try {
            return Reflect.apply(orig, this, input);
          } catch (e) {
            degrade('audiocontext:createBuffer:native_throw', e, {
              stage: 'runtime',
              level: 'warn',
              type: __audioTypeBrowser,
              diagTag: `audio:${CTX_NAME}:createBuffer`,
              key: 'createBuffer',
              data: { outcome: 'throw', reason: 'native_throw' }
            });
            throw e;
          }
        }
      });
    }

  // 5. patch AnalyserNode (preserveing invariants)
  const dCreateAnalyser = Object.getOwnPropertyDescriptor(proto, 'createAnalyser') || getPropDescriptorDeep(proto, 'createAnalyser');
  if (AUDIO_NOISE_ENABLED && dCreateAnalyser && typeof dCreateAnalyser.value === 'function' && canReplaceMethod(proto, 'createAnalyser', CTX_NAME)) {
    targets.push({
      owner: proto,
      key: 'createAnalyser',
      kind: 'method',
      wrapLayer: 'core_wrapper',
      resolve: 'proto_chain',
      invokeClass: 'brand_strict',
      policy: 'skip',
      diagTag: `audio:${CTX_NAME}:createAnalyser`,
      allowCreate: true,
      validThis: validAudioContextThis,
      invalidThis: 'throw',
      invoke: function audioCreateAnalyserInvoke(orig, args) {
        const input = Array.isArray(args) ? args : [];
        let analyser;
        try {
          analyser = Reflect.apply(orig, this, input);
        } catch (e) {
          degrade('audiocontext:createAnalyser:native_throw', e, {
            stage: 'runtime',
            level: 'warn',
            type: __audioTypeBrowser,
            diagTag: `audio:${CTX_NAME}:createAnalyser`,
            key: 'createAnalyser',
            data: { outcome: 'throw', reason: 'native_throw' }
          });
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
              degrade('audiocontext:analyser:byte_freq_native_throw', e, {
                stage: 'runtime',
                level: 'warn',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteFrequencyData',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            if (!AUDIO_NOISE_ENABLED) return result;
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
              degrade('audiocontext:analyser:byte_freq_noise_failed', e, {
                stage: 'hook',
                level: 'warn',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteFrequencyData',
                data: { outcome: 'skip', reason: 'byte_freq_noise_failed' }
              });
            }
            return result;
          }
        }], 'skip');
      } else {
        noteIssue('missing_method:getByteFrequencyData', CTX_NAME);
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
              degrade('audiocontext:analyser:float_freq_native_throw', e, {
                stage: 'runtime',
                level: 'warn',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatFrequencyData',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            if (!AUDIO_NOISE_ENABLED) return result;
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
              degrade('audiocontext:analyser:float_freq_noise_failed', e, {
                stage: 'hook',
                level: 'warn',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatFrequencyData',
                data: { outcome: 'skip', reason: 'float_freq_noise_failed' }
              });
            }
            return result;
          }
        }], 'skip');
      } else {
        noteIssue('missing_method:getFloatFrequencyData', CTX_NAME);
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
              degrade('audiocontext:analyser:byte_time_native_throw', e, {
                stage: 'runtime',
                level: 'warn',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteTimeDomainData',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            if (!AUDIO_NOISE_ENABLED) return result;
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
              degrade('audiocontext:analyser:byte_time_noise_failed', e, {
                stage: 'hook',
                level: 'warn',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getByteTimeDomainData',
                data: { outcome: 'skip', reason: 'byte_time_noise_failed' }
              });
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
              degrade('audiocontext:analyser:float_time_native_throw', e, {
                stage: 'runtime',
                level: 'warn',
                type: __audioTypeBrowser,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatTimeDomainData',
                data: { outcome: 'throw', reason: 'native_throw' }
              });
              throw e;
            }
            if (!AUDIO_NOISE_ENABLED) return result;
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
              degrade('audiocontext:analyser:float_time_noise_failed', e, {
                stage: 'hook',
                level: 'warn',
                type: __audioTypePipeline,
                diagTag: `audio:${CTX_NAME}:analyser`,
                key: 'AnalyserNode.getFloatTimeDomainData',
                data: { outcome: 'skip', reason: 'float_time_noise_failed' }
              });
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

    emitDegrade('info', __tag + ':ready', null, {
      stage: 'apply',
      key: null,
      message: 'ok',
      type: 'ok',
      data: { outcome: 'return', ctxClasses: CTX_CLASSES.length, targets: __totalTargets, applied: __totalApplied }
    });
  } catch (e) {
    const rollbackErr = e;
    __D?.diag?.('error', __tag + ':fatal', {
      module: __tag,
      diagTag: __tag,
      surface: __surface,
      key: null,
      stage: 'apply',
      message: 'fatal module error',
      type: __audioTypeBrowser,
      data: { outcome: 'throw', reason: 'fatal', rollbackOk: false }
    }, rollbackErr);
    try {
      if (__core && typeof __core.releaseGuardFlag === 'function') {
        __core.releaseGuardFlag(__flagKey, __guardToken, false, __tag);
      }
    } catch (eRelease) {
      __D?.diag?.('warn', __tag + ':guard_release_failed', {
        module: __tag,
        diagTag: __tag,
        surface: __surface,
        key: __flagKey,
        stage: 'rollback',
        message: 'releaseGuardFlag threw after apply failure',
        type: __audioTypePipeline,
        data: { outcome: 'skip', reason: 'guard_release_failed' }
      }, eRelease);
    }
    throw rollbackErr;
  }

  // Snapshot variant: do not touch OfflineAudioContext.startRendering.
};
