const AudioContextModule = function AudioContextModule(window) {
  if (globalThis.__AUDIO_CTX_PATCH_APPLIED__) return;
  globalThis.__AUDIO_CTX_PATCH_APPLIED__ = true;

  const C = window.CanvasPatchContext;
    if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
  const R = window.rand.use('audio');
  const markAsNative = (function() {
    const ensure = (typeof window.__ensureMarkAsNative === 'function') ? window.__ensureMarkAsNative : null;
    const m = ensure ? ensure() : null;
    if (typeof m !== 'function') {
      throw new Error('[AudioContextPatch] markAsNative missing');
    }
    return m;
  })();
  const safeDefine = (typeof window.__safeDefine === 'function') ? window.__safeDefine : null;
  const __wrapNativeApply = (typeof window.__wrapNativeApply === 'function') ? window.__wrapNativeApply : null;
  const __wrapNativeAccessor = (typeof window.__wrapNativeAccessor === 'function') ? window.__wrapNativeAccessor : null;
  const __corePreflightTarget = (window.Core && typeof window.Core.preflightTarget === 'function')
    ? window.Core.preflightTarget
    : null;
  if (typeof safeDefine !== 'function') throw new Error('[AudioContextPatch] __safeDefine missing');
  if (typeof __wrapNativeApply !== 'function') throw new Error('[AudioContextPatch] __wrapNativeApply missing');
  if (typeof __wrapNativeAccessor !== 'function') throw new Error('[AudioContextPatch] __wrapNativeAccessor missing');
  const AUDIO_NOISE_ENABLED = true;
  const __audioDegrade = (typeof window.__DEGRADE__ === 'function') ? window.__DEGRADE__ : null;
  const __audioDegradeDiag = (__audioDegrade && typeof __audioDegrade.diag === 'function')
    ? __audioDegrade.diag.bind(__audioDegrade)
    : null;

  const GUARD = globalThis.__AUDIO_CTX_GUARD__ || (globalThis.__AUDIO_CTX_GUARD__ = {
    counts: {},
    last: null
  });

  function noteIssue(code, detail) {
    const key = String(code);
    GUARD.counts[key] = (GUARD.counts[key] || 0) + 1;
    GUARD.last = { code: key, detail: detail || null, at: Date.now() };
    const ctx = {
      module: 'audiocontext',
      diagTag: 'audio_guard',
      surface: 'audio',
      key,
      stage: 'guard',
      message: key,
      data: detail || null,
      type: 'pipeline missing data'
    };
    if (__audioDegradeDiag) {
      try { __audioDegradeDiag('warn', 'audiocontext:' + key, ctx, null); } catch (_) {}
      return;
    }
    if (typeof __audioDegrade === 'function') {
      try { __audioDegrade('audiocontext:' + key, null, ctx); } catch (_) {}
    }
  }
  function ensurePreflight(owner, key, kind, ctxName) {
    if (typeof __corePreflightTarget !== 'function') return true;
    const pre = __corePreflightTarget({
      owner,
      key,
      kind,
      resolve: 'proto_chain',
      policy: 'throw',
      diagTag: `audio:${ctxName || 'module'}:${String(key)}`
    });
    if (!pre || pre.ok !== true) {
      const reason = pre && pre.reason ? pre.reason : 'preflight_failed';
      noteIssue(`${reason}:${key}`, ctxName || null);
      const err = (pre && pre.error instanceof Error) ? pre.error : new Error(`[AudioContextPatch] preflight failed for ${String(key)}`);
      throw err;
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

  // 1. lazy native values for sampleRate/baseLatency (avoid eager AudioContext init)// let sampleRateSource =;  0=default, 1=offline, 2=audio
  let nativeSampleRate = 44100, nativeBaseLatency = 0.0029;
  let sampleRateSource = 0;
  let baseLatencySource = 0;

  function maybeUpdateRates(self, origSampleGet, origBaseGet, priority) {
    if (typeof origSampleGet === 'function' && priority >= sampleRateSource) {
      const v = Reflect.apply(origSampleGet, self, []);
      if (Number.isFinite(v)) {
        nativeSampleRate = v;
        sampleRateSource = priority;
      }
    }
    if (typeof origBaseGet === 'function' && priority >= baseLatencySource) {
      const v = Reflect.apply(origBaseGet, self, []);
      if (Number.isFinite(v)) {
        nativeBaseLatency = v;
        baseLatencySource = priority;
      }
    }
  }

  // 2. Actual list of classes for patch (AudioContext + OfflineAudioContext + webkit aliases)
  const CTX_CLASSES = [
    window.AudioContext,
    window.webkitAudioContext,
    window.OfflineAudioContext,
    window.webkitOfflineAudioContext
  ].filter(Boolean);

  const __seenProtos = new WeakSet();

  for (const CTX of CTX_CLASSES) {
    const proto = CTX.prototype;
    if (__seenProtos.has(proto)) continue;
    __seenProtos.add(proto);
    const CTX_NAME = CTX && CTX.name ? CTX.name : 'AudioContext';
    const priority = (CTX === window.AudioContext || CTX === window.webkitAudioContext) ? 2 : 1;

    // 3. patch sampleRate/baseLatency: wrap native accessor to preserve native shape
    const sampleRateDesc = Object.getOwnPropertyDescriptor(proto, 'sampleRate') || getPropDescriptorDeep(proto, 'sampleRate');
    if (sampleRateDesc && typeof sampleRateDesc.get === 'function' && canRedefine(proto, 'sampleRate', CTX_NAME)) {
      ensurePreflight(proto, 'sampleRate', 'accessor', CTX_NAME);
      const origSampleGet = sampleRateDesc.get;
      const getSampleRate = __wrapNativeAccessor(origSampleGet, 'get sampleRate', function(target, thisArg, argList) {
        const v = Reflect.apply(target, thisArg, []);
        if (Number.isFinite(v) && priority >= sampleRateSource) { nativeSampleRate = v; sampleRateSource = priority; }
        return v;
      });
      Object.defineProperty(proto, 'sampleRate', {
        get: getSampleRate,
        set: sampleRateDesc.set,
        configurable: sampleRateDesc ? !!sampleRateDesc.configurable : true,
        enumerable: sampleRateDesc ? !!sampleRateDesc.enumerable : false
      });
    }
    if ('baseLatency' in proto) {
      const baseLatencyDesc = Object.getOwnPropertyDescriptor(proto, 'baseLatency') || getPropDescriptorDeep(proto, 'baseLatency');
      if (baseLatencyDesc && typeof baseLatencyDesc.get === 'function' && canRedefine(proto, 'baseLatency', CTX_NAME)) {
        ensurePreflight(proto, 'baseLatency', 'accessor', CTX_NAME);
        const origBaseGet = baseLatencyDesc.get;
        const getBaseLatency = __wrapNativeAccessor(origBaseGet, 'get baseLatency', function(target, thisArg, argList) {
          const v = Reflect.apply(target, thisArg, []);
          if (Number.isFinite(v) && priority >= baseLatencySource) { nativeBaseLatency = v; baseLatencySource = priority; }
          return v;
        });
        Object.defineProperty(proto, 'baseLatency', {
          get: getBaseLatency,
          set: baseLatencyDesc.set,
          configurable: baseLatencyDesc ? !!baseLatencyDesc.configurable : true,
          enumerable: baseLatencyDesc ? !!baseLatencyDesc.enumerable : false
        });
      }
    }


    // 4. patch createBuffer (descriptor-strict): wrap native method via Core wrapper
    const dCreateBuffer = Object.getOwnPropertyDescriptor(proto, 'createBuffer') || getPropDescriptorDeep(proto, 'createBuffer');
    if (dCreateBuffer && typeof dCreateBuffer.value === 'function' && canReplaceMethod(proto, 'createBuffer', CTX_NAME)) {
      ensurePreflight(proto, 'createBuffer', 'method', CTX_NAME);
      const origCreateBuffer = dCreateBuffer.value;
      const wrappedCreateBuffer = __wrapNativeApply(origCreateBuffer, 'createBuffer', function(target, thisArg, argList) {
        return Reflect.apply(target, thisArg, argList);
      });
      safeDefine(proto, 'createBuffer', {
        value: wrappedCreateBuffer,
        writable: !!dCreateBuffer.writable,
        configurable: !!dCreateBuffer.configurable,
        enumerable: !!dCreateBuffer.enumerable
      });
      console.log('[AudioContextPatch] Patched createBuffer on', CTX_NAME);
    }

  // 5. patch AnalyserNode (preserveing invariants)
  if (AUDIO_NOISE_ENABLED && typeof proto.createAnalyser === 'function' && canReplaceMethod(proto, 'createAnalyser', CTX_NAME)) {
    ensurePreflight(proto, 'createAnalyser', 'method', CTX_NAME);
    const origCreateAnalyser = proto.createAnalyser;
    proto.createAnalyser = markAsNative(makeMethod('createAnalyser', function() {
      const analyser = origCreateAnalyser.call(this);

      // --- Byte Spectrum: discrete ±1/0 with compensation of the summ ---
      const origByte = analyser.getByteFrequencyData;
      analyser.getByteFrequencyData = markAsNative(makeMethod('getByteFrequencyData', function(array) {
        Reflect.apply(origByte, this, [array]);
        if (!AUDIO_NOISE_ENABLED) return;
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
      }), 'getByteFrequencyData');

      // --- Float Spectrum: pair of zero summary noise, without going out for [min,max] ---
      const origFloat = analyser.getFloatFrequencyData;
      analyser.getFloatFrequencyData = markAsNative(makeMethod('getFloatFrequencyData', function(array) {
        Reflect.apply(origFloat, this, [array]);
        if (!AUDIO_NOISE_ENABLED) return;
        const lo = (typeof this.minDecibels === 'number') ? this.minDecibels : -100;
        const hi = (typeof this.maxDecibels === 'number') ? this.maxDecibels : -30;
        const n  = array.length | 0;
        if (!n) return;

        //The amplitude of the noise expressed through its own parameters of the node
        const range = Math.max(1e-9, hi - lo);
        const baseAmp = range * (typeof this.smoothingTimeConstant === 'number' ? this.smoothingTimeConstant : 0.8)
                              / Math.max(1, this.fftSize || 2048);

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
      }), 'getFloatFrequencyData');

      // --- Byte time-domain: paired±1 (The sum preserved) carefully [0..255] ---
      const origByteTD = analyser.getByteTimeDomainData;
      if (typeof origByteTD === 'function') {
        analyser.getByteTimeDomainData = markAsNative(makeMethod('getByteTimeDomainData', function(array) {
          Reflect.apply(origByteTD, this, [array]);
          if (!AUDIO_NOISE_ENABLED) return;
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
        }), 'getFloatTimeDomainData');
      }

      return analyser;
    }), 'createAnalyser');
  }


  // 6.Patch OfflineAudioContext (add noise)
  if (AUDIO_NOISE_ENABLED && typeof OfflineAudioContext.prototype.startRendering === 'function') {
      const dStart = Object.getOwnPropertyDescriptor(OfflineAudioContext.prototype, 'startRendering');
      const origStartRendering = dStart && dStart.value;
      if (typeof origStartRendering === 'function' && canReplaceMethod(OfflineAudioContext.prototype, 'startRendering', 'OfflineAudioContext')) {
        ensurePreflight(OfflineAudioContext.prototype, 'startRendering', 'promise_method', 'OfflineAudioContext');
        const wrappedStartRendering = __wrapNativeApply(origStartRendering, 'startRendering', function(target, thisArg, argList) {
          const p = Reflect.apply(target, thisArg, argList);
          if (!p || typeof p.then !== 'function') return p;
          return p.then(buffer => addNoiseToRenderBuffer(buffer));
        });
        safeDefine(OfflineAudioContext.prototype, 'startRendering', {
          value: wrappedStartRendering,
          writable: dStart ? !!dStart.writable : true,
          configurable: dStart ? !!dStart.configurable : true,
          enumerable: dStart ? !!dStart.enumerable : false
        });
      }
  }


  // 7. noise in renderBuffer
  function addNoiseToRenderBuffer(buffer) {
      if (!buffer || typeof buffer.getChannelData !== 'function') return buffer;
      if (!AUDIO_NOISE_ENABLED) return buffer;
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
          const data = buffer.getChannelData(ch);
          for (let i = 0; i < data.length; i++) {
              // Can be combined - part is more likely, part with less
              if (R() < 0.1) data[i] += (R() - 0.5) * 0.005;
              if (ch === 0 && R() < 0.025) data[i] += (R() - 0.5) * 0.003;
          }
      }
      return buffer;
  }
}
} 
