function AudioContextModule() {
  if (!window.__PATCH_AUDIOCONTEXT__) {
  window.__PATCH_AUDIOCONTEXT__ = true;
  const C = window.CanvasPatchContext;
    if (!C) throw new Error('[CanvasPatch] CanvasPatchContext is undefined — module registration is not available');
  const R = window.rand.use('audio');

  // 1. get original values for sampleRate/baseLatency
  let nativeSampleRate = 44100, nativeBaseLatency = 0.0029;
  const ctx = window.AudioContext ? new window.AudioContext() : new window.OfflineAudioContext(1, 1, 44100);
  nativeSampleRate = ctx.sampleRate;
  if ('baseLatency' in ctx) nativeBaseLatency = ctx.baseLatency;
  ctx.close && ctx.close();

  // 2. Actual list of classes for patch (AudioContext + OfflineAudioContext + webkit aliases)
  const CTX_CLASSES = [
    window.AudioContext,
    window.webkitAudioContext,
    window.OfflineAudioContext,
    window.webkitOfflineAudioContext
  ].filter(Boolean);

  for (const CTX of CTX_CLASSES) {
    const proto = CTX.prototype;

    // 3. We only patch sampleRate/baseLatency (getter does not break fingerprint)
    Object.defineProperty(proto, 'sampleRate', {
      get() { return nativeSampleRate; },
      configurable: true
    });
    if ('baseLatency' in proto) {
      Object.defineProperty(proto, 'baseLatency', {
        get() { return nativeBaseLatency; },
        configurable: true
      });
    }

    // 4. patch createBuffer: We rolled the input and throw the error as in the original
  if (typeof AudioContext.prototype.createBuffer === 'function') {
      const origCreateBuffer = AudioContext.prototype.createBuffer;
      AudioContext.prototype.createBuffer = function(numOfChannels, length, sampleRate) {
          if (length < 0 || sampleRate <= 0) throw new RangeError('Invalid length or sampleRate for AudioBuffer');
          return origCreateBuffer.call(this, numOfChannels, length, sampleRate);
      };
      console.log('[AudioContextPatch] Patched createBuffer on AudioContext');
  }
  // 5. patch AnalyserNode (preserveing invariants)
  if (typeof proto.createAnalyser === 'function') {
    const origCreateAnalyser = proto.createAnalyser;
    proto.createAnalyser = function () {
      const analyser = origCreateAnalyser.call(this);

      // --- Byte Spectrum: discrete ±1/0 with compensation of the summ ---
      const origByte = analyser.getByteFrequencyData.bind(analyser);
      analyser.getByteFrequencyData = function (array) {
        origByte(array);
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
      };

      // --- Float Spectrum: pair of zero summary noise, without going out for [min,max] ---
      const origFloat = analyser.getFloatFrequencyData.bind(analyser);
      analyser.getFloatFrequencyData = function (array) {
        origFloat(array);
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
      };

      // --- Byte time-domain: paired±1 (The sum preserved) carefully [0..255] ---
      const origByteTD = analyser.getByteTimeDomainData?.bind(analyser);
      if (typeof origByteTD === 'function') {
        analyser.getByteTimeDomainData = function (array) {
          origByteTD(array);
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
        };
      }

      // --- Float time-domain: pair zero-summary noise within [-1..1] ---
      const origFloatTD = analyser.getFloatTimeDomainData?.bind(analyser);
      if (typeof origFloatTD === 'function') {
        analyser.getFloatTimeDomainData = function (array) {
          origFloatTD(array);
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
        };
      }

      return analyser;
    };
  }


  // 6.Patch OfflineAudioContext (add noise)
  if (typeof OfflineAudioContext.prototype.startRendering === 'function') {
      const origStartRendering = OfflineAudioContext.prototype.startRendering;
      OfflineAudioContext.prototype.startRendering = function(...args) {
          return origStartRendering.apply(this, args).then(buffer => {
              //add Noise, if necessary
              return addNoiseToRenderBuffer(buffer);
          });
      };
  }

  // 7. noise in renderBuffer
  function addNoiseToRenderBuffer(buffer) {
      if (!buffer || typeof buffer.getChannelData !== 'function') return buffer;
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
}} 
