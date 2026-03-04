
Object.defineProperty(globalThis, "__PROBE__", { value: async function(){


  "use strict";
  // ...всё твоё текущее тело...

  if (typeof globalThis === "undefined") {
    throw new Error("[probe] globalThis is missing");
  }

  const nav = globalThis.navigator;

  if (!nav) {
    throw new Error("[probe] navigator is missing");
  }


  const W = (typeof window !== "undefined") ? window : null;
  const __probeDegrade = (W && typeof W.__DEGRADE__ === "function") ? W.__DEGRADE__ : null;



  function __probeDiag(level, code, extra, err) {
    try {
      const x = (extra && typeof extra === 'object') ? extra : {};
      const ctx = {
        module: 'probe',
        diagTag: (typeof x.diagTag === 'string' && x.diagTag) ? x.diagTag : 'probe',
        surface: 'probe',
        key: (typeof x.key === 'string' || x.key === null) ? x.key : null,
        stage: (typeof x.stage === 'string' && x.stage) ? x.stage : 'runtime',
        message: (typeof x.message === 'string' && x.message) ? x.message : String(code || 'probe'),
        data: Object.prototype.hasOwnProperty.call(x, 'data') ? x.data : null,
        type: (typeof x.type === 'string' && x.type) ? x.type : 'pipeline missing data'
      };
      if (__probeDegrade && typeof __probeDegrade.diag === 'function') {
        __probeDegrade.diag(String(level || 'info'), String(code || 'probe'), ctx, err || null);
        return;
      }
      if (typeof __probeDegrade === 'function') {
        __probeDegrade(String(code || 'probe'), err || null, Object.assign({ level: String(level || 'info') }, ctx));
      }
    } catch (_) {}
  }

  function __probeNum(v, fallback) {
    const n = Number(v);
    return (Number.isFinite(n) && n > 0) ? Math.floor(n) : fallback;
  }

  const __probeTimeoutCfg =
    (globalThis.__PROBE_TIMEOUTS__ && typeof globalThis.__PROBE_TIMEOUTS__ === "object")
      ? globalThis.__PROBE_TIMEOUTS__
      : {};
  const __PROBE_TIMEOUTS = {
    callMs: __probeNum(__probeTimeoutCfg.callMs, 2500),
    highEntropyMs: __probeNum(__probeTimeoutCfg.highEntropyMs, 3000),
    stepMs: __probeNum(__probeTimeoutCfg.stepMs, 8000),
    totalMs: __probeNum(__probeTimeoutCfg.totalMs, 30000)
  };
  const __probeRunStartedAt = Date.now();

  function __probeBuildTimeoutError(meta, timeoutMs, elapsedMs) {
    const check = (meta && typeof meta.check === "string" && meta.check) ? meta.check : "__PROBE__";
    const phase = (meta && typeof meta.phase === "string" && meta.phase) ? meta.phase : "runtime";
    const method = (meta && typeof meta.method === "string" && meta.method) ? meta.method : "unknown";
    const ms = __probeNum(elapsedMs, 0);
    const err = new Error(`[probe] async timeout (${check}/${phase}/${method}) after ${ms}ms`);
    err.name = "TimeoutError";
    err.code = "probe:async_timeout";
    err.check = check;
    err.phase = phase;
    err.method = method;
    err.elapsedMs = ms;
    err.timeoutMs = __probeNum(timeoutMs, 0);
    err.probeTimedOut = true;
    return err;
  }

  async function __probeAwaitWithTimeout(promiseLike, timeoutMs, meta) {
    const startedAt = Date.now();
    const ms = __probeNum(timeoutMs, 1);
    let timer = null;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(__probeBuildTimeoutError(meta, ms, Date.now() - startedAt));
        }, ms);
      });
      const value = await Promise.race([Promise.resolve(promiseLike), timeoutPromise]);
      return { ok: true, value, timedOut: false, elapsedMs: Date.now() - startedAt, timeoutMs: ms };
    } catch (error) {
      const timedOut = !!(error && (error.probeTimedOut === true || error.name === "TimeoutError"));
      return { ok: false, error, timedOut, elapsedMs: Date.now() - startedAt, timeoutMs: ms };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function __probeRemainingBudgetMs() {
    const spent = Date.now() - __probeRunStartedAt;
    return __PROBE_TIMEOUTS.totalMs - spent;
  }

  async function __probeAwaitWithinBudget(promiseLike, meta) {
    const left = __probeRemainingBudgetMs();
    if (!(left > 0)) {
      return {
        ok: false,
        error: __probeBuildTimeoutError(meta, 0, Date.now() - __probeRunStartedAt),
        timedOut: true,
        elapsedMs: 0,
        timeoutMs: 0
      };
    }
    const budgetMs = Math.min(__PROBE_TIMEOUTS.stepMs, left);
    return __probeAwaitWithTimeout(promiseLike, budgetMs, meta);
  }

  function __probeLogAsyncTimeout(meta, elapsedMs, timeoutMs, err) {
    const check = (meta && typeof meta.check === "string" && meta.check) ? meta.check : "__PROBE__";
    const phase = (meta && typeof meta.phase === "string" && meta.phase) ? meta.phase : "runtime";
    const method = (meta && typeof meta.method === "string" && meta.method) ? meta.method : "unknown";
    __probeDiag("error", "probe:async_timeout", {
      stage: "runtime",
      key: method,
      message: "probe async operation timed out",
      type: "pipeline missing data",
      data: {
        check,
        phase,
        method,
        elapsedMs: __probeNum(elapsedMs, 0),
        timeoutMs: __probeNum(timeoutMs, 0),
        outcome: "throw",
        reason: "timed_out"
      }
    }, err || null);
  }







  const NAV_VALUE_PATHS = [
    "userAgent",
    "appVersion",
    "platform",
    "vendor",
    "deviceMemory",
    "hardwareConcurrency",
    "language",
    "languages",
    "oscpu",
    "webdriver",
    "plugins.length",
    "mimeTypes.length",
    "geolocation",
    "userAgentData",
    "userAgentData.brands",
    "userAgentData.mobile",
    "userAgentData.platform",
    "userAgentData.fullVersionList",
    "userAgentData.getHighEntropyValues",
    "userAgentData.toJSON"
  ];


  const METHOD_PATHS = [
    "permissions.query",
    "mediaDevices.enumerateDevices",
    "storage.estimate",
    "storage.persist",
    "storage.persisted",
    "credentials.create",
    "credentials.get",
    "geolocation.getCurrentPosition",
    "webkitTemporaryStorage.queryUsageAndQuota",
    "userAgentData.getHighEntropyValues",
    "userAgentData.toJSON",
    "gpu.requestAdapter",
    "Intl.NumberFormat",
    "Intl.Collator",
    "Intl.DateTimeFormat.prototype.resolvedOptions",
    "Intl.ListFormat",
    "Intl.PluralRules",
    "Intl.RelativeTimeFormat",
    "Intl.RelativeTimeFormat.prototype.resolvedOptions",
    "Intl.DisplayNames",
    "Date.prototype.toLocaleDateString",
    "Date.prototype.toLocaleString",
    "Date.prototype.toLocaleTimeString",
    "HTMLCanvasElement.prototype.getContext",
    "HTMLCanvasElement.prototype.toDataURL",
    "HTMLCanvasElement.prototype.toBlob",
    "OffscreenCanvas.prototype.getContext",
    "OffscreenCanvas.prototype.convertToBlob",
    "CanvasRenderingContext2D.prototype.measureText",
    "CanvasRenderingContext2D.prototype.fillText",
    "CanvasRenderingContext2D.prototype.strokeText",
    "CanvasRenderingContext2D.prototype.fillRect",
    "CanvasRenderingContext2D.prototype.drawImage",
    "CanvasRenderingContext2D.prototype.getImageData",
    "CanvasRenderingContext2D.prototype.putImageData",
    "CanvasRenderingContext2D.prototype.translate",
    "CanvasRenderingContext2D.prototype.setTransform",
    "OffscreenCanvasRenderingContext2D.prototype.drawImage",
    "OffscreenCanvasRenderingContext2D.prototype.getImageData",
    "OffscreenCanvasRenderingContext2D.prototype.putImageData",
    "OffscreenCanvasRenderingContext2D.prototype.translate",
    "OffscreenCanvasRenderingContext2D.prototype.setTransform",
    "WebGLRenderingContext.prototype.getParameter",
    "WebGLRenderingContext.prototype.getSupportedExtensions",
    "WebGLRenderingContext.prototype.getExtension",
    "WebGLRenderingContext.prototype.readPixels",
    "WebGLRenderingContext.prototype.getShaderPrecisionFormat",
    "WebGLRenderingContext.prototype.shaderSource",
    "WebGLRenderingContext.prototype.getUniform",
    "WebGL2RenderingContext.prototype.getParameter",
    "WebGL2RenderingContext.prototype.getSupportedExtensions",
    "WebGL2RenderingContext.prototype.getExtension",
    "WebGL2RenderingContext.prototype.readPixels",
    "WebGL2RenderingContext.prototype.getShaderPrecisionFormat",
    "WebGL2RenderingContext.prototype.shaderSource",
    "WebGL2RenderingContext.prototype.getUniform",
    "AudioContext.prototype.createBuffer",
    "AudioContext.prototype.createAnalyser",
    "webkitAudioContext.prototype.createBuffer",
    "webkitAudioContext.prototype.createAnalyser",
    "AnalyserNode.prototype.getByteFrequencyData",
    "AnalyserNode.prototype.getFloatFrequencyData",
    "AnalyserNode.prototype.getByteTimeDomainData",
    "AnalyserNode.prototype.getFloatTimeDomainData",
    "OfflineAudioContext.prototype.startRendering",
    "webkitOfflineAudioContext.prototype.startRendering",
    "AudioBuffer.prototype.getChannelData"
  ];

  const PROTO_SPECS = [
    {
      label: "Navigator.prototype",
      getProto: () => Object.getPrototypeOf(nav),
      getTarget: () => nav,
      keys: [
        "userAgent",
        "appVersion",
        "platform",
        "vendor",
        "deviceMemory",
        "hardwareConcurrency",
        "language",
        "languages",
        "oscpu",
        "webdriver",
        "plugins",
        "mimeTypes",
        "userAgentData"
      ]
    },
    {
      label: "NavigatorUAData.prototype",
      getProto: () => {
        if (!("userAgentData" in nav) || !nav.userAgentData) return null;
        return Object.getPrototypeOf(nav.userAgentData);
      },
      getTarget: () => nav.userAgentData || null,
      keys: [
        "brands",
        "mobile",
        "platform",
        "fullVersionList",
        "getHighEntropyValues",
        "toJSON"
      ]
    },
    {
      label: "Permissions.prototype",
      getProto: () => (nav.permissions ? Object.getPrototypeOf(nav.permissions) : null),
      getTarget: () => nav.permissions || null,
      keys: ["query"]
    },
    {
      label: "MediaDevices.prototype",
      getProto: () => (nav.mediaDevices ? Object.getPrototypeOf(nav.mediaDevices) : null),
      getTarget: () => nav.mediaDevices || null,
      keys: ["enumerateDevices"]
    },
    {
      label: "StorageManager.prototype",
      getProto: () => (nav.storage ? Object.getPrototypeOf(nav.storage) : null),
      getTarget: () => nav.storage || null,
      keys: ["estimate", "persist", "persisted"]
    },
    {
      label: "CredentialsContainer.prototype",
      getProto: () => (nav.credentials ? Object.getPrototypeOf(nav.credentials) : null),
      getTarget: () => nav.credentials || null,
      keys: ["create", "get"]
    },
    {
      label: "TemporaryStorage.prototype",
      getProto: () =>
        nav.webkitTemporaryStorage ? Object.getPrototypeOf(nav.webkitTemporaryStorage) : null,
      getTarget: () => nav.webkitTemporaryStorage || null,
      keys: ["queryUsageAndQuota"]
    },
    {
      label: "HTMLCanvasElement.prototype",
      getProto: () => (typeof HTMLCanvasElement !== "undefined" ? HTMLCanvasElement.prototype : null),
      getTarget: () => {
        if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
        try {
          return document.createElement("canvas");
        } catch (_) {
          return null;
        }
      },
      keys: ["getContext", "toDataURL", "toBlob"]
    },
    {
      label: "OffscreenCanvas.prototype",
      getProto: () => (typeof OffscreenCanvas !== "undefined" ? OffscreenCanvas.prototype : null),
      getTarget: () => {
        if (typeof OffscreenCanvas === "undefined") return null;
        try {
          return new OffscreenCanvas(1, 1);
        } catch (_) {
          return null;
        }
      },
      keys: ["getContext", "convertToBlob"]
    },
    {
      label: "CanvasRenderingContext2D.prototype",
      getProto: () =>
        typeof CanvasRenderingContext2D !== "undefined" ? CanvasRenderingContext2D.prototype : null,
      getTarget: () => {
        if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
        try {
          const canvas = document.createElement("canvas");
          return typeof canvas.getContext === "function" ? canvas.getContext("2d") : null;
        } catch (_) {
          return null;
        }
      },
      keys: [
        "measureText",
        "fillText",
        "strokeText",
        "fillRect",
        "drawImage",
        "getImageData",
        "putImageData",
        "translate",
        "setTransform"
      ]
    },
    {
      label: "OffscreenCanvasRenderingContext2D.prototype",
      getProto: () =>
        typeof OffscreenCanvasRenderingContext2D !== "undefined" ? OffscreenCanvasRenderingContext2D.prototype : null,
      getTarget: () => {
        if (typeof OffscreenCanvas === "undefined") return null;
        try {
          const canvas = new OffscreenCanvas(1, 1);
          return typeof canvas.getContext === "function" ? canvas.getContext("2d") : null;
        } catch (_) {
          return null;
        }
      },
      keys: ["drawImage", "getImageData", "putImageData", "translate", "setTransform"]
    },
    {
      label: "WebGLRenderingContext.prototype",
      getProto: () =>
        typeof WebGLRenderingContext !== "undefined" ? WebGLRenderingContext.prototype : null,
      getTarget: () => {
        if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
        try {
          const canvas = document.createElement("canvas");
          if (typeof canvas.getContext !== "function") return null;
          return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (_) {
          return null;
        }
      },
      keys: [
        "getParameter",
        "getSupportedExtensions",
        "getExtension",
        "readPixels",
        "getShaderPrecisionFormat",
        "shaderSource",
        "getUniform"
      ]
    },
    {
      label: "WebGL2RenderingContext.prototype",
      getProto: () =>
        typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null,
      getTarget: () => {
        if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
        try {
          const canvas = document.createElement("canvas");
          if (typeof canvas.getContext !== "function") return null;
          return canvas.getContext("webgl2");
        } catch (_) {
          return null;
        }
      },
      keys: [
        "getParameter",
        "getSupportedExtensions",
        "getExtension",
        "readPixels",
        "getShaderPrecisionFormat",
        "shaderSource",
        "getUniform"
      ]
    },
    {
      // Chromium/MDN: BaseAudioContext defines shared audio API surface that both AudioContext and OfflineAudioContext inherit.
      // In modern Chromium, several members are not own-properties on AudioContext.prototype.
      label: "BaseAudioContext.prototype",
      getProto: () => (typeof BaseAudioContext !== "undefined" ? BaseAudioContext.prototype : null),
      getTarget: () => {
        const Ctor = (typeof AudioContext === "function")
          ? AudioContext
          : (typeof webkitAudioContext === "function" ? webkitAudioContext : null);
        if (!Ctor) return (typeof BaseAudioContext !== "undefined" ? BaseAudioContext.prototype : null);
        try {
          return new Ctor();
        } catch (_) {
          return Ctor.prototype;
        }
      },
      keys: ["sampleRate", "createBuffer", "createAnalyser"]
    },
    {
      label: "AudioContext.prototype",
      getProto: () => {
        const Ctor = (typeof AudioContext === "function")
          ? AudioContext
          : (typeof webkitAudioContext === "function" ? webkitAudioContext : null);
        return Ctor ? Ctor.prototype : null;
      },
      getTarget: () => {
        const Ctor = (typeof AudioContext === "function")
          ? AudioContext
          : (typeof webkitAudioContext === "function" ? webkitAudioContext : null);
        if (!Ctor) return null;
        try {
          return new Ctor();
        } catch (_) {
          return Ctor.prototype;
        }
      },
      // Chromium/MDN: AudioContext adds AudioContext-specific members over BaseAudioContext.
      keys: ["baseLatency"]
    },
    {
      label: "OfflineAudioContext.prototype",
      getProto: () => {
        const Ctor = (typeof OfflineAudioContext === "function")
          ? OfflineAudioContext
          : (typeof webkitOfflineAudioContext === "function" ? webkitOfflineAudioContext : null);
        return Ctor ? Ctor.prototype : null;
      },
      getTarget: () => {
        const Ctor = (typeof OfflineAudioContext === "function")
          ? OfflineAudioContext
          : (typeof webkitOfflineAudioContext === "function" ? webkitOfflineAudioContext : null);
        return Ctor ? Ctor.prototype : null;
      },
      keys: ["startRendering"]
    },
    {
      label: "AnalyserNode.prototype",
      getProto: () => (typeof AnalyserNode !== "undefined" ? AnalyserNode.prototype : null),
      getTarget: () => (typeof AnalyserNode !== "undefined" ? AnalyserNode.prototype : null),
      keys: ["getByteFrequencyData", "getFloatFrequencyData", "getByteTimeDomainData", "getFloatTimeDomainData"]
    },
    {
      label: "AudioBuffer.prototype",
      getProto: () => (typeof AudioBuffer !== "undefined" ? AudioBuffer.prototype : null),
      getTarget: () => (typeof AudioBuffer !== "undefined" ? AudioBuffer.prototype : null),
      keys: ["getChannelData"]
    }
  ];

  function fnSig(fn) {
    try {
      if (typeof fn !== "function") return null;
      return `${fn.name || "(anonymous)"}(${fn.length})`;
    } catch (_) {
      return "[function unreadable]";
    }
  }

  function errorShape(error) {
    if (!error) return null;
    return {
      name: error && error.name ? String(error.name) : "Error",
      message: error && error.message ? String(error.message) : String(error),
      stack: error && error.stack ? String(error.stack) : null
    };
  }

  function safeGet(receiver, key) {
    try {
      return { ok: true, value: Reflect.get(receiver, key, receiver) };
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  function readPath(root, path) {
    const parts = String(path).split(".");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      if (current == null) {
        // Path chain is missing (e.g. webkit-prefixed APIs on Chromium).
        // This is not an exception-worthy condition for the probe: treat as "not present".
        return { ok: true, value: undefined };
      }
      const step = safeGet(current, parts[i]);
      if (!step.ok) return step;
      current = step.value;
    }

    return { ok: true, value: current };
  }

  function toPrintable(value) {
    if (typeof value === "function") return `[Function ${fnSig(value)}]`;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return value;
    return value;
  }

  function errorToString(error) {
    if (!error) return null;
    const name = error && error.name ? String(error.name) : "Error";
    const message = error && error.message ? String(error.message) : String(error);
    return `${name}: ${message}`;
  }

  async function printFieldValues() {
    const uaData = nav && nav.userAgentData ? nav.userAgentData : null;
    const highEntropyBasePath = "userAgentData.";
    const highEntropySkipKeys = new Set(["brands", "mobile", "platform", "getHighEntropyValues", "toJSON"]);
    const highEntropyKeys = [];
    const highEntropyPaths = new Set();
    const highEntropyValuesByPath = new Map();
    let highEntropyFetchError = null;
    let highEntropyFetchAttempted = false;
    let highEntropyAsyncState = null;
    let highEntropyElapsedMs = null;

    for (const path of NAV_VALUE_PATHS) {
      if (!String(path).startsWith(highEntropyBasePath)) continue;
      const key = String(path).slice(highEntropyBasePath.length);
      if (!key || key.indexOf(".") !== -1) continue;
      if (highEntropySkipKeys.has(key)) continue;
      if (highEntropyPaths.has(path)) continue;
      highEntropyPaths.add(path);
      highEntropyKeys.push(key);
    }

    if (highEntropyKeys.length > 0) {
      if (!uaData || typeof uaData.getHighEntropyValues !== "function") {
        highEntropyFetchError = new TypeError("[probe] navigator.userAgentData.getHighEntropyValues is not available");
        highEntropyAsyncState = "not_available";
      } else {
        highEntropyFetchAttempted = true;
        const meta = {
          check: "fields",
          phase: "high_entropy",
          method: "NavigatorUAData.getHighEntropyValues"
        };
        const waited = await __probeAwaitWithTimeout(
          (async () => Reflect.apply(uaData.getHighEntropyValues, uaData, [highEntropyKeys]))(),
          __PROBE_TIMEOUTS.highEntropyMs,
          meta
        );
        highEntropyElapsedMs = waited.elapsedMs;
        if (waited.ok) {
          const highEntropyResult = waited.value;
          highEntropyAsyncState = "resolved";
          if (!highEntropyResult || typeof highEntropyResult !== "object") {
            highEntropyFetchError = new TypeError("[probe] getHighEntropyValues returned non-object result");
            highEntropyAsyncState = "rejected";
          } else {
            for (const key of highEntropyKeys) {
              const path = `${highEntropyBasePath}${key}`;
              highEntropyValuesByPath.set(path, {
                present: Object.prototype.hasOwnProperty.call(highEntropyResult, key),
                value: highEntropyResult[key]
              });
            }
          }
        } else {
          highEntropyFetchError = waited.error;
          highEntropyAsyncState = waited.timedOut ? "timed_out" : "rejected";
          if (waited.timedOut) {
            __probeLogAsyncTimeout(meta, waited.elapsedMs, waited.timeoutMs, waited.error);
          }
        }
      }
    }

    const rows = NAV_VALUE_PATHS.map((path) => {
      if (highEntropyPaths.has(path)) {
        const key = String(path).slice(highEntropyBasePath.length);
        const highEntropyEntry = highEntropyValuesByPath.get(path) || null;
        if (highEntropyEntry && highEntropyEntry.present) {
          return {
            field: path,
            ok: true,
            value: toPrintable(highEntropyEntry.value),
            error: null,
            source: "userAgentData.getHighEntropyValues",
            asyncState: highEntropyAsyncState,
            elapsedMs: highEntropyElapsedMs
          };
        }
        if (highEntropyFetchError) {
          return {
            field: path,
            ok: false,
            value: null,
            error: errorToString(highEntropyFetchError),
            source: "userAgentData.getHighEntropyValues",
            asyncState: highEntropyAsyncState,
            elapsedMs: highEntropyElapsedMs
          };
        }
        if (highEntropyFetchAttempted) {
          return {
            field: path,
            ok: false,
            value: null,
            error: `TypeError: Missing '${key}' in getHighEntropyValues result`,
            source: "userAgentData.getHighEntropyValues",
            asyncState: highEntropyAsyncState || "rejected",
            elapsedMs: highEntropyElapsedMs
          };
        }
      }

      const r = readPath(nav, path);
      return {
        field: path,
        ok: r.ok,
        value: r.ok ? toPrintable(r.value) : null,
        error: r.ok ? null : errorToString(r.error),
        source: "direct"
      };
    });

    console.group("[probe] Field values");
    console.table(rows);
    console.groupEnd();

    return rows;
  }

  function descriptorShape(desc) {
    if (!desc) return null;
    return {
      configurable: !!desc.configurable,
      enumerable: !!desc.enumerable,
      writable: Object.prototype.hasOwnProperty.call(desc, "writable") ? !!desc.writable : null,
      hasGetter: typeof desc.get === "function",
      getterSig: fnSig(desc.get),
      hasSetter: typeof desc.set === "function",
      setterSig: fnSig(desc.set),
      hasValue: Object.prototype.hasOwnProperty.call(desc, "value"),
      valueType: Object.prototype.hasOwnProperty.call(desc, "value") ? typeof desc.value : null,
      valueSig: typeof desc.value === "function" ? fnSig(desc.value) : null
    };
  }

  function printPrototypeDescriptors() {
    console.group("[probe] Prototype descriptors");

    const out = [];

    for (const spec of PROTO_SPECS) {
      let proto = null;
      let target = null;
      try {
        proto = spec.getProto();
        target = typeof spec.getTarget === "function" ? spec.getTarget() : null;
      } catch (e) {
        console.warn(`[probe] ${spec.label} skipped (getProto failed):`, e);
        out.push({ prototype: spec.label, error: String(e) });
        continue;
      }

      if (!proto) {
        console.log(`[probe] ${spec.label}: not available`);
        out.push({ prototype: spec.label, error: "not available" });
        continue;
      }

      const rows = spec.keys.map((key) => {
        let desc = null;
        try {
          desc = Object.getOwnPropertyDescriptor(proto, key) || null;
        } catch (_) {
          desc = null;
        }

        const shape = descriptorShape(desc);
        let resolved;
        let resolvedType = null;
        let resolveError = null;
        let toStringError = null;
        let toStringStatus = null;
        let toStringCheckTarget = null;
        try {
          if (target != null) {
            resolved = Reflect.get(target, key, target);
          } else {
            resolved = Reflect.get(proto, key, proto);
          }
          resolvedType = `${typeof resolved} ${Object.prototype.toString.call(resolved)}`;
        } catch (e) {
          resolveError = errorShape(e);
          resolvedType = "<<resolve threw>>";
        }

        if (shape && shape.hasGetter) {
          toStringCheckTarget = "descriptor.get/descriptor.set";
          if (typeof desc.get === "function") {
            try {
              Function.prototype.toString.call(desc.get);
            } catch (e) {
              toStringError = errorShape(e);
            }
          }
          if (!toStringError && typeof desc.set === "function") {
            try {
              Function.prototype.toString.call(desc.set);
            } catch (e) {
              toStringError = errorShape(e);
            }
          }
          if (!toStringError) {
            toStringStatus = "callable checked";
          }
        } else if (typeof resolved === "function") {
          toStringCheckTarget = "resolved";
          try {
            Function.prototype.toString.call(resolved);
            toStringStatus = "callable checked";
          } catch (e) {
            toStringError = errorShape(e);
          }
        } else {
          toStringCheckTarget = "resolved";
          toStringStatus = "not callable (expected)";
        }

        return Object.assign(
          {
            prototype: spec.label,
            key,
            exists: !!desc,
            resolvedType,
            descriptorShape: shape
              ? {
                  hasValue: !!shape.hasValue,
                  hasGetter: !!shape.hasGetter,
                  hasSetter: !!shape.hasSetter
                }
              : null,
            toStringCheckTarget,
            toStringStatus,
            toStringError,
            resolveError
          },
          shape || {}
        );
      });

      console.log(`[probe] ${spec.label}`);
      console.table(rows);
      out.push({ prototype: spec.label, rows });
    }

    console.groupEnd();
    return out;
  }

  function printTouchedMethods() {
    function makeSandboxOracle() {
      if (!globalThis.document || typeof document.createElement !== "function") {
        return { ok: false, error: new Error("[probe] document missing (sandbox oracle)") };
      }
      const iframe = document.createElement("iframe");
      iframe.src = "about:blank";
      iframe.style.display = "none";
      // sandboxed realm: scripts disabled => reduces chance our patch runs there
      iframe.sandbox = "allow-same-origin";
      try {
        (document.documentElement || document.body || document).appendChild(iframe);
      } catch (e) {
        return { ok: false, error: e };
      }
      try {
        const w = iframe.contentWindow;
        const oracleToString =
          w && w.Function && w.Function.prototype && w.Function.prototype.toString;
        const oracleObjToString =
          w && w.Object && w.Object.prototype && w.Object.prototype.toString;
        const oracleSetProto = w && w.Reflect && w.Reflect.setPrototypeOf;
        return {
          ok: typeof oracleToString === "function",
          iframe,
          w,
          oracleToString,
          oracleObjToString,
          oracleSetProto
        };
      } catch (e) {
        try { iframe.remove(); } catch (_) {}
        return { ok: false, error: e };
      }
    }

    const sandboxOracle = makeSandboxOracle();
    function resolveMethodRoot(path) {
      if (
        typeof path === "string" &&
        (
          path.startsWith("Intl.") ||
          path.startsWith("Date.") ||
          path.startsWith("HTMLCanvasElement.") ||
          path.startsWith("OffscreenCanvas.") ||
          path.startsWith("CanvasRenderingContext2D.") ||
          path.startsWith("OffscreenCanvasRenderingContext2D.") ||
          path.startsWith("WebGLRenderingContext.") ||
          path.startsWith("WebGL2RenderingContext.") ||
          path.startsWith("AudioContext.") ||
          path.startsWith("webkitAudioContext.") ||
          path.startsWith("OfflineAudioContext.") ||
          path.startsWith("webkitOfflineAudioContext.") ||
          path.startsWith("AnalyserNode.") ||
          path.startsWith("AudioBuffer.")
        )
      ) {
        return globalThis;
      }
      return nav;
    }

    const rows = METHOD_PATHS.map((path) => {
      const root = resolveMethodRoot(path);
      const r = readPath(root, path);
      let toStringStatus = null;
      let toStringError = null;
      let objectToString = null;
      let objectToStringError = null;
      let sandboxToStringStatus = null;
      let sandboxToStringError = null;
      let sandboxHasNativeCode = null;
      let sandboxObjToString = null;
      let sandboxObjToStringError = null;
      let setProtoStatus = null;
      let setProtoError = null;

      if (r.ok && typeof r.value === "function") {
        try {
          objectToString = Object.prototype.toString.call(r.value);
        } catch (e) {
          objectToStringError = errorShape(e);
        }
        try {
          Function.prototype.toString.call(r.value);
          toStringStatus = "callable checked";
        } catch (e) {
          toStringStatus = "callable check failed";
          toStringError = errorShape(e);
        }

        try {
          const p = Reflect.getPrototypeOf(r.value);
          const ok = Reflect.setPrototypeOf(r.value, p);
          setProtoStatus = ok === true ? "ok" : "failed";
        } catch (e) {
          setProtoStatus = "threw";
          setProtoError = errorShape(e);
        }

        if (sandboxOracle && sandboxOracle.ok && typeof sandboxOracle.oracleToString === "function") {
          try {
            const s = Reflect.apply(sandboxOracle.oracleToString, r.value, []);
            sandboxToStringStatus = "ok";
            sandboxHasNativeCode = typeof s === "string" && s.indexOf("[native code]") !== -1;
          } catch (e) {
            sandboxToStringStatus = "threw";
            sandboxToStringError = errorShape(e);
          }
        }
        if (sandboxOracle && sandboxOracle.ok && typeof sandboxOracle.oracleObjToString === "function") {
          try {
            sandboxObjToString = Reflect.apply(sandboxOracle.oracleObjToString, r.value, []);
          } catch (e) {
            sandboxObjToStringError = errorShape(e);
          }
        }
      } else if (r.ok) {
        toStringStatus = "not callable (expected)";
      } else {
        toStringStatus = "resolve failed";
      }

      return {
        method: path,
        ok: r.ok,
        exists: r.ok && r.value != null,
        isMethod: r.ok && typeof r.value === "function",
        signature: r.ok && typeof r.value === "function" ? fnSig(r.value) : null,
        objectToString,
        objectToStringError,
        toStringStatus,
        toStringError,
        sandboxToStringStatus,
        sandboxToStringError,
        sandboxHasNativeCode,
        sandboxObjToString,
        sandboxObjToStringError,
        setProtoStatus,
        setProtoError,
        value: r.ok ? toPrintable(r.value) : null,
        error: r.ok ? null : errorShape(r.error)
      };
    });

    console.group("[probe] Touched methods");
    console.table(rows);
    console.groupEnd();

    try {
      if (sandboxOracle && sandboxOracle.iframe) sandboxOracle.iframe.remove();
    } catch (_) {}

    return { paths: METHOD_PATHS.slice(), rows };
  }



  async function printReceiverChecks() {
    const rows = [];

    function isPromiseLike(v) {
      return !!v && (typeof v === "object" || typeof v === "function") && typeof v.then === "function";
    }

    async function safeApply(fn, thisArg, args, meta) {
      const startedAt = Date.now();
      try {
        const value = Reflect.apply(fn, thisArg, Array.isArray(args) ? args : []);
        if (isPromiseLike(value)) {
          const waited = await __probeAwaitWithTimeout(
            Promise.resolve(value),
            __PROBE_TIMEOUTS.callMs,
            meta || null
          );
          if (waited.ok) {
            return {
              ok: true,
              value: waited.value,
              promise: true,
              asyncState: "resolved",
              elapsedMs: waited.elapsedMs
            };
          }
          if (waited.timedOut) {
            __probeLogAsyncTimeout(meta || null, waited.elapsedMs, waited.timeoutMs, waited.error);
          }
          return {
            ok: false,
            error: waited.error,
            promise: true,
            asyncState: waited.timedOut ? "timed_out" : "rejected",
            elapsedMs: waited.elapsedMs
          };
        }
        return {
          ok: true,
          value,
          promise: false,
          asyncState: "sync",
          elapsedMs: Date.now() - startedAt
        };
      } catch (e) {
        return {
          ok: false,
          error: e,
          promise: false,
          asyncState: "threw",
          elapsedMs: Date.now() - startedAt
        };
      }
    }

    async function safeApplyWithMeta(fn, thisArg, args, meta) {
      try {
        return await safeApply(fn, thisArg, args, meta);
      } catch (e) {
        return {
          ok: false,
          error: e,
          promise: false,
          asyncState: "threw",
          elapsedMs: 0
        };
      }
    }

    async function withProbeBadReceiverGuard(run) {
      const root = (typeof globalThis !== "undefined" && globalThis) ? globalThis : {};
      const mode = (root.__LOGGER_GUARD_MODE__ && typeof root.__LOGGER_GUARD_MODE__ === "object")
        ? root.__LOGGER_GUARD_MODE__
        : (root.__LOGGER_GUARD_MODE__ = {});
      const prevDepth = Number(mode.probeExpectedThrowDepth) || 0;
      mode.probeExpectedThrowDepth = prevDepth + 1;
      mode.probeExpectedThrowAt = Date.now();
      try {
        return await run();
      } finally {
        const nextDepth = (Number(mode.probeExpectedThrowDepth) || 1) - 1;
        mode.probeExpectedThrowDepth = nextDepth > 0 ? nextDepth : 0;
        mode.probeExpectedThrowAt = Date.now();
      }
    }

    function classifyError(e) {
      if (!e) return null;
      const name = e && e.name ? String(e.name) : "Error";
      const msg = e && e.message ? String(e.message) : String(e);
      const lc = msg.toLowerCase();
      const illegal = lc.indexOf("illegal invocation") !== -1;
      const incompatibleReceiver = lc.indexOf("incompatible receiver") !== -1;
      const incompatibleProxy = lc.indexOf("incompatible proxy") !== -1;
      const timedOut = (name === "TimeoutError") || (lc.indexOf("timeout") !== -1);
      return {
        name,
        message: msg,
        illegalInvocation: illegal,
        incompatibleReceiver: incompatibleReceiver,
        incompatibleProxy: incompatibleProxy,
        timedOut: timedOut
      };
    }

    async function pushRow(label, fn, goodThis, goodArgs, badThis, badArgs) {
      const methodId = (typeof label === "string" && label) ? label.replace(/^receiver:\s*/, "") : "unknown";
      const row = {
        check: label,
        method: methodId,
        available: typeof fn === "function",
        goodThis: goodThis ? Object.prototype.toString.call(goodThis) : null,
        goodSyncOk: null,
        goodResult: null,
        goodError: null,
        goodAsyncState: null,
        goodElapsedMs: null,
        badThrew: null,
        badError: null,
        badAsyncState: null,
        badElapsedMs: null,
        match: null
      };

      if (typeof fn !== "function") {
        rows.push(row);
        return;
      }

      // Bad receiver: should throw TypeError / Illegal invocation in Chromium
      const bad = await withProbeBadReceiverGuard(() =>
        safeApplyWithMeta(fn, badThis, badArgs, {
          check: label,
          phase: "bad",
          method: methodId
        })
      );
      row.badThrew = !bad.ok;
      row.badError = bad.ok ? null : classifyError(bad.error);
      row.badAsyncState = bad.asyncState || null;
      row.badElapsedMs = typeof bad.elapsedMs === "number" ? bad.elapsedMs : null;

      const badMatch =
        row.badThrew === true &&
        row.badError &&
        row.badError.name === "TypeError" &&
        (row.badError.illegalInvocation === true || row.badError.incompatibleReceiver === true) &&
        row.badError.incompatibleProxy !== true;

      // Good receiver: should not throw TypeError synchronously (other errors may be env-specific)
      let goodMatch = null;
      if (goodThis) {
        const good = await safeApplyWithMeta(fn, goodThis, goodArgs, {
          check: label,
          phase: "good",
          method: methodId
        });
        row.goodSyncOk = !!good.ok;
        row.goodAsyncState = good.asyncState || null;
        row.goodElapsedMs = typeof good.elapsedMs === "number" ? good.elapsedMs : null;
        if (good.ok) {
          row.goodResult = toPrintable(good.value);
        } else {
          row.goodError = classifyError(good.error);
          if (good.asyncState === "timed_out" || good.asyncState === "rejected") {
            goodMatch = false;
          }
          if (row.goodError && (
            row.goodError.name === "TypeError" ||
            row.goodError.illegalInvocation === true ||
            row.goodError.incompatibleReceiver === true ||
            row.goodError.incompatibleProxy === true
          )) {
            goodMatch = false;
          }
        }
      }

      row.match = (badMatch === true) && (goodMatch !== false);
      rows.push(row);
    }

    try {
      // Keep the set small and side-effect safe: only methods that should brand-check early.
      const permFn = nav && nav.permissions && nav.permissions.query;
      await pushRow(
        "receiver: Permissions.prototype.query",
        permFn,
        nav && nav.permissions ? nav.permissions : null,
        [{ name: "geolocation" }],
        {},
        [{ name: "geolocation" }]
      );

      const estFn = nav && nav.storage && nav.storage.estimate;
      await pushRow(
        "receiver: StorageManager.prototype.estimate",
        estFn,
        nav && nav.storage ? nav.storage : null,
        [],
        {},
        []
      );

      const ghevFn = nav && nav.userAgentData && nav.userAgentData.getHighEntropyValues;
      await pushRow(
        "receiver: NavigatorUAData.prototype.getHighEntropyValues",
        ghevFn,
        nav && nav.userAgentData ? nav.userAgentData : null,
        [["platform"]],
        {},
        [["platform"]]
      );

      const intlDateTimeResolvedOptionsFn =
        (typeof Intl !== "undefined" && Intl.DateTimeFormat && Intl.DateTimeFormat.prototype)
          ? Intl.DateTimeFormat.prototype.resolvedOptions
          : null;
      let intlDateTimeFormat = null;
      try {
        intlDateTimeFormat = (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function")
          ? new Intl.DateTimeFormat()
          : null;
      } catch (_) {
        intlDateTimeFormat = null;
      }
      await pushRow(
        "receiver: Intl.DateTimeFormat.prototype.resolvedOptions",
        intlDateTimeResolvedOptionsFn,
        intlDateTimeFormat,
        [],
        {},
        []
      );

      const intlRelativeTimeResolvedOptionsFn =
        (typeof Intl !== "undefined" && Intl.RelativeTimeFormat && Intl.RelativeTimeFormat.prototype)
          ? Intl.RelativeTimeFormat.prototype.resolvedOptions
          : null;
      let intlRelativeTimeFormat = null;
      try {
        intlRelativeTimeFormat = (typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function")
          ? new Intl.RelativeTimeFormat()
          : null;
      } catch (_) {
        intlRelativeTimeFormat = null;
      }
      await pushRow(
        "receiver: Intl.RelativeTimeFormat.prototype.resolvedOptions",
        intlRelativeTimeResolvedOptionsFn,
        intlRelativeTimeFormat,
        [],
        {},
        []
      );

      const getCtxFn = (typeof HTMLCanvasElement !== "undefined" && HTMLCanvasElement.prototype)
        ? HTMLCanvasElement.prototype.getContext
        : null;
      let canvas = null;
      try {
        canvas = (typeof document !== "undefined" && typeof document.createElement === "function")
          ? document.createElement("canvas")
          : null;
      } catch (_) {
        canvas = null;
      }
      await pushRow(
        "receiver: HTMLCanvasElement.prototype.getContext",
        getCtxFn,
        canvas,
        ["2d"],
        {},
        ["2d"]
      );

      let ctx2d = null;
      try {
        ctx2d = canvas && typeof canvas.getContext === "function" ? canvas.getContext("2d") : null;
      } catch (_) {
        ctx2d = null;
      }
      const drawImageSrc = (() => {
        try {
          if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
          const src = document.createElement("canvas");
          src.width = 1;
          src.height = 1;
          return src;
        } catch (_) {
          return null;
        }
      })();
      const drawImageArgs = drawImageSrc ? [drawImageSrc, 0, 0] : (canvas ? [canvas, 0, 0] : []);

      const ctx2dMeasureTextFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.measureText
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.measureText",
        ctx2dMeasureTextFn,
        ctx2d,
        ["A"],
        {},
        ["A"]
      );

      const ctx2dFillTextFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.fillText
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.fillText",
        ctx2dFillTextFn,
        ctx2d,
        ["A", 0, 0],
        {},
        ["A", 0, 0]
      );

      const ctx2dStrokeTextFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.strokeText
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.strokeText",
        ctx2dStrokeTextFn,
        ctx2d,
        ["A", 0, 0],
        {},
        ["A", 0, 0]
      );

      const ctx2dFillRectFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.fillRect
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.fillRect",
        ctx2dFillRectFn,
        ctx2d,
        [0, 0, 1, 1],
        {},
        [0, 0, 1, 1]
      );

      const ctx2dDrawImageFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.drawImage
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.drawImage",
        ctx2dDrawImageFn,
        ctx2d,
        drawImageArgs,
        {},
        drawImageArgs
      );

      const ctx2dGetImageDataFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.getImageData
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.getImageData",
        ctx2dGetImageDataFn,
        ctx2d,
        [0, 0, 1, 1],
        {},
        [0, 0, 1, 1]
      );

      let putImg = null;
      try {
        putImg = (typeof ImageData === "function") ? new ImageData(1, 1) : null;
      } catch (_) {
        putImg = null;
      }
      const ctx2dPutImageDataFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.putImageData
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.putImageData",
        ctx2dPutImageDataFn,
        ctx2d,
        putImg ? [putImg, 0, 0] : [],
        {},
        putImg ? [putImg, 0, 0] : []
      );

      const ctx2dTranslateFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.translate
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.translate",
        ctx2dTranslateFn,
        ctx2d,
        [0, 0],
        {},
        [0, 0]
      );

      const ctx2dSetTransformFn = (typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype)
        ? CanvasRenderingContext2D.prototype.setTransform
        : null;
      await pushRow(
        "receiver: CanvasRenderingContext2D.prototype.setTransform",
        ctx2dSetTransformFn,
        ctx2d,
        [1, 0, 0, 1, 0, 0],
        {},
        [1, 0, 0, 1, 0, 0]
      );

      let osc = null;
      try {
        osc = (typeof OffscreenCanvas !== "undefined") ? new OffscreenCanvas(1, 1) : null;
      } catch (_) {
        osc = null;
      }
      let octx2d = null;
      try {
        octx2d = osc && typeof osc.getContext === "function" ? osc.getContext("2d") : null;
      } catch (_) {
        octx2d = null;
      }
      const oP = octx2d ? Object.getPrototypeOf(octx2d) : null;

      const off2dGetImageDataFn = oP && typeof oP.getImageData === "function" ? oP.getImageData : null;
      await pushRow(
        "receiver: OffscreenCanvasRenderingContext2D.prototype.getImageData",
        off2dGetImageDataFn,
        octx2d,
        [0, 0, 1, 1],
        {},
        [0, 0, 1, 1]
      );

      const off2dPutImageDataFn = oP && typeof oP.putImageData === "function" ? oP.putImageData : null;
      await pushRow(
        "receiver: OffscreenCanvasRenderingContext2D.prototype.putImageData",
        off2dPutImageDataFn,
        octx2d,
        putImg ? [putImg, 0, 0] : [],
        {},
        putImg ? [putImg, 0, 0] : []
      );

      const off2dTranslateFn = oP && typeof oP.translate === "function" ? oP.translate : null;
      await pushRow(
        "receiver: OffscreenCanvasRenderingContext2D.prototype.translate",
        off2dTranslateFn,
        octx2d,
        [0, 0],
        {},
        [0, 0]
      );

      const off2dSetTransformFn = oP && typeof oP.setTransform === "function" ? oP.setTransform : null;
      await pushRow(
        "receiver: OffscreenCanvasRenderingContext2D.prototype.setTransform",
        off2dSetTransformFn,
        octx2d,
        [1, 0, 0, 1, 0, 0],
        {},
        [1, 0, 0, 1, 0, 0]
      );

      const AudioCtxCtor = (typeof AudioContext === "function")
        ? AudioContext
        : (typeof webkitAudioContext === "function" ? webkitAudioContext : null);
      let audioCtx = null;
      try {
        audioCtx = AudioCtxCtor ? new AudioCtxCtor() : null;
      } catch (e) {
        audioCtx = null;
      }

      const createAnalyserFn = audioCtx && typeof audioCtx.createAnalyser === "function"
        ? audioCtx.createAnalyser
        : null;
      await pushRow(
        "receiver: AudioContext.prototype.createAnalyser",
        createAnalyserFn,
        audioCtx,
        [],
        {},
        []
      );

      let createBufferArgs = null;
      if (audioCtx && audioCtx.destination) {
        const ch = Number(audioCtx.destination.maxChannelCount);
        const sr = Number(audioCtx.sampleRate);
        if (Number.isFinite(ch) && ch > 0 && Number.isFinite(sr) && sr > 0) {
          createBufferArgs = [Math.floor(ch), Math.floor(sr), sr];
        }
      }
      const createBufferFn = (createBufferArgs && audioCtx && typeof audioCtx.createBuffer === "function")
        ? audioCtx.createBuffer
        : null;
      await pushRow(
        "receiver: AudioContext.prototype.createBuffer",
        createBufferFn,
        audioCtx,
        createBufferArgs || [],
        {},
        createBufferArgs || []
      );

      let analyser = null;
      if (audioCtx && typeof audioCtx.createAnalyser === "function") {
        try {
          analyser = Reflect.apply(audioCtx.createAnalyser, audioCtx, []);
        } catch (e) {
          analyser = null;
        }
      }

      const freqBinCount = analyser ? Number(analyser.frequencyBinCount) : NaN;
      const fftSize = analyser ? Number(analyser.fftSize) : NaN;
      const byteFreqArgs = Number.isFinite(freqBinCount) && freqBinCount > 0
        ? [new Uint8Array(Math.floor(freqBinCount))]
        : null;
      const floatFreqArgs = Number.isFinite(freqBinCount) && freqBinCount > 0
        ? [new Float32Array(Math.floor(freqBinCount))]
        : null;
      const byteTimeArgs = Number.isFinite(fftSize) && fftSize > 0
        ? [new Uint8Array(Math.floor(fftSize))]
        : null;
      const floatTimeArgs = Number.isFinite(fftSize) && fftSize > 0
        ? [new Float32Array(Math.floor(fftSize))]
        : null;

      await pushRow(
        "receiver: AnalyserNode.getByteFrequencyData",
        byteFreqArgs && analyser && typeof analyser.getByteFrequencyData === "function" ? analyser.getByteFrequencyData : null,
        analyser,
        byteFreqArgs || [],
        {},
        byteFreqArgs || []
      );
      await pushRow(
        "receiver: AnalyserNode.getFloatFrequencyData",
        floatFreqArgs && analyser && typeof analyser.getFloatFrequencyData === "function" ? analyser.getFloatFrequencyData : null,
        analyser,
        floatFreqArgs || [],
        {},
        floatFreqArgs || []
      );
      await pushRow(
        "receiver: AnalyserNode.getByteTimeDomainData",
        byteTimeArgs && analyser && typeof analyser.getByteTimeDomainData === "function" ? analyser.getByteTimeDomainData : null,
        analyser,
        byteTimeArgs || [],
        {},
        byteTimeArgs || []
      );
      await pushRow(
        "receiver: AnalyserNode.getFloatTimeDomainData",
        floatTimeArgs && analyser && typeof analyser.getFloatTimeDomainData === "function" ? analyser.getFloatTimeDomainData : null,
        analyser,
        floatTimeArgs || [],
        {},
        floatTimeArgs || []
      );

      const OfflineCtxCtor = (typeof OfflineAudioContext === "function")
        ? OfflineAudioContext
        : (typeof webkitOfflineAudioContext === "function" ? webkitOfflineAudioContext : null);
      let offlineCtx = null;
      if (OfflineCtxCtor && audioCtx && audioCtx.destination) {
        const ch = Number(audioCtx.destination.maxChannelCount);
        const sr = Number(audioCtx.sampleRate);
        if (Number.isFinite(ch) && ch > 0 && Number.isFinite(sr) && sr > 0) {
          try {
            offlineCtx = new OfflineCtxCtor(Math.floor(ch), Math.floor(sr), sr);
          } catch (e) {
            offlineCtx = null;
          }
        }
      }

      const startRenderingFn = offlineCtx && typeof offlineCtx.startRendering === "function"
        ? offlineCtx.startRendering
        : null;
      await pushRow(
        "receiver: OfflineAudioContext.prototype.startRendering",
        startRenderingFn,
        offlineCtx,
        [],
        {},
        []
      );
    } catch (e) {
      rows.push({
        check: "receiver: internal probe error",
        available: false,
        goodThis: null,
        goodSyncOk: null,
        goodResult: null,
        goodError: errorShape(e),
        badThrew: null,
        badError: null,
        match: false
      });
    }

    const ok = rows.every((r) => r.match === true || r.match === null);
    console.group("[probe] Receiver/Illegal invocation checks");
    console.table(rows.map((r) => ({
      check: r.check,
      method: r.method,
      available: r.available,
      match: r.match,
      badThrew: r.badThrew,
      badError: r.badError ? r.badError.name : null,
      badAsyncState: r.badAsyncState,
      badElapsedMs: r.badElapsedMs,
      goodSyncOk: r.goodSyncOk,
      goodError: r.goodError ? r.goodError.name : null,
      goodAsyncState: r.goodAsyncState,
      goodElapsedMs: r.goodElapsedMs
    })));
    console.groupEnd();

    return { ok, rows };
  }

  function printAudioOwnPropertyInvariantChecks() {
    const rows = [];
    const methods = [
      "getByteFrequencyData",
      "getFloatFrequencyData",
      "getByteTimeDomainData",
      "getFloatTimeDomainData"
    ];
    const hasOwn = Object.prototype.hasOwnProperty;

    function pushRow(method, expectedAfterCreateOwn, actualAfterCreateOwn, match, extra, error) {
      rows.push({
        check: `audio-own: AnalyserNode.${method}`,
        method,
        expectedAfterCreateOwn,
        actualAfterCreateOwn,
        match: match === true ? true : match === false ? false : null,
        extra: extra || null,
        error: error ? errorShape(error) : null
      });
    }

    let audioCtx = null;
    let analyser = null;
    try {
      const AudioCtxCtor = (typeof AudioContext === "function")
        ? AudioContext
        : (typeof webkitAudioContext === "function" ? webkitAudioContext : null);
      if (!AudioCtxCtor) {
        for (const method of methods) {
          pushRow(method, false, null, null, {
            phase: "after_createAnalyser",
            beforeCreateAnalyserOwn: false,
            note: "AudioContext unavailable"
          }, null);
        }
        return { ok: true, rows };
      }
      try {
        audioCtx = new AudioCtxCtor();
      } catch (_) {
        audioCtx = null;
      }
      if (!audioCtx || typeof audioCtx.createAnalyser !== "function") {
        for (const method of methods) {
          pushRow(method, false, null, null, {
            phase: "after_createAnalyser",
            beforeCreateAnalyserOwn: false,
            note: "createAnalyser unavailable"
          }, null);
        }
        return { ok: true, rows };
      }
      analyser = Reflect.apply(audioCtx.createAnalyser, audioCtx, []);
      for (const method of methods) {
        const proto = (typeof AnalyserNode === "function" && AnalyserNode.prototype)
          ? AnalyserNode.prototype
          : null;
        const protoOwn = !!(proto && hasOwn.call(proto, method));
        const afterOwn = !!(analyser && (typeof analyser === "object" || typeof analyser === "function") && hasOwn.call(analyser, method));
        pushRow(
          method,
          false,
          afterOwn,
          afterOwn === false,
          {
            phase: "after_createAnalyser",
            beforeCreateAnalyserOwn: false,
            protoHasOwn: protoOwn
          },
          null
        );
      }
    } catch (e) {
      for (const method of methods) {
        pushRow(method, false, null, false, {
          phase: "after_createAnalyser",
          beforeCreateAnalyserOwn: false,
          note: "probe internal error"
        }, e);
      }
    }

    const ok = rows.every((r) => r.match === true || r.match === null);
    console.group("[probe] Audio own-property invariant checks");
    console.table(rows.map((r) => ({
      check: r.check,
      method: r.method,
      match: r.match,
      expectedAfterCreateOwn: r.expectedAfterCreateOwn,
      actualAfterCreateOwn: r.actualAfterCreateOwn,
      protoHasOwn: r.extra && Object.prototype.hasOwnProperty.call(r.extra, "protoHasOwn") ? r.extra.protoHasOwn : null,
      error: r.error ? r.error.name : null
    })));
    console.groupEnd();

    return { ok, rows };
  }

  function printPrototypeInvariantChecks() {
    const rows = [];

    function push(check, expected, actual, match, error) {
      rows.push({
        check,
        expected: expected == null ? "" : String(expected),
        actual: actual == null ? "" : String(actual),
        match: match === true ? true : match === false ? false : null,
        error: error ? errorShape(error) : null
      });
    }

    function tryProto(label, obj, expectedProto) {
      if (!obj) {
        push(label, "available", "not available", null);
        return;
      }
      let p = null;
      try {
        p = Object.getPrototypeOf(obj);
      } catch (e) {
        push(label, "Object.getPrototypeOf success", "threw", false, e);
        return;
      }
      if (!expectedProto) {
        push(label, "prototype acquired", Object.prototype.toString.call(p), null);
        return;
      }
      push(label, "expected prototype", p === expectedProto, p === expectedProto);
    }

    function tryInstanceof(label, obj, ctor) {
      if (!obj || typeof ctor !== "function") {
        push(label, "available", "not available", null);
        return;
      }
      let ok = null;
      try {
        ok = obj instanceof ctor;
      } catch (e) {
        push(label, "instanceof success", "threw", false, e);
        return;
      }
      push(label, "true", String(ok), ok === true);
    }

    try {
      tryInstanceof("proto: navigator instanceof Navigator", nav, typeof Navigator === "function" ? Navigator : null);
      tryProto("proto: Object.getPrototypeOf(navigator) === Navigator.prototype", nav, (typeof Navigator === "function" ? Navigator.prototype : null));

      tryInstanceof("proto: navigator.permissions instanceof Permissions", nav && nav.permissions, (typeof Permissions === "function" ? Permissions : null));
      tryProto("proto: permissions proto check", nav && nav.permissions, (typeof Permissions === "function" ? Permissions.prototype : null));

      tryInstanceof("proto: navigator.storage instanceof StorageManager", nav && nav.storage, (typeof StorageManager === "function" ? StorageManager : null));
      tryProto("proto: storage proto check", nav && nav.storage, (typeof StorageManager === "function" ? StorageManager.prototype : null));

      tryInstanceof("proto: navigator.userAgentData instanceof NavigatorUAData", nav && nav.userAgentData, (typeof NavigatorUAData === "function" ? NavigatorUAData : null));
      tryProto("proto: userAgentData proto check", nav && nav.userAgentData, (typeof NavigatorUAData === "function" ? NavigatorUAData.prototype : null));

      const AudioCtxCtor = (typeof AudioContext === "function")
        ? AudioContext
        : (typeof webkitAudioContext === "function" ? webkitAudioContext : null);
      let audioCtx = null;
      try {
        audioCtx = AudioCtxCtor ? new AudioCtxCtor() : null;
      } catch (e) {
        audioCtx = null;
      }
      tryInstanceof("proto: audioContext instanceof AudioContext", audioCtx, AudioCtxCtor);
      tryProto("proto: audioContext proto check", audioCtx, AudioCtxCtor ? AudioCtxCtor.prototype : null);

      let analyser = null;
      if (audioCtx && typeof audioCtx.createAnalyser === "function") {
        try {
          analyser = Reflect.apply(audioCtx.createAnalyser, audioCtx, []);
        } catch (e) {
          analyser = null;
        }
      }
      tryInstanceof("proto: analyser instanceof AnalyserNode", analyser, (typeof AnalyserNode === "function" ? AnalyserNode : null));
      tryProto("proto: analyser proto check", analyser, (typeof AnalyserNode === "function" ? AnalyserNode.prototype : null));

      const OfflineCtxCtor = (typeof OfflineAudioContext === "function")
        ? OfflineAudioContext
        : (typeof webkitOfflineAudioContext === "function" ? webkitOfflineAudioContext : null);
      const offlineProto = OfflineCtxCtor ? OfflineCtxCtor.prototype : null;
      tryProto("proto: OfflineAudioContext.prototype available", offlineProto, null);

      // Functions should behave like functions (avoid Proxy invariant explosions)
      tryProto("proto: Object.getPrototypeOf(Function.prototype.toString) === Function.prototype", Function.prototype.toString, Function.prototype);
    } catch (e) {
      push("proto: internal probe error", "no throw", "threw", false, e);
    }

    const ok = rows.every((r) => r.match === true || r.match === null);
    console.group("[probe] Prototype/instanceof checks");
    console.table(rows.map((r) => ({ check: r.check, match: r.match, error: r.error ? r.error.name : null })));
    console.groupEnd();

    return { ok, rows };
  }


