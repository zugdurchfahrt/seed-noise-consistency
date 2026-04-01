const LOGGingModule = function LOGGingModule() {
    const G =
      (typeof globalThis !== "undefined" && globalThis) ||
      (typeof self !== "undefined" && self) ||
      (typeof window !== "undefined" && window) ||
      {};
    const W = (typeof window !== "undefined" && window) ? window : null;

    const global = G;
    const C = ((W || G).CanvasPatchContext && (typeof (W || G).CanvasPatchContext === "object" || typeof (W || G).CanvasPatchContext === "function"))
      ? (W || G).CanvasPatchContext
      : null;
    if (!C) throw new Error("[LOGGingModule] CanvasPatchContext missing");
    const stateRoot = (C.state && typeof C.state === "object") ? C.state : null;
    if (!stateRoot) throw new Error("[LOGGingModule] CanvasPatchContext.state missing");
    const __loggerRoot = (C.__logger && typeof C.__logger === "object") ? C.__logger : null;
    if (!__loggerRoot) throw new Error("[LOGGingModule] CanvasPatchContext.__logger missing");

    function __defineLoggerHiddenValue(name, value, writable) {
      Object.defineProperty(__loggerRoot, name, {
        value: value,
        writable: writable !== false,
        configurable: true,
        enumerable: false
      });
      return value;
    }
    function __ensureLoggerHiddenValue(name, fallbackFactory, validator, writable) {
      const current = __loggerRoot[name];
      const isValid = (typeof validator === "function") ? validator(current) : !!current;
      const nextValue = isValid ? current : fallbackFactory();
      return __defineLoggerHiddenValue(name, nextValue, writable);
    }
    function __defineGlobalCompatValue(name, value, writable) {
      Object.defineProperty(global, name, {
        value: value,
        writable: writable !== false,
        configurable: true,
        enumerable: false
      });
      return value;
    }
    try {
      const globalLoggerAliasDesc = Object.getOwnPropertyDescriptor(global, "L");
      if (!globalLoggerAliasDesc || globalLoggerAliasDesc.configurable !== false || globalLoggerAliasDesc.value === __loggerRoot) {
        __defineGlobalCompatValue("L", __loggerRoot, true);
      }
    } catch (_) {}

    const __loggerWindowShellKeys = ["__DEGRADE__", "__DEBUG__", "_logLevel", "_logConfig", "__LOGGER_GUARD_MODE__", "log"];
    function rebindWindowLoggerShell() {
      if (!W) return;
      const diag = (__loggerRoot && __loggerRoot.__DEGRADE__ && typeof __loggerRoot.__DEGRADE__.diag === "function")
        ? __loggerRoot.__DEGRADE__.diag.bind(__loggerRoot.__DEGRADE__)
        : null;
      for (let i = 0; i < __loggerWindowShellKeys.length; i++) {
        const key = __loggerWindowShellKeys[i];
        const desc = Object.getOwnPropertyDescriptor(W, key);
        if (!desc) continue;
        if (desc.configurable === false) {
          if (diag) {
            diag("warn", "set_log:window_logger_shell_nonconfigurable", {
              module: "set_log",
              diagTag: "set_log",
              surface: "window",
              key: key,
              stage: "cleanup",
              message: "window logger shell cleanup skipped: non-configurable",
              type: "browser structure missing data",
              data: { outcome: "skip", reason: "window_logger_shell_nonconfigurable" }
            }, null);
          }
          continue;
        }
        try {
          delete W[key];
          if (Object.prototype.hasOwnProperty.call(W, key) && diag) {
            diag("warn", "set_log:window_logger_shell_delete_failed", {
              module: "set_log",
              diagTag: "set_log",
              surface: "window",
              key: key,
              stage: "cleanup",
              message: "window logger shell cleanup delete failed",
              type: "browser structure missing data",
              data: { outcome: "skip", reason: "window_logger_shell_delete_failed" }
            }, null);
          }
        } catch (e) {
          if (diag) {
            diag("warn", "set_log:window_logger_shell_delete_failed", {
              module: "set_log",
              diagTag: "set_log",
              surface: "window",
              key: key,
              stage: "cleanup",
              message: "window logger shell cleanup delete failed",
              type: "browser structure missing data",
              data: { outcome: "skip", reason: "window_logger_shell_delete_failed" }
            }, e);
          }
        }
      }
    }

    if (!__loggerRoot.__PATCH_MYTYPER__) {
    __defineLoggerHiddenValue("__PATCH_MYTYPER__", true, true);

    // ===== 0) Central store: private buffer only =====
    const STORE = (__loggerRoot.STORE instanceof WeakMap) ? __loggerRoot.STORE : new WeakMap();
    const FALLBACK_BUF = Array.isArray(__loggerRoot.FALLBACK_BUF) ? __loggerRoot.FALLBACK_BUF : [];
    __defineLoggerHiddenValue("STORE", STORE, true);
    __defineLoggerHiddenValue("FALLBACK_BUF", FALLBACK_BUF, true);
    let degradeFn = null;

    function _buf() {
      const key = degradeFn || __loggerRoot.__DEGRADE__;
      if (typeof key !== "function") return FALLBACK_BUF;
      if (!STORE.has(key)) STORE.set(key, []);
      return STORE.get(key);
    }

    function _guardPush(entry) {
      try { _buf().push(entry); } catch (_) {}
    }

    // Alert levels for pipeline diagnostics (warn+ are surfaced by default).
    const DIAG_CRITICAL_LEVELS = { warn: true, error: true, fatal: true };
    const DIAG_RUNTIME_TYPES = {
      onerror: "error",
      unhandledrejection: "error",
      resource_error: "error",
      worker_error: "error",
      worker_unhandledrejection: "error",
      logger_guard: "error"
    };

    // DIAG dedup/throttle:
    // - keeps the first N identical diag events and suppresses further duplicates;
    // - improves log readability when one failing check emits the same event many times;
    // - does NOT remove diagnostics entirely (first copies are still preserved for debugging).
    // Tunables (optional, set before logger init):
    //   window.__DIAG_DUP_LIMIT   -> how many equal events to keep (default: 2)
    //   window.__DIAG_DUP_MAP_MAX -> max unique signatures before map reset (default: 2048)
    const DIAG_DUP_LIMIT = toPosInt(global.__DIAG_DUP_LIMIT, 2);
    const DIAG_DUP_MAP_MAX = toPosInt(global.__DIAG_DUP_MAP_MAX, 2048);
    const DIAG_DUP_COUNTS = new Map();
    const LOGGER_MODULE_AUDIT_SLOTS = [
      { module: "set_log", diagTag: "set_log", codePrefix: "set_log", source: "bundle", emitter: "diag", functions: "none", critical: true },
      { module: "bootstrap_hide", diagTag: "bootstrap_hide", codePrefix: "bootstrap_hide", source: "bundle", emitter: "diag", functions: "none", critical: true },
      { module: "core_window", diagTag: "core_window", codePrefix: "core_window", source: "bundle", emitter: "diag", functions: "none", critical: true },
      { module: "probe", diagTag: "probe", codePrefix: "probe", source: "bundle", emitter: "diag", functions: "none", critical: true },
      { module: "rtc", diagTag: "rtc", codePrefix: "rtc", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "hide_webdriver", diagTag: "hide_webdriver", codePrefix: "hide_webdriver", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "wrk", diagTag: "wrk", codePrefix: "wrk", source: "bundle", emitter: "diag", functions: "none", critical: true },
      { module: "rng_set", diagTag: "rng_set", codePrefix: "rng_set", source: "bundle", emitter: "diag", functions: "none", critical: true },
      { module: "nav_total_set", diagTag: "nav_total_set", codePrefix: "nav_total_set", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "screen", diagTag: "screen", codePrefix: "screen", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "fonts", diagTag: "fonts", codePrefix: "fonts", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "canvas", diagTag: "canvas", codePrefix: "canvas", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "webgl", diagTag: "webgl", codePrefix: "webgl", source: "bundle", emitter: "diag", functions: "auto", aliases: ["webglstorage"], critical: true },
      { module: "webgpu_wl", diagTag: "webgpu_wl", codePrefix: "webgpu_wl", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "webgpu", diagTag: "webgpu", codePrefix: "webgpu", source: "bundle", emitter: "diag", functions: "auto", critical: true },
      { module: "audiocontext", diagTag: "audiocontext", codePrefix: "audiocontext", source: "bundle", emitter: "diag", functions: "auto", aliases: ["audio"], critical: true },
      { module: "context", diagTag: "context", codePrefix: "context", source: "bundle", emitter: "diag", functions: "none", critical: true },
      { module: "tz", diagTag: "tz", codePrefix: "tz", source: "cdp", emitter: "diag", functions: "auto", critical: true },
      { module: "GeoOverride", diagTag: "geo", codePrefix: "geo", source: "cdp", emitter: "diag", functions: "auto", critical: true },
      { module: "uad_override", diagTag: "uad_override", codePrefix: "uad_override", source: "cdp", emitter: "diag", functions: "auto", critical: true },
      { module: "headers_interceptor", diagTag: "headers_interceptor", codePrefix: "headers_interceptor", source: "disabled", emitter: "diag", functions: "auto", critical: false },
      { module: "headers_bridge", diagTag: "headers_bridge", codePrefix: "headers_bridge", source: "disabled", emitter: "diag", functions: "auto", critical: false },
      {
        module: "WORKER_PATCH_SRC",
        diagTag: "worker_patch",
        codePrefix: "worker_patch_src",
        source: "cdp",
        emitter: "diag",
        functions: "none",
        aliases: ["WORKER_PATCH_SRC"],
        critical: true,
        requiresResultProof: true,
        locate: {
          file: "sunami/assets/scripts/workerscope/WORKER_PATCH_SRC.js",
          triggerCode: "worker_patch_src:apply:installed",
          expected: {
            level: "info",
            code: "worker_patch_src:apply:installed",
            stage: "apply",
            key: "installWorkerUACHMirror",
            message: "worker patch installed",
            data: { outcome: "return" }
          }
        }
      },
      { module: "worker_bootstrap", diagTag: "worker_bootstrap", codePrefix: "worker_bootstrap", source: "cdp", emitter: "diag", functions: "none", critical: true }
    ];
    __defineLoggerHiddenValue("__MODULE_DIAG_SLOTS__", LOGGER_MODULE_AUDIT_SLOTS, true);
    const __moduleAuditState = {
      timerId: null,
      lastSignalByModule: Object.create(null),
      armed: false,
      completed: false
    };

    // Signature defines what "same event" means for dedup.
    // If these fields match, event copies after DIAG_DUP_LIMIT are suppressed.
    function diagDupSignature(level, code, ctx, err) {
      const c = (ctx && typeof ctx === "object") ? ctx : {};
      const data = (c.data && typeof c.data === "object") ? c.data : null;
      const consoleGroup = (
        (String(code || "unknown") === "set_log:console_capture")
        && data
        && typeof data.consoleGroup === "string"
        && data.consoleGroup
      ) ? data.consoleGroup : "";
      const eName = (err && typeof err.name === "string") ? err.name : "";
      const eMsg = (err && typeof err.message === "string") ? err.message : (err == null ? "" : String(err));
      return [
        String(level || "info"),
        String(code || "unknown"),
        (typeof c.module === "string") ? c.module : "",
        (typeof c.diagTag === "string") ? c.diagTag : "",
        (typeof c.surface === "string") ? c.surface : "",
        (typeof c.key === "string" || c.key === null) ? String(c.key) : "",
        (typeof c.stage === "string") ? c.stage : "",
        (typeof c.message === "string") ? c.message : "",
        (typeof c.type === "string") ? c.type : "",
        consoleGroup,
        eName,
        eMsg
      ].join("|");
    }

    // Returns true only for first N copies of the same signature.
    function shouldEmitDiag(level, code, ctx, err) {
      const sig = diagDupSignature(level, code, ctx, err);
      const prev = DIAG_DUP_COUNTS.has(sig) ? DIAG_DUP_COUNTS.get(sig) : 0;
      const next = prev + 1;
      DIAG_DUP_COUNTS.set(sig, next);
      if (DIAG_DUP_COUNTS.size > DIAG_DUP_MAP_MAX) {
        DIAG_DUP_COUNTS.clear();
      }
      return next <= DIAG_DUP_LIMIT;
    }

    function isSummaryCode(code) {
      if (typeof code !== "string" || !code) return false;
      return (
        code.endsWith(":ready") ||
        code.endsWith(":installed") ||
        code.endsWith(":applied") ||
        code.endsWith(":patched") ||
        code.endsWith(":patches_applied") ||
        code.endsWith(":whitelist_loaded") ||
        code.endsWith(":group_applied")
      );
    }

    function modulePrefixes(slot) {
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

    function modulePrefixMatch(value, prefix) {
      if (typeof value !== "string" || !value || typeof prefix !== "string" || !prefix) return false;
      return value === prefix || value.indexOf(prefix + ":") === 0;
    }

    function moduleEventMatchesSlot(slot, entry) {
      if (!slot || !entry || typeof entry !== "object" || entry.type !== "degrade") return false;
      const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
      const moduleName = (extra && typeof extra.module === "string" && extra.module) ? extra.module : null;
      const diagTag = (extra && typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null;
      const code = (typeof entry.code === "string" && entry.code) ? entry.code : null;
      if (slot.module && moduleName === slot.module) return true;
      const prefixes = modulePrefixes(slot);
      for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];
        if (modulePrefixMatch(diagTag, prefix) || modulePrefixMatch(code, prefix)) return true;
      }
      return false;
    }

    function modulePickEvent(slot, events) {
      if (!Array.isArray(events) || !events.length) return null;
      let fallback = null;
      for (let i = events.length - 1; i >= 0; i--) {
        const entry = events[i];
        const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
        const diagTag = (extra && typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null;
        const moduleName = (extra && typeof extra.module === "string" && extra.module) ? extra.module : null;
        if (!fallback) fallback = entry;
        if ((diagTag && diagTag === slot.diagTag) || (moduleName && moduleName === slot.module)) {
          if (isSummaryCode(entry.code)) return entry;
          return entry;
        }
      }
      return fallback;
    }

    function moduleEntryStatus(slot, entry) {
      if (slot && slot.emitter === "missing") return "missing_emitter";
      if (!entry) return (slot && slot.source === "disabled") ? "disabled" : "not_emitted";
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
      if (slot && slot.requiresResultProof === true && isSummaryCode(code)) return "apply_only";
      return isSummaryCode(code) ? "ok" : "seen";
    }
    __defineLoggerHiddenValue("__MODULE_DIAG_AUDIT__", Object.freeze({
      isSummaryCode,
      matchEntry: moduleEventMatchesSlot,
      pickEntry: modulePickEvent,
      entryStatus: moduleEntryStatus
    }), true);

    function emitModuleAuditSignal(slot, entry, status) {
      try {
        if (!slot || slot.critical !== true) return;
        if (status !== "apply_only" && status !== "warn" && status !== "error" && status !== "not_emitted" && status !== "missing_emitter") return;
        const locate = (slot && slot.locate && typeof slot.locate === "object") ? slot.locate : null;
        const expected = (locate && locate.expected && typeof locate.expected === "object") ? locate.expected : null;
        const extra = (entry && entry.extra && typeof entry.extra === "object") ? entry.extra : null;
        const data = (extra && extra.data && typeof extra.data === "object") ? extra.data : null;
        const code = (status === "apply_only")
          ? "degrade:module_result_missing"
          : "degrade:module_status";
        const message = (status === "apply_only")
          ? "module emitted only apply/install signal; result proof missing"
          : "module status is not ok";
        const entryCode = (entry && typeof entry.code === "string") ? entry.code : null;
        __degradeApi.diag("error", code, {
          module: (slot && typeof slot.module === "string" && slot.module) ? slot.module : "set_log",
          diagTag: "degrade:module_check",
          surface: (extra && typeof extra.surface === "string" && extra.surface)
            ? extra.surface
            : (slot && typeof slot.diagTag === "string" && slot.diagTag ? slot.diagTag : "logger"),
          key: (extra && (typeof extra.key === "string" || extra.key === null))
            ? extra.key
            : (expected && (typeof expected.key === "string" || expected.key === null))
              ? expected.key
              : ((slot && typeof slot.module === "string" && slot.module) ? slot.module : null),
          stage: "audit",
          message,
          type: "pipeline missing data",
          data: {
            outcome: "return",
            reason: status,
            module: slot && slot.module ? slot.module : null,
            code: entryCode,
            auditedBy: "set_log",
            observedStage: extra && typeof extra.stage === "string"
              ? extra.stage
              : (expected && typeof expected.stage === "string" ? expected.stage : null),
            observedKey: extra && (typeof extra.key === "string" || extra.key === null)
              ? extra.key
              : (expected && (typeof expected.key === "string" || expected.key === null) ? expected.key : null),
            observedData: data || (expected && Object.prototype.hasOwnProperty.call(expected, "data") ? expected.data : null),
            source: slot && slot.source ? slot.source : null,
            file: locate && typeof locate.file === "string" ? locate.file : null,
            triggerCode: locate && typeof locate.triggerCode === "string" ? locate.triggerCode : null
          }
        }, null);
      } catch (_) {}
    }

    function runModuleAuditProducer() {
      try {
        const buf = _buf();
        const arr = Array.isArray(buf)
          ? buf.filter((entry) => {
              if (!entry || entry.type !== "degrade") return false;
              const code = (typeof entry.code === "string") ? entry.code : "";
              return code !== "degrade:module_status" && code !== "degrade:module_result_missing";
            })
          : [];
        for (let i = 0; i < LOGGER_MODULE_AUDIT_SLOTS.length; i++) {
          const slot = LOGGER_MODULE_AUDIT_SLOTS[i];
          const events = [];
          for (let j = 0; j < arr.length; j++) {
            const entry = arr[j];
            if (moduleEventMatchesSlot(slot, entry)) events.push(entry);
          }
          const moduleEvent = modulePickEvent(slot, events);
          const status = moduleEntryStatus(slot, moduleEvent);
          const signalKey = [
            status,
            moduleEvent && typeof moduleEvent.code === "string" ? moduleEvent.code : "",
            moduleEvent && typeof moduleEvent.timestamp === "string" ? moduleEvent.timestamp : ""
          ].join("|");
          if (__moduleAuditState.lastSignalByModule[slot.module] === signalKey) continue;
          __moduleAuditState.lastSignalByModule[slot.module] = signalKey;
          if (status === "apply_only" || status === "warn" || status === "error" || status === "not_emitted" || status === "missing_emitter") {
            emitModuleAuditSignal(slot, moduleEvent, status);
          }
        }
      } catch (_) {}
    }

    function scheduleModuleAuditProducer() {
      try {
        if (__moduleAuditState.armed) return;
        __moduleAuditState.armed = true;
        const queueRun = function() {
          if (__moduleAuditState.completed === true) return;
          if (__moduleAuditState.timerId != null) return;
          __moduleAuditState.timerId = global.setTimeout(function() {
            __moduleAuditState.timerId = null;
            __moduleAuditState.completed = true;
            runModuleAuditProducer();
          }, 0);
        };
        const doc = (global.document && typeof global.document === "object") ? global.document : null;
        if (!doc || doc.readyState === "complete") {
          queueRun();
          return;
        }
        if (typeof global.addEventListener === "function") {
          global.addEventListener("load", queueRun, { once: true });
          return;
        }
        if (typeof doc.addEventListener === "function") {
          doc.addEventListener("DOMContentLoaded", queueRun, { once: true });
          return;
        }
        queueRun();
      } catch (_) {}
    }
    scheduleModuleAuditProducer();

    function toPosInt(v, defVal) {
      const n = Number(v);
      if (!isFinite(n) || n <= 0) return defVal;
      return Math.floor(n);
    }

    function toNonNegInt(v, defVal) {
      const n = Number(v);
      if (!isFinite(n) || n < 0) return defVal;
      return Math.floor(n);
    }

    function safeEntryTimestamp(entry) {
      if (!entry || typeof entry !== "object") return new Date().toISOString();
      return (typeof entry.timestamp === "string" && entry.timestamp) ? entry.timestamp : new Date().toISOString();
    }

    function normalizeDiagIncident(entry, idx) {
      try {
        if (!entry || typeof entry !== "object") return null;
        const entryType = (typeof entry.type === "string") ? entry.type : null;
        if (!entryType) return null;

        if (entryType === "degrade") {
          const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : {};
          const level = (typeof extra.level === "string" && extra.level) ? extra.level : "info";
          const errObj = (entry.error && typeof entry.error === "object") ? entry.error : null;
          const errName = (errObj && typeof errObj.name === "string") ? errObj.name : null;
          const errMessage = (errObj && typeof errObj.message === "string")
            ? errObj.message
            : (typeof entry.error === "string" ? entry.error : null);
          return {
            idx: (typeof idx === "number") ? idx : null,
            diagTag: (typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null,
            module: (typeof extra.module === "string" && extra.module) ? extra.module : null,
            key: (typeof extra.key === "string") ? extra.key : null,
            timestamp: safeEntryTimestamp(entry),
            entryType: "degrade",
            level: String(level),
            critical: !!DIAG_CRITICAL_LEVELS[String(level)],
            code: (typeof entry.code === "string" && entry.code) ? entry.code : null,
            stage: (typeof extra.stage === "string" && extra.stage) ? extra.stage : null,
            message: (typeof extra.message === "string" && extra.message) ? extra.message : errMessage,
            errName: errName,
            errMessage: errMessage,
            diagType: (typeof extra.type === "string" && extra.type) ? extra.type : null,
            data: Object.prototype.hasOwnProperty.call(extra, "data") ? extra.data : null
          };
        }

        if (!Object.prototype.hasOwnProperty.call(DIAG_RUNTIME_TYPES, entryType)) return null;
        const lvl = DIAG_RUNTIME_TYPES[entryType];
        const msg = (typeof entry.message === "string" && entry.message) ? entry.message : null;
        const runtimeData = {};
        if (Object.prototype.hasOwnProperty.call(entry, "data")) {
          runtimeData.data = normalizeForJSON(entry.data);
        }
        if (typeof entry.stack === "string" && entry.stack) runtimeData.stack = entry.stack;
        if (typeof entry.source === "string" && entry.source) runtimeData.source = entry.source;
        if (typeof entry.filename === "string" && entry.filename) runtimeData.filename = entry.filename;
        if (typeof entry.lineno === "number") runtimeData.lineno = entry.lineno;
        if (typeof entry.colno === "number") runtimeData.colno = entry.colno;
        if (Object.prototype.hasOwnProperty.call(entry, "error")) {
          runtimeData.error = normalizeForJSON(entry.error);
        }
        const hasRuntimeData = Object.keys(runtimeData).length > 0;
        return {
          idx: (typeof idx === "number") ? idx : null,
          diagTag: "runtime",
          module: "runtime",
          key: null,
          timestamp: safeEntryTimestamp(entry),
          entryType: entryType,
          level: lvl,
          critical: true,
          code: entryType,
          stage: "runtime",
          message: msg,
          errName: null,
          errMessage: msg,
          diagType: "browser structure missing data",
          data: hasRuntimeData ? runtimeData : null
        };
      } catch (_) {
        return null;
      }
    }

    function formatCompactTimestamp(value) {
      const raw = (typeof value === "string" && value) ? value : new Date().toISOString();
      const isoMatch = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(\.\d+)?Z?$/.exec(raw);
      if (isoMatch) {
        const fraction = isoMatch[3] ? isoMatch[3].slice(0, 3) : "";
        return isoMatch[1] + ":" + isoMatch[2] + fraction;
      }
      const parsed = new Date(raw);
      if (!isFinite(parsed.getTime())) return raw;
      const pad2 = (n) => String(n).padStart(2, "0");
      const centis = String(Math.floor(parsed.getUTCMilliseconds() / 10)).padStart(2, "0");
      return [
        parsed.getUTCFullYear(),
        pad2(parsed.getUTCMonth() + 1),
        pad2(parsed.getUTCDate())
      ].join("-") + ":" + [
        pad2(parsed.getUTCHours()),
        pad2(parsed.getUTCMinutes()),
        pad2(parsed.getUTCSeconds())
      ].join(":") + "." + centis;
    }

    function resolveModuleAuditObservedData(triggerCode) {
      try {
        if (typeof triggerCode !== "string" || !triggerCode) return null;
        const arr = _buf();
        if (!Array.isArray(arr)) return null;
        for (let i = arr.length - 1; i >= 0; i--) {
          const entry = arr[i];
          if (!entry || entry.type !== "degrade") continue;
          const code = (typeof entry.code === "string") ? entry.code : "";
          if (!code || code === "degrade:module_status" || code === "degrade:module_result_missing") continue;
          if (code !== triggerCode) continue;
          const extra = (entry.extra && typeof entry.extra === "object") ? entry.extra : null;
          const data = (extra && extra.data && typeof extra.data === "object") ? extra.data : null;
          if (!data) continue;
          return normalizeForJSON(data);
        }
      } catch (_) {}
      return null;
    }

    function shapeDegradeBufferEntry(entry, idx) {
      const incident = normalizeDiagIncident(entry, idx);
      const entryType = (entry && typeof entry.type === "string") ? entry.type : (incident && incident.entryType ? incident.entryType : "degrade");
      const entryExtra = (entry && entry.extra && typeof entry.extra === "object")
        ? normalizeForJSON(entry.extra)
        : {};
      const extra = (entryExtra && typeof entryExtra === "object")
        ? Object.assign({}, entryExtra)
        : {};
      if (incident) {
        if (typeof incident.level === "string" && !Object.prototype.hasOwnProperty.call(extra, "level")) extra.level = incident.level;
        if (typeof incident.diagTag === "string" && incident.diagTag && !Object.prototype.hasOwnProperty.call(extra, "diagTag")) extra.diagTag = incident.diagTag;
        if (typeof incident.stage === "string" && incident.stage && !Object.prototype.hasOwnProperty.call(extra, "stage")) extra.stage = incident.stage;
        if (typeof incident.diagType === "string" && incident.diagType && !Object.prototype.hasOwnProperty.call(extra, "type")) extra.type = incident.diagType;
        if (!Object.prototype.hasOwnProperty.call(extra, "data") && incident.data != null) extra.data = incident.data;
        if (!Object.prototype.hasOwnProperty.call(extra, "entryType")) extra.entryType = incident.entryType;
        if (!Object.prototype.hasOwnProperty.call(extra, "critical")) extra.critical = !!incident.critical;
      }
      const errorValue = (() => {
        if (entry && Object.prototype.hasOwnProperty.call(entry, "error")) return normalizeForJSON(entry.error);
        if (incident && (incident.errName || incident.errMessage)) {
          return {
            name: incident.errName || null,
            message: incident.errMessage || null
          };
        }
        if (entry && typeof entry.message === "string" && entry.message) return entry.message;
        return null;
      })();
      const moduleName = (typeof extra.module === "string" && extra.module)
        ? extra.module
        : (entry && typeof entry.module === "string" && entry.module)
          ? entry.module
          : (incident && typeof incident.module === "string" ? incident.module : null);
      const keyValue = (typeof extra.key === "string" || extra.key === null)
        ? extra.key
        : (entry && (typeof entry.key === "string" || entry.key === null))
          ? entry.key
          : (incident ? incident.key : null);
      const codeValue = (entry && typeof entry.code === "string" && entry.code)
        ? entry.code
        : (incident && typeof incident.code === "string" ? incident.code : ((entry && typeof entry.type === "string") ? entry.type : null));
      if (
        extra
        && typeof extra === "object"
        && (codeValue === "degrade:module_status" || codeValue === "degrade:module_result_missing")
        && extra.data
        && typeof extra.data === "object"
      ) {
        const data = Object.assign({}, extra.data);
        const observed = (data.observedData && typeof data.observedData === "object") ? data.observedData : null;
        const looksThinObserved = !observed || (
          Object.keys(observed).length <= 1
          && Object.prototype.hasOwnProperty.call(observed, "outcome")
        );
        if (looksThinObserved) {
          const hydratedObserved = resolveModuleAuditObservedData(data.triggerCode);
          if (hydratedObserved && typeof hydratedObserved === "object") {
            data.observedData = hydratedObserved;
          }
        }
        const nextObserved = (data.observedData && typeof data.observedData === "object") ? data.observedData : null;
        if (nextObserved) {
          const workerKeys = ["scopeKind", "language", "languages", "deviceMemory", "hardwareConcurrency", "uaData"];
          for (let i = 0; i < workerKeys.length; i++) {
            const k = workerKeys[i];
            if (!Object.prototype.hasOwnProperty.call(data, k) && Object.prototype.hasOwnProperty.call(nextObserved, k)) {
              data[k] = nextObserved[k];
            }
          }
        }
        extra.data = data;
      }
      return {
        idx: (typeof idx === "number") ? idx : null,
        module: moduleName,
        key: keyValue,
        code: codeValue,
        error: errorValue,
        extra: extra,
        timestamp: formatCompactTimestamp(safeEntryTimestamp(entry)),
        type: entryType
      };
    }

    function buildDegradeBufferMeta(rawEntries) {
      const arr = Array.isArray(rawEntries) ? rawEntries : [];
      const meta = {
        totalBuffer: arr.length,
        totalCritical: 0,
        byLevel: {},
        byCode: {},
        byModule: {},
        byEntryType: {},
        lastCritical: []
      };
      for (let i = 0; i < arr.length; i++) {
        const incident = normalizeDiagIncident(arr[i], i);
        if (!incident) continue;
        const level = (typeof incident.level === "string" && incident.level) ? incident.level : "info";
        const code = (typeof incident.code === "string" && incident.code) ? incident.code : "unknown";
        const moduleName = (typeof incident.module === "string" && incident.module) ? incident.module : "unknown";
        const entryType = (typeof incident.entryType === "string" && incident.entryType) ? incident.entryType : "unknown";
        meta.byLevel[level] = (meta.byLevel[level] || 0) + 1;
        meta.byCode[code] = (meta.byCode[code] || 0) + 1;
        meta.byModule[moduleName] = (meta.byModule[moduleName] || 0) + 1;
        meta.byEntryType[entryType] = (meta.byEntryType[entryType] || 0) + 1;
        if (!incident.critical) continue;
        meta.totalCritical += 1;
        meta.lastCritical.push(shapeDegradeBufferEntry(arr[i], i));
      }
      if (meta.lastCritical.length > 30) meta.lastCritical = meta.lastCritical.slice(-30);
      meta.lastTimestamp = arr.length ? formatCompactTimestamp(safeEntryTimestamp(arr[arr.length - 1])) : null;
      meta.cursor = {
        nextSinceIndex: arr.length,
        lastTimestamp: meta.lastTimestamp
      };
      return meta;
    }


    // Debug flag
    __ensureLoggerHiddenValue("__DEBUG__", function () {
      return (
        // Toggle for *logger self-diagnostics visibility*.
        // IMPORTANT: must not change runtime behavior by throwing from the logger.
        typeof global.__DEBUG__ !== "undefined" ? !!global.__DEBUG__ : true
      );
      // typeof global.__DEBUG__ !== "undefined" ? !!global.__DEBUG__ : false;
    }, function (v) {
      return typeof v === "boolean";
    }, true);

    const env = (function () {
      const existingEnv = (global.env && typeof global.env === "object") ? global.env : Object.create(null);
      __defineGlobalCompatValue("env", existingEnv, true);
      if (!Object.prototype.hasOwnProperty.call(existingEnv, "DEBUG_DEGRADES")) existingEnv.DEBUG_DEGRADES = true;
      // existingEnv.DEBUG_DEGRADES = false; // выключить
      // existingEnv.EXPECTED_RECEIVER_THROW_GUARD = true;   // включить special logger_guard for expected Illegal invocation / incompatible receiver
      if (!Object.prototype.hasOwnProperty.call(existingEnv, "EXPECTED_RECEIVER_THROW_GUARD")) existingEnv.EXPECTED_RECEIVER_THROW_GUARD = false;
      return existingEnv;
    })();


    // Save original console methods
    const origConsole = {
      log: console.log && console.log.bind(console),
      warn: console.warn && console.warn.bind(console),
      error: console.error && console.error.bind(console),
      info: console.info && console.info.bind(console),
      debug: console.debug && console.debug.bind(console),
      trace: console.trace && console.trace.bind(console),
      group: console.group && console.group.bind(console),
      groupCollapsed: console.groupCollapsed && console.groupCollapsed.bind(console),
      groupEnd: console.groupEnd && console.groupEnd.bind(console),
      table: console.table && console.table.bind(console),
      dir: console.dir && console.dir.bind(console),
    };
    __defineLoggerHiddenValue("__RAW_CONSOLE__", Object.freeze(origConsole), true);
    const consoleGroupStack = [];

    function getLoggerGuard() {
      __ensureLoggerHiddenValue("__LOGGER_GUARD__", function () {
        return { count: 0, last: null, lastAt: null };
      }, function (v) {
        return !!(v && typeof v === "object");
      }, true);
      return __loggerRoot.__LOGGER_GUARD__;
    }

    function getLoggerGuardMode() {
      try {
        __ensureLoggerHiddenValue("__LOGGER_GUARD_MODE__", function () { return {}; }, function (v) {
          return !!(v && typeof v === "object");
        }, true);
        const mode = __loggerRoot.__LOGGER_GUARD_MODE__;
        if (!Object.prototype.hasOwnProperty.call(mode, "expectedReceiverThrow")) {
          mode.expectedReceiverThrow = !(env && env.EXPECTED_RECEIVER_THROW_GUARD === false);
        }
        return mode;
      } catch (_) {
        return null;
      }
    }

    function recordLoggerError(err, where) {
      const guard = getLoggerGuard();
      guard.count++;
      guard.lastAt = Date.now();
      guard.last = {
        where: where ? String(where) : "unknown",
        message: (err && err.message) ? String(err.message) : String(err),
        stack: (err && err.stack) ? String(err.stack) : null
      };

      _guardPush({
        type: "logger_guard",
        logger_guard: true,
        where: guard.last.where,
        message: guard.last.message,
        stack: guard.last.stack,
        timestamp: new Date().toISOString()
      });
    }

    function isProbeReceiverGuardActive() {
      try {
        const mode = getLoggerGuardMode();
        return !!(mode && typeof mode === "object" && Number(mode.probeExpectedThrowDepth) > 0);
      } catch (_) {
        return false;
      }
    }

    function isExpectedReceiverThrowGuardActive() {
      try {
        const mode = getLoggerGuardMode();
        return !(mode && mode.expectedReceiverThrow === false);
      } catch (_) {
        return true;
      }
    }

    function recordProbeGuardDegrade(code, err, extra) {
      try {
        const guard = getLoggerGuard();
        const safeExtra = (extra && typeof extra === "object") ? extra : {};
        const errMessage =
          (err && typeof err === "object" && typeof err.message === "string") ? String(err.message) :
          (typeof err === "string" ? String(err) : null);
        const message = errMessage || ((typeof safeExtra.message === "string" && safeExtra.message) ? safeExtra.message : String(code || "probe.bad_receiver"));
        const stack = (err && typeof err === "object" && typeof err.stack === "string") ? String(err.stack) : null;

        guard.count++;
        guard.lastAt = Date.now();
        guard.last = {
          where: "probe.bad_receiver",
          message: message,
          stack: stack
        };

        _guardPush({
          type: "logger_guard",
          logger_guard: true,
          where: guard.last.where,
          code: code ? String(code) : "probe.bad_receiver",
          message: message,
          stack: stack,
          meta: {
            source: "probe",
            mode: "bad_receiver_checks",
            module: (typeof safeExtra.module === "string") ? safeExtra.module : null,
            stage: (typeof safeExtra.stage === "string") ? safeExtra.stage : null,
            key: (typeof safeExtra.key === "string") ? safeExtra.key : null,
            level: (typeof safeExtra.level === "string") ? safeExtra.level : null
          },
          timestamp: new Date().toISOString()
        });
      } catch (_) {}
    }

    function extractConsoleBufferMeta(args) {
      const arr = Array.isArray(args) ? args.slice() : [];
      if (!arr.length) return { args: arr, meta: null };
      const first = arr[0];
      if (!isPlainObject(first) || first.__bufferMeta__ !== true) return { args: arr, meta: null };
      return {
        args: arr.slice(1),
        meta: {
          module: (typeof first.module === "string" && first.module) ? first.module : null,
          key: (typeof first.key === "string" || first.key === null) ? first.key : null,
          code: (typeof first.code === "string" && first.code) ? first.code : null
        }
      };
    }

    function isExpectedReceiverThrow(code, extra, err) {
      try {
        const safeExtra = (extra && typeof extra === "object") ? extra : {};
        const data = (safeExtra.data && typeof safeExtra.data === "object") ? safeExtra.data : {};
        const reason = (typeof data.reason === "string") ? data.reason : "";
        const outcome = (typeof data.outcome === "string") ? data.outcome : "";
        const normalizedCode = (typeof code === "string") ? code : "";
        if (outcome === "throw" && (reason === "native_throw" || reason === "native_illegal_invocation" || reason === "illegal_invocation")) return true;
        if (normalizedCode.endsWith(":native_throw")) return true;
        if (normalizedCode.indexOf("_illegal_invocation") !== -1) return true;
        const er = (err && typeof err === "object") ? err : null;
        const name = (er && typeof er.name === "string") ? er.name : "";
        const message = (er && typeof er.message === "string") ? er.message.toLowerCase() : "";
        if (name !== "TypeError") return false;
        return message.indexOf("illegal invocation") !== -1 || message.indexOf("incompatible receiver") !== -1;
      } catch (_) {
        return false;
      }
    }

    function recordExpectedReceiverThrow(code, err, extra) {
      try {
        const guard = getLoggerGuard();
        const safeExtra = (extra && typeof extra === "object") ? extra : {};
        const errMessage =
          (err && typeof err === "object" && typeof err.message === "string") ? String(err.message) :
          (typeof err === "string" ? String(err) : null);
        const message = errMessage || ((typeof safeExtra.message === "string" && safeExtra.message) ? safeExtra.message : String(code || "expected_receiver_throw"));
        const stack = (err && typeof err === "object" && typeof err.stack === "string") ? String(err.stack) : null;

        guard.count++;
        guard.lastAt = Date.now();
        guard.last = {
          where: "expected.receiver.throw",
          message: message,
          stack: stack
        };

        _guardPush({
          type: "logger_guard",
          logger_guard: true,
          where: guard.last.where,
          code: code ? String(code) : "expected_receiver_throw",
          message: message,
          stack: stack,
          meta: {
            source: "degrade",
            mode: "expected_receiver_throw",
            module: (typeof safeExtra.module === "string") ? safeExtra.module : null,
            stage: (typeof safeExtra.stage === "string") ? safeExtra.stage : null,
            key: (typeof safeExtra.key === "string") ? safeExtra.key : null,
            level: (typeof safeExtra.level === "string") ? safeExtra.level : null,
            data: (safeExtra.data && typeof safeExtra.data === "object") ? safeExtra.data : null
          },
          timestamp: new Date().toISOString()
        });
      } catch (_) {}
    }

    function guardedApply(fn, self, args, where) {
      try {
        return Reflect.apply(fn, self, args);
      } catch (err) {
        recordLoggerError(err, where);
        // Logging must never become a runtime crash source.
        return undefined;
      }
    }

    // Supported logging levels
    const LOG_LEVELS = ["error", "warn", "log", "info", "debug", "trace"];
    __ensureLoggerHiddenValue("_logLevel", function () {
      return (typeof global._logLevel === "string" && global._logLevel) ? global._logLevel : "log";
    }, function (v) {
      return typeof v === "string" && !!v;
    }, true);

    function levelAllows(currentLevel, eventLevel) {
      const idx = LOG_LEVELS.indexOf(currentLevel);
      const safeIdx = idx >= 0 ? idx : LOG_LEVELS.indexOf("log");
      const allowed = LOG_LEVELS.slice(0, safeIdx + 1);
      return allowed.indexOf(eventLevel) !== -1;
    }

    // ===== 1) Make everything JSON-serializable =====
    function safeTag(v) {
      try {
        return Object.prototype.toString.call(v);
      } catch (_) {
        return "[object Unknown]";
      }
    }

    function isHostLikeTag(tag) {
      return /\[object (Window|Document|HTML.*|SVG.*|Media.*|WebGL.*|Canvas.*|Offscreen.*|ImageData|Plugin|PluginArray|MimeType|MimeTypeArray)\]/.test(
        tag
      );
    }

    const SERIAL_LIMITS = {
      depth: 3,
      keys: 32,
      array: 64,
      string: 512,
      metaKeys: 8
    };

    function clampString(value) {
      const s = String(value);
      if (s.length <= SERIAL_LIMITS.string) return s;
      return s.slice(0, SERIAL_LIMITS.string) + `...[len=${s.length}]`;
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object") return false;
      let proto;
      try {
        proto = Object.getPrototypeOf(value);
      } catch (_) {
        return false;
      }
      return proto === Object.prototype || proto === null;
    }

    function metadataSnapshot(value, tag) {
      const out = { __type: "snapshot", tag: tag || safeTag(value) };
      try {
        const ctor = value && value.constructor && value.constructor.name;
        if (typeof ctor === "string" && ctor) out.ctor = ctor;
      } catch (_) {}
      try {
        if (typeof value === "function") out.name = value.name || "anonymous";
      } catch (_) {}
      try {
        if (value && typeof value === "object") {
          if (typeof value.length === "number" && isFinite(value.length)) out.length = value.length;
          const keys = Object.keys(value);
          out.keys = keys.slice(0, SERIAL_LIMITS.metaKeys);
          if (keys.length > SERIAL_LIMITS.metaKeys) out.keys_truncated = keys.length - SERIAL_LIMITS.metaKeys;
        }
      } catch (_) {}
      return out;
    }

    function normalizeForJSON(value, seen, depth) {
      try {
        const lvl = typeof depth === "number" ? depth : 0;
        if (value === null || typeof value === "undefined") return value;
        const t = typeof value;

        if (t === "string") {
          if (value.indexOf("data:") === 0) return "[DataURL len=" + value.length + "]";
          if (value.indexOf("blob:") === 0) return "[BlobURL]";
          return clampString(value);
        }
        if (t === "number" || t === "boolean") return value;
        if (t === "bigint") return String(value) + "n";
        if (t === "symbol") return String(value);

        if (t === "function") {
          return metadataSnapshot(value, safeTag(value));
        }

        if (value instanceof Error) {
          return {
            __type: "Error",
            name: clampString(value.name || "Error"),
            message: clampString(value.message || ""),
            stack: value.stack ? clampString(value.stack) : null,
          };
        }

        const tag = safeTag(value);
        if (isHostLikeTag(tag)) return metadataSnapshot(value, tag);

        if (t !== "object") return clampString(value);

        // Cycles
        if (!seen) seen = new WeakSet();
        if (seen.has(value)) return "[Circular]";
        seen.add(value);

        if (lvl >= SERIAL_LIMITS.depth) return metadataSnapshot(value, tag);

        // Arrays
        if (Array.isArray(value)) {
          const lim = Math.min(value.length, SERIAL_LIMITS.array);
          const outArr = new Array(lim);
          for (let i = 0; i < lim; i++) {
            outArr[i] = normalizeForJSON(value[i], seen, lvl + 1);
          }
          if (value.length > lim) outArr.push(`[... ${value.length - lim} more items]`);
          return outArr;
        }

        if (!isPlainObject(value)) return metadataSnapshot(value, tag);

        const out = {};
        const keys = Object.keys(value);
        const lim = Math.min(keys.length, SERIAL_LIMITS.keys);
        for (let i = 0; i < lim; i++) {
          const k = keys[i];
          try {
            out[k] = normalizeForJSON(value[k], seen, lvl + 1);
          } catch (_) {
            out[k] = "[Unserializable]";
          }
        }
        if (keys.length > lim) out.__truncated_keys__ = keys.length - lim;
        return out;
      } catch (_) {
        return metadataSnapshot(value, safeTag(value));
      }
    }

    function normalizeProbeScalar(value) {
      if (value === null || typeof value === "undefined") return value;
      const t = typeof value;
      if (t === "string" || t === "number" || t === "boolean") return normalizeForJSON(value);
      if (value instanceof Error) return normalizeForJSON(value);
      if (Array.isArray(value)) {
        const lim = Math.min(value.length, 8);
        const out = new Array(lim);
        for (let i = 0; i < lim; i++) out[i] = normalizeForJSON(value[i], null, 2);
        if (value.length > lim) out.push(`[... ${value.length - lim} more items]`);
        return out;
      }
      if (isPlainObject(value)) {
        const keys = Object.keys(value);
        const out = {};
        const lim = Math.min(keys.length, 8);
        for (let i = 0; i < lim; i++) {
          const k = keys[i];
          out[k] = normalizeForJSON(value[k], null, 2);
        }
        if (keys.length > lim) out.__truncated_keys__ = keys.length - lim;
        return out;
      }
      return metadataSnapshot(value, safeTag(value));
    }

    function normalizeProbeRow(section, row) {
      if (!row || typeof row !== "object") return normalizeProbeScalar(row);
      const out = {};
      function pick(key, alias) {
        if (!Object.prototype.hasOwnProperty.call(row, key)) return;
        const v = row[key];
        out[alias || key] = normalizeProbeScalar(v);
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
        return Object.keys(out).length ? out : metadataSnapshot(row, safeTag(row));
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
        pick("module"); pick("kind"); pick("unit"); pick("status"); pick("code"); pick("message");
        return out;
      }
      const keys = Object.keys(row);
      for (let i = 0; i < Math.min(keys.length, 8); i++) pick(keys[i]);
      if (keys.length > 8) out.__truncated_keys__ = keys.length - 8;
      return out;
    }

    function normalizeProbeReportData(value) {
      if (!isPlainObject(value)) return normalizeForJSON(value);
      const out = {};
      if (Object.prototype.hasOwnProperty.call(value, "section")) out.section = normalizeForJSON(value.section);
      if (Object.prototype.hasOwnProperty.call(value, "status")) out.status = normalizeForJSON(value.status);
      if (Object.prototype.hasOwnProperty.call(value, "probeRunId")) out.probeRunId = normalizeForJSON(value.probeRunId);
      if (Object.prototype.hasOwnProperty.call(value, "summary")) out.summary = normalizeProbeScalar(value.summary);
      if (Object.prototype.hasOwnProperty.call(value, "reason")) out.reason = normalizeForJSON(value.reason);
      if (Object.prototype.hasOwnProperty.call(value, "error")) out.error = normalizeProbeScalar(value.error);
      const section = (typeof value.section === "string" && value.section) ? value.section : "";
      if (Array.isArray(value.rows)) {
        const lim = Math.min(value.rows.length, 64);
        out.rows = new Array(lim);
        for (let i = 0; i < lim; i++) out.rows[i] = normalizeProbeRow(section, value.rows[i]);
        if (value.rows.length > lim) out.rows.push(`[... ${value.rows.length - lim} more items]`);
      }
      if (Array.isArray(value.rawEntries)) {
        const lim = Math.min(value.rawEntries.length, 12);
        out.rawEntries = new Array(lim);
        for (let i = 0; i < lim; i++) out.rawEntries[i] = normalizeProbeScalar(value.rawEntries[i]);
        if (value.rawEntries.length > lim) out.rawEntries.push(`[... ${value.rawEntries.length - lim} more items]`);
      }
      if (Object.prototype.hasOwnProperty.call(value, "meta")) out.meta = normalizeProbeScalar(value.meta);
      return out;
    }

    function safeStringify(value) {
      try {
        return JSON.stringify(normalizeForJSON(value), null, 2);
      } catch (_) {
        try {
          return String(value);
        } catch (__e) {
          return safeTag(value);
        }
      }
    }

    function pushEntry(entry) {
      try {
        _buf().push(entry);
      } catch (e) {
        // ВАЖНО: не вызывать __DEGRADE__ отсюда, если __DEGRADE__ пишет через pushEntry,
        // иначе рекурсия по пути ошибок (само-логирование логгера).
        // (если очень надо сигналить — делай это через origConsole.* или просто молчи)
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          // Keep last-known logger failure in memory; never throw outward from the logger.
          try { recordLoggerError(e, "pushEntry"); } catch (_) {}
        }
      }
    }


    // ===== 2.5) Swallowed/degrade marker (explicit) =====
    const __degradeApi = function (code, err, extra) {
    degradeFn = __degradeApi;
      try {
        if (typeof pushEntry !== "function") {
          if (env && env.DEBUG_DEGRADES) {
            const te = new TypeError("[set_log] pushEntry is missing");
            try { recordLoggerError(te, "__DEGRADE__:pushEntry_missing"); } catch (_) {}
            if (origConsole && origConsole.error) { try { origConsole.error(te); } catch (_) {} }
          }
          return;
        }
        const normalizedExtra = extra ? normalizeForJSON(extra) : null;

        if (isProbeReceiverGuardActive()) {
          recordProbeGuardDegrade(code, err, normalizedExtra);
          return;
        }

        pushEntry({
          type: "degrade",
          code: code ? String(code) : "unknown",
          error: err instanceof Error ? {
            name: err.name,
            message: err.message,
            stack: err.stack || null,
          } : (err ? safeStringify(err) : null),
          extra: normalizedExtra,
          timestamp: new Date().toISOString(),
        });
        } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
            if (origConsole && origConsole.error) {
            try { origConsole.error(e); } catch (_) {}
            }
            try { recordLoggerError(e, "__DEGRADE__"); } catch (_) {}
        }
        }
    };
    degradeFn = __degradeApi;
    __defineLoggerHiddenValue("__DEGRADE__", __degradeApi, true);

    Object.defineProperty(__degradeApi, "getBuffer", {
      value() {
        const raw = _buf().slice();
        const shaped = raw.map((entry, idx) => shapeDegradeBufferEntry(entry, idx));
        Object.defineProperty(shaped, "meta", {
          value: buildDegradeBufferMeta(raw),
          enumerable: false,
          writable: false,
          configurable: false
        });
        return shaped;
      },
      enumerable: false,
      writable: false,
      configurable: false
    });

    /**
     * C.__logger.__DEGRADE__.diag(level, code, ctx, err?)
     *
     * Единый вход для диагностических событий всех модулей.
     *
     * @param {string} level - 'info'|'warn'|'error'|'fatal'
     * @param {string} code - идентификатор события
     * @param {object} ctx - plain-object контекст: module, diagTag, surface, key, stage, message, data, type
     * @param {Error} [err] - опциональная ошибка
     *
     * Записывает в shape: { type:'degrade', code, error, extra:{ level, type, ... }, timestamp }.
     * Fail-safe: не бросает исключения и не пишет в console.
     */
  Object.defineProperty(__degradeApi, "diag", {
      value(level, code, ctx, err) {
        try {
          const validLevels = ["info", "warn", "error", "fatal"];
          const rawLevel = String(level || "info");
          const normalizedLevel = validLevels.indexOf(rawLevel) !== -1 ? rawLevel : "info";
          const normalizedCode = String(code || "unknown");

          let safeCtx = ctx;
          if (!isPlainObject(safeCtx)) {
            safeCtx = {};
          }

      // accept any string type; do not overwrite ctx.type
      const rawType = (safeCtx && typeof safeCtx.type === "string") ? safeCtx.type : undefined;
      const validatedType = rawType; // keep as-is; undefined if not provided

      // Preserve `null` as a distinct value; only coerce truly invalid types.
      // `data` is allowed to be `object|function|null` (arrays are ok).
      let dataIn = safeCtx && safeCtx.data;
      if (dataIn === undefined) dataIn = {};
      if (dataIn !== null && (typeof dataIn !== "object" && typeof dataIn !== "function")) {
        dataIn = {};
      }
      const safeData = (dataIn === null)
        ? null
        : (
            safeCtx
            && safeCtx.module === "probe"
            && safeCtx.diagTag === "probe:report"
            && isPlainObject(dataIn)
          )
          ? normalizeProbeReportData(dataIn)
          : normalizeForJSON(dataIn);

      const extraObj = {
        level: normalizedLevel,
        type: validatedType,
        module: (typeof safeCtx.module === "string") ? safeCtx.module : undefined,
        diagTag: (typeof safeCtx.diagTag === "string") ? safeCtx.diagTag : undefined,
        surface: (typeof safeCtx.surface === "string") ? safeCtx.surface : undefined,
        // Fill missing keys for log consumers: prefer explicit ctx.key, otherwise reuse diagTag/module.
        // This keeps pipeline semantics intact while avoiding "null holes" in the log table.
        key: (typeof safeCtx.key === "string" && safeCtx.key)
          ? safeCtx.key
          : ((typeof safeCtx.diagTag === "string" && safeCtx.diagTag)
            ? safeCtx.diagTag
            : ((typeof safeCtx.module === "string" && safeCtx.module) ? safeCtx.module : undefined)),
        stage: (typeof safeCtx.stage === "string") ? safeCtx.stage : undefined,
        message: (typeof safeCtx.message === "string") ? safeCtx.message : undefined,
        data: safeData
      };

      // Dedup gate: keeps early evidence, suppresses high-volume duplicate noise.
      if (!shouldEmitDiag(normalizedLevel, normalizedCode, extraObj, err || null)) {
        return;
      }

      if (isExpectedReceiverThrow(normalizedCode, extraObj, err || null)) {
        if (isExpectedReceiverThrowGuardActive()) {
          recordExpectedReceiverThrow(normalizedCode, err || null, extraObj);
        }
        return;
      }

      __degradeApi(normalizedCode, err, extraObj);

      } catch (e) { try { recordLoggerError(e, "diag"); } catch (_) {} }

    },
    enumerable: false,
    writable: false,
    configurable: false
  });
  if (!Object.prototype.hasOwnProperty.call(__loggerRoot, "__PROBE_LIVE_READER__")) {
    const __probeLiveCfg = (global.__PROBE_LIVE_READER_CONFIG__ && typeof global.__PROBE_LIVE_READER_CONFIG__ === "object")
      ? global.__PROBE_LIVE_READER_CONFIG__
      : {};
    const __probeLiveState = {
      intervalMs: toPosInt(__probeLiveCfg.intervalMs, 1000),
      maxRows: toPosInt(__probeLiveCfg.maxRows, 80),
      panelId: (typeof __probeLiveCfg.panelId === "string" && __probeLiveCfg.panelId) ? __probeLiveCfg.panelId : "__probe_live_reader__",
      enabled: false,
      timerId: null,
      lastIndex: 0,
      rows: [],
      lastRenderSig: "",
      startedAt: null
    };

    function __probeLiveDiag(level, code, message, data, err) {
      try {
        __degradeApi.diag(level, code, {
          module: "set_log",
          diagTag: "set_log:probe_live_reader",
          surface: "logger",
          key: "__PROBE_LIVE_READER__",
          stage: "runtime",
          message: message,
          data: data == null ? null : data,
          type: "pipeline telemetry"
        }, err || null);
      } catch (_) {}
    }

    function __probeLiveGetBuffer() {
      try {
        const buf = __degradeApi.getBuffer();
        return Array.isArray(buf) ? buf : [];
      } catch (e) {
        __probeLiveDiag("warn", "set_log:probe_live_reader_buffer_failed", "__DEGRADE__.getBuffer failed", {
          outcome: "skip",
          reason: "buffer_failed"
        }, e);
        return [];
      }
    }

    function __probeLiveEnsurePanel() {
      if (!G || !G.documentElement || !G.body) return null;
      let host = G.getElementById(__probeLiveState.panelId);
      if (host) return host;
      host = G.createElement("div");
      host.id = __probeLiveState.panelId;
      host.setAttribute("data-probe-live-reader", "1");
      host.style.position = "fixed";
      host.style.right = "12px";
      host.style.bottom = "12px";
      host.style.zIndex = "2147483647";
      host.style.width = "420px";
      host.style.maxHeight = "40vh";
      host.style.overflow = "auto";
      host.style.background = "rgba(12,12,14,0.95)";
      host.style.color = "#e8e8e8";
      host.style.border = "1px solid rgba(255,255,255,0.18)";
      host.style.borderRadius = "8px";
      host.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
      host.style.padding = "8px 10px";
      host.style.font = "12px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      host.style.whiteSpace = "pre-wrap";
      host.style.wordBreak = "break-word";
      host.style.pointerEvents = "auto";
      G.body.appendChild(host);
      return host;
    }

    function __probeLiveEntryToRow(entry, index) {
      const safeEntry = (entry && typeof entry === "object") ? entry : null;
      const extra = (safeEntry && safeEntry.extra && typeof safeEntry.extra === "object") ? safeEntry.extra : null;
      const error = (safeEntry && safeEntry.error && typeof safeEntry.error === "object") ? safeEntry.error : null;
      const entryType = (safeEntry && safeEntry.type) ? String(safeEntry.type) : "";
      const runtimeLevel = (entryType && Object.prototype.hasOwnProperty.call(DIAG_RUNTIME_TYPES, entryType))
        ? DIAG_RUNTIME_TYPES[entryType]
        : "";
      const runtimeTag = runtimeLevel ? "runtime" : "";
      const topMessage = (safeEntry && typeof safeEntry.message === "string") ? safeEntry.message : "";
      const topError = (safeEntry && typeof safeEntry.error === "string") ? safeEntry.error : "";
      const resolvedMessage = extra && typeof extra.message === "string"
        ? extra.message
        : (topMessage || (error && typeof error.message === "string" ? error.message : ""));
      return {
        idx: index,
        timestamp: safeEntry && safeEntry.timestamp ? String(safeEntry.timestamp) : "",
        type: entryType,
        level: (extra && typeof extra.level === "string" && extra.level)
          ? extra.level
          : ((safeEntry && typeof safeEntry.level === "string" && safeEntry.level) ? safeEntry.level : runtimeLevel),
        code: (safeEntry && safeEntry.code) ? String(safeEntry.code) : entryType,
        module: (extra && typeof extra.module === "string" && extra.module)
          ? extra.module
          : ((safeEntry && typeof safeEntry.module === "string" && safeEntry.module) ? safeEntry.module : runtimeTag),
        diagTag: (extra && typeof extra.diagTag === "string" && extra.diagTag)
          ? extra.diagTag
          : ((safeEntry && typeof safeEntry.diagTag === "string" && safeEntry.diagTag) ? safeEntry.diagTag : runtimeTag),
        key: (extra && typeof extra.key === "string" && extra.key)
          ? extra.key
          : ((safeEntry && typeof safeEntry.key === "string" && safeEntry.key) ? safeEntry.key : ""),
        message: resolvedMessage,
        error: (error && typeof error.name === "string" && error.name)
          ? error.name
          : (topError || resolvedMessage)
      };
    }

    function __probeLiveFormatRows(rows) {
      const arr = Array.isArray(rows) ? rows : [];
      if (!arr.length) return "[probe-live] waiting for __DEGRADE__ events";
      return arr.map((row) => {
        return [
          row.timestamp || "",
          row.level || row.type || "",
          row.code || "",
          row.module || row.diagTag || "",
          row.key || "",
          row.message || row.error || ""
        ].filter(Boolean).join(" | ");
      }).join("\n");
    }

    function __probeLiveRender(force) {
      const host = __probeLiveEnsurePanel();
      if (!host) return false;
      const text = __probeLiveFormatRows(__probeLiveState.rows);
      if (!force && text === __probeLiveState.lastRenderSig) return false;
      __probeLiveState.lastRenderSig = text;
      const header = "[probe-live] __DEGRADE__ buffer";
      const meta = "rows=" + __probeLiveState.rows.length + ", intervalMs=" + __probeLiveState.intervalMs;
      host.textContent = header + "\n" + meta + "\n\n" + text;
      return true;
    }

    function __probeLivePoll() {
      const buf = __probeLiveGetBuffer();
      if (!buf.length) {
        __probeLiveRender(false);
        return __probeLiveState.rows.slice();
      }
      if (buf.length < __probeLiveState.lastIndex) {
        __probeLiveState.lastIndex = 0;
        __probeLiveState.rows = [];
      }
      if (buf.length === __probeLiveState.lastIndex) {
        __probeLiveRender(false);
        return __probeLiveState.rows.slice();
      }
      for (let i = __probeLiveState.lastIndex; i < buf.length; i++) {
        __probeLiveState.rows.push(__probeLiveEntryToRow(buf[i], i));
      }
      if (__probeLiveState.rows.length > __probeLiveState.maxRows) {
        __probeLiveState.rows = __probeLiveState.rows.slice(-__probeLiveState.maxRows);
      }
      __probeLiveState.lastIndex = buf.length;
      __probeLiveRender(false);
      return __probeLiveState.rows.slice();
    }

    function __probeLiveStart() {
      if (__probeLiveState.enabled) return true;
      if (!G || G.documentElement) {
        __probeLiveDiag("warn", "set_log:probe_live_reader_not_window_realm", "probe live reader requires document", {
          outcome: "skip",
          reason: "document_missing"
        }, null);
        return false;
      }
      __probeLiveState.enabled = true;
      __probeLiveState.startedAt = Date.now();
      try {
        __probeLiveRender(true);
        __probeLivePoll();
        __probeLiveState.timerId = global.setInterval(__probeLivePoll, __probeLiveState.intervalMs);
        __probeLiveDiag("info", "set_log:probe_live_reader_started", "probe live reader started", {
          outcome: "return",
          reason: "started",
          intervalMs: __probeLiveState.intervalMs,
          maxRows: __probeLiveState.maxRows
        }, null);
        return true;
      } catch (e) {
        __probeLiveState.enabled = false;
        __probeLiveState.timerId = null;
        __probeLiveDiag("error", "set_log:probe_live_reader_start_failed", "probe live reader start failed", {
          outcome: "skip",
          reason: "start_failed"
        }, e);
        return false;
      }
    }

    function __probeLiveStop() {
      if (__probeLiveState.timerId != null) {
        try { global.clearInterval(__probeLiveState.timerId); } catch (_) {}
      }
      __probeLiveState.timerId = null;
      __probeLiveState.enabled = false;
      return true;
    }

  }


    // ===== 2) Core logger: pushLog (console + errors) =====
    function pushLog(level, args, withStack, module, bufferMeta) {
      try {
        if (!levelAllows(__loggerRoot._logLevel, level)) return;

        const normArgs = normalizeForJSON(args);
        const msgParts = [];
        if (args && args.length) {
          for (let i = 0; i < args.length; i++) {
            try {
              const a = args[i];
              if (typeof a === "string") {
                if (a.indexOf("data:") === 0) msgParts.push("[DataURL len=" + a.length + "]");
                else if (a.indexOf("blob:") === 0) msgParts.push("[BlobURL]");
                else msgParts.push(a);
              } else msgParts.push(safeTag(a));
            } catch (_) {
              msgParts.push("[Unserializable]");
            }
          }
        }

        const resolvedModule = (bufferMeta && typeof bufferMeta.module === "string" && bufferMeta.module) ? bufferMeta.module : (module || "global");
        const resolvedKey = (bufferMeta && (typeof bufferMeta.key === "string" || bufferMeta.key === null)) ? bufferMeta.key : null;
        const resolvedCode = (bufferMeta && typeof bufferMeta.code === "string" && bufferMeta.code)
          ? bufferMeta.code
          : ((module === "console") ? "set_log:console_capture" : "set_log:logger_capture");
        const resolvedDiagTag = (module === "console") ? "set_log:console_capture" : "set_log:logger_capture";
        const resolvedMessage = msgParts.join(" ");
        const diagLevel = (level === "error") ? "error" : ((level === "warn") ? "warn" : "info");
        const activeConsoleGroup = (module === "console" && consoleGroupStack.length)
          ? consoleGroupStack[consoleGroupStack.length - 1]
          : null;
        const diagData = {
          source: (module === "console") ? "console_capture" : "module_logger",
          consoleLevel: level,
          args: normArgs
        };
        if (typeof activeConsoleGroup === "string" && activeConsoleGroup) diagData.consoleGroup = activeConsoleGroup;
        if (module !== "console") diagData.loggerModule = module;
        if (withStack) {
          try {
            const st = new Error().stack;
            if (typeof st === "string" && st) diagData.stack = st;
          } catch (_) {}
        }
        if (withStack) {
          diagData.captureMode = "stacked";
        }
        __degradeApi.diag(diagLevel, resolvedCode, {
          module: resolvedModule,
          diagTag: resolvedDiagTag,
          surface: "logger",
          key: resolvedKey,
          stage: "runtime",
          message: resolvedMessage || ((module === "console") ? ("console." + level) : (String(module || "logger") + "." + level)),
          type: "pipeline telemetry",
          data: diagData
        }, null);
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          // Do not call __DEGRADE__ here (it writes through pushEntry); avoid recursion.
          try { recordLoggerError(e, "pushLog"); } catch (_) {}
        }
      }
    }

    // ===== 3) Patch console.* (single source of truth) =====
    for (const level of LOG_LEVELS) {
      const orig = origConsole[level];
      if (!orig) continue;

      console[level] = function () {
        const args = Array.prototype.slice.call(arguments);
        const extracted = extractConsoleBufferMeta(args);
        const consoleArgs = extracted.args;
        const bufferMeta = extracted.meta;

        // keep your existing filter
        for (let i = 0; i < consoleArgs.length; i++) {
          const a = consoleArgs[i];
          if (typeof a === "string" && a.indexOf("undetected chromedriver") !== -1) {
            return;
          }
        }

        pushLog(
          level,
          consoleArgs,
          level === "error" || level === "warn" || level === "log",
          "console",
          bufferMeta
        );

        guardedApply(orig, console, consoleArgs, "console." + level);
      };
    }
    if (origConsole.group) {
      console.group = function () {
        const args = Array.prototype.slice.call(arguments);
        const label = args.length ? args.map((a) => {
          try {
            return (typeof a === "string") ? a : safeTag(a);
          } catch (_) {
            return "[Unserializable]";
          }
        }).join(" ") : "group";
        consoleGroupStack.push(label);
        guardedApply(origConsole.group, console, args, "console.group");
      };
    }
    if (origConsole.groupCollapsed) {
      console.groupCollapsed = function () {
        const args = Array.prototype.slice.call(arguments);
        const label = args.length ? args.map((a) => {
          try {
            return (typeof a === "string") ? a : safeTag(a);
          } catch (_) {
            return "[Unserializable]";
          }
        }).join(" ") : "groupCollapsed";
        consoleGroupStack.push(label);
        guardedApply(origConsole.groupCollapsed, console, args, "console.groupCollapsed");
      };
    }
    if (origConsole.groupEnd) {
      console.groupEnd = function () {
        if (consoleGroupStack.length) consoleGroupStack.pop();
        guardedApply(origConsole.groupEnd, console, [], "console.groupEnd");
      };
    }

    // ===== 4) Module logger C.__logger.log (no double logging) =====
    __ensureLoggerHiddenValue("_logConfig", function () { return {
      global: { enabled: true, level: "log" },
      WEBGLlogger: { enabled: true, level: "log" },
      CanvasLogger: { enabled: true, level: "debug" },
      Contextlogger: { enabled: true, level: "debug" },
      Navigatorlogger: { enabled: true, level: "debug" },
      WRKlogger: { enabled: true, level: "debug" },
    }; }, function (v) {
      return !!(v && typeof v === "object");
    }, true);

    __defineLoggerHiddenValue("log", function (module, level) {
      const args = Array.prototype.slice.call(arguments, 2);
      const config = __loggerRoot._logConfig[module] || __loggerRoot._logConfig.global;
      if (!config || !config.enabled) return;
      if (!levelAllows(config.level, level)) return;

      // Store entry in __DEGRADE__ only; do not mirror to DevTools console.
      pushLog(level, args, level === "error" || level === "warn" || level === "log", module);
    }, false);

    // ===== 5) Uncaught errors + unhandled rejections (consistent, no logError) =====

    // 5.1 window.onerror (script errors)
    const prevOnError = (typeof global.onerror === "function") ? global.onerror : null;
    global.onerror = function (message, source, lineno, colno, error) {
      try {
        pushEntry({
          type: "onerror",
          message: typeof message === "string" ? message : safeStringify(message),
          source: source || null,
          lineno: typeof lineno === "number" ? lineno : null,
          colno: typeof colno === "number" ? colno : null,
          stack: error && error.stack ? String(error.stack) : null,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "onerror"); } catch (_) {}
        }
      }
      let swallow = false;
      try {
        if (prevOnError) {
          const r = prevOnError.apply(global, arguments);
          if (r === true) swallow = true;
        }
      } catch (e) {
        try { recordLoggerError(e, "onerror_prev"); } catch (_) {}
      }
      return swallow ? true : false;
    };
    const __loggerOnError = global.onerror;

    // 5.2 resource errors (capture=true catches <script src> load fails etc.)
    global.addEventListener(
      "error",
      function (e) {
        try {
          // If it has e.error, it is usually a runtime ErrorEvent.
          // If our window.onerror is still installed, it already recorded it; avoid duplicates.
          // If the page overwrote window.onerror, record it here to avoid losing uncaught errors.
          if (e && e.error) {
            if (global.onerror === __loggerOnError) return;
            const err = e.error;
            pushEntry({
              type: "onerror",
              message: (typeof e.message === "string" && e.message) ? e.message : (err && err.message ? String(err.message) : "Error"),
              source: (typeof e.filename === "string" && e.filename) ? e.filename : null,
              lineno: (typeof e.lineno === "number") ? e.lineno : null,
              colno: (typeof e.colno === "number") ? e.colno : null,
              stack: err && err.stack ? String(err.stack) : null,
              timestamp: new Date().toISOString(),
            });
            return;
          }

          const target = e && e.target ? e.target : null;
          const url =
            target && (target.src || target.href) ? (target.src || target.href) : null;

          pushEntry({
            type: "resource_error",
            message: e && e.message ? String(e.message) : "Resource error",
            source: url,
            timestamp: new Date().toISOString(),
          });
        } catch (e) {
          if (env && env.DEBUG_DEGRADES) {
            if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
            try { recordLoggerError(e, "resource_error"); } catch (_) {}
          }
        }
      },
      true
    );

    // 5.3 unhandled promise rejections
    global.addEventListener("unhandledrejection", function (event) {
      try {
        const reason = event ? event.reason : null;
        pushEntry({
          type: "unhandledrejection",
          message:
            reason && reason.message ? String(reason.message) : String(reason),
          stack: reason && reason.stack ? String(reason.stack) : null,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "unhandledrejection"); } catch (_) {}
        }
      }
    });

    // 5.4 worker-context only (avoid breaking window.postMessage signature)
    // If this code is ever injected into a Worker, we still record worker errors locally.
    try {
      const isWorker =
        typeof global.document === "undefined" &&
        typeof global.window === "undefined" &&
        typeof global.importScripts === "function";

      if (isWorker && typeof global.addEventListener === "function") {
        global.addEventListener("error", function (e) {
          try {
            pushEntry({
              type: "worker_error",
              message: e && e.message ? String(e.message) : "Worker error",
              filename: e && e.filename ? String(e.filename) : null,
              lineno: typeof (e && e.lineno) === "number" ? e.lineno : null,
              colno: typeof (e && e.colno) === "number" ? e.colno : null,
              timestamp: new Date().toISOString(),
            });
           } catch (e) {
             if (env && env.DEBUG_DEGRADES) {
               if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
               try { recordLoggerError(e, "worker_error"); } catch (_) {}
             }
           }
         });

        global.addEventListener("unhandledrejection", function (event) {
          try {
            const reason = event ? event.reason : null;
            pushEntry({
              type: "worker_unhandledrejection",
              message:
                reason && reason.message ? String(reason.message) : String(reason),
              stack: reason && reason.stack ? String(reason.stack) : null,
              timestamp: new Date().toISOString(),
            });
           } catch (e) {
             if (env && env.DEBUG_DEGRADES) {
               if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
               try { recordLoggerError(e, "worker_unhandledrejection"); } catch (_) {}
             }
           }
         });
      }
     } catch (e) {
       if (env && env.DEBUG_DEGRADES) {
         if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
         try { recordLoggerError(e, "worker_context"); } catch (_) {}
       }
     }

    // ===== 6) Export helper (in-session) =====
    __defineLoggerHiddenValue("exportMyDebugLog", function () {
      try {
        if (typeof document === "undefined" || !document) return;
        const list = (typeof __loggerRoot.__DEGRADE__ === "function" && typeof __loggerRoot.__DEGRADE__.getBuffer === "function")
          ? __loggerRoot.__DEGRADE__.getBuffer()
          : [];
        const data = JSON.stringify(list, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my_debug_log_" + new Date().toISOString().replace(/:/g, "").replace(/Z$/, "") + ".json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          try {
            document.body.removeChild(a);
          } catch (e) {
            if (env && env.DEBUG_DEGRADES) {
              if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
              try { recordLoggerError(e, "exportMyDebugLog:removeChild"); } catch (_) {}
            }
          }
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            if (env && env.DEBUG_DEGRADES) {
              if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
              try { recordLoggerError(e, "exportMyDebugLog:revokeObjectURL"); } catch (_) {}
            }
          }
        }, 5500);
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "exportMyDebugLog"); } catch (_) {}
        }
      }
    }, false);

    // ===== 7) One-click toggles (no markers) =====
    __defineLoggerHiddenValue("DEBUG_ALL_ON", function () {
      try {
        __loggerRoot.__DEBUG__ = true;
        __loggerRoot._logLevel = "trace";
        if (__loggerRoot._logConfig) {
          for (const k in __loggerRoot._logConfig) {
            __loggerRoot._logConfig[k].enabled = true;
            __loggerRoot._logConfig[k].level = "trace";
          }
        }
        if (typeof __loggerRoot.__DEGRADE__ === "function") {
          __loggerRoot.__DEGRADE__("DEBUG_ALL_ON", null);
        }
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "DEBUG_ALL_ON"); } catch (_) {}
        }
      }
    }, false);

    __defineLoggerHiddenValue("DEBUG_ALL_OFF", function () {
      try {
        __loggerRoot.__DEBUG__ = false;
        __loggerRoot._logLevel = "error";
        if (__loggerRoot._logConfig) {
          for (const k in __loggerRoot._logConfig) {
            __loggerRoot._logConfig[k].enabled = false;
          }
        }
        if (typeof __loggerRoot.__DEGRADE__ === "function") {
          __loggerRoot.__DEGRADE__("DEBUG_ALL_OFF", null);
        }
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "DEBUG_ALL_OFF"); } catch (_) {}
        }
      }
    }, false);

    __defineLoggerHiddenValue("DEBUG_ALL_TOGGLE", function () {
      try {
        if (__loggerRoot.__DEBUG__) __loggerRoot.DEBUG_ALL_OFF();
        else __loggerRoot.DEBUG_ALL_ON();
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "DEBUG_ALL_TOGGLE"); } catch (_) {}
        }
      }
    }, false);

    // Logger self-diagnostics mode toggles (controls verbosity, not runtime throws)
    __defineLoggerHiddenValue("DEBUG_DEGRADES_ON", function () {
      try {
        env.DEBUG_DEGRADES = true;
        if (typeof __loggerRoot.__DEGRADE__ === "function") __loggerRoot.__DEGRADE__("DEBUG_DEGRADES_ON", null);
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_ON"); } catch (_) {}
      }
    }, false);

    __defineLoggerHiddenValue("DEBUG_DEGRADES_OFF", function () {
      try {
        env.DEBUG_DEGRADES = false;
        if (typeof __loggerRoot.__DEGRADE__ === "function") __loggerRoot.__DEGRADE__("DEBUG_DEGRADES_OFF", null);
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_OFF"); } catch (_) {}
      }
    }, false);

    __defineLoggerHiddenValue("DEBUG_DEGRADES_TOGGLE", function () {
      try {
        env.DEBUG_DEGRADES = !env.DEBUG_DEGRADES;
        if (typeof __loggerRoot.__DEGRADE__ === "function") __loggerRoot.__DEGRADE__("DEBUG_DEGRADES_TOGGLE", null, { enabled: !!env.DEBUG_DEGRADES });
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_TOGGLE"); } catch (_) {}
      }
    }, false);

    __defineLoggerHiddenValue("EXPECTED_RECEIVER_THROW_GUARD_ON", function () {
      try {
        env.EXPECTED_RECEIVER_THROW_GUARD = true;
        const mode = getLoggerGuardMode();
        if (mode) mode.expectedReceiverThrow = true;
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "EXPECTED_RECEIVER_THROW_GUARD_ON"); } catch (_) {}
      }
    }, false);

    __defineLoggerHiddenValue("EXPECTED_RECEIVER_THROW_GUARD_OFF", function () {
      try {
        env.EXPECTED_RECEIVER_THROW_GUARD = false;
        const mode = getLoggerGuardMode();
        if (mode) mode.expectedReceiverThrow = false;
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "EXPECTED_RECEIVER_THROW_GUARD_OFF"); } catch (_) {}
      }
    }, false);

    __defineLoggerHiddenValue("EXPECTED_RECEIVER_THROW_GUARD_TOGGLE", function () {
      try {
        const mode = getLoggerGuardMode();
        const next = !(mode && mode.expectedReceiverThrow === false);
        if (mode) mode.expectedReceiverThrow = !next;
        env.EXPECTED_RECEIVER_THROW_GUARD = !!(mode && mode.expectedReceiverThrow !== false);
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "EXPECTED_RECEIVER_THROW_GUARD_TOGGLE"); } catch (_) {}
      }
    }, false);
      Object.defineProperty(__loggerRoot, "rebindWindowLoggerShell", {
        value: rebindWindowLoggerShell,
        writable: false,
        configurable: true,
        enumerable: false
      });
      rebindWindowLoggerShell();
    }
}
