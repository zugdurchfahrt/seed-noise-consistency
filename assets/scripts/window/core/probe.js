(function(){
const __probeRun = async function(){
  "use strict";

  if (typeof globalThis === "undefined") {
    throw new Error("[probe] globalThis is missing");
  }

  const nav = globalThis.navigator;

  if (!nav) {
    throw new Error("[probe] navigator is missing");
  }


  const W = (typeof window !== "undefined") ? window : null;
  const __probeCoreInternal = (W && W.Core && W.Core.__internal && typeof W.Core.__internal === "object")
    ? W.Core.__internal
    : null;
  const __probeCoreToStringState = (__probeCoreInternal && __probeCoreInternal.coreToStringState && typeof __probeCoreInternal.coreToStringState === "object")
    ? __probeCoreInternal.coreToStringState
    : null;
  const __probeProxyTargetMap = (__probeCoreToStringState && __probeCoreToStringState.proxyTargetMap instanceof WeakMap)
    ? __probeCoreToStringState.proxyTargetMap
    : null;
  const __probeLoggerRoot = (W && W.CanvasPatchContext && W.CanvasPatchContext.__logger && typeof W.CanvasPatchContext.__logger === "object")
    ? W.CanvasPatchContext.__logger
    : null;
  const __probeDegrade = (__probeLoggerRoot && typeof __probeLoggerRoot.__DEGRADE__ === "function") ? __probeLoggerRoot.__DEGRADE__ : null;
  const __probeRawConsole = (__probeLoggerRoot && __probeLoggerRoot.__RAW_CONSOLE__ && typeof __probeLoggerRoot.__RAW_CONSOLE__ === "object")
    ? __probeLoggerRoot.__RAW_CONSOLE__
    : null;
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

  function __probeConsoleCall(method) {
    try {
      const fn = __probeRawConsole && typeof __probeRawConsole[method] === "function"
        ? __probeRawConsole[method]
        : null;
      if (typeof fn !== "function") return;
      const args = Array.prototype.slice.call(arguments, 1);
      fn.apply(__probeRawConsole, args);
    } catch (_) {}
  }

  function __probeCountWhere(list, predicate) {
    const arr = Array.isArray(list) ? list : [];
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      let matched = false;
      try {
        matched = !!predicate(arr[i], i);
      } catch (_) {
        matched = false;
      }
      if (matched) count += 1;
    }
    return count;
  }

  function __probeIsPlainObject(value) {
    if (!value || typeof value !== "object") return false;
    try {
      const proto = Object.getPrototypeOf(value);
      return proto === Object.prototype || proto === null;
    } catch (_) {
      return false;
    }
  }

  function __probeNormalizeReportScalar(value) {
    if (value === null || typeof value === "undefined") return value;
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean") return value;
    if (value instanceof Error) return errorShape(value);
    if (Array.isArray(value)) {
      const lim = Math.min(value.length, 8);
      const out = new Array(lim);
      for (let i = 0; i < lim; i++) out[i] = copyJson(value[i]);
      if (value.length > lim) out.push(`[... ${value.length - lim} more items]`);
      return out;
    }
    if (__probeIsPlainObject(value)) {
      const keys = Object.keys(value);
      const out = {};
      const lim = Math.min(keys.length, 8);
      for (let i = 0; i < lim; i++) {
        const k = keys[i];
        out[k] = copyJson(value[k]);
      }
      if (keys.length > lim) out.__truncated_keys__ = keys.length - lim;
      return out;
    }
    return toPrintable(value);
  }

  function __probeNormalizeReportRow(section, row) {
    if (!row || typeof row !== "object") return __probeNormalizeReportScalar(row);
    const out = {};
    function pick(key, alias) {
      if (!Object.prototype.hasOwnProperty.call(row, key)) return;
      out[alias || key] = __probeNormalizeReportScalar(row[key]);
    }
    if (section === "field_values") {
      pick("field"); pick("ok"); pick("value"); pick("error"); pick("source");
      return out;
    }
    if (section === "worker_scope_audit") {
      pick("scope"); pick("variant"); pick("field"); pick("match"); pick("expected"); pick("actual"); pick("error");
      return out;
    }
    if (section === "prototype_descriptors") {
      pick("prototype");
      if (Array.isArray(row.rows)) out.rowCount = row.rows.length;
      if (Array.isArray(row.rows) && row.rows.length) {
        const first = row.rows[0];
        if (first && typeof first === "object") {
          const keys = Object.keys(first).slice(0, 8);
          if (keys.length) out.rowShape = keys;
        }
      }
      return Object.keys(out).length ? out : __probeNormalizeReportScalar(row);
    }
    if (section === "touched_methods") {
      pick("method"); pick("ok"); pick("exists"); pick("isMethod"); pick("signature"); pick("toStringStatus"); pick("setProtoStatus"); pick("error");
      return out;
    }
    if (section === "receiver_checks") {
      pick("check"); pick("method"); pick("available"); pick("match"); pick("badThrew"); pick("badError"); pick("goodError"); pick("badAsyncState"); pick("goodAsyncState");
      return out;
    }
    if (section === "audio_own_property_checks") {
      pick("check"); pick("method"); pick("match"); pick("expectedAfterCreateOwn"); pick("actualAfterCreateOwn"); pick("extra"); pick("error");
      return out;
    }
    if (section === "prototype_instanceof_checks" || section === "tostring_cross_realm_checks") {
      pick("check"); pick("match"); pick("expected"); pick("actual"); pick("error");
      return out;
    }
    if (section === "descriptor_expectations") {
      pick("prototype"); pick("key"); pick("allMatch"); pick("missingActual");
      const mismatchKeys = [];
      const keys = Object.keys(row);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k.indexOf("match_") === 0 && row[k] === false) mismatchKeys.push(k.slice(6));
      }
      if (mismatchKeys.length) out.mismatchFields = mismatchKeys;
      return out;
    }
    if (section === "degrade_last_50") {
      pick("idx"); pick("timestamp"); pick("level"); pick("code"); pick("module"); pick("key"); pick("message"); pick("err");
      return out;
    }
    if (section === "module_check") {
      pick("module"); pick("unit"); pick("status"); pick("code"); pick("message");
      return out;
    }
    const keys = Object.keys(row);
    for (let i = 0; i < Math.min(keys.length, 8); i++) pick(keys[i]);
    if (keys.length > 8) out.__truncated_keys__ = keys.length - 8;
    return out;
  }

  function __probeNormalizeReportData(value) {
    if (!__probeIsPlainObject(value)) return copyJson(value);
    const out = {};
    if (Object.prototype.hasOwnProperty.call(value, "section")) out.section = copyJson(value.section);
    if (Object.prototype.hasOwnProperty.call(value, "status")) out.status = copyJson(value.status);
    if (Object.prototype.hasOwnProperty.call(value, "probeRunId")) out.probeRunId = copyJson(value.probeRunId);
    if (Object.prototype.hasOwnProperty.call(value, "summary")) out.summary = __probeNormalizeReportScalar(value.summary);
    if (Object.prototype.hasOwnProperty.call(value, "reason")) out.reason = copyJson(value.reason);
    if (Object.prototype.hasOwnProperty.call(value, "error")) out.error = __probeNormalizeReportScalar(value.error);
    const section = (typeof value.section === "string" && value.section) ? value.section : "";
    if (Array.isArray(value.rows)) {
      const lim = Math.min(value.rows.length, 64);
      out.rows = new Array(lim);
      for (let i = 0; i < lim; i++) out.rows[i] = __probeNormalizeReportRow(section, value.rows[i]);
      if (value.rows.length > lim) out.rows.push(`[... ${value.rows.length - lim} more items]`);
    }
    if (Array.isArray(value.rawEntries)) {
      const lim = Math.min(value.rawEntries.length, 12);
      out.rawEntries = new Array(lim);
      for (let i = 0; i < lim; i++) out.rawEntries[i] = __probeNormalizeReportScalar(value.rawEntries[i]);
      if (value.rawEntries.length > lim) out.rawEntries.push(`[... ${value.rawEntries.length - lim} more items]`);
    }
    if (Object.prototype.hasOwnProperty.call(value, "meta")) out.meta = __probeNormalizeReportScalar(value.meta);
    return out;
  }

  function __probeReport(section, payload, err) {
    try {
      const sectionName = (typeof section === "string" && section) ? section : "unknown";
      const x = (payload && typeof payload === "object") ? payload : {};
      const status = (typeof x.status === "string" && x.status) ? x.status : "ok";
      const level = (typeof x.level === "string" && x.level)
        ? x.level
        : ((status === "error") ? "error" : ((status === "mismatch" || status === "skipped") ? "warn" : "info"));
      const data = {
        section: sectionName,
        status: status,
        probeRunId: String(__probeRunStartedAt)
      };
      if (Object.prototype.hasOwnProperty.call(x, "rows")) data.rows = x.rows;
      if (Object.prototype.hasOwnProperty.call(x, "summary")) data.summary = x.summary;
      if (Object.prototype.hasOwnProperty.call(x, "reason")) data.reason = x.reason;
      if (Object.prototype.hasOwnProperty.call(x, "error")) data.error = x.error;
      if (Object.prototype.hasOwnProperty.call(x, "rawEntries")) data.rawEntries = x.rawEntries;
      if (Object.prototype.hasOwnProperty.call(x, "meta")) data.meta = x.meta;
      __probeDiag(level, `probe:section:${sectionName}`, {
        diagTag: "probe:report",
        stage: "report",
        key: sectionName,
        message: `[probe] section report ${sectionName} #${__probeRunStartedAt}`,
        type: "probe telemetry",
        data: __probeNormalizeReportData(data)
      }, err || null);
    } catch (_) {}
  }

  const __PROBE_DEFAULT_FLAGS__ = {
    workerScopeAudit: true,
    brandCheck: true,
    receiverChecks: true
  };
  if (!globalThis.__PROBE_FLAGS__ || typeof globalThis.__PROBE_FLAGS__ !== "object") {
    globalThis.__PROBE_FLAGS__ = Object.assign({}, __PROBE_DEFAULT_FLAGS__);
  } else {
    for (const key of Object.keys(__PROBE_DEFAULT_FLAGS__)) {
      if (!Object.prototype.hasOwnProperty.call(globalThis.__PROBE_FLAGS__, key)) {
        globalThis.__PROBE_FLAGS__[key] = __PROBE_DEFAULT_FLAGS__[key];
      }
    }
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
    sharedWorkerMs: __probeNum(__probeTimeoutCfg.sharedWorkerMs, 12000),
    totalMs: __probeNum(__probeTimeoutCfg.totalMs, 30000)
  };
  const __probeFlagsCfg =
    (globalThis.__PROBE_FLAGS__ && typeof globalThis.__PROBE_FLAGS__ === "object")
      ? globalThis.__PROBE_FLAGS__
      : {};
  const __PROBE_ENABLE_RECEIVER_CHECKS__ = __probeFlagsCfg.receiverChecks === true;
  const __PROBE_ENABLE_BRAND_CHECK__ = __probeFlagsCfg.brandCheck === true;
  const __PROBE_ENABLE_WORKER_SCOPE_AUDIT__ = __probeFlagsCfg.workerScopeAudit === true;
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

  async function __probeObserveAsync(promiseLike) {
    const startedAt = Date.now();
    try {
      const value = await Promise.resolve(promiseLike);
      return { ok: true, value, timedOut: false, elapsedMs: Date.now() - startedAt, timeoutMs: 0 };
    } catch (error) {
      const timedOut = !!(error && (error.probeTimedOut === true || error.name === "TimeoutError"));
      return {
        ok: false,
        error,
        timedOut,
        elapsedMs: Date.now() - startedAt,
        timeoutMs: __probeNum(error && error.timeoutMs, 0)
      };
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
    const requestedMs = __probeNum(meta && meta.timeoutMs, __PROBE_TIMEOUTS.stepMs);
    const budgetMs = Math.min(requestedMs, left);
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

  // Manual probe runs create live audio objects; close/disconnect them before returning.
  function __probeCleanupAudioObjects(audioCtx, analyser) {
    try {
      if (analyser && typeof analyser.disconnect === "function") analyser.disconnect();
    } catch (_) {}
    try {
      if (audioCtx && typeof audioCtx.close === "function") {
        const closeResult = audioCtx.close();
        if (closeResult && typeof closeResult.catch === "function") closeResult.catch(function() {});
        return;
      }
    } catch (_) {}
    try {
      if (audioCtx && typeof audioCtx.suspend === "function") {
        const suspendResult = audioCtx.suspend();
        if (suspendResult && typeof suspendResult.catch === "function") suspendResult.catch(function() {});
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
    "userAgentData.uaFullVersion",
    "userAgentData.fullVersionList",
    "userAgentData.getHighEntropyValues",
    "userAgentData.toJSON"
  ];

  const USER_AGENT_DATA_HIGH_ENTROPY_HINTS = [
    "architecture",
    "bitness",
    "formFactors",
    "fullVersionList",
    "model",
    "platformVersion",
    "uaFullVersion",
    "wow64"
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
        "uaFullVersion",
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
      label: "Screen.prototype",
      getProto: () => {
        if (typeof window === "undefined" || !window.screen) return null;
        return Object.getPrototypeOf(window.screen);
      },
      getTarget: () => {
        if (typeof window === "undefined" || !window.screen) return null;
        return window.screen;
      },
      keys: [
        "width",
        "height",
        "availWidth",
        "availHeight",
        "colorDepth",
        "pixelDepth",
        "availLeft",
        "availTop",
        "orientation"
      ]
    },
    {
      label: "ScreenOrientation.prototype",
      getProto: () => {
        if (typeof window === "undefined" || !window.screen || !window.screen.orientation) return null;
        return Object.getPrototypeOf(window.screen.orientation);
      },
      getTarget: () => {
        if (typeof window === "undefined" || !window.screen || !window.screen.orientation) return null;
        return window.screen.orientation;
      },
      keys: ["type", "angle"]
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

  const API_CONTROL_TARGET_SPECS = [
    {
      target: "Date.toLocaleDateString",
      scope: "window",
      key: "toLocaleDateString",
      getRoot: () => (typeof Date !== "undefined" && Date && Date.prototype ? Date.prototype : null),
      hasOwnOnNavigator: () => null
    },
    {
      target: "Date.toLocaleString",
      scope: "window",
      key: "toLocaleString",
      getRoot: () => (typeof Date !== "undefined" && Date && Date.prototype ? Date.prototype : null),
      hasOwnOnNavigator: () => null
    },
    {
      target: "Date.toLocaleTimeString",
      scope: "window",
      key: "toLocaleTimeString",
      getRoot: () => (typeof Date !== "undefined" && Date && Date.prototype ? Date.prototype : null),
      hasOwnOnNavigator: () => null
    },
    {
      target: "DateTimeFormat.resolvedOptions",
      scope: "window",
      key: "resolvedOptions",
      getRoot: () => (
        typeof Intl !== "undefined" &&
        Intl &&
        Intl.DateTimeFormat &&
        Intl.DateTimeFormat.prototype
          ? Intl.DateTimeFormat.prototype
          : null
      ),
      hasOwnOnNavigator: () => null
    },
    {
      target: "Function.toString",
      scope: "window",
      key: "toString",
      getRoot: () => (typeof Function !== "undefined" && Function && Function.prototype ? Function.prototype : null),
      hasOwnOnNavigator: () => null
    },
    {
      target: "GPU.requestAdapter",
      scope: "window",
      key: "requestAdapter",
      getRoot: () => {
        if (typeof GPU !== "undefined" && GPU && GPU.prototype) return GPU.prototype;
        const gpu = safeGet(nav, "gpu");
        if (!gpu.ok || !gpu.value) return null;
        return Object.getPrototypeOf(gpu.value);
      },
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "gpu")
    },
    {
      target: "MediaDevices.enumerateDevices",
      scope: "window",
      key: "enumerateDevices",
      getRoot: () => {
        if (typeof MediaDevices !== "undefined" && MediaDevices && MediaDevices.prototype) return MediaDevices.prototype;
        if (!nav || !nav.mediaDevices) return null;
        return Object.getPrototypeOf(nav.mediaDevices);
      },
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "mediaDevices")
    },
    {
      target: "Navigator.appVersion",
      scope: "window",
      key: "appVersion",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "appVersion")
    },
    {
      target: "Navigator.deviceMemory",
      scope: "window",
      key: "deviceMemory",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "deviceMemory")
    },
    {
      target: "Navigator.hardwareConcurrency",
      scope: "window",
      key: "hardwareConcurrency",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "hardwareConcurrency")
    },
    {
      target: "Navigator.language",
      scope: "window",
      key: "language",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "language")
    },
    {
      target: "Navigator.languages",
      scope: "window",
      key: "languages",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "languages")
    },
    {
      target: "Navigator.maxTouchPoints",
      scope: "window",
      key: "maxTouchPoints",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "maxTouchPoints")
    },
    {
      target: "Navigator.mimeTypes",
      scope: "window",
      key: "mimeTypes",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "mimeTypes")
    },
    {
      target: "Navigator.platform",
      scope: "window",
      key: "platform",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "platform")
    },
    {
      target: "Navigator.plugins",
      scope: "window",
      key: "plugins",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "plugins")
    },
    {
      target: "Navigator.productSub",
      scope: "window",
      key: "productSub",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "productSub")
    },
    {
      target: "Navigator.vendor",
      scope: "window",
      key: "vendor",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "vendor")
    },
    {
      target: "Navigator.vendorSub",
      scope: "window",
      key: "vendorSub",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "vendorSub")
    },
    {
      target: "Navigator.webdriver",
      scope: "window",
      key: "webdriver",
      getRoot: () => Object.getPrototypeOf(nav),
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "webdriver")
    },
    {
      target: "Permissions.query",
      scope: "window",
      key: "query",
      getRoot: () => {
        if (typeof Permissions !== "undefined" && Permissions && Permissions.prototype) return Permissions.prototype;
        if (!nav || !nav.permissions) return null;
        return Object.getPrototypeOf(nav.permissions);
      },
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "permissions")
    },
    {
      target: "RelativeTimeFormat.resolvedOptions",
      scope: "window",
      key: "resolvedOptions",
      getRoot: () => (
        typeof Intl !== "undefined" &&
        Intl &&
        Intl.RelativeTimeFormat &&
        Intl.RelativeTimeFormat.prototype
          ? Intl.RelativeTimeFormat.prototype
          : null
      ),
      hasOwnOnNavigator: () => null
    },
    {
      target: "StorageManager.estimate",
      scope: "window",
      key: "estimate",
      getRoot: () => {
        if (typeof StorageManager !== "undefined" && StorageManager && StorageManager.prototype) return StorageManager.prototype;
        if (!nav || !nav.storage) return null;
        return Object.getPrototypeOf(nav.storage);
      },
      hasOwnOnNavigator: () => Object.prototype.hasOwnProperty.call(nav, "storage")
    }
  ];

  const API_CONTROL_WORKER_TARGET_KEYS = [
    "deviceMemory",
    "hardwareConcurrency",
    "language",
    "languages"
  ];
  const WORKER_ACCESSOR_OBSERVABILITY_TARGET_KEYS = [
    "hardwareConcurrency",
    "language",
    "languages",
    "userAgentData"
  ];

  function errorToString(error) {
    if (!error) return null;
    const name = error && error.name ? String(error.name) : "Error";
    const message = error && error.message ? String(error.message) : String(error);
    return `${name}: ${message}`;
  }

  function __probeDescribeProtoNode(node) {
    if (node == null) return "null";
    try {
      const ctor = node && node.constructor;
      const ctorName = (typeof ctor === "function" && ctor.name) ? String(ctor.name) : "";
      if (ctorName) return `${ctorName}.prototype`;
    } catch (_) {}
    try {
      return Object.prototype.toString.call(node);
    } catch (_) {
      return "[prototype unreadable]";
    }
  }

  function __probeBuildProtoChain(root) {
    const rows = [];
    const seen = [];
    let current = root;
    let depth = 0;
    while (current != null && depth < 24) {
      if (seen.indexOf(current) !== -1) {
        rows.push("[cycle]");
        return rows;
      }
      seen.push(current);
      rows.push(__probeDescribeProtoNode(current));
      try {
        current = Object.getPrototypeOf(current);
      } catch (e) {
        rows.push(`[Object.getPrototypeOf threw: ${errorToString(e)}]`);
        return rows;
      }
      depth += 1;
    }
    rows.push("null");
    return rows;
  }

  function __probeAccessorVsData(desc) {
    if (!desc) return null;
    if (typeof desc.get === "function" || typeof desc.set === "function") return "accessor";
    if (Object.prototype.hasOwnProperty.call(desc, "value")) return "data";
    return "unknown";
  }

  function __probeFindDescriptor(root, key) {
    let current = root;
    while (current) {
      let desc = null;
      try {
        desc = Object.getOwnPropertyDescriptor(current, key) || null;
      } catch (_) {
        desc = null;
      }
      if (desc) return { owner: current, desc };
      try {
        current = Object.getPrototypeOf(current);
      } catch (_) {
        current = null;
      }
    }
    return { owner: null, desc: null };
  }

  function __probeBridgeKind(fn, proxyTargetMap) {
    if (typeof fn !== "function") return "not_function";
    if (!(proxyTargetMap instanceof WeakMap)) return "native_or_untracked";
    try {
      const target = proxyTargetMap.get(fn);
      if (typeof target === "function" && target !== fn) return "proxy_carrier";
    } catch (_) {}
    return "native_or_untracked";
  }

  function __probeCompactError(error) {
    if (!error) return null;
    return {
      name: error && error.name ? String(error.name) : "Error",
      message: error && error.message ? String(error.message) : String(error)
    };
  }

  function __probeSafeCall(fn, finalizer) {
    try {
      return { ok: true, value: fn() };
    } catch (error) {
      return { ok: false, error };
    } finally {
      try {
        if (typeof finalizer === "function") finalizer();
      } catch (_) {}
    }
  }

  function __probeCollectAccessorObservabilityRows(specs, proxyTargetMap) {
    const list = Array.isArray(specs) ? specs : [];
    return list.map((spec) => {
      const key = spec && spec.key ? String(spec.key) : "unknown";
      const property = (spec && typeof spec.property === "string" && spec.property) ? spec.property : key;
      const mode = (spec && typeof spec.mode === "string" && spec.mode) ? spec.mode : "accessor";
      const receiver = spec ? spec.receiver : null;
      const root = spec ? spec.root : null;
      const resolved = __probeFindDescriptor(root, property);
      const desc = resolved.desc;
      const callable = mode === "method"
        ? (desc && typeof desc.value === "function" ? desc.value : null)
        : (desc && typeof desc.get === "function" ? desc.get : null);
      const good = callable
        ? __probeSafeCall(() => Reflect.apply(callable, receiver, []))
        : { ok: false, error: new Error(mode === "method" ? "method missing" : "getter missing") };
      const bad = callable
        ? __probeSafeCall(() => Reflect.apply(callable, {}, []))
        : { ok: false, error: new Error(mode === "method" ? "method missing" : "getter missing") };
      const text = callable
        ? __probeSafeCall(() => Function.prototype.toString.call(callable))
        : { ok: false, error: new Error(mode === "method" ? "method missing" : "getter missing") };
      const nativeProto = callable
        ? __probeSafeCall(() => Object.getPrototypeOf(callable)).value
        : null;
      const objectCreateToString = callable
        ? __probeSafeCall(() => Object.create(callable).toString())
        : { ok: false, error: new Error(mode === "method" ? "method missing" : "getter missing") };
      const setProtoRecursion = callable
        ? __probeSafeCall(
            () => Object.setPrototypeOf(callable, Object.create(callable)).toString(),
            () => {
              try {
                if (nativeProto) Object.setPrototypeOf(callable, nativeProto);
              } catch (_) {}
            }
          )
        : { ok: false, error: new Error(mode === "method" ? "method missing" : "getter missing") };

      return {
        key,
        descriptorOwner: __probeDescribeProtoNode(resolved.owner),
        descriptorShape: desc ? {
          configurable: !!desc.configurable,
          enumerable: !!desc.enumerable,
          hasGetter: typeof desc.get === "function",
          hasSetter: typeof desc.set === "function",
          hasValue: Object.prototype.hasOwnProperty.call(desc, "value")
        } : null,
        accessorVsData: __probeAccessorVsData(desc),
        hasOwnOnNavigator: !!(receiver && Object.prototype.hasOwnProperty.call(receiver, property)),
        getterKind: __probeBridgeKind(callable, proxyTargetMap),
        toString: text.ok ? String(text.value) : null,
        toStringHasNativeCode: text.ok && typeof text.value === "string" ? text.value.indexOf("[native code]") !== -1 : false,
        goodValue: good.ok ? toPrintable(good.value) : null,
        goodError: good.ok ? null : __probeCompactError(good.error),
        badError: bad.ok ? null : __probeCompactError(bad.error),
        objectCreateToStringError: objectCreateToString.ok ? null : __probeCompactError(objectCreateToString.error),
        setProtoRecursionError: setProtoRecursion.ok ? null : __probeCompactError(setProtoRecursion.error)
      };
    });
  }

  function __probeCompareAccessorObservability(windowRows, actualRows, scope, variant) {
    const expectedIndex = new Map();
    for (const row of Array.isArray(windowRows) ? windowRows : []) {
      if (!row || typeof row.key !== "string") continue;
      expectedIndex.set(row.key, row);
    }
    const isWorkerScope = scope === "DedicatedWorker" || scope === "SharedWorker" || scope === "ServiceWorker";
    const expectedWorkerOwner = isWorkerScope ? "WorkerNavigator.prototype" : null;
    return (Array.isArray(actualRows) ? actualRows : []).map((actual) => {
      const expected = expectedIndex.get(actual.key) || null;
      const badErrorMatch = __probeStableStringify(expected ? expected.badError : null) === __probeStableStringify(actual.badError);
      const objectCreateMatch = __probeStableStringify(expected ? expected.objectCreateToStringError : null) === __probeStableStringify(actual.objectCreateToStringError);
      const setProtoMatch = __probeStableStringify(expected ? expected.setProtoRecursionError : null) === __probeStableStringify(actual.setProtoRecursionError);
      const descriptorOwnerMatch = !!expected && (
        expected.descriptorOwner === actual.descriptorOwner ||
        (expected.descriptorOwner === "Navigator.prototype" && actual.descriptorOwner === expectedWorkerOwner)
      );
      const descriptorShapeMatch = __probeStableStringify(expected ? expected.descriptorShape : null) === __probeStableStringify(actual.descriptorShape);
      const getterKindMatch = !!expected && expected.getterKind === actual.getterKind;
      const toStringNativeMatch = !!expected && expected.toStringHasNativeCode === actual.toStringHasNativeCode;
      const hasOwnMatch = !!expected && expected.hasOwnOnNavigator === actual.hasOwnOnNavigator;
      const match = !!expected && descriptorOwnerMatch && descriptorShapeMatch && getterKindMatch && toStringNativeMatch && badErrorMatch && objectCreateMatch && setProtoMatch && hasOwnMatch;
      return {
        scope,
        variant: variant || null,
        key: actual.key,
        match,
        descriptorOwnerMatch,
        descriptorShapeMatch,
        getterKindMatch,
        toStringNativeMatch,
        badErrorMatch,
        objectCreateToStringErrorMatch: objectCreateMatch,
        setProtoRecursionErrorMatch: setProtoMatch,
        hasOwnOnNavigatorMatch: hasOwnMatch,
        expected: expected ? {
          descriptorOwner: expected.descriptorOwner,
          descriptorShape: expected.descriptorShape,
          getterKind: expected.getterKind,
          toStringHasNativeCode: expected.toStringHasNativeCode,
          badError: expected.badError,
          objectCreateToStringError: expected.objectCreateToStringError,
          setProtoRecursionError: expected.setProtoRecursionError,
          hasOwnOnNavigator: expected.hasOwnOnNavigator
        } : null,
        actual: {
          descriptorOwner: actual.descriptorOwner,
          descriptorShape: actual.descriptorShape,
          getterKind: actual.getterKind,
          toStringHasNativeCode: actual.toStringHasNativeCode,
          badError: actual.badError,
          objectCreateToStringError: actual.objectCreateToStringError,
          setProtoRecursionError: actual.setProtoRecursionError,
          hasOwnOnNavigator: actual.hasOwnOnNavigator
        }
      };
    });
  }

  function __probeInspectApiControlTarget(spec, overrides) {
    const extra = (overrides && typeof overrides === "object") ? overrides : {};
    const row = {
      target: spec && spec.target ? String(spec.target) : "unknown",
      scope: extra.scope || (spec && spec.scope ? String(spec.scope) : "window"),
      variant: Object.prototype.hasOwnProperty.call(extra, "variant") ? extra.variant : null,
      descriptorOwner: null,
      descriptorShape: null,
      accessorVsData: null,
      hasOwnOnNavigator: null,
      descriptorMissing: null,
      ownerMissing: null,
      readOnlyInspection: "Object.getOwnPropertyDescriptor",
      protoChain: [],
      error: null
    };
    let root = null;
    let key = null;
    try {
      key = spec && spec.key ? String(spec.key) : null;
      if (!key) throw new Error("probe control key missing");
      root = Object.prototype.hasOwnProperty.call(extra, "root")
        ? extra.root
        : (spec && typeof spec.getRoot === "function" ? spec.getRoot() : null);
      if (Object.prototype.hasOwnProperty.call(extra, "hasOwnOnNavigator")) {
        row.hasOwnOnNavigator = extra.hasOwnOnNavigator;
      } else if (spec && typeof spec.hasOwnOnNavigator === "function") {
        row.hasOwnOnNavigator = spec.hasOwnOnNavigator();
      }
      if (!root) {
        row.protoChain = [];
        row.descriptorMissing = true;
        row.ownerMissing = true;
        return row;
      }
      row.protoChain = __probeBuildProtoChain(root);
      let current = root;
      while (current != null) {
        let desc = null;
        try {
          desc = Object.getOwnPropertyDescriptor(current, key) || null;
        } catch (e) {
          row.error = errorShape(e);
          row.descriptorMissing = true;
          row.ownerMissing = true;
          return row;
        }
        if (desc) {
          row.descriptorOwner = __probeDescribeProtoNode(current);
          row.descriptorShape = descriptorShape(desc);
          row.accessorVsData = __probeAccessorVsData(desc);
          row.descriptorMissing = false;
          row.ownerMissing = false;
          return row;
        }
        current = Object.getPrototypeOf(current);
      }
      row.descriptorMissing = true;
      row.ownerMissing = true;
      return row;
    } catch (e) {
      row.error = errorShape(e);
      row.descriptorMissing = true;
      row.ownerMissing = true;
      return row;
    }
  }

  async function __probeCollectWorkerControlRows() {
    const keysJson = JSON.stringify(API_CONTROL_WORKER_TARGET_KEYS);
    const workerScript = `
      function __probeWorkerDescribeProtoNode__(node) {
        if (node == null) return "null";
        try {
          const ctor = node && node.constructor;
          const ctorName = (typeof ctor === "function" && ctor.name) ? String(ctor.name) : "";
          if (ctorName) return ctorName + ".prototype";
        } catch (_) {}
        try {
          return Object.prototype.toString.call(node);
        } catch (_) {
          return "[prototype unreadable]";
        }
      }
      function __probeWorkerBuildProtoChain__(root) {
        const rows = [];
        const seen = [];
        let current = root;
        let depth = 0;
        while (current != null && depth < 24) {
          if (seen.indexOf(current) !== -1) {
            rows.push("[cycle]");
            return rows;
          }
          seen.push(current);
          rows.push(__probeWorkerDescribeProtoNode__(current));
          try {
            current = Object.getPrototypeOf(current);
          } catch (e) {
            rows.push("[Object.getPrototypeOf threw]");
            return rows;
          }
          depth += 1;
        }
        rows.push("null");
        return rows;
      }
      function __probeWorkerDescriptorShape__(desc) {
        if (!desc) return null;
        return {
          configurable: !!desc.configurable,
          enumerable: !!desc.enumerable,
          writable: Object.prototype.hasOwnProperty.call(desc, "writable") ? !!desc.writable : null,
          hasGetter: typeof desc.get === "function",
          hasSetter: typeof desc.set === "function",
          hasValue: Object.prototype.hasOwnProperty.call(desc, "value"),
          valueType: Object.prototype.hasOwnProperty.call(desc, "value") ? typeof desc.value : null
        };
      }
      function __probeWorkerInspectRow__(key) {
        const nav = self.navigator;
        const root = nav ? Object.getPrototypeOf(nav) : null;
        const scopeName =
          (typeof SharedWorkerGlobalScope === "function" && self instanceof SharedWorkerGlobalScope)
            ? "SharedWorkerGlobalScope"
            : ((typeof DedicatedWorkerGlobalScope === "function" && self instanceof DedicatedWorkerGlobalScope)
              ? "DedicatedWorkerGlobalScope"
              : "DedicatedWorkerGlobalScope");
        const scope =
          scopeName === "SharedWorkerGlobalScope"
            ? "shared"
            : "dedicated";
        const row = {
          target: scopeName + ".WorkerNavigator." + key,
          key: key,
          scope: scopeName,
          scopeKind: scope,
          descriptorOwner: null,
          descriptorShape: null,
          accessorVsData: null,
          hasOwnOnNavigator: nav ? Object.prototype.hasOwnProperty.call(nav, key) : null,
          descriptorMissing: null,
          ownerMissing: null,
          readOnlyInspection: "Object.getOwnPropertyDescriptor",
          protoChain: root ? __probeWorkerBuildProtoChain__(root) : [],
          error: null
        };
        if (!root) {
          row.descriptorMissing = true;
          row.ownerMissing = true;
          return row;
        }
        let current = root;
        while (current != null) {
          let desc = null;
          try {
            desc = Object.getOwnPropertyDescriptor(current, key) || null;
          } catch (e) {
            row.error = {
              name: e && e.name ? String(e.name) : "Error",
              message: e && e.message ? String(e.message) : String(e),
              stack: e && e.stack ? String(e.stack) : null
            };
            row.descriptorMissing = true;
            row.ownerMissing = true;
            return row;
          }
          if (desc) {
            row.descriptorOwner = __probeWorkerDescribeProtoNode__(current);
            row.descriptorShape = __probeWorkerDescriptorShape__(desc);
            row.accessorVsData =
              (typeof desc.get === "function" || typeof desc.set === "function")
                ? "accessor"
                : (Object.prototype.hasOwnProperty.call(desc, "value") ? "data" : "unknown");
            row.descriptorMissing = false;
            row.ownerMissing = false;
            return row;
          }
          current = Object.getPrototypeOf(current);
        }
        row.descriptorMissing = true;
        row.ownerMissing = true;
        return row;
      }
      async function __probeWorkerCollectControlRows__() {
        const keys = ${keysJson};
        return keys.map(__probeWorkerInspectRow__);
      }
    `;

    const dedicatedSource = `
      "use strict";
      ${workerScript}
      (async function() {
        try {
          const rows = await __probeWorkerCollectControlRows__();
          self.postMessage({ ok: true, rows: rows });
        } catch (error) {
          self.postMessage({
            ok: false,
            error: {
              name: error && error.name ? String(error.name) : "Error",
              message: error && error.message ? String(error.message) : String(error),
              stack: error && error.stack ? String(error.stack) : null
            }
          });
        }
      })();
    `;

    const sharedSource = `
      "use strict";
      ${workerScript}
      self.onconnect = function(ev) {
        const port = ev && ev.ports && ev.ports[0];
        if (!port) return;
        Promise.resolve()
          .then(__probeWorkerCollectControlRows__)
          .then(function(rows) {
            port.postMessage({ ok: true, rows: rows });
          })
          .catch(function(error) {
            port.postMessage({
              ok: false,
              error: {
                name: error && error.name ? String(error.name) : "Error",
                message: error && error.message ? String(error.message) : String(error),
                stack: error && error.stack ? String(error.stack) : null
              }
            });
          });
      };
    `;

    const rows = [];
    const cleanup = [];
    const dedicatedURL = URL.createObjectURL(new Blob([dedicatedSource], { type: "text/javascript" }));
    const sharedURL = URL.createObjectURL(new Blob([sharedSource], { type: "text/javascript" }));
    const sharedName = `probe-control-shared-${Date.now()}`;
    const pushTransportRows = (variant, wait) => {
      const error = wait && wait.error ? wait.error : null;
      const scope = variant === "SharedWorker" ? "SharedWorker" : "DedicatedWorker";
      const scopeKind = variant === "SharedWorker" ? "shared" : "dedicated";
      const scopeName = variant === "SharedWorker" ? "SharedWorkerGlobalScope" : "DedicatedWorkerGlobalScope";
      for (const key of API_CONTROL_WORKER_TARGET_KEYS) {
        rows.push({
          target: `${scopeName}.WorkerNavigator.${key}`,
          scope: scopeName,
          scopeKind: scopeKind,
          variant,
          descriptorOwner: null,
          descriptorShape: null,
          accessorVsData: null,
          hasOwnOnNavigator: null,
          descriptorMissing: null,
          ownerMissing: null,
          readOnlyInspection: "worker_transport",
          protoChain: [],
          transportState: wait && wait.timedOut ? "timed_out" : "failed",
          error: errorShape(error)
        });
      }
    };
    try {
      const dedicatedWait = await __probeAwaitWithTimeout((async () => {
        const worker = new Worker(dedicatedURL);
        cleanup.push(() => { try { worker.terminate(); } catch (_) {} });
        return await new Promise((resolve, reject) => {
          const onMessage = (ev) => {
            cleanupListeners();
            const data = ev && ev.data;
            if (data && data.ok) return resolve(data.rows);
            reject(data && data.error ? new Error(String(data.error.message || data.error.name || "worker error")) : new Error("worker error"));
          };
          const onError = (ev) => {
            cleanupListeners();
            reject(new Error(ev && ev.message ? String(ev.message) : "worker message error"));
          };
          const cleanupListeners = () => {
            worker.removeEventListener("message", onMessage);
            worker.removeEventListener("error", onError);
          };
          worker.addEventListener("message", onMessage);
          worker.addEventListener("error", onError);
        });
      })(), __PROBE_TIMEOUTS.stepMs, {
        check: "api_control_list",
        phase: "DedicatedWorker",
        method: "Worker"
      });

      if (dedicatedWait.ok) {
        const dedicatedRows = Array.isArray(dedicatedWait.value) ? dedicatedWait.value : [];
        for (const row of dedicatedRows) {
          rows.push(Object.assign({ scope: "DedicatedWorkerGlobalScope", scopeKind: "dedicated", variant: "DedicatedWorker" }, row));
        }
      } else {
        pushTransportRows("DedicatedWorker", dedicatedWait);
      }

      const sharedWait = await __probeAwaitWithTimeout((async () => {
        const shared = new SharedWorker(sharedURL, { name: sharedName });
        const port = shared.port;
        cleanup.push(() => {
          try { if (port && typeof port.close === "function") port.close(); } catch (_) {}
        });
        return await new Promise((resolve, reject) => {
          const onMessage = (ev) => {
            cleanupListeners();
            const data = ev && ev.data;
            if (data && data.ok) return resolve(data.rows);
            reject(data && data.error ? new Error(String(data.error.message || data.error.name || "shared worker error")) : new Error("shared worker error"));
          };
          const onError = (ev) => {
            cleanupListeners();
            reject(new Error(ev && ev.message ? String(ev.message) : "shared worker message error"));
          };
          const cleanupListeners = () => {
            port.removeEventListener("message", onMessage);
            port.removeEventListener("messageerror", onError);
          };
          port.addEventListener("message", onMessage);
          port.addEventListener("messageerror", onError);
          if (typeof port.start === "function") port.start();
        });
      })(), __PROBE_TIMEOUTS.sharedWorkerMs, {
        check: "api_control_list",
        phase: "SharedWorker",
        method: "SharedWorker"
      });

      if (sharedWait.ok) {
        const sharedRows = Array.isArray(sharedWait.value) ? sharedWait.value : [];
        for (const row of sharedRows) {
          rows.push(Object.assign({ scope: "SharedWorkerGlobalScope", scopeKind: "shared", variant: "SharedWorker" }, row));
        }
      } else {
        pushTransportRows("SharedWorker", sharedWait);
      }
    } finally {
      while (cleanup.length) {
        const fn = cleanup.pop();
        try { fn(); } catch (_) {}
      }
      try { URL.revokeObjectURL(dedicatedURL); } catch (_) {}
      try { URL.revokeObjectURL(sharedURL); } catch (_) {}
    }
    return rows;
  }

  async function printApiControlList() {
    const rows = [];
    for (const spec of API_CONTROL_TARGET_SPECS) {
      rows.push(__probeInspectApiControlTarget(spec));
    }
    if (__PROBE_ENABLE_WORKER_SCOPE_AUDIT__) {
      const workerRows = await __probeCollectWorkerControlRows();
      Array.prototype.push.apply(rows, workerRows);
    }
    __probeConsoleCall("group", "[probe] API control list");
    __probeConsoleCall("table", rows);
    __probeConsoleCall("groupEnd");
    return {
      rows,
      meta: {
        targets: API_CONTROL_TARGET_SPECS.length,
        workerTargets: API_CONTROL_WORKER_TARGET_KEYS.length
      }
    };
  }

  async function printFieldValues() {
    const uaData = nav && nav.userAgentData ? nav.userAgentData : null;
    const highEntropyKeys = USER_AGENT_DATA_HIGH_ENTROPY_HINTS.slice();
    const highEntropyValuesByKey = new Map();
    let highEntropyFetchError = null;
    let highEntropyFetchAttempted = false;
    let highEntropyAsyncState = null;
    let highEntropyElapsedMs = null;

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
              highEntropyValuesByKey.set(key, {
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
      const r = readPath(nav, path);
      return {
        field: path,
        ok: r.ok,
        value: r.ok ? toPrintable(r.value) : null,
        error: r.ok ? null : errorToString(r.error),
        source: "direct"
      };
    });
    for (const key of highEntropyKeys) {
      const highEntropyEntry = highEntropyValuesByKey.get(key) || null;
      if (highEntropyEntry && highEntropyEntry.present) {
        rows.push({
          field: `userAgentData.getHighEntropyValues.${key}`,
          ok: true,
          value: toPrintable(highEntropyEntry.value),
          error: null,
          source: "userAgentData.getHighEntropyValues",
          asyncState: highEntropyAsyncState,
          elapsedMs: highEntropyElapsedMs
        });
        continue;
      }
      rows.push({
        field: `userAgentData.getHighEntropyValues.${key}`,
        ok: false,
        value: null,
        error: highEntropyFetchError
          ? errorToString(highEntropyFetchError)
          : (highEntropyFetchAttempted
            ? `TypeError: Missing '${key}' in getHighEntropyValues result`
            : "TypeError: high entropy fetch not attempted"),
        source: "userAgentData.getHighEntropyValues",
        asyncState: highEntropyAsyncState || "rejected",
        elapsedMs: highEntropyElapsedMs
      });
    }

    __probeConsoleCall("group", "[probe] Field values");
    __probeConsoleCall("table", rows);
    __probeConsoleCall("groupEnd");

    return rows;
  }

  async function __probeCollectCanonicalScopeValues(scopeName, targetNav) {
    const navTarget = targetNav || null;
    if (!navTarget) {
      throw new Error(`[probe] ${scopeName} navigator missing`);
    }
    const uaData = navTarget.userAgentData || null;
    const heKeys = USER_AGENT_DATA_HIGH_ENTROPY_HINTS.slice();
    let he = null;
    if (!uaData || typeof uaData.getHighEntropyValues !== "function") {
      throw new Error(`[probe] ${scopeName} userAgentData.getHighEntropyValues missing`);
    }
    const waited = await __probeAwaitWithTimeout(
      Reflect.apply(uaData.getHighEntropyValues, uaData, [heKeys]),
      __PROBE_TIMEOUTS.highEntropyMs,
      { check: "worker_scope_audit", phase: scopeName, method: "NavigatorUAData.getHighEntropyValues" }
    );
    if (!waited.ok) {
      if (waited.timedOut) {
        __probeLogAsyncTimeout({ check: "worker_scope_audit", phase: scopeName, method: "NavigatorUAData.getHighEntropyValues" }, waited.elapsedMs, waited.timeoutMs, waited.error);
      }
      throw waited.error || new Error(`[probe] ${scopeName} high entropy failed`);
    }
    he = waited.value;
    if (!he || typeof he !== "object") {
      throw new Error(`[probe] ${scopeName} high entropy result invalid`);
    }
    return {
      language: navTarget.language,
      languages: Array.isArray(navTarget.languages) ? Array.prototype.slice.call(navTarget.languages) : navTarget.languages,
      deviceMemory: navTarget.deviceMemory,
      hardwareConcurrency: navTarget.hardwareConcurrency,
      uaData: {
        brands: uaData && Array.isArray(uaData.brands) ? JSON.parse(JSON.stringify(uaData.brands)) : uaData ? uaData.brands : null,
        mobile: uaData ? uaData.mobile : null,
        platform: uaData ? uaData.platform : null,
        uaFullVersion: uaData ? uaData.uaFullVersion : null,
        fullVersionList: uaData && Array.isArray(uaData.fullVersionList) ? JSON.parse(JSON.stringify(uaData.fullVersionList)) : (he && Array.isArray(he.fullVersionList) ? JSON.parse(JSON.stringify(he.fullVersionList)) : null),
        highEntropy: JSON.parse(JSON.stringify(he))
      }
    };
  }

  function __probeStableStringify(value) {
    try {
      return JSON.stringify(value);
    } catch (_) {
      return null;
    }
  }

  function copyJson(value) {
    if (value == null) return null;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return toPrintable(value);
    }
  }

  function workerScopeName(scopeKind) {
    if (scopeKind === "dedicated") return "DedicatedWorker";
    if (scopeKind === "shared") return "SharedWorker";
    if (scopeKind === "service") return "ServiceWorker";
    if (scopeKind === "window") return "Window";
    if (scopeKind === "Worker" || scopeKind === "worker" || scopeKind === "WorkerGlobalScope" || scopeKind === "DedicatedWorkerGlobalScope") return "DedicatedWorker";
    if (scopeKind === "SharedWorker" || scopeKind === "SharedWorkerGlobalScope") return "SharedWorker";
    if (scopeKind === "ServiceWorker" || scopeKind === "ServiceWorkerGlobalScope") return "ServiceWorker";
    if (scopeKind === "DedicatedWorker") return "DedicatedWorker";
    return typeof scopeKind === "string" && scopeKind ? scopeKind : null;
  }

  function findNativeSkip(scopeName, field) {
    if (field !== "language" && field !== "languages" && field !== "hardwareConcurrency" && field !== "deviceMemory") {
      return null;
    }
    try {
      const wantedScope = workerScopeName(scopeName);
      const events = getDegradeEvents();
      for (let i = events.length - 1; i >= 0; i--) {
        const entry = events[i];
        if (!entry || entry.code !== "worker_patch_src:workernavigator_descriptor:native_mismatch_skip") continue;
        const extra = entry.extra && typeof entry.extra === "object" ? entry.extra : null;
        const data = extra && extra.data && typeof extra.data === "object" ? extra.data : null;
        const key = extra && typeof extra.key === "string" ? extra.key : null;
        if (key !== field || !data) continue;
        const eventScope = workerScopeName(data.scope);
        if (wantedScope && eventScope && wantedScope !== eventScope) continue;
        return {
          reason: typeof data.reason === "string" && data.reason ? data.reason : "no_admissible_carrier",
          nativeValue: copyJson(data.nativeValue),
          profileValue: copyJson(data.profileValue),
          requiresAction: data.requiresAction === true
        };
      }
    } catch (_) {}
    return null;
  }

  function __probeCompareScopeValues(expectedWindow, actualScope, scopeName, variant) {
    const rows = [];
    const actualValues = actualScope && typeof actualScope === "object" ? actualScope : {};
    const push = (field, expected, actual) => {
      const directMatch = __probeStableStringify(actual) === __probeStableStringify(expected);
      const skip = directMatch ? null : findNativeSkip(scopeName, field);
      const skipMatch = !!(skip && __probeStableStringify(actual) === __probeStableStringify(skip.nativeValue));
      rows.push({
        scope: scopeName,
        variant: variant || null,
        field,
        match: directMatch || skipMatch,
        expected: copyJson(expected),
        actual: copyJson(actual),
        baseline: skipMatch ? "native" : "window",
        reason: skipMatch ? skip.reason : null,
        nativeValue: skipMatch ? copyJson(skip.nativeValue) : null,
        profileValue: skipMatch ? copyJson(skip.profileValue) : null
      });
    };
    push("language", expectedWindow.language, actualValues.language);
    push("languages", expectedWindow.languages, actualValues.languages);
    push("deviceMemory", expectedWindow.deviceMemory, actualValues.deviceMemory);
    push("hardwareConcurrency", expectedWindow.hardwareConcurrency, actualValues.hardwareConcurrency);
    push("userAgentData.brands", expectedWindow.uaData.brands, actualValues.uaData && actualValues.uaData.brands);
    push("userAgentData.mobile", expectedWindow.uaData.mobile, actualValues.uaData && actualValues.uaData.mobile);
    push("userAgentData.platform", expectedWindow.uaData.platform, actualValues.uaData && actualValues.uaData.platform);
    push("userAgentData.uaFullVersion", expectedWindow.uaData.uaFullVersion, actualValues.uaData && actualValues.uaData.uaFullVersion);
    push("userAgentData.fullVersionList", expectedWindow.uaData.fullVersionList, actualValues.uaData && actualValues.uaData.fullVersionList);
    for (const field of USER_AGENT_DATA_HIGH_ENTROPY_HINTS) {
      push(`userAgentData.getHighEntropyValues.${field}`, expectedWindow.uaData.highEntropy[field], actualValues.uaData && actualValues.uaData.highEntropy ? actualValues.uaData.highEntropy[field] : null);
    }
    return rows;
  }

  async function __probeRunWorkerScopeAudit() {
    function runWindowSeedProbeAudit() {
      try {
        const core = globalThis && globalThis.Core && typeof globalThis.Core === "object"
          ? globalThis.Core
          : null;
        const internal = core && core.__internal && typeof core.__internal === "object"
          ? core.__internal
          : null;
        const state = internal && internal.coreToStringState && internal.coreToStringState.__CORE_TOSTRING_STATE__ === true
          ? internal.coreToStringState
          : null;
        if (!state || typeof state.nativeToString !== "function" || !(state.overrideMap instanceof WeakMap) || !(state.proxyTargetMap instanceof WeakMap)) {
          throw new Error("Core.__internal.coreToStringState missing");
        }
        return {
          ok: true,
          legacyExportPresent: !!(core && Object.prototype.hasOwnProperty.call(core, "__ensureMarkAsNative")),
          statePresent: true
        };
      } catch (error) {
        return {
          ok: false,
          error: errorShape(error)
        };
      }
    }

    const windowValues = await __probeCollectCanonicalScopeValues("WindowScope", nav);
    const windowSeedProbeAudit = runWindowSeedProbeAudit();
    const workerSeedProbeAuditSource = String.raw`
      function __probeRunWorkerSeedProbeAudit__() {
        const shapeError = function(error) {
          return {
            name: error && error.name ? String(error.name) : "Error",
            message: error && error.message ? String(error.message) : String(error),
            stack: error && error.stack ? String(error.stack) : null
          };
        };
        try {
          const ctx = self && self.CanvasPatchContext && typeof self.CanvasPatchContext === "object"
            ? self.CanvasPatchContext
            : null;
          const stateRoot = ctx && ctx.state && typeof ctx.state === "object"
            ? ctx.state
            : null;
          const wrkState = stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === "object"
            ? stateRoot.__WRK__
            : null;
          const runtime = wrkState && wrkState.runtime && typeof wrkState.runtime === "object"
            ? wrkState.runtime
            : null;
          if (!runtime) {
            throw new Error("CanvasPatchContext.state.__WRK__.runtime missing");
          }
          const ensureMarkAsNative = typeof runtime.__ensureMarkAsNative === "function"
            ? runtime.__ensureMarkAsNative
            : null;
          const state = runtime.__CORE_TOSTRING_STATE__ && runtime.__CORE_TOSTRING_STATE__.__CORE_TOSTRING_STATE__ === true
            ? runtime.__CORE_TOSTRING_STATE__
            : null;
          if (typeof ensureMarkAsNative !== "function") {
            throw new Error("CanvasPatchContext.state.__WRK__.runtime.__ensureMarkAsNative missing");
          }
          if (!state || typeof state.nativeToString !== "function" || !(state.overrideMap instanceof WeakMap) || !(state.proxyTargetMap instanceof WeakMap)) {
            throw new Error("CanvasPatchContext.state.__WRK__.runtime.__CORE_TOSTRING_STATE__ missing");
          }
          const markAsNative = ensureMarkAsNative();
          if (typeof markAsNative !== "function") {
            throw new Error("markAsNative seed missing");
          }
          const toStringOverrideMap = state.overrideMap;
          const toStringProxyTargetMap = state.proxyTargetMap;
          const nativeToString = state.nativeToString;
          const seedProbe = function seedProbe(){};
          Object.defineProperty(seedProbe, "__coreBridgeTarget__", {
            value: nativeToString,
            writable: true,
            configurable: true,
            enumerable: false
          });
          const seedProbeSource = Reflect.apply(nativeToString, seedProbe, []);
          let leakedLabel = false;
          let actualSource = null;
          try {
            markAsNative(seedProbe, "toString");
            leakedLabel = typeof toStringOverrideMap.get(seedProbe) === "string";
            actualSource = Reflect.apply(Function.prototype.toString, seedProbe, []);
          } finally {
            toStringProxyTargetMap.delete(seedProbe);
            toStringOverrideMap.delete(seedProbe);
          }
          if (leakedLabel) {
            throw new Error("source-text toString probe must stay unlabeled");
          }
          if (actualSource !== seedProbeSource) {
            throw new Error("source-text toString probe forwarding mismatch");
          }
          return {
            ok: true,
            labelLeaked: false,
            forwardingMatch: true
          };
        } catch (error) {
          return {
            ok: false,
            error: shapeError(error)
          };
        }
      }
    `;
    const workerHighEntropyKeysJson = JSON.stringify(USER_AGENT_DATA_HIGH_ENTROPY_HINTS);
    const dedicatedSource = `
      (async function(){
        "use strict";
        ${workerSeedProbeAuditSource}
        async function collect() {
          const nav = self.navigator;
          if (!nav) throw new Error("navigator missing");
          const uaData = nav.userAgentData;
          if (!uaData || typeof uaData.getHighEntropyValues !== "function") throw new Error("userAgentData missing");
          const heKeys = ${workerHighEntropyKeysJson};
          const he = await Reflect.apply(uaData.getHighEntropyValues, uaData, [heKeys]);
          return {
            language: nav.language,
            languages: Array.isArray(nav.languages) ? Array.prototype.slice.call(nav.languages) : nav.languages,
            deviceMemory: nav.deviceMemory,
            hardwareConcurrency: nav.hardwareConcurrency,
            seedProbeAudit: __probeRunWorkerSeedProbeAudit__(),
            uaData: {
              brands: Array.isArray(uaData.brands) ? JSON.parse(JSON.stringify(uaData.brands)) : uaData.brands,
              mobile: uaData.mobile,
              platform: uaData.platform,
              uaFullVersion: uaData.uaFullVersion,
              fullVersionList: Array.isArray(uaData.fullVersionList) ? JSON.parse(JSON.stringify(uaData.fullVersionList)) : (he && Array.isArray(he.fullVersionList) ? JSON.parse(JSON.stringify(he.fullVersionList)) : null),
              highEntropy: JSON.parse(JSON.stringify(he))
            }
          };
        }
        try {
          const values = await collect();
          self.postMessage({ ok: true, values: values });
        } catch (error) {
          self.postMessage({
            ok: false,
            error: {
              name: error && error.name ? String(error.name) : "Error",
              message: error && error.message ? String(error.message) : String(error),
              stack: error && error.stack ? String(error.stack) : null
            }
          });
        }
      })();
    `;
    const sharedSource = `
      "use strict";
      ${workerSeedProbeAuditSource}
      async function __probeCollectSharedValues__() {
        const nav = self.navigator;
        if (!nav) throw new Error("navigator missing");
        const uaData = nav.userAgentData;
        if (!uaData || typeof uaData.getHighEntropyValues !== "function") throw new Error("userAgentData missing");
        const heKeys = ${workerHighEntropyKeysJson};
        const he = await Reflect.apply(uaData.getHighEntropyValues, uaData, [heKeys]);
        return {
          language: nav.language,
          languages: Array.isArray(nav.languages) ? Array.prototype.slice.call(nav.languages) : nav.languages,
          deviceMemory: nav.deviceMemory,
          hardwareConcurrency: nav.hardwareConcurrency,
          seedProbeAudit: __probeRunWorkerSeedProbeAudit__(),
          uaData: {
            brands: Array.isArray(uaData.brands) ? JSON.parse(JSON.stringify(uaData.brands)) : uaData.brands,
            mobile: uaData.mobile,
            platform: uaData.platform,
            uaFullVersion: uaData.uaFullVersion,
            fullVersionList: Array.isArray(uaData.fullVersionList) ? JSON.parse(JSON.stringify(uaData.fullVersionList)) : (he && Array.isArray(he.fullVersionList) ? JSON.parse(JSON.stringify(he.fullVersionList)) : null),
            highEntropy: JSON.parse(JSON.stringify(he))
          }
        };
      }
      self.onconnect = function(ev) {
        const port = ev && ev.ports && ev.ports[0];
        if (!port) return;
        Promise.resolve()
          .then(__probeCollectSharedValues__)
          .then(function(values) {
            port.postMessage({ ok: true, values: values });
          })
          .catch(function(error) {
            port.postMessage({
              ok: false,
              error: {
                name: error && error.name ? String(error.name) : "Error",
                message: error && error.message ? String(error.message) : String(error),
                stack: error && error.stack ? String(error.stack) : null
              }
            });
          });
      };
    `;
    const dedicatedURL = URL.createObjectURL(new Blob([dedicatedSource], { type: "text/javascript" }));
    const sharedURL = URL.createObjectURL(new Blob([sharedSource], { type: "text/javascript" }));
    const sharedName = `probe-shared-${Date.now()}`;
    const rows = [];
    const cleanup = [];
    const readScopeFromDegrade = (scopeKind, missingMessage) => {
      try {
        const events = getDegradeEvents();
        for (let i = events.length - 1; i >= 0; i--) {
          const entry = events[i];
          if (!entry || typeof entry !== "object") continue;
          const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
          if (!extra) continue;
          const data = (extra.data && typeof extra.data === "object") ? extra.data : null;
          const observed = (data && data.observedData && typeof data.observedData === "object")
            ? data.observedData
            : null;
          const source = observed && typeof observed === "object" ? observed : data;
          if (!source || typeof source !== "object") continue;
          const rawScopeIdentity = (typeof source.scope === "string" && source.scope)
            ? source.scope
            : ((typeof source.scopeKind === "string" && source.scopeKind)
              ? source.scopeKind
              : null);
          const normalizedScopeKind = workerScopeName(rawScopeIdentity);
          if (normalizedScopeKind !== scopeKind) continue;
          return {
            ok: true,
            values: {
              language: source.language,
              languages: Array.isArray(source.languages) ? JSON.parse(JSON.stringify(source.languages)) : source.languages,
              deviceMemory: source.deviceMemory,
              hardwareConcurrency: source.hardwareConcurrency,
              uaData: source.uaData && typeof source.uaData === "object" ? JSON.parse(JSON.stringify(source.uaData)) : null
            }
          };
        }
      } catch (e) {
        return { ok: false, error: errorShape(e), comparisons: [] };
      }
      return {
        ok: null,
        skipped: true,
        reason: missingMessage,
        error: null,
        comparisons: []
      };
    };
    try {
      const dedicatedWait = await __probeAwaitWithinBudget((async () => {
        const worker = new Worker(dedicatedURL);
        cleanup.push(() => { try { worker.terminate(); } catch (_) {} });
        return await new Promise((resolve, reject) => {
          const onMessage = (ev) => {
            cleanupListeners();
            const data = ev && ev.data;
            if (data && data.ok) return resolve(data);
            reject(data && data.error ? new Error(String(data.error.message || data.error.name || "worker error")) : new Error("worker error"));
          };
          const onError = (ev) => {
            cleanupListeners();
            reject(new Error(ev && ev.message ? String(ev.message) : "worker message error"));
          };
          const cleanupListeners = () => {
            worker.removeEventListener("message", onMessage);
            worker.removeEventListener("error", onError);
          };
          worker.addEventListener("message", onMessage);
          worker.addEventListener("error", onError);
        });
      })(), { check: "worker_scope_audit", phase: "DedicatedWorker", method: "Worker" });
      const dedicated = dedicatedWait.ok
        ? {
            ok: true,
            values: dedicatedWait.value && dedicatedWait.value.values ? dedicatedWait.value.values : null,
            seedProbeAudit: dedicatedWait.value && dedicatedWait.value.values ? dedicatedWait.value.values.seedProbeAudit : null,
            comparisons: __probeCompareScopeValues(windowValues, dedicatedWait.value && dedicatedWait.value.values ? dedicatedWait.value.values : null, "DedicatedWorker", "single")
          }
        : { ok: false, error: errorShape(dedicatedWait.error), comparisons: [] };

      const sharedCollect = async () => {
        const shared = new SharedWorker(sharedURL, { name: sharedName });
        const port = shared.port;
        cleanup.push(() => {
          try { if (port && typeof port.close === "function") port.close(); } catch (_) {}
        });
        return await new Promise((resolve, reject) => {
          const onMessage = (ev) => {
            cleanupListeners();
            const data = ev && ev.data;
            if (data && data.ok) return resolve(data);
            reject(data && data.error ? new Error(String(data.error.message || data.error.name || "shared worker error")) : new Error("shared worker error"));
          };
          const onError = (ev) => {
            cleanupListeners();
            reject(new Error(ev && ev.message ? String(ev.message) : "shared worker message error"));
          };
          const cleanupListeners = () => {
            port.removeEventListener("message", onMessage);
            port.removeEventListener("messageerror", onError);
          };
          port.addEventListener("message", onMessage);
          port.addEventListener("messageerror", onError);
          if (typeof port.start === "function") port.start();
        });
      };

      const sharedFirstWait = await __probeAwaitWithinBudget(sharedCollect(), {
        check: "worker_scope_audit",
        phase: "SharedWorker:first",
        method: "SharedWorker",
        timeoutMs: __PROBE_TIMEOUTS.sharedWorkerMs
      });
      const sharedSecondWait = sharedFirstWait.ok
        ? await __probeAwaitWithinBudget(sharedCollect(), {
            check: "worker_scope_audit",
            phase: "SharedWorker:reuse",
            method: "SharedWorker",
            timeoutMs: __PROBE_TIMEOUTS.sharedWorkerMs
          })
        : {
            ok: false,
            skipped: true,
            reason: "first_shared_worker_probe_failed",
            error: null,
            timedOut: false,
            elapsedMs: 0,
            timeoutMs: 0
          };

      const shared = {
        first: sharedFirstWait.ok
          ? {
              ok: true,
              values: sharedFirstWait.value && sharedFirstWait.value.values ? sharedFirstWait.value.values : null,
              seedProbeAudit: sharedFirstWait.value && sharedFirstWait.value.values ? sharedFirstWait.value.values.seedProbeAudit : null,
              comparisons: __probeCompareScopeValues(windowValues, sharedFirstWait.value && sharedFirstWait.value.values ? sharedFirstWait.value.values : null, "SharedWorker", "first")
            }
          : { ok: false, error: errorShape(sharedFirstWait.error), comparisons: [] },
        second: sharedSecondWait.ok
          ? {
              ok: true,
              values: sharedSecondWait.value && sharedSecondWait.value.values ? sharedSecondWait.value.values : null,
              seedProbeAudit: sharedSecondWait.value && sharedSecondWait.value.values ? sharedSecondWait.value.values.seedProbeAudit : null,
              comparisons: __probeCompareScopeValues(windowValues, sharedSecondWait.value && sharedSecondWait.value.values ? sharedSecondWait.value.values : null, "SharedWorker", "reuse")
            }
          : (sharedSecondWait.skipped
            ? { ok: null, skipped: true, reason: sharedSecondWait.reason, error: null, comparisons: [] }
            : { ok: false, error: errorShape(sharedSecondWait.error), comparisons: [] })
      };
      const sharedView = shared.first.ok
        ? { ok: true, values: shared.first.values }
        : { ok: false, error: shared.first.error };

      const serviceWorkerSlot = readScopeFromDegrade("ServiceWorker", "service worker values missing in __DEGRADE__");
      const serviceWorker = serviceWorkerSlot.ok
        ? { ok: true, values: serviceWorkerSlot.values, comparisons: __probeCompareScopeValues(windowValues, serviceWorkerSlot.values, "ServiceWorker", "active") }
        : (serviceWorkerSlot.skipped
          ? { ok: null, skipped: true, reason: serviceWorkerSlot.reason, error: null, comparisons: [] }
          : { ok: false, error: serviceWorkerSlot.error, comparisons: [] });

      const comparisonRows = [];
      const pushSeedProbeAuditComparison = (scope, variant, audit, fallbackError) => {
        const actual = audit && typeof audit === "object"
          ? (audit.ok === true ? {
              ok: true,
              labelLeaked: audit.labelLeaked === true,
              forwardingMatch: audit.forwardingMatch === true
            } : (audit.error || audit))
          : (fallbackError || null);
        comparisonRows.push({
          scope: scope,
          variant: variant,
          field: "Function.prototype.toString.seedProbeAudit",
          match: !!(audit && audit.ok === true),
          expected: {
            ok: true,
            labelLeaked: false,
            forwardingMatch: true
          },
          actual: actual
        });
      };
      pushSeedProbeAuditComparison("WindowScope", "active", windowSeedProbeAudit, null);
      if (!dedicated.ok) {
        comparisonRows.push({
          scope: "DedicatedWorker",
          variant: "single",
          field: "__worker__",
          match: false,
          expected: "values",
          actual: dedicated.error
        });
      }
      pushSeedProbeAuditComparison("DedicatedWorker", "single", dedicated.seedProbeAudit, dedicated.error);
      Array.prototype.push.apply(comparisonRows, dedicated.comparisons);
      if (!shared.first.ok) {
        comparisonRows.push({
          scope: "SharedWorker",
          variant: "first",
          field: "__worker__",
          match: false,
          expected: "values",
          actual: shared.first.error
        });
      }
      pushSeedProbeAuditComparison("SharedWorker", "first", shared.first.seedProbeAudit, shared.first.error);
      if (!shared.second.ok) {
        comparisonRows.push({
          scope: "SharedWorker",
          variant: "reuse",
          field: "__worker__",
          match: shared.second.skipped === true,
          expected: shared.second.skipped ? "skipped after first failure" : "values",
          actual: shared.second.skipped ? shared.second.reason : shared.second.error,
          skipped: shared.second.skipped === true
        });
      }
      if (shared.second.skipped) {
        comparisonRows.push({
          scope: "SharedWorker",
          variant: "reuse",
          field: "Function.prototype.toString.seedProbeAudit",
          match: true,
          expected: "skipped after first failure",
          actual: shared.second.reason,
          skipped: true
        });
      } else {
        pushSeedProbeAuditComparison("SharedWorker", "reuse", shared.second.seedProbeAudit, shared.second.error);
      }
      Array.prototype.push.apply(comparisonRows, shared.first.comparisons);
      Array.prototype.push.apply(comparisonRows, shared.second.comparisons);
      const reuseMatch = (shared.first.ok && shared.second.ok)
        ? (__probeStableStringify(shared.first.values) === __probeStableStringify(shared.second.values))
        : (shared.second.skipped === true);
      comparisonRows.push({
        scope: "SharedWorker",
        variant: "reuse",
        field: "reuse.same_values",
        match: reuseMatch,
        expected: shared.second.skipped ? "skipped after first failure" : (shared.first.ok ? shared.first.values : null),
        actual: shared.second.skipped ? shared.second.reason : (shared.second.ok ? shared.second.values : null),
        skipped: shared.second.skipped === true
      });
      if (!serviceWorker.ok) {
        comparisonRows.push({
          scope: "ServiceWorker",
          variant: "active",
          field: "__degrade__",
          match: serviceWorker.skipped === true,
          expected: serviceWorker.skipped ? "optional observation" : "diag values",
          actual: serviceWorker.skipped ? serviceWorker.reason : serviceWorker.error,
          skipped: serviceWorker.skipped === true
        });
      } else {
        Array.prototype.push.apply(comparisonRows, serviceWorker.comparisons);
      }

      const rowFields = [
        ["language", (x) => x ? x.language : null],
        ["languages", (x) => x ? x.languages : null],
        ["deviceMemory", (x) => x ? x.deviceMemory : null],
        ["hardwareConcurrency", (x) => x ? x.hardwareConcurrency : null],
        ["userAgentData.brands", (x) => x && x.uaData ? x.uaData.brands : null],
        ["userAgentData.mobile", (x) => x && x.uaData ? x.uaData.mobile : null],
        ["userAgentData.platform", (x) => x && x.uaData ? x.uaData.platform : null],
        ["userAgentData.uaFullVersion", (x) => x && x.uaData ? x.uaData.uaFullVersion : null],
        ["userAgentData.fullVersionList", (x) => x && x.uaData ? x.uaData.fullVersionList : null],
        ["userAgentData.getHighEntropyValues.architecture", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.architecture : null],
        ["userAgentData.getHighEntropyValues.bitness", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.bitness : null],
        ["userAgentData.getHighEntropyValues.model", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.model : null],
        ["userAgentData.getHighEntropyValues.platformVersion", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.platformVersion : null],
        ["userAgentData.getHighEntropyValues.fullVersionList", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.fullVersionList : null],
        ["userAgentData.getHighEntropyValues.uaFullVersion", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.uaFullVersion : null],
        ["userAgentData.getHighEntropyValues.wow64", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.wow64 : null],
        ["userAgentData.getHighEntropyValues.formFactors", (x) => x && x.uaData && x.uaData.highEntropy ? x.uaData.highEntropy.formFactors : null]
      ];
      const printable = (value) => {
        if (value && typeof value === "object" && value.name && value.message) {
          return `${String(value.name)}: ${String(value.message)}`;
        }
        return toPrintable(value);
      };
      const findValueComparison = (scope, variant, field) => {
        const arr = Array.isArray(comparisonRows) ? comparisonRows : [];
        for (let i = 0; i < arr.length; i++) {
          const row = arr[i];
          if (!row || row.scope !== scope || row.variant !== variant || row.field !== field) continue;
          return row;
        }
        return null;
      };
      for (const entry of rowFields) {
        const label = entry[0];
        const getter = entry[1];
        const dedicatedCmp = findValueComparison("DedicatedWorker", "single", label);
        const sharedCmp = findValueComparison("SharedWorker", "first", label);
        const serviceCmp = findValueComparison("ServiceWorker", "active", label);
        rows.push({
          parameter: label,
          Window: printable(getter(windowValues)),
          DedicatedWorker: dedicated.ok ? printable(getter(dedicated.values)) : printable(dedicated.error),
          DedicatedWorkerMatch: dedicatedCmp ? dedicatedCmp.match : null,
          DedicatedWorkerBaseline: dedicatedCmp ? dedicatedCmp.baseline : null,
          DedicatedWorkerReason: dedicatedCmp ? dedicatedCmp.reason : null,
          DedicatedWorkerNativeValue: dedicatedCmp ? copyJson(dedicatedCmp.nativeValue) : null,
          DedicatedWorkerProfileValue: dedicatedCmp ? copyJson(dedicatedCmp.profileValue) : null,
          SharedWorker: sharedView.ok ? printable(getter(sharedView.values)) : printable(sharedView.error),
          SharedWorkerMatch: sharedCmp ? sharedCmp.match : null,
          SharedWorkerBaseline: sharedCmp ? sharedCmp.baseline : null,
          SharedWorkerReason: sharedCmp ? sharedCmp.reason : null,
          SharedWorkerNativeValue: sharedCmp ? copyJson(sharedCmp.nativeValue) : null,
          SharedWorkerProfileValue: sharedCmp ? copyJson(sharedCmp.profileValue) : null,
          ServiceWorker: serviceWorker.ok ? printable(getter(serviceWorker.values)) : (serviceWorker.skipped ? "not_observed" : printable(serviceWorker.error)),
          ServiceWorkerMatch: serviceCmp ? serviceCmp.match : null,
          ServiceWorkerBaseline: serviceCmp ? serviceCmp.baseline : null,
          ServiceWorkerReason: serviceCmp ? serviceCmp.reason : null
        });
      }
      rows.push({
        parameter: "Function.prototype.toString.seedProbeAudit",
        Window: windowSeedProbeAudit.ok ? "ok" : printable(windowSeedProbeAudit.error),
        DedicatedWorker: dedicated.ok
          ? ((dedicated.seedProbeAudit && dedicated.seedProbeAudit.ok) ? "ok" : printable(dedicated.seedProbeAudit && dedicated.seedProbeAudit.error ? dedicated.seedProbeAudit.error : dedicated.seedProbeAudit))
          : printable(dedicated.error),
        SharedWorker: sharedView.ok
          ? ((shared.first.seedProbeAudit && shared.first.seedProbeAudit.ok) ? "ok" : printable(shared.first.seedProbeAudit && shared.first.seedProbeAudit.error ? shared.first.seedProbeAudit.error : shared.first.seedProbeAudit))
          : printable(shared.first.error),
        ServiceWorker: "not_observed"
      });

      __probeConsoleCall("group", "[probe] worker scope audit");
      __probeConsoleCall("table", rows);
      __probeConsoleCall("groupEnd");

      return {
        ok: dedicated.ok === true && shared.first.ok === true && (shared.second.ok === true || shared.second.skipped === true) && (serviceWorker.ok === true || serviceWorker.skipped === true) && comparisonRows.every((row) => row && row.match === true),
        window: windowValues,
        dedicated,
        shared,
        serviceWorker,
        seedProbeAudit: {
          window: windowSeedProbeAudit,
          dedicated: dedicated.seedProbeAudit || { ok: false, error: dedicated.error || null },
          shared: {
            first: shared.first.seedProbeAudit || { ok: false, error: shared.first.error || null },
            second: shared.second.seedProbeAudit || { ok: false, error: shared.second.error || null }
          },
          serviceWorker: {
            ok: null,
            skipped: true,
            reason: "not_observed_via_worker_scope_audit"
          }
        },
        comparisons: comparisonRows,
        rows
      };
    } finally {
      while (cleanup.length) {
        const fn = cleanup.pop();
        try { fn(); } catch (_) {}
      }
      try { URL.revokeObjectURL(dedicatedURL); } catch (_) {}
      try { URL.revokeObjectURL(sharedURL); } catch (_) {}
    }
  }

  async function __probeRunWorkerAccessorObservabilityAudit() {
    const windowSpecs = WORKER_ACCESSOR_OBSERVABILITY_TARGET_KEYS.map((key) => ({
      key,
      root: Object.getPrototypeOf(nav),
      receiver: nav,
      mode: "accessor"
    }));
    const windowRows = __probeCollectAccessorObservabilityRows(windowSpecs, __probeProxyTargetMap);
    const workerKeysJson = JSON.stringify(WORKER_ACCESSOR_OBSERVABILITY_TARGET_KEYS);
    const workerScript = `
      function __probeWorkerErrorShape__(error) {
        if (!error) return null;
        return {
          name: error && error.name ? String(error.name) : "Error",
          message: error && error.message ? String(error.message) : String(error)
        };
      }
      function __probeWorkerDescribeProtoNode__(node) {
        if (node == null) return "null";
        try {
          const ctor = node && node.constructor;
          const ctorName = (typeof ctor === "function" && ctor.name) ? String(ctor.name) : "";
          if (ctorName) return ctorName + ".prototype";
        } catch (_) {}
        try {
          return Object.prototype.toString.call(node);
        } catch (_) {
          return "[prototype unreadable]";
        }
      }
      function __probeWorkerFindDescriptor__(root, key) {
        let current = root;
        while (current) {
          let desc = null;
          try {
            desc = Object.getOwnPropertyDescriptor(current, key) || null;
          } catch (_) {
            desc = null;
          }
          if (desc) return { owner: current, desc: desc };
          try {
            current = Object.getPrototypeOf(current);
          } catch (_) {
            current = null;
          }
        }
        return { owner: null, desc: null };
      }
      function __probeWorkerAccessorVsData__(desc) {
        if (!desc) return null;
        if (typeof desc.get === "function" || typeof desc.set === "function") return "accessor";
        if (Object.prototype.hasOwnProperty.call(desc, "value")) return "data";
        return "unknown";
      }
      function __probeWorkerBridgeKind__(fn, proxyTargetMap) {
        if (typeof fn !== "function") return "not_function";
        if (!(proxyTargetMap instanceof WeakMap)) return "native_or_untracked";
        try {
          const target = proxyTargetMap.get(fn);
          if (typeof target === "function" && target !== fn) return "proxy_carrier";
        } catch (_) {}
        return "native_or_untracked";
      }
      function __probeWorkerSafeCall__(fn, finalizer) {
        try {
          return { ok: true, value: fn() };
        } catch (error) {
          return { ok: false, error: error };
        } finally {
          try {
            if (typeof finalizer === "function") finalizer();
          } catch (_) {}
        }
      }
      function __probeWorkerResolveProxyTargetMap__() {
        try {
          const ctx = self && self.CanvasPatchContext && typeof self.CanvasPatchContext === "object"
            ? self.CanvasPatchContext
            : null;
          const stateRoot = ctx && ctx.state && typeof ctx.state === "object"
            ? ctx.state
            : null;
          const wrkState = stateRoot && stateRoot.__WRK__ && typeof stateRoot.__WRK__ === "object"
            ? stateRoot.__WRK__
            : null;
          const runtime = wrkState && wrkState.runtime && typeof wrkState.runtime === "object"
            ? wrkState.runtime
            : null;
          const state = runtime && runtime.__CORE_TOSTRING_STATE__ && runtime.__CORE_TOSTRING_STATE__.__CORE_TOSTRING_STATE__ === true
            ? runtime.__CORE_TOSTRING_STATE__
            : null;
          return (state && state.proxyTargetMap instanceof WeakMap) ? state.proxyTargetMap : null;
        } catch (_) {
          return null;
        }
      }
      function __probeWorkerCollectAccessorRows__() {
        const nav = self.navigator;
        const root = nav ? Object.getPrototypeOf(nav) : null;
        const proxyTargetMap = __probeWorkerResolveProxyTargetMap__();
        const keys = ${workerKeysJson};
        return keys.map(function(key) {
          const resolved = __probeWorkerFindDescriptor__(root, key);
          const desc = resolved.desc;
          const callable = desc && typeof desc.get === "function" ? desc.get : null;
          const good = callable
            ? __probeWorkerSafeCall__(function() { return Reflect.apply(callable, nav, []); })
            : { ok: false, error: new Error("getter missing") };
          const bad = callable
            ? __probeWorkerSafeCall__(function() { return Reflect.apply(callable, {}, []); })
            : { ok: false, error: new Error("getter missing") };
          const text = callable
            ? __probeWorkerSafeCall__(function() { return Function.prototype.toString.call(callable); })
            : { ok: false, error: new Error("getter missing") };
          const nativeProto = callable
            ? __probeWorkerSafeCall__(function() { return Object.getPrototypeOf(callable); }).value
            : null;
          const objectCreateToString = callable
            ? __probeWorkerSafeCall__(function() { return Object.create(callable).toString(); })
            : { ok: false, error: new Error("getter missing") };
          const setProtoRecursion = callable
            ? __probeWorkerSafeCall__(
                function() { return Object.setPrototypeOf(callable, Object.create(callable)).toString(); },
                function() {
                  try {
                    if (nativeProto) Object.setPrototypeOf(callable, nativeProto);
                  } catch (_) {}
                }
              )
            : { ok: false, error: new Error("getter missing") };
          return {
            key: key,
            descriptorOwner: __probeWorkerDescribeProtoNode__(resolved.owner),
            descriptorShape: desc ? {
              configurable: !!desc.configurable,
              enumerable: !!desc.enumerable,
              hasGetter: typeof desc.get === "function",
              hasSetter: typeof desc.set === "function",
              hasValue: Object.prototype.hasOwnProperty.call(desc, "value")
            } : null,
            accessorVsData: __probeWorkerAccessorVsData__(desc),
            hasOwnOnNavigator: !!(nav && Object.prototype.hasOwnProperty.call(nav, key)),
            getterKind: __probeWorkerBridgeKind__(callable, proxyTargetMap),
            toString: text.ok ? String(text.value) : null,
            toStringHasNativeCode: text.ok && typeof text.value === "string" ? text.value.indexOf("[native code]") !== -1 : false,
            goodError: good.ok ? null : __probeWorkerErrorShape__(good.error),
            badError: bad.ok ? null : __probeWorkerErrorShape__(bad.error),
            objectCreateToStringError: objectCreateToString.ok ? null : __probeWorkerErrorShape__(objectCreateToString.error),
            setProtoRecursionError: setProtoRecursion.ok ? null : __probeWorkerErrorShape__(setProtoRecursion.error)
          };
        });
      }
    `;
    const dedicatedSource = `
      "use strict";
      ${workerScript}
      (function() {
        try {
          self.postMessage({ ok: true, rows: __probeWorkerCollectAccessorRows__() });
        } catch (error) {
          self.postMessage({
            ok: false,
            error: {
              name: error && error.name ? String(error.name) : "Error",
              message: error && error.message ? String(error.message) : String(error),
              stack: error && error.stack ? String(error.stack) : null
            }
          });
        }
      })();
    `;
    const sharedSource = `
      "use strict";
      ${workerScript}
      self.onconnect = function(ev) {
        const port = ev && ev.ports && ev.ports[0];
        if (!port) return;
        try {
          port.postMessage({ ok: true, rows: __probeWorkerCollectAccessorRows__() });
        } catch (error) {
          port.postMessage({
            ok: false,
            error: {
              name: error && error.name ? String(error.name) : "Error",
              message: error && error.message ? String(error.message) : String(error),
              stack: error && error.stack ? String(error.stack) : null
            }
          });
        }
      };
    `;
    const dedicatedURL = URL.createObjectURL(new Blob([dedicatedSource], { type: "text/javascript" }));
    const sharedURL = URL.createObjectURL(new Blob([sharedSource], { type: "text/javascript" }));
    const sharedName = `probe-observability-shared-${Date.now()}`;
    const cleanup = [];
    try {
      const collectDedicated = await __probeAwaitWithinBudget((async () => {
        const worker = new Worker(dedicatedURL);
        cleanup.push(() => { try { worker.terminate(); } catch (_) {} });
        return await new Promise((resolve, reject) => {
          const onMessage = (ev) => {
            cleanupListeners();
            const data = ev && ev.data;
            if (data && data.ok) return resolve(data.rows);
            reject(data && data.error ? new Error(String(data.error.message || data.error.name || "worker error")) : new Error("worker error"));
          };
          const onError = (ev) => {
            cleanupListeners();
            reject(new Error(ev && ev.message ? String(ev.message) : "worker message error"));
          };
          const cleanupListeners = () => {
            worker.removeEventListener("message", onMessage);
            worker.removeEventListener("error", onError);
          };
          worker.addEventListener("message", onMessage);
          worker.addEventListener("error", onError);
        });
      })(), { check: "worker_accessor_observability", phase: "DedicatedWorker", method: "Worker" });
      const collectShared = await __probeAwaitWithinBudget((async () => {
        const shared = new SharedWorker(sharedURL, { name: sharedName });
        const port = shared.port;
        cleanup.push(() => {
          try { if (port && typeof port.close === "function") port.close(); } catch (_) {}
        });
        return await new Promise((resolve, reject) => {
          const onMessage = (ev) => {
            cleanupListeners();
            const data = ev && ev.data;
            if (data && data.ok) return resolve(data.rows);
            reject(data && data.error ? new Error(String(data.error.message || data.error.name || "shared worker error")) : new Error("shared worker error"));
          };
          const onError = (ev) => {
            cleanupListeners();
            reject(new Error(ev && ev.message ? String(ev.message) : "shared worker message error"));
          };
          const cleanupListeners = () => {
            port.removeEventListener("message", onMessage);
            port.removeEventListener("messageerror", onError);
          };
          port.addEventListener("message", onMessage);
          port.addEventListener("messageerror", onError);
          if (typeof port.start === "function") port.start();
        });
      })(), {
        check: "worker_accessor_observability",
        phase: "SharedWorker",
        method: "SharedWorker",
        timeoutMs: __PROBE_TIMEOUTS.sharedWorkerMs
      });
      const dedicated = collectDedicated.ok
        ? {
            ok: true,
            rows: Array.isArray(collectDedicated.value) ? collectDedicated.value : [],
            comparisons: __probeCompareAccessorObservability(windowRows, Array.isArray(collectDedicated.value) ? collectDedicated.value : [], "DedicatedWorker", "single")
          }
        : { ok: false, error: errorShape(collectDedicated.error), rows: [], comparisons: [] };
      const shared = collectShared.ok
        ? {
            ok: true,
            rows: Array.isArray(collectShared.value) ? collectShared.value : [],
            comparisons: __probeCompareAccessorObservability(windowRows, Array.isArray(collectShared.value) ? collectShared.value : [], "SharedWorker", "single")
          }
        : { ok: false, error: errorShape(collectShared.error), rows: [], comparisons: [] };
      const summaryRows = [];
      for (const base of windowRows) {
        summaryRows.push({
          scope: "WindowScope",
          variant: "active",
          key: base.key,
          descriptorOwner: base.descriptorOwner,
          descriptorShape: base.descriptorShape,
          hasOwnOnNavigator: base.hasOwnOnNavigator,
          getterKind: base.getterKind,
          toStringHasNativeCode: base.toStringHasNativeCode,
          badError: base.badError ? `${base.badError.name}: ${base.badError.message}` : null,
          objectCreateToStringError: base.objectCreateToStringError ? `${base.objectCreateToStringError.name}: ${base.objectCreateToStringError.message}` : null,
          setProtoRecursionError: base.setProtoRecursionError ? `${base.setProtoRecursionError.name}: ${base.setProtoRecursionError.message}` : null
        });
      }
      for (const cmp of dedicated.comparisons) {
        summaryRows.push({
          scope: cmp.scope,
          variant: cmp.variant,
          key: cmp.key,
          match: cmp.match,
          descriptorOwner: cmp.actual ? cmp.actual.descriptorOwner : null,
          descriptorOwnerMatch: cmp.descriptorOwnerMatch,
          descriptorShapeMatch: cmp.descriptorShapeMatch,
          hasOwnOnNavigatorMatch: cmp.hasOwnOnNavigatorMatch,
          getterKind: cmp.actual ? cmp.actual.getterKind : null,
          getterKindMatch: cmp.getterKindMatch,
          toStringHasNativeCode: cmp.actual ? cmp.actual.toStringHasNativeCode : null,
          toStringNativeMatch: cmp.toStringNativeMatch,
          badError: cmp.actual && cmp.actual.badError ? `${cmp.actual.badError.name}: ${cmp.actual.badError.message}` : null,
          badErrorMatch: cmp.badErrorMatch,
          objectCreateToStringError: cmp.actual && cmp.actual.objectCreateToStringError ? `${cmp.actual.objectCreateToStringError.name}: ${cmp.actual.objectCreateToStringError.message}` : null,
          objectCreateToStringErrorMatch: cmp.objectCreateToStringErrorMatch,
          setProtoRecursionError: cmp.actual && cmp.actual.setProtoRecursionError ? `${cmp.actual.setProtoRecursionError.name}: ${cmp.actual.setProtoRecursionError.message}` : null,
          setProtoRecursionErrorMatch: cmp.setProtoRecursionErrorMatch
        });
      }
      for (const cmp of shared.comparisons) {
        summaryRows.push({
          scope: cmp.scope,
          variant: cmp.variant,
          key: cmp.key,
          match: cmp.match,
          descriptorOwner: cmp.actual ? cmp.actual.descriptorOwner : null,
          descriptorOwnerMatch: cmp.descriptorOwnerMatch,
          descriptorShapeMatch: cmp.descriptorShapeMatch,
          hasOwnOnNavigatorMatch: cmp.hasOwnOnNavigatorMatch,
          getterKind: cmp.actual ? cmp.actual.getterKind : null,
          getterKindMatch: cmp.getterKindMatch,
          toStringHasNativeCode: cmp.actual ? cmp.actual.toStringHasNativeCode : null,
          toStringNativeMatch: cmp.toStringNativeMatch,
          badError: cmp.actual && cmp.actual.badError ? `${cmp.actual.badError.name}: ${cmp.actual.badError.message}` : null,
          badErrorMatch: cmp.badErrorMatch,
          objectCreateToStringError: cmp.actual && cmp.actual.objectCreateToStringError ? `${cmp.actual.objectCreateToStringError.name}: ${cmp.actual.objectCreateToStringError.message}` : null,
          objectCreateToStringErrorMatch: cmp.objectCreateToStringErrorMatch,
          setProtoRecursionError: cmp.actual && cmp.actual.setProtoRecursionError ? `${cmp.actual.setProtoRecursionError.name}: ${cmp.actual.setProtoRecursionError.message}` : null,
          setProtoRecursionErrorMatch: cmp.setProtoRecursionErrorMatch
        });
      }
      __probeConsoleCall("group", "[probe] worker accessor observability");
      __probeConsoleCall("table", summaryRows);
      __probeConsoleCall("groupEnd");
      return {
        ok: dedicated.ok === true && shared.ok === true
          && dedicated.comparisons.every((row) => row && row.match === true)
          && shared.comparisons.every((row) => row && row.match === true),
        window: windowRows,
        dedicated,
        shared,
        serviceWorker: {
          ok: null,
          skipped: true,
          reason: "not_collected_in_worker_accessor_observability"
        },
        rows: summaryRows
      };
    } finally {
      while (cleanup.length) {
        const fn = cleanup.pop();
        try { fn(); } catch (_) {}
      }
      try { URL.revokeObjectURL(dedicatedURL); } catch (_) {}
      try { URL.revokeObjectURL(sharedURL); } catch (_) {}
    }
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
    const out = [];

    for (const spec of PROTO_SPECS) {
      let proto = null;
      let target = null;
      try {
        proto = spec.getProto();
        target = typeof spec.getTarget === "function" ? spec.getTarget() : null;
      } catch (e) {
        __probeConsoleCall("warn", `[probe] ${spec.label} skipped (getProto failed):`, e);
        out.push({ prototype: spec.label, error: String(e) });
        continue;
      }

      if (!proto) {
        __probeConsoleCall("log", `[probe] ${spec.label}: not available`);
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

      out.push({ prototype: spec.label, rows });
    }

    __probeConsoleCall("group", "[probe] Prototype descriptors");
    for (const block of out) {
      if (!block || !Array.isArray(block.rows)) continue;
      __probeConsoleCall("log", `[probe] ${block.prototype}`);
      __probeConsoleCall("table", block.rows);
    }
    __probeConsoleCall("groupEnd");
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
    const webglInvocationByPath = new Map();

    function setWebGLInvocation(path, status, detail, err) {
      webglInvocationByPath.set(path, {
        status: (typeof status === "string" && status) ? status : "unknown",
        detail: detail == null ? null : String(detail),
        error: err ? errorShape(err) : null
      });
    }

    function createWebGLProbeContext(kind) {
      if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
      try {
        const canvas = document.createElement("canvas");
        if (!canvas || typeof canvas.getContext !== "function") return null;
        if (kind === "webgl2") return canvas.getContext("webgl2");
        return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      } catch (_) {
        return null;
      }
    }

    function safeCallWebGLMethod(path, detail, call) {
      try {
        const value = call();
        setWebGLInvocation(path, "called", detail, null);
        return value;
      } catch (e) {
        setWebGLInvocation(path, "threw", detail, e);
        return null;
      }
    }

    function collectWebGLMethodTouches(kind, protoLabel) {
      const ctx = createWebGLProbeContext(kind);
      const shaderPrecisionPath = `${protoLabel}.getShaderPrecisionFormat`;
      const shaderSourcePath = `${protoLabel}.shaderSource`;
      const getUniformPath = `${protoLabel}.getUniform`;

      if (!ctx) {
        setWebGLInvocation(shaderPrecisionPath, "skipped", "context unavailable", null);
        setWebGLInvocation(shaderSourcePath, "skipped", "context unavailable", null);
        setWebGLInvocation(getUniformPath, "skipped", "context unavailable", null);
        return;
      }

      safeCallWebGLMethod(shaderPrecisionPath, `${kind} runtime touch`, function() {
        return Reflect.apply(ctx.getShaderPrecisionFormat, ctx, [ctx.FRAGMENT_SHADER, ctx.HIGH_FLOAT]);
      });

      let vertexShader = null;
      let fragmentShader = null;
      let program = null;
      let uniformLocation = null;

      try {
        if (typeof ctx.createShader === "function") {
          vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
          fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);
        }

        if (!vertexShader || !fragmentShader) {
          setWebGLInvocation(shaderSourcePath, "skipped", "shader creation unavailable", null);
          setWebGLInvocation(getUniformPath, "skipped", "shader creation unavailable", null);
          return;
        }

        safeCallWebGLMethod(shaderSourcePath, `${kind} runtime touch`, function() {
          Reflect.apply(ctx.shaderSource, ctx, [
            vertexShader,
            "attribute vec4 a_position; void main(){ gl_Position = a_position; }"
          ]);
          Reflect.apply(ctx.shaderSource, ctx, [
            fragmentShader,
            "precision mediump float; uniform float u_probe; void main(){ gl_FragColor = vec4(u_probe, 0.0, 0.0, 1.0); }"
          ]);
          return true;
        });

        if (typeof ctx.compileShader === "function") {
          ctx.compileShader(vertexShader);
          ctx.compileShader(fragmentShader);
        }
        if (typeof ctx.createProgram !== "function") {
          setWebGLInvocation(getUniformPath, "skipped", "program creation unavailable", null);
          return;
        }

        program = ctx.createProgram();
        if (!program) {
          setWebGLInvocation(getUniformPath, "skipped", "program creation failed", null);
          return;
        }

        if (typeof ctx.attachShader === "function") {
          ctx.attachShader(program, vertexShader);
          ctx.attachShader(program, fragmentShader);
        }
        if (typeof ctx.linkProgram === "function") ctx.linkProgram(program);
        if (typeof ctx.getUniformLocation !== "function") {
          setWebGLInvocation(getUniformPath, "skipped", "uniform lookup unavailable", null);
          return;
        }

        uniformLocation = ctx.getUniformLocation(program, "u_probe");
        if (!uniformLocation) {
          setWebGLInvocation(getUniformPath, "skipped", "uniform location missing", null);
          return;
        }

        safeCallWebGLMethod(getUniformPath, `${kind} runtime touch`, function() {
          return Reflect.apply(ctx.getUniform, ctx, [program, uniformLocation]);
        });
      } catch (e) {
        if (!webglInvocationByPath.has(shaderSourcePath)) {
          setWebGLInvocation(shaderSourcePath, "threw", `${kind} runtime touch`, e);
        }
        if (!webglInvocationByPath.has(getUniformPath)) {
          setWebGLInvocation(getUniformPath, "threw", `${kind} runtime touch`, e);
        }
      } finally {
        try {
          if (program && typeof ctx.deleteProgram === "function") ctx.deleteProgram(program);
        } catch (_) {}
        try {
          if (vertexShader && typeof ctx.deleteShader === "function") ctx.deleteShader(vertexShader);
        } catch (_) {}
        try {
          if (fragmentShader && typeof ctx.deleteShader === "function") ctx.deleteShader(fragmentShader);
        } catch (_) {}
      }
    }

    // Active touches are needed so the runtime access-path can emit diagnostics for these WebGL hooks.
    collectWebGLMethodTouches("webgl", "WebGLRenderingContext.prototype");
    collectWebGLMethodTouches("webgl2", "WebGL2RenderingContext.prototype");

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
      const webglInvocation = webglInvocationByPath.get(path) || null;
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
        invocationStatus: webglInvocation ? webglInvocation.status : null,
        invocationDetail: webglInvocation ? webglInvocation.detail : null,
        invocationError: webglInvocation ? webglInvocation.error : null,
        setProtoStatus,
        setProtoError,
        value: r.ok ? toPrintable(r.value) : null,
        error: r.ok ? null : errorShape(r.error)
      };
    });

    __probeConsoleCall("group", "[probe] Touched methods");
    __probeConsoleCall("table", rows);
    __probeConsoleCall("groupEnd");

    try {
      if (sandboxOracle && sandboxOracle.iframe) sandboxOracle.iframe.remove();
    } catch (_) {}

    return { paths: METHOD_PATHS.slice(), rows };
  }



  async function printReceiverChecks() {
    const rows = [];
    let audioCtx = null;
    let analyser = null;

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
    } finally {
      __probeCleanupAudioObjects(audioCtx, analyser);
    }

    const ok = rows.every((r) => r.match === true || r.match === null);
    __probeConsoleCall("group", "[probe] Receiver/Illegal invocation checks");
    __probeConsoleCall("table", rows.map((r) => ({
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
    __probeConsoleCall("groupEnd");

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
    } finally {
      __probeCleanupAudioObjects(audioCtx, analyser);
    }

    const ok = rows.every((r) => r.match === true || r.match === null);
    __probeConsoleCall("group", "[probe] Audio own-property invariant checks");
    __probeConsoleCall("table", rows.map((r) => ({
      check: r.check,
      method: r.method,
      match: r.match,
      expectedAfterCreateOwn: r.expectedAfterCreateOwn,
      actualAfterCreateOwn: r.actualAfterCreateOwn,
      protoHasOwn: r.extra && Object.prototype.hasOwnProperty.call(r.extra, "protoHasOwn") ? r.extra.protoHasOwn : null,
      error: r.error ? r.error.name : null
    })));
    __probeConsoleCall("groupEnd");

    return { ok, rows };
  }

  function printPrototypeInvariantChecks() {
    const rows = [];
    let audioCtx = null;
    let analyser = null;

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
      try {
        audioCtx = AudioCtxCtor ? new AudioCtxCtor() : null;
      } catch (e) {
        audioCtx = null;
      }
      tryInstanceof("proto: audioContext instanceof AudioContext", audioCtx, AudioCtxCtor);
      tryProto("proto: audioContext proto check", audioCtx, AudioCtxCtor ? AudioCtxCtor.prototype : null);

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
    } finally {
      __probeCleanupAudioObjects(audioCtx, analyser);
    }

    const ok = rows.every((r) => r.match === true || r.match === null);
    __probeConsoleCall("group", "[probe] Prototype/instanceof checks");
    __probeConsoleCall("table", rows.map((r) => ({ check: r.check, match: r.match, error: r.error ? r.error.name : null })));
    __probeConsoleCall("groupEnd");

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
  if (__PROBE_ENABLE_BRAND_CHECK__) (function brandCheck() {
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
  __probeConsoleCall("group", "[probe] toString cross-realm checks (hard invariants + informational)");
  __probeConsoleCall("table", rows.map((r) => ({ check: r.check, match: r.match, error: r.error ? r.error.name : null })));
  __probeConsoleCall("groupEnd");

  return { ok, rows };
}


  const DESCRIPTOR_EXPECTATIONS = [
    { p: "Navigator.prototype", k: "language",  exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "languages", exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "userAgent", exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "webdriver", exp: { exists: true,  hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Navigator.prototype", k: "oscpu",     exp: { exists: false } },
    { p: "Screen.prototype", k: "width",        exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "height",       exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "availWidth",   exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "availHeight",  exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "colorDepth",   exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "pixelDepth",   exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "availLeft",    exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "availTop",     exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "Screen.prototype", k: "orientation",  exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "ScreenOrientation.prototype", k: "type",  exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
    { p: "ScreenOrientation.prototype", k: "angle", exp: { exists: true, hasGetter: true, hasSetter: false, hasValue: false, enumerable: null, configurable: null, writable: null, valueType: null, toStringCheckTarget: "descriptor.get/descriptor.set" } },
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
        message: "descriptors missing before descriptor expectations compare"
      };
      __probeConsoleCall("group", "[probe] Descriptor expectations - skipped");
      __probeConsoleCall("warn", `[probe] ${error.message}`);
      __probeConsoleCall("groupEnd");
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
    __probeConsoleCall("group", "[probe] Descriptor expectations - mismatches");
    __probeConsoleCall("log", `[probe] total: ${rows.length}, mismatches: ${mismatchesRows.length}`);
    __probeConsoleCall("table", mismatchesRows);
    __probeConsoleCall("groupEnd");

    return { total: rows.length, mismatches: mismatchesRows.length, rows, skipped: false, error: null };
  }


  function getDegradeEvents() {
    // External probe: no project-specific fallbacks, only explicit __DEGRADE__ buffer if present.
    const degrade = (__probeLoggerRoot && typeof __probeLoggerRoot.__DEGRADE__ === "function") ? __probeLoggerRoot.__DEGRADE__ : null;
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



    __probeConsoleCall("group", "[probe] __DEGRADE__ last 50");
    __probeConsoleCall("log", `[probe] total degrade events: ${all.length}`);
    __probeConsoleCall("table", rows);
    __probeConsoleCall("log", "[probe] raw last 50 entries:");
    for (const entry of last50) __probeConsoleCall("dir", entry, { depth: 5 });
    __probeConsoleCall("groupEnd");

    return { total: all.length, last50Count: last50.length, rows, raw: last50 };
  }

  const __probeModuleAudit = (
    __probeLoggerRoot
    && __probeLoggerRoot.__MODULE_DIAG_AUDIT__
    && typeof __probeLoggerRoot.__MODULE_DIAG_AUDIT__ === "object"
  )
    ? __probeLoggerRoot.__MODULE_DIAG_AUDIT__
    : null;
  const PROBE_MODULE_CHECK_SLOTS = (
    __probeLoggerRoot
    && Array.isArray(__probeLoggerRoot.__MODULE_DIAG_SLOTS__)
    && __probeLoggerRoot.__MODULE_DIAG_SLOTS__.length
  )
    ? __probeLoggerRoot.__MODULE_DIAG_SLOTS__
    : [];

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

  function __probeMakeRow(index, slot, entry, kind, unit, status) {
    const extra = (entry && entry.extra && typeof entry.extra === "object") ? entry.extra : null;
    const data = (extra && extra.data && typeof extra.data === "object") ? extra.data : null;
    const locate = (slot && slot.locate && typeof slot.locate === "object") ? slot.locate : null;
    const expected = (locate && locate.expected && typeof locate.expected === "object") ? locate.expected : null;
    const rowData = entry ? __probeDataCell(entry) : null;
    const fileValue = data && typeof data.file === "string"
      ? data.file
      : (locate && typeof locate.file === "string" ? locate.file : null);
    const row = {
      idx: index,
      module: slot && typeof slot.module === "string"
        ? slot.module
        : (extra && typeof extra.module === "string" ? extra.module : null),
      unit: (typeof unit === "string" && unit) ? unit : null,
      status: status,
      source: slot && typeof slot.source === "string" ? slot.source : null,
      timestamp: entry && typeof entry.timestamp === "string" ? entry.timestamp : null,
      code: entry && typeof entry.code === "string"
        ? entry.code
        : (expected && typeof expected.code === "string"
          ? expected.code
          : (locate && typeof locate.triggerCode === "string" ? locate.triggerCode : null)),
      level: extra && typeof extra.level === "string"
        ? extra.level
        : (expected && typeof expected.level === "string" ? expected.level : null),
      stage: extra && typeof extra.stage === "string"
        ? extra.stage
        : (expected && typeof expected.stage === "string" ? expected.stage : null),
      key: extra && (typeof extra.key === "string" || extra.key === null)
        ? extra.key
        : (expected && (typeof expected.key === "string" || expected.key === null) ? expected.key : null),
      diagTag: extra && typeof extra.diagTag === "string"
        ? extra.diagTag
        : (slot && typeof slot.diagTag === "string" ? slot.diagTag : null),
      message: (extra && typeof extra.message === "string")
        ? extra.message
        : (entry && entry.error && typeof entry.error === "object" && typeof entry.error.message === "string")
          ? entry.error.message
          : (expected && typeof expected.message === "string" ? expected.message : null),
      err: __probeErrCell(entry),
      data: rowData != null
        ? rowData
        : (expected && Object.prototype.hasOwnProperty.call(expected, "data")
          ? (function() {
              try {
                const s = JSON.stringify(expected.data);
                return (typeof s === "string") ? s : null;
              } catch (_) {
                return "[unserializable]";
              }
            })()
          : null)
    };
    if (typeof fileValue === "string" && fileValue) row.file = fileValue;
    Object.defineProperty(row, "__probeKind", {
      value: (kind === "patch") ? "patch" : "module",
      enumerable: false,
      configurable: true
    });
    return row;
  }

  function __probePatchUnit(slot, entry) {
    if (!slot || slot.functions === "none" || !entry || typeof entry !== "object") return null;
    const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
    if (!extra) return null;
    const code = (typeof entry.code === "string" && entry.code) ? entry.code : null;
    const diagTag = (typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null;
    if (code && code.indexOf("degrade:module_status:") === 0) return null;
    if (code && (code.indexOf(":nav_access") >= 0 || extra.message === "nav access")) return null;
    if (code && __probeModuleAudit && typeof __probeModuleAudit.isSummaryCode === "function" && __probeModuleAudit.isSummaryCode(code, slot)) return null;
    if (diagTag && diagTag !== slot.diagTag) return diagTag;
    if (code) return code;
    return null;
  }

  function printModuleCheck() {
    const rows = [];
    try {
      if (!__probeModuleAudit) return rows;
      const matchEntry = (typeof __probeModuleAudit.matchEntry === "function") ? __probeModuleAudit.matchEntry : null;
      const evaluate = (typeof __probeModuleAudit.evaluate === "function") ? __probeModuleAudit.evaluate : null;
      if (!matchEntry || !evaluate) return rows;
      const degrade = (__probeLoggerRoot && typeof __probeLoggerRoot.__DEGRADE__ === "function") ? __probeLoggerRoot.__DEGRADE__ : null;
      const buf = (typeof degrade === "function" && typeof degrade.getBuffer === "function") ? degrade.getBuffer() : [];
      const arr = Array.isArray(buf) ? buf : [];
      let rowIndex = 0;

      for (let i = 0; i < PROBE_MODULE_CHECK_SLOTS.length; i++) {
        const slot = PROBE_MODULE_CHECK_SLOTS[i];
        const events = [];
        for (let j = 0; j < arr.length; j++) {
          const entry = arr[j];
          if (matchEntry(slot, entry)) events.push(entry);
        }

        const moduleEval = evaluate(slot, events);
        const moduleEvent = (moduleEval && typeof moduleEval === "object") ? moduleEval.entry : null;
        const moduleStatus = (moduleEval && typeof moduleEval.status === "string" && moduleEval.status) ? moduleEval.status : "pending";
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
            const patchEval = evaluate(slot, [entry]);
            const patchStatus = (patchEval && typeof patchEval.status === "string" && patchEval.status) ? patchEval.status : "pending";
            rows.push(__probeMakeRow(rowIndex++, slot, entry, "patch", unit, patchStatus));
          }
        }
      }
    } catch (e) {
      __probeDiag("error", "probe:module_check_failed", {
        diagTag: "probe:module_check",
        stage: "module_check",
        key: "moduleCheck",
        message: "module check failed",
        type: "probe telemetry",
        data: {
          outcome: "throw",
          reason: "module_check_failed"
        }
      }, e);
    }

    const moduleRows = rows.filter((row) => row && row.__probeKind === "module");
    const patchRows = rows.filter((row) => row && row.__probeKind === "patch");
    __probeConsoleCall("group", "[probe] module check");
    __probeConsoleCall("table", moduleRows);
    if (patchRows.length) {
      __probeConsoleCall("groupCollapsed", "[probe] module check patch details");
      __probeConsoleCall("table", patchRows);
      __probeConsoleCall("groupEnd");
    }
    __probeConsoleCall("groupEnd");
    Object.defineProperty(moduleRows, "__probePatchRows", {
      value: patchRows,
      enumerable: false,
      configurable: true
    });
    return moduleRows;
  }

  function printNavigatorCollectionChecks() {
    const rows = [];
    function push(check, pass, details, err) {
      rows.push({
        check: String(check || "navigator_collection"),
        pass: !!pass,
        details: Object.prototype.hasOwnProperty.call(arguments, 2) ? details : null,
        error: err ? errorShape(err) : null
      });
    }
    function compareWrongThis(wrapperFn, nativeFn, args) {
      const invokeArgs = Array.isArray(args) ? args.slice() : [];
      const invoke = (fn) => {
        try {
          return { threw: false, value: toPrintable(Reflect.apply(fn, {}, invokeArgs)), error: null };
        } catch (e) {
          return { threw: true, value: null, error: errorShape(e) };
        }
      };
      const actual = invoke(wrapperFn);
      const expected = (typeof nativeFn === "function") ? invoke(nativeFn) : null;
      let match = false;
      if (expected) {
        if (actual.threw === expected.threw) {
          if (actual.threw) {
            match = !!(
              actual.error &&
              expected.error &&
              actual.error.name === expected.error.name &&
              actual.error.message === expected.error.message
            );
          } else {
            match = JSON.stringify(actual.value) === JSON.stringify(expected.value);
          }
        }
      }
      return { actual, expected, match };
    }
    try {
      const plugins = nav.plugins;
      const pluginsAgain = nav.plugins;
      const mimeTypes = nav.mimeTypes;
      const mimeTypesAgain = nav.mimeTypes;
      const plugin0 = plugins && plugins.length ? plugins[0] : null;
      const mime0 = mimeTypes && mimeTypes.length ? mimeTypes[0] : null;
      const pluginArrayProto = (typeof PluginArray !== "undefined" && PluginArray && PluginArray.prototype)
        ? PluginArray.prototype
        : (plugins ? Object.getPrototypeOf(plugins) : null);
      const pluginProto = (typeof Plugin !== "undefined" && Plugin && Plugin.prototype)
        ? Plugin.prototype
        : (plugin0 ? Object.getPrototypeOf(plugin0) : null);
      const mimeTypeArrayProto = (typeof MimeTypeArray !== "undefined" && MimeTypeArray && MimeTypeArray.prototype)
        ? MimeTypeArray.prototype
        : (mimeTypes ? Object.getPrototypeOf(mimeTypes) : null);

      push("Navigator.plugins identity stable", plugins === pluginsAgain, {
        sameIdentity: plugins === pluginsAgain
      });
      push("Navigator.mimeTypes identity stable", mimeTypes === mimeTypesAgain, {
        sameIdentity: mimeTypes === mimeTypesAgain
      });
      push("Navigator.plugins tag", Object.prototype.toString.call(plugins) === "[object PluginArray]", {
        tag: Object.prototype.toString.call(plugins)
      });
      push("Navigator.mimeTypes tag", Object.prototype.toString.call(mimeTypes) === "[object MimeTypeArray]", {
        tag: Object.prototype.toString.call(mimeTypes)
      });
      push("Navigator.plugins item native-shaped", !!(plugins && typeof plugins.item === "function" && plugins.item.name === "item" && Function.prototype.toString.call(plugins.item).indexOf("[native code]") !== -1), {
        type: plugins ? typeof plugins.item : null,
        name: plugins && plugins.item ? plugins.item.name : null,
        toString: plugins && plugins.item ? Function.prototype.toString.call(plugins.item) : null
      });
      push("Navigator.plugins namedItem native-shaped", !!(plugins && typeof plugins.namedItem === "function" && plugins.namedItem.name === "namedItem" && Function.prototype.toString.call(plugins.namedItem).indexOf("[native code]") !== -1), {
        type: plugins ? typeof plugins.namedItem : null,
        name: plugins && plugins.namedItem ? plugins.namedItem.name : null,
        toString: plugins && plugins.namedItem ? Function.prototype.toString.call(plugins.namedItem) : null
      });
      push("Navigator.mimeTypes item native-shaped", !!(mimeTypes && typeof mimeTypes.item === "function" && mimeTypes.item.name === "item" && Function.prototype.toString.call(mimeTypes.item).indexOf("[native code]") !== -1), {
        type: mimeTypes ? typeof mimeTypes.item : null,
        name: mimeTypes && mimeTypes.item ? mimeTypes.item.name : null,
        toString: mimeTypes && mimeTypes.item ? Function.prototype.toString.call(mimeTypes.item) : null
      });
      push("Navigator.mimeTypes namedItem native-shaped", !!(mimeTypes && typeof mimeTypes.namedItem === "function" && mimeTypes.namedItem.name === "namedItem" && Function.prototype.toString.call(mimeTypes.namedItem).indexOf("[native code]") !== -1), {
        type: mimeTypes ? typeof mimeTypes.namedItem : null,
        name: mimeTypes && mimeTypes.namedItem ? mimeTypes.namedItem.name : null,
        toString: mimeTypes && mimeTypes.namedItem ? Function.prototype.toString.call(mimeTypes.namedItem) : null
      });
      push("Plugin object tag", !!plugin0 && Object.prototype.toString.call(plugin0) === "[object Plugin]", {
        tag: plugin0 ? Object.prototype.toString.call(plugin0) : null
      });
      push("MimeType object tag", !!mime0 && Object.prototype.toString.call(mime0) === "[object MimeType]", {
        tag: mime0 ? Object.prototype.toString.call(mime0) : null
      });
      push("Navigator.plugins numeric lookup linked", !!(plugins && plugin0 && plugins.item(0) === plugin0), {
        item0Matches: !!(plugins && plugin0 && plugins.item(0) === plugin0)
      });
      push("Navigator.plugins named lookup linked", !!(plugins && plugin0 && plugin0.name && plugins.namedItem(plugin0.name) === plugin0), {
        pluginName: plugin0 ? plugin0.name : null,
        namedItemMatches: !!(plugins && plugin0 && plugin0.name && plugins.namedItem(plugin0.name) === plugin0)
      });
      push("Navigator.mimeTypes numeric lookup linked", !!(mimeTypes && mime0 && mimeTypes.item(0) === mime0), {
        item0Matches: !!(mimeTypes && mime0 && mimeTypes.item(0) === mime0)
      });
      push("Navigator.mimeTypes named lookup linked", !!(mimeTypes && mime0 && mime0.type && mimeTypes.namedItem(mime0.type) === mime0), {
        mimeType: mime0 ? mime0.type : null,
        namedItemMatches: !!(mimeTypes && mime0 && mime0.type && mimeTypes.namedItem(mime0.type) === mime0)
      });
      push("Plugin numeric lookup linked", !!(plugin0 && mime0 && plugin0.item(0) === mime0), {
        item0Matches: !!(plugin0 && mime0 && plugin0.item(0) === mime0)
      });
      push("Plugin named lookup linked", !!(plugin0 && mime0 && mime0.type && plugin0.namedItem(mime0.type) === mime0), {
        mimeType: mime0 ? mime0.type : null,
        namedItemMatches: !!(plugin0 && mime0 && mime0.type && plugin0.namedItem(mime0.type) === mime0)
      });
      push("MimeType enabledPlugin linked", !!(mime0 && plugin0 && mime0.enabledPlugin === plugin0), {
        linked: !!(mime0 && plugin0 && mime0.enabledPlugin === plugin0)
      });
      if (plugins && typeof plugins.item === "function") {
        const wrongThis = compareWrongThis(plugins.item, pluginArrayProto && pluginArrayProto.item, [0]);
        push("PluginArray.item wrong-this matches native", wrongThis.match, wrongThis);
      }
      if (plugins && typeof plugins.namedItem === "function") {
        const wrongThis = compareWrongThis(plugins.namedItem, pluginArrayProto && pluginArrayProto.namedItem, [plugin0 && plugin0.name ? plugin0.name : "missing"]);
        push("PluginArray.namedItem wrong-this matches native", wrongThis.match, wrongThis);
      }
      if (plugin0 && typeof plugin0.item === "function") {
        const wrongThis = compareWrongThis(plugin0.item, pluginProto && pluginProto.item, [0]);
        push("Plugin.item wrong-this matches native", wrongThis.match, wrongThis);
      }
      if (plugin0 && typeof plugin0.namedItem === "function") {
        const wrongThis = compareWrongThis(plugin0.namedItem, pluginProto && pluginProto.namedItem, [mime0 && mime0.type ? mime0.type : "missing"]);
        push("Plugin.namedItem wrong-this matches native", wrongThis.match, wrongThis);
      }
      if (mimeTypes && typeof mimeTypes.item === "function") {
        const wrongThis = compareWrongThis(mimeTypes.item, mimeTypeArrayProto && mimeTypeArrayProto.item, [0]);
        push("MimeTypeArray.item wrong-this matches native", wrongThis.match, wrongThis);
      }
      if (mimeTypes && typeof mimeTypes.namedItem === "function") {
        const wrongThis = compareWrongThis(mimeTypes.namedItem, mimeTypeArrayProto && mimeTypeArrayProto.namedItem, [mime0 && mime0.type ? mime0.type : "missing"]);
        push("MimeTypeArray.namedItem wrong-this matches native", wrongThis.match, wrongThis);
      }
    } catch (e) {
      push("navigator collections probe", false, null, e);
    }

    __probeConsoleCall("group", "[probe] navigator collections");
    __probeConsoleCall("table", rows);
    __probeConsoleCall("groupEnd");
    return { ok: rows.every((row) => row && row.pass !== false), rows };
  }

  const fieldsMeta = { check: "__PROBE__", phase: "build", method: "printFieldValues" };
  const fieldsWait = await __probeObserveAsync(printFieldValues());
  if (!fieldsWait.ok && fieldsWait.timedOut) {
    __probeLogAsyncTimeout(fieldsMeta, fieldsWait.elapsedMs, fieldsWait.timeoutMs, fieldsWait.error);
  }
  const receiverMeta = { check: "__PROBE__", phase: "build", method: "printReceiverChecks" };
  const receiverWait = __PROBE_ENABLE_RECEIVER_CHECKS__
    ? await __probeObserveAsync(printReceiverChecks())
    : {
        ok: true,
        value: {
          ok: true,
          rows: [],
          skipped: true,
          reason: "disabled_by_probe_flags"
        },
        timedOut: false,
        elapsedMs: 0,
        timeoutMs: 0
      };
  if (__PROBE_ENABLE_RECEIVER_CHECKS__ && !receiverWait.ok && receiverWait.timedOut) {
    __probeLogAsyncTimeout(receiverMeta, receiverWait.elapsedMs, receiverWait.timeoutMs, receiverWait.error);
  }
  const workerScopeMeta = { check: "__PROBE__", phase: "build", method: "__probeRunWorkerScopeAudit" };
  const workerScopeWait = __PROBE_ENABLE_WORKER_SCOPE_AUDIT__
    ? await __probeObserveAsync(__probeRunWorkerScopeAudit())
    : {
        ok: true,
        value: {
          ok: true,
          rows: [],
          skipped: true,
          reason: "disabled_by_probe_flags"
        },
        timedOut: false,
        elapsedMs: 0,
        timeoutMs: 0
      };
  if (__PROBE_ENABLE_WORKER_SCOPE_AUDIT__ && !workerScopeWait.ok && workerScopeWait.timedOut) {
    __probeLogAsyncTimeout(workerScopeMeta, workerScopeWait.elapsedMs, workerScopeWait.timeoutMs, workerScopeWait.error);
  }
  const workerAccessorObservabilityMeta = { check: "__PROBE__", phase: "build", method: "__probeRunWorkerAccessorObservabilityAudit" };
  const workerAccessorObservabilityWait = __PROBE_ENABLE_WORKER_SCOPE_AUDIT__
    ? await __probeObserveAsync(__probeRunWorkerAccessorObservabilityAudit())
    : {
        ok: true,
        value: {
          ok: true,
          rows: [],
          skipped: true,
          reason: "disabled_by_probe_flags"
        },
        timedOut: false,
        elapsedMs: 0,
        timeoutMs: 0
      };
  if (__PROBE_ENABLE_WORKER_SCOPE_AUDIT__ && !workerAccessorObservabilityWait.ok && workerAccessorObservabilityWait.timedOut) {
    __probeLogAsyncTimeout(workerAccessorObservabilityMeta, workerAccessorObservabilityWait.elapsedMs, workerAccessorObservabilityWait.timeoutMs, workerAccessorObservabilityWait.error);
  }
  const apiControlMeta = { check: "__PROBE__", phase: "build", method: "printApiControlList" };
  const apiControlWait = await __probeObserveAsync(printApiControlList());
  if (!apiControlWait.ok && apiControlWait.timedOut) {
    __probeLogAsyncTimeout(apiControlMeta, apiControlWait.elapsedMs, apiControlWait.timeoutMs, apiControlWait.error);
  }

  const __probeModuleCheckState = {};
  const result = {
    ok: true,
    timestamp: new Date().toISOString(),
    fields: fieldsWait.ok ? fieldsWait.value : [{
      field: "__probe__.printFieldValues",
      ok: false,
      value: null,
      error: errorToString(fieldsWait.error),
      source: "probe_async",
      asyncState: fieldsWait.timedOut ? "timed_out" : "rejected",
      elapsedMs: fieldsWait.elapsedMs
    }],
    apiControlList: apiControlWait.ok ? apiControlWait.value : {
      rows: [{
        target: "__probe__.printApiControlList",
        scope: "window",
        variant: null,
        descriptorOwner: null,
        descriptorShape: null,
        accessorVsData: null,
        hasOwnOnNavigator: null,
        descriptorMissing: true,
        ownerMissing: true,
        readOnlyInspection: "Object.getOwnPropertyDescriptor",
        protoChain: [],
        error: errorShape(apiControlWait.error)
      }],
      meta: {
        error: errorShape(apiControlWait.error),
        asyncState: apiControlWait.timedOut ? "timed_out" : "rejected",
        elapsedMs: apiControlWait.elapsedMs
      }
    },
    descriptors: printPrototypeDescriptors(),
    methods: printTouchedMethods(),
    receiverChecks: receiverWait.ok ? receiverWait.value : {
      ok: false,
      rows: [{
        check: "receiver: probe_async",
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
    navigatorCollections: printNavigatorCollectionChecks(),
    workerScopeAudit: workerScopeWait.ok ? workerScopeWait.value : {
      ok: false,
      rows: [{
        scope: "worker_scope_audit",
        variant: null,
        field: "__probeRunWorkerScopeAudit",
        match: false,
        expected: null,
        actual: errorShape(workerScopeWait.error)
      }],
      error: errorShape(workerScopeWait.error),
      watchdogState: workerScopeWait.timedOut ? "timed_out" : "rejected"
    },
    workerAccessorObservability: workerAccessorObservabilityWait.ok ? workerAccessorObservabilityWait.value : {
      ok: false,
      rows: [{
        scope: "worker_accessor_observability",
        variant: null,
        key: "__probeRunWorkerAccessorObservabilityAudit",
        match: false,
        error: errorShape(workerAccessorObservabilityWait.error)
      }],
      error: errorShape(workerAccessorObservabilityWait.error),
      watchdogState: workerAccessorObservabilityWait.timedOut ? "timed_out" : "rejected"
    },
    degrade: printLastDegradeEvents(),
    moduleCheck: (__probeModuleCheckState.rows = printModuleCheck()),
    modulePatchDetails: __probeModuleCheckState.rows && Array.isArray(__probeModuleCheckState.rows.__probePatchRows)
      ? __probeModuleCheckState.rows.__probePatchRows
      : [],
    watchdog: {
      enabled: __PROBE_ENABLE_WORKER_SCOPE_AUDIT__,
      totalBudgetMs: __PROBE_ENABLE_WORKER_SCOPE_AUDIT__ ? __PROBE_TIMEOUTS.totalMs : 0,
      spentMs: Date.now() - __probeRunStartedAt,
      remainingMs: __PROBE_ENABLE_WORKER_SCOPE_AUDIT__ ? __probeRemainingBudgetMs() : 0,
      fields: {
        state: fieldsWait.ok ? "resolved" : (fieldsWait.timedOut ? "timed_out" : "rejected"),
        elapsedMs: fieldsWait.elapsedMs,
        timeoutMs: fieldsWait.timeoutMs
      },
      apiControlList: {
        state: apiControlWait.ok ? "resolved" : (apiControlWait.timedOut ? "timed_out" : "rejected"),
        elapsedMs: apiControlWait.elapsedMs,
        timeoutMs: apiControlWait.timeoutMs
      },
      receiverChecks: {
        state: __PROBE_ENABLE_RECEIVER_CHECKS__ ? (receiverWait.ok ? "resolved" : (receiverWait.timedOut ? "timed_out" : "rejected")) : "disabled",
        elapsedMs: receiverWait.elapsedMs,
        timeoutMs: receiverWait.timeoutMs
      },
      workerScopeAudit: {
        state: __PROBE_ENABLE_WORKER_SCOPE_AUDIT__
          ? (workerScopeWait.ok ? "resolved" : (workerScopeWait.timedOut ? "timed_out" : "rejected"))
          : "disabled",
        elapsedMs: workerScopeWait.elapsedMs,
        timeoutMs: workerScopeWait.timeoutMs
      },
      workerAccessorObservability: {
        state: __PROBE_ENABLE_WORKER_SCOPE_AUDIT__
          ? (workerAccessorObservabilityWait.ok ? "resolved" : (workerAccessorObservabilityWait.timedOut ? "timed_out" : "rejected"))
          : "disabled",
        elapsedMs: workerAccessorObservabilityWait.elapsedMs,
        timeoutMs: workerAccessorObservabilityWait.timeoutMs
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
      (result.workerScopeAudit ? result.workerScopeAudit.ok !== false : true) &&
      (result.workerAccessorObservability ? result.workerAccessorObservability.ok !== false : true) &&
      (result.audioOwnProperty ? result.audioOwnProperty.ok !== false : true) &&
      (result.prototypeInvariants ? result.prototypeInvariants.ok !== false : true) &&
      (result.toStringCrossRealm ? result.toStringCrossRealm.ok !== false : true) &&
      (result.navigatorCollections ? result.navigatorCollections.ok !== false : true) &&
      (result.degradeOk !== false) &&
      (result.moduleCheckOk !== false)
    );
  } catch (_) {}

  try {
    const observabilityRows = (result.workerAccessorObservability && Array.isArray(result.workerAccessorObservability.rows))
      ? result.workerAccessorObservability.rows
      : [];
    const observabilityBad = __probeCountWhere(observabilityRows, (row) => row && row.match === false);
    __probeReport("worker_accessor_observability", {
      status: observabilityBad ? "mismatch" : "ok",
      rows: observabilityRows,
      summary: {
        total: observabilityRows.length,
        bad: observabilityBad
      }
    });
  } catch (_) {}

  try {
    const collectionRows = (result.navigatorCollections && Array.isArray(result.navigatorCollections.rows))
      ? result.navigatorCollections.rows
      : [];
    const collectionBad = __probeCountWhere(collectionRows, (row) => row && row.pass === false);
    __probeReport("navigator_collections", {
      status: collectionBad ? "mismatch" : "ok",
      rows: collectionRows,
      summary: {
        total: collectionRows.length,
        bad: collectionBad
      }
    });
  } catch (_) {}

  try {
    const moduleRows = Array.isArray(result.moduleCheck) ? result.moduleCheck : [];
    const moduleBad = __probeCountWhere(moduleRows, (row) => {
      const status = (row && typeof row.status === "string") ? row.status : "";
      return status === "error" || status === "warn" || status === "missing_emitter" || status === "not_emitted";
    });
    __probeReport("module_check", {
      status: moduleBad ? "mismatch" : "ok",
      rows: moduleRows,
      summary: {
        total: moduleRows.length,
        bad: moduleBad
      }
    });
  } catch (_) {}

  Object.defineProperty(globalThis, "__PROBE_OUTPUT__", {
    value: result,
    writable: true,
    configurable: true,
    enumerable: false
  });

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
  const allCols = arr.length ? Array.from(new Set(arr.flatMap((r) => Object.keys(r || {})))) : [];
  const cols = allCols.filter((c) => arr.some((r) => {
    const v = r && Object.prototype.hasOwnProperty.call(r, c) ? r[c] : null;
    return v !== null && typeof v !== "undefined" && v !== "";
  }));
  if (!cols.length) return arr.length ? "<pre>(no printable columns)</pre>" : "<pre>(no rows)</pre>";
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
  const apiControlRows = result && result.apiControlList && Array.isArray(result.apiControlList.rows)
    ? result.apiControlList.rows
    : [];
  const apiControlMeta = result && result.apiControlList && result.apiControlList.meta
    ? __probeEscapeHtml(JSON.stringify(result.apiControlList.meta))
    : "not available";
  // const workerScopeRows = result && result.workerScopeAudit && result.workerScopeAudit.rows;
  const methodsRows = result && result.methods && result.methods.rows;
  const degradeRows = result && result.degrade && result.degrade.rows;
  const moduleCheckRows = result && Array.isArray(result.moduleCheck) ? result.moduleCheck : [];
  const moduleRows = moduleCheckRows;
  const modulePatchRows = result && Array.isArray(result.modulePatchDetails) ? result.modulePatchDetails : [];
  const toStringCrossRows = result && result.toStringCrossRealm && result.toStringCrossRealm.rows;
  const receiverRows = result && result.receiverChecks && result.receiverChecks.rows;
  const workerAccessorObservabilityRows = result && result.workerAccessorObservability && result.workerAccessorObservability.rows;
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
    <h2>API-only control list</h2>
    <div class="meta">${apiControlMeta}</div>
    ${__probeTableHtml(apiControlRows)}
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
    <h2>Worker accessor observability</h2>
    ${__probeTableHtml(workerAccessorObservabilityRows)}
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
    <h2>Module check</h2>
    ${__probeTableHtml(moduleRows)}
    ${modulePatchRows.length ? `<details><summary>Patch details (${modulePatchRows.length})</summary>${__probeTableHtml(modulePatchRows)}</details>` : ""}
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
};
try {
  const W = (typeof window !== "undefined") ? window : null;
  const L = (W && W.CanvasPatchContext && W.CanvasPatchContext.__logger && typeof W.CanvasPatchContext.__logger === "object")
    ? W.CanvasPatchContext.__logger
    : null;
  if (L) {
    Object.defineProperty(L, "__PROBE__", {
      value: __probeRun,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
} catch (_) {}
})();