function printToStringCrossRealmChecks() {
  const rows = [];

  function pushRow(check, expected, actual, match, extra, error) {
    rows.push({
      check,
      expected: expected == null ? "" : String(expected),
      actual: actual == null ? "" : String(actual),
      match: match === true ? true : match === false ? false : null,
      extra: extra || null,
      error: error ? errorShape(error) : null
    });
  }

  // Require DOM (this probe is for window pages; if executed elsewhere, report and continue)
  if (!globalThis.document || typeof document.createElement !== "function") {
    pushRow(
      "iframe baseline availability",
      "document + iframe available",
      "<<no document>>",
      false,
      { note: "Cross-realm baseline skipped (no DOM)" }
    );
    return { ok: false, rows };
  }

  const iframe = document.createElement("iframe");
  iframe.src = "about:blank";
  iframe.style.display = "none";

  try {
    (document.documentElement || document.body || document).appendChild(iframe);
  } catch (e) {
    pushRow(
      "iframe baseline attach",
      "iframe appended",
      "attach failed",
      false,
      null,
      e
    );
    return { ok: false, rows };
  }

  let w = null;
  try {
    w = iframe.contentWindow;
  } catch (e) {
    pushRow("iframe.contentWindow", "available", "read failed", false, null, e);
    try { iframe.remove(); } catch (_) {}
    return { ok: false, rows };
  }

  if (!w) {
    pushRow("iframe.contentWindow", "non-null", "null", false);
    try { iframe.remove(); } catch (_) {}
    return { ok: false, rows };
  }

  // Oracle: iframe's Function.prototype.toString (cross-realm checking your functions)
  const oracleToString = w.Function && w.Function.prototype && w.Function.prototype.toString;
  if (typeof oracleToString !== "function") {
    pushRow("iframe Function.prototype.toString", "function", String(typeof oracleToString), false);
    try { iframe.remove(); } catch (_) {}
    return { ok: false, rows };
  }

  function oracleString(fn) {
    return Reflect.apply(oracleToString, fn, []);
  }

  // 1) Descriptor invariants (hard): match flags, do not compare bodies/strings
  let ourDesc = null;
  let theirDesc = null;
  try { ourDesc = Object.getOwnPropertyDescriptor(Function.prototype, "toString") || null; } catch (_) { ourDesc = null; }
  try { theirDesc = Object.getOwnPropertyDescriptor(w.Function.prototype, "toString") || null; } catch (_) { theirDesc = null; }

  if (ourDesc && theirDesc) {
    const expected = JSON.stringify({
      writable: !!theirDesc.writable,
      enumerable: !!theirDesc.enumerable,
      configurable: !!theirDesc.configurable
    });
    const actual = JSON.stringify({
      writable: !!ourDesc.writable,
      enumerable: !!ourDesc.enumerable,
      configurable: !!ourDesc.configurable
    });
    const match =
      !!theirDesc.writable === !!ourDesc.writable &&
      !!theirDesc.enumerable === !!ourDesc.enumerable &&
      !!theirDesc.configurable === !!ourDesc.configurable;

    pushRow("Function.prototype.toString descriptor invariants", expected, actual, match);
  } else {
    pushRow(
      "Function.prototype.toString descriptor invariants",
      "descriptor present",
      `ours:${!!ourDesc} theirs:${!!theirDesc}`,
      false
    );
  }

  // 2) Brand / receiver invariants (hard): non-function receiver must throw (TypeError in Chromium)
  (function brandCheck() {
    const ourFn = Function.prototype.toString;
    const theirFn = w.Function && w.Function.prototype && w.Function.prototype.toString;

    let expectedThrew = false;
    let expectedErr = null;
    let actualThrew = false;
    let actualErr = null;

    try { Reflect.apply(theirFn, {}, []); } catch (e) { expectedThrew = true; expectedErr = e; }
    try { Reflect.apply(ourFn, {}, []); } catch (e) { actualThrew = true; actualErr = e; }

    const expected = expectedThrew ? `${expectedErr && expectedErr.name ? expectedErr.name : "Error"}: ${expectedErr && expectedErr.message ? expectedErr.message : ""}` : "no throw";
    const actual = actualThrew ? `${actualErr && actualErr.name ? actualErr.name : "Error"}: ${actualErr && actualErr.message ? actualErr.message : ""}` : "no throw";

    const match =
      expectedThrew === true &&
      actualThrew === true &&
      (expectedErr && expectedErr.name ? String(expectedErr.name) : "Error") === (actualErr && actualErr.name ? String(actualErr.name) : "Error");

    pushRow("Function.prototype.toString brand-check on non-function receiver", expected, actual, match, null, actualErr);
  })();

  // 3) String representation cross-realm (soft / informational):
  // We do NOT compare exact strings. Only record if the oracle call is possible and whether it looks native.
  function addFnToStringCheck(label, ourFn, theirFn) {
    let expected = "";
    let actual = "";

    try { expected = (typeof theirFn === "function") ? oracleString(theirFn) : `<<not function: ${typeof theirFn}>>`; }
    catch (e) { pushRow(label + " (expected)", "no throw", "threw", false, null, e); return; }

    try { actual = (typeof ourFn === "function") ? oracleString(ourFn) : `<<not function: ${typeof ourFn}>>`; }
    catch (e) { pushRow(label + " (actual)", "no throw", "threw", false, null, e); return; }

    const extra = {
      note: "string equality check disabled (methodology: avoid cosmetic toString checks)",
      expectedSig: fnSig(theirFn),
      actualSig: fnSig(ourFn),
      expectedHasNativeCode: typeof expected === "string" && expected.indexOf("[native code]") !== -1,
      actualHasNativeCode: typeof actual === "string" && actual.indexOf("[native code]") !== -1
    };

    // match: null => informational row, not a hard failure signal
    pushRow(label, expected, actual, null, extra);
  }

  // Built-in baseline checks (informational)
  addFnToStringCheck("builtin: Function.prototype.toString", Function.prototype.toString, w.Function.prototype.toString);
  addFnToStringCheck("builtin: Object.defineProperty", Object.defineProperty, w.Object.defineProperty);
  addFnToStringCheck("builtin: Reflect.apply", Reflect.apply, w.Reflect.apply);

  // Navigator getter baseline (informational)
  try {
    const ourNavProto = globalThis.navigator ? Object.getPrototypeOf(globalThis.navigator) : null;
    const theirNavProto = w.navigator ? Object.getPrototypeOf(w.navigator) : null;

    const ourUAGet = ourNavProto ? (Object.getOwnPropertyDescriptor(ourNavProto, "userAgent") || {}).get : null;
    const theirUAGet = theirNavProto ? (Object.getOwnPropertyDescriptor(theirNavProto, "userAgent") || {}).get : null;

    addFnToStringCheck("accessor.get: Navigator.prototype.userAgent", ourUAGet, theirUAGet);
  } catch (e) {
    pushRow("accessor.get: Navigator.prototype.userAgent", "resolved", "resolve failed", false, null, e);
  }

  try { iframe.remove(); } catch (_) {}

  const ok = rows.every((r) => r.match === true || r.match === null);
  console.group("[probe] toString cross-realm checks (hard invariants + informational)");
  console.table(rows.map((r) => ({ check: r.check, match: r.match, error: r.error ? r.error.name : null })));
  console.groupEnd();

  return { ok, rows };
}


  const DESCRIPTOR_EXPECTATIONS = [
    { p: "Navigator.prototype", k: "language",  exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "languages", exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "userAgent", exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "webdriver", exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "oscpu",     exp: { exists: false } },
    { p: "Permissions.prototype",         k: "query",              exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "MediaDevices.prototype",        k: "enumerateDevices",   exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "StorageManager.prototype",      k: "estimate",           exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "StorageManager.prototype",      k: "persist",            exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "StorageManager.prototype",      k: "persisted",          exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CredentialsContainer.prototype", k: "create",            exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CredentialsContainer.prototype", k: "get",               exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "TemporaryStorage.prototype",     k: "queryUsageAndQuota", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "NavigatorUAData.prototype",      k: "getHighEntropyValues", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "NavigatorUAData.prototype",      k: "toJSON",              exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "HTMLCanvasElement.prototype",    k: "getContext",          exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "HTMLCanvasElement.prototype",    k: "toDataURL",           exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "HTMLCanvasElement.prototype",    k: "toBlob",              exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "measureText",     exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "fillText",        exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "strokeText",      exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "fillRect",        exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "drawImage",       exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "getImageData",    exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "putImageData",    exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "translate",       exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "CanvasRenderingContext2D.prototype", k: "setTransform",    exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "WebGLRenderingContext.prototype", k: "getParameter",       exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "WebGLRenderingContext.prototype", k: "getSupportedExtensions", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "WebGLRenderingContext.prototype", k: "getExtension",       exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "WebGLRenderingContext.prototype", k: "readPixels",         exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "WebGLRenderingContext.prototype", k: "getShaderPrecisionFormat", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "WebGLRenderingContext.prototype", k: "shaderSource",       exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "WebGLRenderingContext.prototype", k: "getUniform",         exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "AudioContext.prototype",          k: "baseLatency",        exp: { exists: true, hasValue: false, valueType: null, hasGetter: true, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    // Chromium/MDN: these members belong to BaseAudioContext and are inherited by AudioContext/OfflineAudioContext.
    { p: "BaseAudioContext.prototype",      k: "sampleRate",         exp: { exists: true, hasValue: false, valueType: null, hasGetter: true, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "BaseAudioContext.prototype",      k: "createBuffer",       exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "BaseAudioContext.prototype",      k: "createAnalyser",     exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "OfflineAudioContext.prototype",   k: "startRendering",     exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "AnalyserNode.prototype",          k: "getByteFrequencyData", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "AnalyserNode.prototype",          k: "getFloatFrequencyData", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "AnalyserNode.prototype",          k: "getByteTimeDomainData", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "AnalyserNode.prototype",          k: "getFloatTimeDomainData", exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } },
    { p: "AudioBuffer.prototype",           k: "getChannelData",     exp: { exists: true, hasValue: true, valueType: "function", hasGetter: false, hasSetter: false, enumerable: null, configurable: null, writable: null, toStringCheckTarget: "resolved" } }
  ];

  const DESCRIPTOR_EXPECT_FIELDS = [
    "exists",
    "configurable",
    "enumerable",
    "writable",
    "hasGetter",
    "getterSig",
    "hasSetter",
    "setterSig",
    "hasValue",
    "valueType",
    "toStringCheckTarget"
  ];

  function descriptorExpectationEq(exp, act) {
    if (exp === null || typeof exp === "undefined") return true;
    return exp === act;
  }

  function printDescriptorExpectations(out) {
    if (!out || !Array.isArray(out.descriptors)) {
      const error = {
        name: "TypeError",
        message: "[probe] descriptors missing before descriptor expectations compare"
      };
      console.group("[probe] Descriptor expectations - skipped");
      console.warn(error.message);
      console.groupEnd();
      return { total: 0, mismatches: 0, rows: [], skipped: true, error };
    }

    const idx = new Map();
    for (const block of out.descriptors) {
      if (!block || !Array.isArray(block.rows)) continue;
      for (const row of block.rows) {
        idx.set(`${row.prototype}::${row.key}`, row);
      }
    }

    const rows = DESCRIPTOR_EXPECTATIONS.map((target) => {
      const id = `${target.p}::${target.k}`;
      const actual = idx.get(id) || null;
      const row = { id, prototype: target.p, key: target.k, missingActual: !actual };
      let allMatch = true;

      for (const field of DESCRIPTOR_EXPECT_FIELDS) {
        const exp = target.exp && Object.prototype.hasOwnProperty.call(target.exp, field) ? target.exp[field] : null;
        const act = actual ? (Object.prototype.hasOwnProperty.call(actual, field) ? actual[field] : null) : null;
        row[`exp_${field}`] = exp;
        row[`act_${field}`] = act;
        row[`match_${field}`] = descriptorExpectationEq(exp, act);
        if (!row[`match_${field}`]) allMatch = false;
      }

      row.allMatch = !row.missingActual && allMatch;
      return row;
    });

    const mismatchesRows = rows.filter((r) => !r.allMatch);
    console.group("[probe] Descriptor expectations - mismatches");
    console.log(`[probe] total: ${rows.length}, mismatches: ${mismatchesRows.length}`);
    console.table(mismatchesRows);
    console.groupEnd();

    return { total: rows.length, mismatches: mismatchesRows.length, rows, skipped: false, error: null };
  }


  function getDegradeEvents() {
    // External probe: no project-specific fallbacks, only explicit __DEGRADE__ buffer if present.
    const degrade = globalThis.__DEGRADE__;
    if (typeof degrade !== "function" || typeof degrade.getBuffer !== "function") return [];
    try {
      const buf = degrade.getBuffer();
      if (!Array.isArray(buf)) return [];
      return buf.filter((e) => e && e.type === "degrade");
    } catch (_) {
      return [];
    }
  }

  function printLastDegradeEvents() {
    const all = getDegradeEvents();
    const last50 = all.slice(-50);

    // const rows = last50.map((e, i) => ({
    //   idx: i,
    //   timestamp: e && e.timestamp ? e.timestamp : null,
    //   code: e && e.code ? e.code : null,
    //   level: e && e.extra && e.extra.level ? e.extra.level : null,
    //   diagTag: e && e.extra && e.extra.diagTag ? e.extra.diagTag : null,
    //   module: e && e.extra && e.extra.module ? e.extra.module : null,
    //   stage: e && e.extra && e.extra.stage ? e.extra.stage : null,
    //   key: e && e.extra && e.extra.key ? e.extra.key : null,
    //   message: e && e.extra && e.extra.message ? e.extra.message : null
    // }));



    const rows = last50.map((e, i) => {
      const probeExpectedErr = (() => {
        try {
          const er = e ? e.error : null;
          if (!er || typeof er !== "object") return false;
          const name = (typeof er.name === "string") ? er.name : "";
          const message = (typeof er.message === "string") ? er.message : "";
          const stack = (typeof er.stack === "string") ? er.stack : "";
          const lcMessage = message.toLowerCase();
          const expectedReceiverThrow =
            lcMessage.indexOf("illegal invocation") !== -1 ||
            lcMessage.indexOf("incompatible receiver") !== -1;
          if (name !== "TypeError") return false;
          if (!expectedReceiverThrow) return false;
          if (!stack) return false;
          // Probe intentionally runs bad-receiver tests in printReceiverChecks(); those should not populate "err".
          // Filter only by probe-owned markers to avoid accidental coupling to other helpers.
          return /printReceiverChecks|__PROBE__/i.test(stack);
        } catch (_) {
          return false;
        }
      })();

      const errCell = (() => {
        try {
          if (probeExpectedErr) return null;
          const er = e ? e.error : null;
          if (er == null) return null;
          if (typeof er === "string") return er;
          if (typeof er === "object") {
            if (typeof er.name === "string" && er.name) return er.name;
            if (typeof er.message === "string" && er.message) return er.message;
            return null;
          }
          return String(er);
        } catch (_) {
          return null;
        }
      })();

      return {
        idx: i,
        timestamp: e && e.timestamp ? e.timestamp : null,
        code: e && e.code ? e.code : null,
        level: e && e.extra && e.extra.level ? e.extra.level : null,
        diagTag: e && e.extra && e.extra.diagTag ? e.extra.diagTag : null,
        module: e && e.extra && e.extra.module ? e.extra.module : null,
        stage: e && e.extra && e.extra.stage ? e.extra.stage : null,
        key: e && e.extra && e.extra.key ? e.extra.key : null,
        message: (e && e.extra && e.extra.message)
          ? e.extra.message
          : (e && e.error && typeof e.error === "object" && e.error && typeof e.error.message === "string")
            ? e.error.message
            : null,
        err: errCell,
        data: (() => {
          try {
            const s = JSON.stringify(e?.extra?.data);
            return (typeof s === "string") ? s : null;
          }
          catch (_) { return "[unserializable]"; }
        })()
      };
    });



    console.group("[probe] __DEGRADE__ last 50");
    console.log(`[probe] total degrade events: ${all.length}`);
    console.table(rows);
    console.log("[probe] raw last 50 entries:");
    for (const entry of last50) console.dir(entry, { depth: 5 });
    console.groupEnd();

    return { total: all.length, last50Count: last50.length, rows, raw: last50 };
  }

  // ===== [probe] module check (static module inventory + runtime rows from __DEGRADE__) =====
  // IMPORTANT:
  // - inventory stays static and follows main.py / assignmnets/array.md;
  // - runtime rows are built only from __DEGRADE__ buffer;
  // - patch rows are shown only for modules that already emit grouped patch diagnostics.
  const PROBE_MODULE_CHECK_SLOTS = [
    { module: "set_log", diagTag: "set_log", codePrefix: "set_log", source: "bundle", emitter: "missing", functions: "none" },
    { module: "probe", diagTag: "probe", codePrefix: "probe", source: "bundle", emitter: "diag", functions: "none" },
    { module: "core_window", diagTag: "core_window", codePrefix: "core_window", source: "bundle", emitter: "diag", functions: "none" },
    { module: "rtc", diagTag: "rtc", codePrefix: "rtc", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "hide_webdriver", diagTag: "hide_webdriver", codePrefix: "hide_webdriver", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "wrk", diagTag: "wrk", codePrefix: "wrk", source: "bundle", emitter: "diag", functions: "none" },
    { module: "rng_set", diagTag: "rng_set", codePrefix: "rng_set", source: "bundle", emitter: "diag", functions: "none" },
    { module: "nav_total_set", diagTag: "nav_total_set", codePrefix: "nav_total_set", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "screen", diagTag: "screen", codePrefix: "screen", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "fonts", diagTag: "fonts", codePrefix: "fonts", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "canvas", diagTag: "canvas", codePrefix: "canvas", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "webgl", diagTag: "webgl", codePrefix: "webgl", source: "bundle", emitter: "diag", functions: "auto", aliases: ["webglstorage"] },
    { module: "webgpu_wl", diagTag: "webgpu_wl", codePrefix: "webgpu_wl", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "webgpu", diagTag: "webgpu", codePrefix: "webgpu", source: "bundle", emitter: "diag", functions: "auto" },
    { module: "audiocontext", diagTag: "audiocontext", codePrefix: "audiocontext", source: "bundle", emitter: "diag", functions: "auto", aliases: ["audio"] },
    { module: "context", diagTag: "context", codePrefix: "context", source: "bundle", emitter: "diag", functions: "none" },
    { module: "tz", diagTag: "tz", codePrefix: "tz", source: "cdp", emitter: "diag", functions: "auto" },
    { module: "GeoOverride", diagTag: "geo", codePrefix: "geo", source: "cdp", emitter: "diag", functions: "auto" },
    { module: "uad_override", diagTag: "uad_override", codePrefix: "uad_override", source: "cdp", emitter: "diag", functions: "auto" },
    { module: "headers_interceptor", diagTag: "headers_interceptor", codePrefix: "headers_interceptor", source: "disabled", emitter: "diag", functions: "auto" },
    { module: "headers_bridge", diagTag: "headers_bridge", codePrefix: "headers_bridge", source: "disabled", emitter: "diag", functions: "auto" },
    { module: "WORKER_PATCH_SRC", diagTag: "worker_patch", codePrefix: "worker_patch_src", source: "cdp", emitter: "diag", functions: "none", aliases: ["WORKER_PATCH_SRC"] },
    { module: "worker_bootstrap", diagTag: "worker_bootstrap", codePrefix: "worker_bootstrap", source: "cdp", emitter: "diag", functions: "none" }
  ];

  function __probeModulePrefixes(slot) {
    const out = [];
    if (slot && typeof slot.diagTag === "string" && slot.diagTag) out.push(slot.diagTag);
    if (slot && typeof slot.codePrefix === "string" && slot.codePrefix) out.push(slot.codePrefix);
    if (slot && Array.isArray(slot.aliases)) {
      for (let i = 0; i < slot.aliases.length; i++) {
        const v = slot.aliases[i];
        if (typeof v === "string" && v) out.push(v);
      }
    }
    return out;
  }

  function __probePrefixMatch(value, prefix) {
    if (typeof value !== "string" || !value || typeof prefix !== "string" || !prefix) return false;
    return value === prefix || value.indexOf(prefix + ":") === 0;
  }

  function __probeSummaryCode(code) {
    if (typeof code !== "string" || !code) return false;
    return (
      code.endsWith(":ready") ||
      code.endsWith(":applied") ||
      code.endsWith(":patched") ||
      code.endsWith(":patches_applied") ||
      code.endsWith(":whitelist_loaded") ||
      code.endsWith(":group_applied")
    );
  }

  function __probeErrCell(entry) {
    try {
      const er = entry ? entry.error : null;
      if (er == null) return null;
      if (typeof er === "string") return er;
      if (typeof er === "object") {
        if (typeof er.name === "string" && er.name) return er.name;
        if (typeof er.message === "string" && er.message) return er.message;
        return null;
      }
      return String(er);
    } catch (_) {
      return null;
    }
  }

  function __probeDataCell(entry) {
    try {
      const s = JSON.stringify(entry?.extra?.data);
      return (typeof s === "string") ? s : null;
    } catch (_) {
      return "[unserializable]";
    }
  }

  function __probeRowStatus(slot, entry) {
    if (slot && slot.emitter === "missing") return "missing_emitter";
    if (!entry) {
      return (slot && slot.source === "disabled") ? "disabled" : "not_emitted";
    }
    const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
    const level = (extra && typeof extra.level === "string") ? extra.level : null;
    const stage = (extra && typeof extra.stage === "string") ? extra.stage : null;
    const code = (entry && typeof entry.code === "string") ? entry.code : "";
    const data = (extra && extra.data && typeof extra.data === "object") ? extra.data : null;
    const reason = (data && typeof data.reason === "string") ? data.reason : null;
    const outcome = (data && typeof data.outcome === "string") ? data.outcome : null;
    const err = entry ? entry.error : null;
    const errName = (err && typeof err === "object" && typeof err.name === "string")
      ? err.name
      : ((typeof err === "string" && err.indexOf("TypeError") >= 0) ? "TypeError" : null);
    const errMessage = (err && typeof err === "object" && typeof err.message === "string")
      ? err.message
      : ((typeof err === "string") ? err : null);
    const expectedReason = (
      reason === "native_illegal_invocation"
      || reason === "illegal_invocation"
      || reason === "native_throw"
    );
    const expectedCode = (
      code.endsWith("_illegal_invocation")
      || code.endsWith(":native_throw")
    );
    const hasTypeErrorSignal = (
      errName === "TypeError"
      || (typeof errMessage === "string" && errMessage.indexOf("TypeError") >= 0)
      || (typeof errMessage === "string" && errMessage.indexOf("Illegal invocation") >= 0)
      || (typeof errMessage === "string" && errMessage.indexOf("incompatible receiver") >= 0)
    );
    if (
      (stage === "runtime" || stage === "hook")
      && hasTypeErrorSignal
      && (expectedReason || expectedCode)
      && (outcome === "throw" || outcome == null)
    ) {
      return "expected_throw";
    }
    if (level === "fatal" || level === "error") return "error";
    if (level === "warn") return "warn";
    return __probeSummaryCode(entry.code) ? "ok" : "seen";
  }

  function __probeMakeRow(index, slot, entry, kind, unit, status) {
    const extra = (entry && entry.extra && typeof entry.extra === "object") ? entry.extra : null;
    return {
      idx: index,
      kind: kind,
      unit: unit,
      status: status,
      source: slot && typeof slot.source === "string" ? slot.source : null,
      emitter: slot && typeof slot.emitter === "string" ? slot.emitter : null,
      timestamp: entry && typeof entry.timestamp === "string" ? entry.timestamp : null,
      code: entry && typeof entry.code === "string" ? entry.code : null,
      level: extra && typeof extra.level === "string" ? extra.level : null,
      diagTag: extra && typeof extra.diagTag === "string"
        ? extra.diagTag
        : (slot && typeof slot.diagTag === "string" ? slot.diagTag : null),
      module: slot && typeof slot.module === "string"
        ? slot.module
        : (extra && typeof extra.module === "string" ? extra.module : null),
      stage: extra && typeof extra.stage === "string" ? extra.stage : null,
      key: extra && (typeof extra.key === "string" || extra.key === null) ? extra.key : null,
      message: (extra && typeof extra.message === "string")
        ? extra.message
        : (entry && entry.error && typeof entry.error === "object" && typeof entry.error.message === "string")
          ? entry.error.message
          : null,
      err: __probeErrCell(entry),
      data: __probeDataCell(entry)
    };
  }

  function __probeEventMatchesSlot(slot, entry) {
    if (!slot || !entry || typeof entry !== "object" || entry.type !== "degrade") return false;
    const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
    const moduleName = (extra && typeof extra.module === "string" && extra.module) ? extra.module : null;
    const diagTag = (extra && typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null;
    const code = (typeof entry.code === "string" && entry.code) ? entry.code : null;
    if (slot.module && moduleName === slot.module) return true;
    const prefixes = __probeModulePrefixes(slot);
    for (let i = 0; i < prefixes.length; i++) {
      const prefix = prefixes[i];
      if (__probePrefixMatch(diagTag, prefix) || __probePrefixMatch(code, prefix)) return true;
    }
    return false;
  }

  function __probePickModuleEvent(slot, events) {
    if (!Array.isArray(events) || !events.length) return null;
    let fallback = null;
    for (let i = events.length - 1; i >= 0; i--) {
      const entry = events[i];
      const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
      const diagTag = (extra && typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null;
      const moduleName = (extra && typeof extra.module === "string" && extra.module) ? extra.module : null;
      if (!fallback) fallback = entry;
      if ((diagTag && diagTag === slot.diagTag) || (moduleName && moduleName === slot.module)) {
        if (__probeSummaryCode(entry.code)) return entry;
        return entry;
      }
    }
    return fallback;
  }

  function __probePatchUnit(slot, entry) {
    if (!slot || slot.functions === "none" || !entry || typeof entry !== "object") return null;
    const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
    if (!extra) return null;
    const code = (typeof entry.code === "string" && entry.code) ? entry.code : null;
    const diagTag = (typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null;
    if (code && (code.indexOf(":nav_access") >= 0 || extra.message === "nav access")) return null;
    if (diagTag && diagTag !== slot.diagTag) return diagTag;
    if (code && !__probeSummaryCode(code)) return code;
    return null;
  }

  function printModuleCheck() {
    const rows = [];
    try {
      const degrade = globalThis.__DEGRADE__;
      const buf = (typeof degrade === "function" && typeof degrade.getBuffer === "function") ? degrade.getBuffer() : [];
      const arr = Array.isArray(buf) ? buf : [];
      let rowIndex = 0;

      for (let i = 0; i < PROBE_MODULE_CHECK_SLOTS.length; i++) {
        const slot = PROBE_MODULE_CHECK_SLOTS[i];
        const events = [];
        for (let j = 0; j < arr.length; j++) {
          const entry = arr[j];
          if (__probeEventMatchesSlot(slot, entry)) events.push(entry);
        }

        const moduleEvent = __probePickModuleEvent(slot, events);
        const moduleStatus = __probeRowStatus(slot, moduleEvent);
        rows.push(__probeMakeRow(rowIndex++, slot, moduleEvent, "module", slot.module, moduleStatus));

        if (slot.functions !== "none") {
          const latestByUnit = Object.create(null);
          for (let j = events.length - 1; j >= 0; j--) {
            const entry = events[j];
            const unit = __probePatchUnit(slot, entry);
            if (typeof unit !== "string" || !unit || latestByUnit[unit]) continue;
            latestByUnit[unit] = entry;
          }
          const patchUnits = Object.keys(latestByUnit).sort();
          for (let j = 0; j < patchUnits.length; j++) {
            const unit = patchUnits[j];
            const entry = latestByUnit[unit];
            rows.push(__probeMakeRow(rowIndex++, slot, entry, "patch", unit, __probeRowStatus(slot, entry)));
          }
        }
      }
    } catch (_) {}

    console.group("[probe] module check");
    console.table(rows);
    console.groupEnd();
    return rows;
  }

  const fieldsMeta = { check: "__PROBE__", phase: "build", method: "printFieldValues" };
  const fieldsWait = await __probeAwaitWithinBudget(printFieldValues(), fieldsMeta);
  if (!fieldsWait.ok && fieldsWait.timedOut) {
    __probeLogAsyncTimeout(fieldsMeta, fieldsWait.elapsedMs, fieldsWait.timeoutMs, fieldsWait.error);
  }
  const receiverMeta = { check: "__PROBE__", phase: "build", method: "printReceiverChecks" };
  const receiverWait = await __probeAwaitWithinBudget(printReceiverChecks(), receiverMeta);
  if (!receiverWait.ok && receiverWait.timedOut) {
    __probeLogAsyncTimeout(receiverMeta, receiverWait.elapsedMs, receiverWait.timeoutMs, receiverWait.error);
  }

  const result = {
    ok: true,
    timestamp: new Date().toISOString(),
    fields: fieldsWait.ok ? fieldsWait.value : [{
      field: "__probe__.printFieldValues",
      ok: false,
      value: null,
      error: errorToString(fieldsWait.error),
      source: "watchdog",
      asyncState: fieldsWait.timedOut ? "timed_out" : "rejected",
      elapsedMs: fieldsWait.elapsedMs
    }],
    descriptors: printPrototypeDescriptors(),
    methods: printTouchedMethods(),
    receiverChecks: receiverWait.ok ? receiverWait.value : {
      ok: false,
      rows: [{
        check: "receiver: watchdog",
        method: "printReceiverChecks",
        available: false,
        goodThis: null,
        goodSyncOk: null,
        goodResult: null,
        goodError: errorShape(receiverWait.error),
        goodAsyncState: receiverWait.timedOut ? "timed_out" : "rejected",
        goodElapsedMs: receiverWait.elapsedMs,
        badThrew: null,
        badError: null,
        badAsyncState: null,
        badElapsedMs: null,
        match: false
      }]
    },
    audioOwnProperty: printAudioOwnPropertyInvariantChecks(),
    prototypeInvariants: printPrototypeInvariantChecks(),
    toStringCrossRealm: printToStringCrossRealmChecks(),
    degrade: printLastDegradeEvents(),
    moduleCheck: printModuleCheck(),
    watchdog: {
      totalBudgetMs: __PROBE_TIMEOUTS.totalMs,
      spentMs: Date.now() - __probeRunStartedAt,
      remainingMs: __probeRemainingBudgetMs(),
      fields: {
        state: fieldsWait.ok ? "resolved" : (fieldsWait.timedOut ? "timed_out" : "rejected"),
        elapsedMs: fieldsWait.elapsedMs,
        timeoutMs: fieldsWait.timeoutMs
      },
      receiverChecks: {
        state: receiverWait.ok ? "resolved" : (receiverWait.timedOut ? "timed_out" : "rejected"),
        elapsedMs: receiverWait.elapsedMs,
        timeoutMs: receiverWait.timeoutMs
      }
    }
  };

  result.descriptorExpectations = printDescriptorExpectations(result);

  try {
    const criticalLevels = { warn: true, error: true, fatal: true };
    const parseRowData = (row) => {
      if (!row || typeof row !== "object") return null;
      if (typeof row.data !== "string" || !row.data) return null;
      try {
        const parsed = JSON.parse(row.data);
        return (parsed && typeof parsed === "object") ? parsed : null;
      } catch (_) {
        return null;
      }
    };
    const isExpectedThrowRow = (row) => {
      if (!row || typeof row !== "object") return false;
      const code = (typeof row.code === "string") ? row.code : "";
      const dataObj = parseRowData(row);
      const reason = (dataObj && typeof dataObj.reason === "string") ? dataObj.reason : null;
      const outcome = (dataObj && typeof dataObj.outcome === "string") ? dataObj.outcome : null;
      if (outcome === "throw" && (reason === "native_throw" || reason === "native_illegal_invocation" || reason === "illegal_invocation")) return true;
      if (code.endsWith(":native_throw")) return true;
      if (code.indexOf("_illegal_invocation") !== -1) return true;
      return false;
    };
    const degradeRows = (result.degrade && Array.isArray(result.degrade.rows)) ? result.degrade.rows : [];
    const hasUnexpectedDegrade = degradeRows.some((row) => {
      const level = (row && typeof row.level === "string") ? row.level : "";
      if (!criticalLevels[level]) return false;
      return !isExpectedThrowRow(row);
    });
    const moduleRows = Array.isArray(result.moduleCheck) ? result.moduleCheck : [];
    const badModuleStatuses = { error: true, warn: true, missing_emitter: true, not_emitted: true };
    const hasUnexpectedModule = moduleRows.some((row) => {
      const status = (row && typeof row.status === "string") ? row.status : "";
      return !!badModuleStatuses[status];
    });
    result.degradeOk = !hasUnexpectedDegrade;
    result.moduleCheckOk = !hasUnexpectedModule;
    result.ok = !!(
      (result.receiverChecks ? result.receiverChecks.ok !== false : true) &&
      (result.audioOwnProperty ? result.audioOwnProperty.ok !== false : true) &&
      (result.prototypeInvariants ? result.prototypeInvariants.ok !== false : true) &&
      (result.toStringCrossRealm ? result.toStringCrossRealm.ok !== false : true) &&
      (result.degradeOk !== false) &&
      (result.moduleCheckOk !== false)
    );
  } catch (_) {}
  globalThis.__PROBE_OUTPUT__ = result;

function __probeEscapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function __probeTableHtml(rows) {
  const arr = Array.isArray(rows) ? rows : [];
  const cols = arr.length ? Array.from(new Set(arr.flatMap((r) => Object.keys(r || {})))) : [];
  const thead = cols.map((c) => `<th>${__probeEscapeHtml(c)}</th>`).join("");
  const tbody = arr
    .map((r) => {
      const rr = r || {};
      return `<tr>${cols
        .map((c) => {
          let v = rr[c];
          if (v && typeof v === "object") v = JSON.stringify(v);
          return `<td>${__probeEscapeHtml(v == null ? "" : v)}</td>`;
        })
        .join("")}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
}

function __probeChecksVerticalHtml(rows) {
  const arr = Array.isArray(rows) ? rows : [];
  if (!arr.length) return "<pre>(no rows)</pre>";

  return arr.map((r, idx) => {
    const title = (r && r.check) ? String(r.check) : `check #${idx}`;
    const match = r && typeof r.match === "boolean" ? String(r.match) : "";
    const extra = r && r.extra ? __probeEscapeHtml(JSON.stringify(r.extra, null, 2)) : "";
    const err = r && r.error ? __probeEscapeHtml(JSON.stringify(r.error, null, 2)) : "";

    const expected = r && r.expected ? __probeEscapeHtml(r.expected) : "";
    const actual = r && r.actual ? __probeEscapeHtml(r.actual) : "";

    return `
<details ${idx < 6 ? "open" : ""}>
  <summary>${__probeEscapeHtml(title)}${match ? " — match: " + __probeEscapeHtml(match) : ""}</summary>
  <div style="margin:8px 0 14px; padding:8px 10px; border:1px solid #eee; background:#fafafa;">
    <div style="margin:6px 0;"><strong>Expected</strong></div>
    <pre>${expected}</pre>
    <div style="margin:6px 0;"><strong>Actual</strong></div>
    <pre>${actual}</pre>
    ${extra ? `<div style="margin:6px 0;"><strong>Extra</strong></div><pre>${extra}</pre>` : ""}
    ${err ? `<div style="margin:6px 0;"><strong>Error</strong></div><pre>${err}</pre>` : ""}
  </div>
</details>
`.trim();
  }).join("\n");
}

function __probeDownloadHtmlReport(result) {
  const ts = (result && result.timestamp) ? result.timestamp : new Date().toISOString();
  const title = `probe report ${ts}`;

  const fields = result && result.fields;
  const methodsRows = result && result.methods && result.methods.rows;
  const degradeRows = result && result.degrade && result.degrade.rows;
  const toStringCrossRows = result && result.toStringCrossRealm && result.toStringCrossRealm.rows;
  const receiverRows = result && result.receiverChecks && result.receiverChecks.rows;
  const audioOwnRows = result && result.audioOwnProperty && result.audioOwnProperty.rows;
  const protoInvRows = result && result.prototypeInvariants && result.prototypeInvariants.rows;
  const descriptorExpectRows = result && result.descriptorExpectations && Array.isArray(result.descriptorExpectations.rows)
    ? result.descriptorExpectations.rows.filter((r) => !r.allMatch)
    : [];
  const descriptorExpectMeta = result && result.descriptorExpectations
    ? `total: ${result.descriptorExpectations.total}, mismatches: ${result.descriptorExpectations.mismatches}, skipped: ${!!result.descriptorExpectations.skipped}${result.descriptorExpectations.error && result.descriptorExpectations.error.message ? `, error: ${result.descriptorExpectations.error.message}` : ""}`
    : "not available";
  const descBlocks = (result && Array.isArray(result.descriptors)) ? result.descriptors : [];
  const descHtml = descBlocks.map((b) => {
    const name = b && b.prototype ? String(b.prototype) : "prototype";
    if (b && b.error) {
      return `<section><h3>${__probeEscapeHtml(name)}</h3><pre>${__probeEscapeHtml(b.error)}</pre></section>`;
    }
    const rows = b && b.rows;
    return `<section><h3>${__probeEscapeHtml(name)}</h3>${__probeTableHtml(rows)}</section>`;
  }).join("");

  const rawJson = __probeEscapeHtml(JSON.stringify(result, null, 2));

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${__probeEscapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body { font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; padding: 16px; }
  h1,h2,h3 { font: 600 14px/1.2 system-ui, -apple-system, Segoe UI, Arial; margin: 18px 0 8px; }
  .meta { opacity: .75; margin-bottom: 12px; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0 14px; }
  th,td { border: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
  th { background: #f6f6f6; position: sticky; top: 0; }
  section { margin-bottom: 18px; }
  pre { white-space: pre-wrap; word-break: break-word; background: #fafafa; border: 1px solid #eee; padding: 10px; }
  details > summary { cursor: pointer; }
</style>
</head>
<body>
  <h1>${__probeEscapeHtml(title)}</h1>
  <div class="meta">timestamp: ${__probeEscapeHtml(ts)}</div>

  <section>
    <h2>Field values</h2>
    ${__probeTableHtml(fields)}
  </section>

  <section>
    <h2>Prototype descriptors</h2>
    ${descHtml || "<pre>(no descriptors)</pre>"}
  </section>

  <section>
    <h2>Descriptor expectations mismatches</h2>
    <div class="meta">${__probeEscapeHtml(descriptorExpectMeta)}</div>
    ${descriptorExpectRows.length ? __probeTableHtml(descriptorExpectRows) : "<pre>(no mismatches)</pre>"}
  </section>

  <section>
    <h2>Touched methods</h2>
    ${__probeTableHtml(methodsRows)}
  </section>

  <section>
    <h2>Receiver/Illegal invocation checks</h2>
    ${__probeTableHtml(receiverRows)}
  </section>

  <section>
    <h2>AnalyserNode own-property invariant checks</h2>
    ${__probeTableHtml(audioOwnRows)}
  </section>

  <section>
    <h2>Prototype/instanceof checks</h2>
    ${__probeTableHtml(protoInvRows)}
  </section>

  <section>
    <h2>Function.prototype.toString cross-realm checks (hard invariants + informational)</h2>
    ${__probeChecksVerticalHtml(toStringCrossRows)}
  </section>

  <section>
    <h2>__DEGRADE__ last 50</h2>
    ${__probeTableHtml(degradeRows)}
  </section>

  <details>
    <summary>Raw JSON</summary>
    <pre>${rawJson}</pre>
  </details>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `probe-report-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(a.href);

}

__probeDownloadHtmlReport(result);


try {
  const text = JSON.stringify(result, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `probe-output-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
} catch (e) {
  __probeDiag('fatal', 'probe:apply_failed', {
    stage: 'apply',
    key: 'probe',
    message: 'probe is here',
    type: 'browser structure missing data',
    data: null
  }, e);
  return;
}





return result;
}, configurable: true });
