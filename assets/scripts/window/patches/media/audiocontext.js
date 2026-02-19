const AudioContextModule = function AudioContextModule(window) {
  if (globalThis.__AUDIO_CTX_PATCH_APPLIED__) return;

  const __audioTypePipeline = 'pipeline missing data';
  const __audioTypeBrowser = 'browser structure missing data';
  const __audioDegrade = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  const __audioDegradeDiag = (__audioDegrade && typeof __audioDegrade.diag === 'function')
    ? __audioDegrade.diag.bind(__audioDegrade)
    : null;

  function emitDegrade(level, code, err, extra) {
    const d = __audioDegrade;
    if (typeof d !== 'function') return;

    const e = (err instanceof Error)
      ? err
      : (err == null ? null : new Error(String(err)));

    const x = (extra && typeof extra === 'object') ? extra : {};
    const normalizedLevel = (level === 'info' || level === 'warn' || level === 'error' || level === 'fatal')
      ? level
      : 'info';
    const normalizedCode = code || 'audiocontext';

    const ctx = {
      module: 'audiocontext',
      diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'audiocontext',
      surface: 'audio',
      key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
      stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
      message: (typeof x.message === 'string' && x.message) ? x.message : normalizedCode,
      data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
      type: (typeof x.type === 'string' && x.type) ? x.type : __audioTypePipeline
    };

    if (__audioDegradeDiag) {
      try {
        __audioDegradeDiag(normalizedLevel, normalizedCode, ctx, e || null);
      } catch (diagErr) {
        try {
          d('audiocontext:degrade_diag_failed', (diagErr instanceof Error) ? diagErr : new Error(String(diagErr)), {
            level: 'error',
            module: ctx.module,
            diagTag: ctx.diagTag,
            surface: ctx.surface,
            key: ctx.key,
            stage: 'diag',
            message: '__DEGRADE__.diag failed',
            data: { originalCode: normalizedCode },
            type: __audioTypePipeline
          });
        } catch (fallbackErr) {
          globalThis.__AUDIO_CTX_LAST_DEGRADE_EMIT_ERROR__ = {
            stage: 'diag_fallback',
            code: normalizedCode,
            diagError: String(diagErr && diagErr.message ? diagErr.message : diagErr),
            fallbackError: String(fallbackErr && fallbackErr.message ? fallbackErr.message : fallbackErr),
            at: Date.now()
          };
        }
      }
      return;
    }

    try {
      d(normalizedCode, e || null, {
        level: normalizedLevel,
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
      globalThis.__AUDIO_CTX_LAST_DEGRADE_EMIT_ERROR__ = {
        stage: 'emit',
        code: normalizedCode,
        emitError: String(emitErr && emitErr.message ? emitErr.message : emitErr),
        at: Date.now()
      };
    }
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
      key: 'CanvasPatchContext'
    });
    return;
  }

  const rand = window.rand;
  if (!rand || typeof rand.use !== 'function') {
    degrade('audiocontext:rand_missing', new Error('[AudioContextPatch] rand.use missing'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'rand.use'
    });
    return;
  }
  let R = null;
  try {
    R = rand.use('audio');
  } catch (e) {
    degrade('audiocontext:rand_use_failed', e, { stage: 'preflight', level: 'fatal', type: __audioTypePipeline, key: 'rand.use(audio)' });
    return;
  }
  if (typeof R !== 'function') {
    degrade('audiocontext:rand_use_not_function', new Error('[AudioContextPatch] rand.use("audio") is not a function'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'rand.use(audio)'
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
        key: 'markAsNative'
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
      key: '__safeDefine'
    });
    return;
  }
  if (typeof __wrapNativeApply !== 'function') {
    degrade('audiocontext:wrap_native_apply_missing', new Error('[AudioContextPatch] __wrapNativeApply missing'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: '__wrapNativeApply'
    });
    return;
  }
  if (typeof __wrapNativeAccessor !== 'function') {
    degrade('audiocontext:wrap_native_accessor_missing', new Error('[AudioContextPatch] __wrapNativeAccessor missing'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: '__wrapNativeAccessor'
    });
    return;
  }
  if (typeof __coreApplyTargets !== 'function') {
    degrade('audiocontext:core_apply_targets_missing', new Error('[AudioContextPatch] Core.applyTargets is required'), {
      stage: 'preflight',
      level: 'fatal',
      type: __audioTypePipeline,
      key: 'Core.applyTargets'
    });
    return;
  }
  const AUDIO_NOISE_ENABLED = true;

  globalThis.__AUDIO_CTX_PATCH_APPLIED__ = true;

  const GUARD = globalThis.__AUDIO_CTX_GUARD__ || (globalThis.__AUDIO_CTX_GUARD__ = {
    counts: {},
    last: null
  });

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
      data: detail || null,
      type
    });
  }
  function ensurePreflight(owner, key, kind, ctxName) {
    if (typeof __corePreflightTarget !== 'function') return true;
    let pre = null;
    const tag = `audio:${ctxName || 'module'}:${String(key)}`;
    try {
      pre = __corePreflightTarget({
        owner,
        key,
        kind,
        resolve: 'proto_chain',
        policy: 'throw',
        diagTag: tag
      });
    } catch (e) {
      degrade('audiocontext:preflight_exception', e, { stage: 'preflight', level: 'error', type: __audioTypePipeline, diagTag: tag, key: String(key) });
      return false;
    }
    if (!pre || pre.ok !== true) {
      const reason = pre && pre.reason ? pre.reason : 'preflight_failed';
      const err = (pre && pre.error instanceof Error) ? pre.error : new Error(`[AudioContextPatch] preflight failed for ${String(key)}`);
      degrade('audiocontext:' + reason, err, {
        stage: 'preflight',
        level: 'error',
        type: __audioTypeBrowser,
        diagTag: tag,
        key: String(key),
        data: { reason: reason, kind: kind, ctxName: ctxName || null }
      });
      return false;
    }
    return true;
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

  // Create non-constructible accessors/methods (match native layout)
  function makeGetter(prop, impl) {
    const holder = ({ get [prop]() { return impl.call(this); } });
    return Object.getOwnPropertyDescriptor(holder, prop).get;
  }
  function makeMethod(name, impl) {
    return (function() {
      switch (impl.length) {
        case 0: return ({ [name]() { return impl.apply(this, arguments); } })[name];
        case 1: return ({ [name](a0) { return impl.apply(this, arguments); } })[name];
        case 2: return ({ [name](a0, a1) { return impl.apply(this, arguments); } })[name];
        case 3: return ({ [name](a0, a1, a2) { return impl.apply(this, arguments); } })[name];
        default: return ({ [name](...args) { return impl.apply(this, args); } })[name];
      }
    })();
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
      degrade(groupTag + ':preflight_failed', e, { stage: 'preflight', level: 'error', type: __audioTypePipeline, diagTag: groupTag, key: null });
      if (groupPolicy === 'throw') throw e;
      return 0;
    }

    if (!Array.isArray(plans) || !plans.length) {
      const reason = plans && plans.reason ? plans.reason : 'group_skipped';
      const err = new Error('[AudioContextPatch] target group skipped: ' + reason);
      degrade(groupTag + ':' + reason, err, { stage: 'preflight', level: 'warn', type: __audioTypeBrowser, diagTag: groupTag, key: null, data: { reason: reason } });
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
    } catch (e) {
      let rollbackErr = null;
      for (let i = applied.length - 1; i >= 0; i--) {
        const p = applied[i];
        try {
          if (p.origDesc) Object.defineProperty(p.owner, p.key, p.origDesc);
          else delete p.owner[p.key];
        } catch (re) {
          if (!rollbackErr) rollbackErr = re;
          degrade(groupTag + ':rollback_failed', re, { stage: 'rollback', level: 'error', type: __audioTypeBrowser, diagTag: groupTag, key: p.key });
        }
      }
      degrade(groupTag + ':apply_failed', e, { stage: 'apply', level: 'error', type: __audioTypeBrowser, diagTag: groupTag, key: null });
      if (groupPolicy === 'throw') {
        if (rollbackErr) throw rollbackErr;
        throw e;
      }
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

  for (const CTX of CTX_CLASSES) {
    const proto = CTX.prototype;
    if (__seenProtos.has(proto)) continue;
    __seenProtos.add(proto);
    const CTX_NAME = CTX && CTX.name ? CTX.name : 'AudioContext';
    const priority = (CTX === window.AudioContext || CTX === window.webkitAudioContext) ? 2 : 1;
    const targets = [];

    // 3. patch sampleRate/baseLatency: accessor patch via CORE targets
    const sampleRateDesc = Object.getOwnPropertyDescriptor(proto, 'sampleRate') || getPropDescriptorDeep(proto, 'sampleRate');
    if (sampleRateDesc && typeof sampleRateDesc.get === 'function' && canRedefine(proto, 'sampleRate', CTX_NAME)) {
      targets.push({
        owner: proto,
        key: 'sampleRate',
        kind: 'accessor',
        wrapLayer: 'core_wrapper',
        resolve: 'proto_chain',
        policy: 'throw',
        diagTag: `audio:${CTX_NAME}:sampleRate`,
        allowCreate: true,
        configurable: sampleRateDesc ? !!sampleRateDesc.configurable : true,
        enumerable: sampleRateDesc ? !!sampleRateDesc.enumerable : false,
        invalidThis: 'throw',
        getImpl: function audioSampleRateGet(origGet) {
          const v = Reflect.apply(origGet, this, []);
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
          wrapLayer: 'core_wrapper',
          resolve: 'proto_chain',
          policy: 'throw',
          diagTag: `audio:${CTX_NAME}:baseLatency`,
          allowCreate: true,
          configurable: baseLatencyDesc ? !!baseLatencyDesc.configurable : true,
          enumerable: baseLatencyDesc ? !!baseLatencyDesc.enumerable : false,
          invalidThis: 'throw',
          getImpl: function audioBaseLatencyGet(origGet) {
            const v = Reflect.apply(origGet, this, []);
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
        policy: 'throw',
        diagTag: `audio:${CTX_NAME}:createBuffer`,
        allowCreate: true,
        invalidThis: 'throw',
        invoke: function audioCreateBufferInvoke(orig, args) {
          const input = Array.isArray(args) ? args : [];
          return Reflect.apply(orig, this, input);
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
      policy: 'throw',
      diagTag: `audio:${CTX_NAME}:createAnalyser`,
      allowCreate: true,
      invalidThis: 'throw',
      invoke: function audioCreateAnalyserInvoke(orig, args) {
        const input = Array.isArray(args) ? args : [];
        const analyser = Reflect.apply(orig, this, input);
        if (!analyser || (typeof analyser !== 'object' && typeof analyser !== 'function')) return analyser;

      // --- Byte Spectrum: discrete ±1/0 with compensation of the summ ---
      const origByte = analyser.getByteFrequencyData;
      if (typeof origByte === 'function') {
        analyser.getByteFrequencyData = markAsNative(makeMethod('getByteFrequencyData', function(array) {
          Reflect.apply(origByte, this, [array]);
          if (!AUDIO_NOISE_ENABLED) return;
          try {
            let delta = 0;
            const n = array.length | 0;
            for (let i = 0; i < n; i++) {
              const r = R();
              let d = (r < 1/3) ? -1 : (r > 2/3 ? 1 : 0);
              const v = array[i], nv = v + d;
              if (nv >= 0 && nv <= 255) { array[i] = nv; delta += d; }
            }
            if (delta !== 0) {
              if (delta > 0) { // take away
                for (let i = 0; i < n && delta > 0; i++) if (array[i] > 0) { array[i] -= 1; delta--; }
              } else { // add
                delta = -delta;
                for (let i = 0; i < n && delta > 0; i++) if (array[i] < 255) { array[i] += 1; delta--; }
              }
            }
          } catch (e) {
            degrade('audiocontext:analyser:byte_freq_noise_failed', e, { stage: 'runtime', level: 'warn', type: __audioTypePipeline, diagTag: `audio:${CTX_NAME}:analyser`, key: 'AnalyserNode.getByteFrequencyData' });
          }
        }), 'getByteFrequencyData');
      } else {
        noteIssue('missing_method:getByteFrequencyData', CTX_NAME);
      }

      // --- Float Spectrum: pair of zero summary noise, without going out for [min,max] ---
      const origFloat = analyser.getFloatFrequencyData;
      if (typeof origFloat === 'function') {
        analyser.getFloatFrequencyData = markAsNative(makeMethod('getFloatFrequencyData', function(array) {
          Reflect.apply(origFloat, this, [array]);
          if (!AUDIO_NOISE_ENABLED) return;
          try {
            const lo = (typeof this.minDecibels === 'number') ? this.minDecibels : -100;
            const hi = (typeof this.maxDecibels === 'number') ? this.maxDecibels : -30;
            const n  = array.length | 0;
            if (!n) return;

            //The amplitude of the noise expressed through its own parameters of the node
            const range = Math.max(1e-9, hi - lo);
            const baseAmp = range * (typeof this.smoothingTimeConstant === 'number' ? this.smoothingTimeConstant : 0.8)
                                  / Math.max(1, (this.fftSize || 2048) * 0.5);

            // pair scheme: delta_i = -delta_j => the amount is exactly 0; additionly, limiting the local gap to the boundaries
            const tiny = range / 1e6; //technically "do not touch" the edge - from the same units as the data
            for (let i = 0, j = n - 1; i < j; i++, j--) {
              const vi = array[i], vj = array[j];
              // local permited step so as not to touch the boundaries
              const lim_i = Math.max(0, Math.min(vi - lo, hi - vi) - tiny);
              const lim_j = Math.max(0, Math.min(vj - lo, hi - vj) - tiny);
              const amp   = Math.min(baseAmp, lim_i, lim_j);
              if (amp <= 0) continue;

              const d = (R() - 0.5) * 2 * amp; // Symmetric noise
              array[i] = vi + d;
              array[j] = vj - d;               // Antinoise - total is 0

              //numerical error insurance at the very edges
              if (array[i] < lo) array[i] = lo; else if (array[i] > hi) array[i] = hi;
              if (array[j] < lo) array[j] = lo; else if (array[j] > hi) array[j] = hi;
            }
            //The odd middle — without noise (as not to break the zero amount)
          } catch (e) {
            degrade('audiocontext:analyser:float_freq_noise_failed', e, { stage: 'runtime', level: 'warn', type: __audioTypePipeline, diagTag: `audio:${CTX_NAME}:analyser`, key: 'AnalyserNode.getFloatFrequencyData' });
          }
        }), 'getFloatFrequencyData');
      } else {
        noteIssue('missing_method:getFloatFrequencyData', CTX_NAME);
      }

      // --- Byte time-domain: paired±1 (The sum preserved) carefully [0..255] ---
      const origByteTD = analyser.getByteTimeDomainData;
      if (typeof origByteTD === 'function') {
        analyser.getByteTimeDomainData = markAsNative(makeMethod('getByteTimeDomainData', function(array) {
          Reflect.apply(origByteTD, this, [array]);
          if (!AUDIO_NOISE_ENABLED) return;
          try {
            const n = array.length | 0;
            for (let i = 0, j = n - 1; i < j; i++, j--) {
              const vi = array[i], vj = array[j];
              //Choose a sign so that not one goes beyond
              let s = (R() < 0.5) ? 1 : -1;
              const can_i = (vi + s) >= 0 && (vi + s) <= 255;
              const can_j = (vj - s) >= 0 && (vj - s) <= 255;
              if (can_i && can_j) {
                array[i] = vi + s;
                array[j] = vj - s; // сумма по паре = 0
              } else {
                // пробуем обратный знак
                s = -s;
                const can_i2 = (vi + s) >= 0 && (vi + s) <= 255;
                const can_j2 = (vj - s) >= 0 && (vj - s) <= 255;
                if (can_i2 && can_j2) {
                  array[i] = vi + s;
                  array[j] = vj - s;
                }
                // If not, we miss a couple
              }
            }
          } catch (e) {
            degrade('audiocontext:analyser:byte_time_noise_failed', e, { stage: 'runtime', level: 'warn', type: __audioTypePipeline, diagTag: `audio:${CTX_NAME}:analyser`, key: 'AnalyserNode.getByteTimeDomainData' });
          }
        }), 'getByteTimeDomainData');
      }

      // --- Float time-domain: pair zero-summary noise within [-1..1] ---
      const origFloatTD = analyser.getFloatTimeDomainData;
      if (typeof origFloatTD === 'function') {
        analyser.getFloatTimeDomainData = markAsNative(makeMethod('getFloatTimeDomainData', function(array) {
          Reflect.apply(origFloatTD, this, [array]);
          if (!AUDIO_NOISE_ENABLED) return;
          const n = array.length | 0;
          if (!n) return;

          // amplitude "from content": The wider the current scope, the more you can make noise,
          // normalize through fftSize/smoothingTimeConstant
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
            degrade('audiocontext:analyser:float_time_noise_failed', e, { stage: 'runtime', level: 'warn', type: __audioTypePipeline, diagTag: `audio:${CTX_NAME}:analyser`, key: 'AnalyserNode.getFloatTimeDomainData' });
          }
        }), 'getFloatTimeDomainData');
      }

      return analyser;
      }
    });
  }


    applyCoreTargetsGroup(`audiocontext:${CTX_NAME}:proto`, targets, 'skip');
  }

  // Snapshot variant: do not touch OfflineAudioContext.startRendering.
};
