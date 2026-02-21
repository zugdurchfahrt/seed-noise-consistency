
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
    "Intl.ListFormat",
    "Intl.PluralRules",
    "Intl.RelativeTimeFormat",
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
      keys: ["measureText", "fillText", "strokeText"]
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
      } else {
        highEntropyFetchAttempted = true;
        try {
          const highEntropyResult = await Reflect.apply(uaData.getHighEntropyValues, uaData, [highEntropyKeys]);
          if (!highEntropyResult || typeof highEntropyResult !== "object") {
            highEntropyFetchError = new TypeError("[probe] getHighEntropyValues returned non-object result");
          } else {
            for (const key of highEntropyKeys) {
              const path = `${highEntropyBasePath}${key}`;
              highEntropyValuesByPath.set(path, {
                present: Object.prototype.hasOwnProperty.call(highEntropyResult, key),
                value: highEntropyResult[key]
              });
            }
          }
        } catch (e) {
          highEntropyFetchError = e;
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
            source: "userAgentData.getHighEntropyValues"
          };
        }
        if (highEntropyFetchError) {
          return {
            field: path,
            ok: false,
            value: null,
            error: errorToString(highEntropyFetchError),
            source: "userAgentData.getHighEntropyValues"
          };
        }
        if (highEntropyFetchAttempted) {
          return {
            field: path,
            ok: false,
            value: null,
            error: `TypeError: Missing '${key}' in getHighEntropyValues result`,
            source: "userAgentData.getHighEntropyValues"
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

    async function safeApply(fn, thisArg, args) {
      try {
        const value = Reflect.apply(fn, thisArg, Array.isArray(args) ? args : []);
        if (isPromiseLike(value)) {
          try {
            return { ok: true, value: await value, promise: true };
          } catch (e) {
            return { ok: false, error: e, promise: true };
          }
        }
        return { ok: true, value, promise: false };
      } catch (e) {
        return { ok: false, error: e, promise: false };
      }
    }

    function classifyError(e) {
      if (!e) return null;
      const name = e && e.name ? String(e.name) : "Error";
      const msg = e && e.message ? String(e.message) : String(e);
      const illegal = msg.indexOf("Illegal invocation") !== -1;
      const incompatibleProxy =
        msg.indexOf("incompatible Proxy") !== -1 ||
        msg.indexOf("incompatible proxy") !== -1 ||
        msg.indexOf("Incompatible proxy") !== -1;
      return { name, message: msg, illegalInvocation: illegal, incompatibleProxy: incompatibleProxy };
    }

    async function pushRow(label, fn, goodThis, goodArgs, badThis, badArgs) {
      const row = {
        check: label,
        available: typeof fn === "function",
        goodThis: goodThis ? Object.prototype.toString.call(goodThis) : null,
        goodSyncOk: null,
        goodResult: null,
        goodError: null,
        badThrew: null,
        badError: null,
        match: null
      };

      if (typeof fn !== "function") {
        rows.push(row);
        return;
      }

      // Bad receiver: should throw TypeError / Illegal invocation in Chromium
      const bad = await safeApply(fn, badThis, badArgs);
      row.badThrew = !bad.ok;
      row.badError = bad.ok ? null : classifyError(bad.error);

      const badMatch =
        row.badThrew === true &&
        row.badError &&
        (row.badError.name === "TypeError" || row.badError.illegalInvocation === true);

      // Good receiver: should not throw TypeError synchronously (other errors may be env-specific)
      let goodMatch = null;
      if (goodThis) {
        const good = await safeApply(fn, goodThis, goodArgs);
        row.goodSyncOk = !!good.ok;
        if (good.ok) {
          row.goodResult = toPrintable(good.value);
        } else {
          row.goodError = classifyError(good.error);
          if (row.goodError && (row.goodError.name === "TypeError" || row.goodError.illegalInvocation === true)) {
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
      available: r.available,
      match: r.match,
      badThrew: r.badThrew,
      badError: r.badError ? r.badError.name : null,
      goodSyncOk: r.goodSyncOk,
      goodError: r.goodError ? r.goodError.name : null
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



    const rows = last50.map((e, i) => ({
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
      err: (() => {
        try {
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
      })(),
      data: (() => {
        try {
          const s = JSON.stringify(e?.extra?.data);
          return (typeof s === "string") ? s : null;
        }
        catch (_) { return "[unserializable]"; }
      })()
    }));



    console.group("[probe] __DEGRADE__ last 50");
    console.log(`[probe] total degrade events: ${all.length}`);
    console.table(rows);
    console.log("[probe] raw last 50 entries:");
    for (const entry of last50) console.dir(entry, { depth: 5 });
    console.groupEnd();

    return { total: all.length, last50Count: last50.length, rows, raw: last50 };
  }

  const result = {
    ok: true,
    timestamp: new Date().toISOString(),
    fields: await printFieldValues(),
    descriptors: printPrototypeDescriptors(),
    methods: printTouchedMethods(),
    receiverChecks: await printReceiverChecks(),
    prototypeInvariants: printPrototypeInvariantChecks(),
    toStringCrossRealm: printToStringCrossRealmChecks(),
    degrade: printLastDegradeEvents()
  };

  result.descriptorExpectations = printDescriptorExpectations(result);

  try {
    result.ok = !!(
      (result.receiverChecks ? result.receiverChecks.ok !== false : true) &&
      (result.prototypeInvariants ? result.prototypeInvariants.ok !== false : true) &&
      (result.toStringCrossRealm ? result.toStringCrossRealm.ok !== false : true)
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






// Скрипт печатает данные и сохраняет результат в JSON.


// вызвать один раз:__probeDownloadHtmlReport(window.__PROBE_OUTPUT__);
