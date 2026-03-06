const LOGGingModule = function LOGGingModule() {
    const G =
      (typeof globalThis !== "undefined" && globalThis) ||
      (typeof self !== "undefined" && self) ||
      (typeof window !== "undefined" && window) ||
      {};
    const W = (typeof window !== "undefined" && window) ? window : null;

    if (!G.__PATCH_MYTYPER__) {
    G.__PATCH_MYTYPER__ = true;

    const global = G;
    const C = ((W || G).CanvasPatchContext = (W || G).CanvasPatchContext || {});

    // ===== 0) Central store: private buffer only =====
    const STORE = new WeakMap();
    const FALLBACK_BUF = [];
    let degradeFn = null;

    function _buf() {
      const key = degradeFn || G.__DEGRADE__;
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

    const DIAG_SCREEN_STATE = {
      startedAt: new Date().toISOString(),
      updatedAt: null,
      totalSeen: 0,
      totalCritical: 0,
      byLevel: {},
      byCode: {},
      byModule: {},
      byEntryType: {},
      lastCritical: []
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

    // Signature defines what "same event" means for dedup.
    // If these fields match, event copies after DIAG_DUP_LIMIT are suppressed.
    function diagDupSignature(level, code, ctx, err) {
      const c = (ctx && typeof ctx === "object") ? ctx : {};
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
            timestamp: safeEntryTimestamp(entry),
            entryType: "degrade",
            level: String(level),
            critical: !!DIAG_CRITICAL_LEVELS[String(level)],
            code: (typeof entry.code === "string" && entry.code) ? entry.code : null,
            module: (typeof extra.module === "string" && extra.module) ? extra.module : null,
            diagTag: (typeof extra.diagTag === "string" && extra.diagTag) ? extra.diagTag : null,
            stage: (typeof extra.stage === "string" && extra.stage) ? extra.stage : null,
            key: (typeof extra.key === "string") ? extra.key : null,
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
        return {
          idx: (typeof idx === "number") ? idx : null,
          timestamp: safeEntryTimestamp(entry),
          entryType: entryType,
          level: lvl,
          critical: true,
          code: entryType,
          module: "runtime",
          diagTag: "runtime",
          stage: "runtime",
          key: null,
          message: msg,
          errName: null,
          errMessage: msg,
          diagType: "browser structure missing data",
          data: null
        };
      } catch (_) {
        return null;
      }
    }

    function diagScreenGetConfig() {
      global.__DIAG_SCREEN__ = (global.__DIAG_SCREEN__ && typeof global.__DIAG_SCREEN__ === "object") ? global.__DIAG_SCREEN__ : {};
      const cfg = global.__DIAG_SCREEN__;
      if (!Object.prototype.hasOwnProperty.call(cfg, "enabled")) cfg.enabled = false;
      if (!Object.prototype.hasOwnProperty.call(cfg, "criticalOnly")) cfg.criticalOnly = true;
      if (!Object.prototype.hasOwnProperty.call(cfg, "lastN")) cfg.lastN = 30;
      if (!Object.prototype.hasOwnProperty.call(cfg, "includeData")) cfg.includeData = false;
      return cfg;
    }

    function diagScreenSnapshot() {
      const cfg = diagScreenGetConfig();
      return {
        enabled: !!cfg.enabled,
        criticalOnly: !!cfg.criticalOnly,
        lastN: toPosInt(cfg.lastN, 30),
        includeData: !!cfg.includeData,
        startedAt: DIAG_SCREEN_STATE.startedAt,
        updatedAt: DIAG_SCREEN_STATE.updatedAt,
        totalSeen: DIAG_SCREEN_STATE.totalSeen,
        totalCritical: DIAG_SCREEN_STATE.totalCritical,
        byLevel: Object.assign({}, DIAG_SCREEN_STATE.byLevel),
        byCode: Object.assign({}, DIAG_SCREEN_STATE.byCode),
        byModule: Object.assign({}, DIAG_SCREEN_STATE.byModule),
        byEntryType: Object.assign({}, DIAG_SCREEN_STATE.byEntryType),
        lastCritical: DIAG_SCREEN_STATE.lastCritical.slice()
      };
    }

    function pushDiagScreenIncident(incident) {
      const cfg = diagScreenGetConfig();
      if (!cfg.enabled) return;
      if (!incident || typeof incident !== "object") return;
      if (cfg.criticalOnly && !incident.critical) return;

      DIAG_SCREEN_STATE.totalSeen += 1;
      if (incident.critical) DIAG_SCREEN_STATE.totalCritical += 1;
      DIAG_SCREEN_STATE.updatedAt = new Date().toISOString();

      const lv = (typeof incident.level === "string" && incident.level) ? incident.level : "info";
      const code = (typeof incident.code === "string" && incident.code) ? incident.code : "unknown";
      const mod = (typeof incident.module === "string" && incident.module) ? incident.module : "unknown";
      const typ = (typeof incident.entryType === "string" && incident.entryType) ? incident.entryType : "unknown";

      DIAG_SCREEN_STATE.byLevel[lv] = (DIAG_SCREEN_STATE.byLevel[lv] || 0) + 1;
      DIAG_SCREEN_STATE.byCode[code] = (DIAG_SCREEN_STATE.byCode[code] || 0) + 1;
      DIAG_SCREEN_STATE.byModule[mod] = (DIAG_SCREEN_STATE.byModule[mod] || 0) + 1;
      DIAG_SCREEN_STATE.byEntryType[typ] = (DIAG_SCREEN_STATE.byEntryType[typ] || 0) + 1;

      const keepData = !!cfg.includeData;
      const saved = keepData ? incident : Object.assign({}, incident, { data: undefined });
      DIAG_SCREEN_STATE.lastCritical.push(saved);

      const maxN = toPosInt(cfg.lastN, 30);
      if (DIAG_SCREEN_STATE.lastCritical.length > maxN) {
        DIAG_SCREEN_STATE.lastCritical.splice(0, DIAG_SCREEN_STATE.lastCritical.length - maxN);
      }

      const sink = (typeof global.__DIAG_SCREEN_RENDER__ === "function") ? global.__DIAG_SCREEN_RENDER__ : null;
      if (sink) {
        try {
          sink(diagScreenSnapshot(), saved);
        } catch (_) {}
      }
    }

    function pullDiagAlerts(opts) {
      try {
        const o = isPlainObject(opts) ? opts : {};
        const limit = toPosInt(o.limit, 50);
        const sinceIndex = toNonNegInt(o.sinceIndex, 0);
        const criticalOnly = !Object.prototype.hasOwnProperty.call(o, "criticalOnly") ? true : !!o.criticalOnly;
        const includeData = !!o.includeData;
        const includeRaw = !!o.includeRaw;

        const buf = _buf().slice();
        const start = Math.min(sinceIndex, buf.length);
        const out = [];
        let scanned = 0;

        for (let i = start; i < buf.length; i++) {
          const incident = normalizeDiagIncident(buf[i], i);
          if (!incident) continue;
          scanned += 1;
          if (criticalOnly && !incident.critical) continue;
          const shaped = includeData ? incident : Object.assign({}, incident, { data: undefined });
          if (includeRaw) shaped.raw = buf[i];
          out.push(shaped);
        }

        const incidents = out.length > limit ? out.slice(out.length - limit) : out;
        const lastEntry = (buf.length > 0) ? buf[buf.length - 1] : null;

        return {
          ok: true,
          totalBuffer: buf.length,
          scanned: scanned,
          returned: incidents.length,
          incidents: incidents,
          cursor: {
            nextSinceIndex: buf.length,
            lastTimestamp: safeEntryTimestamp(lastEntry)
          }
        };
      } catch (e) {
        return {
          ok: false,
          error: {
            name: (e && e.name) ? String(e.name) : "Error",
            message: (e && e.message) ? String(e.message) : String(e)
          },
          incidents: [],
          cursor: { nextSinceIndex: 0, lastTimestamp: null }
        };
      }
    }

    function resetDiagScreenState() {
      DIAG_SCREEN_STATE.startedAt = new Date().toISOString();
      DIAG_SCREEN_STATE.updatedAt = null;
      DIAG_SCREEN_STATE.totalSeen = 0;
      DIAG_SCREEN_STATE.totalCritical = 0;
      DIAG_SCREEN_STATE.byLevel = {};
      DIAG_SCREEN_STATE.byCode = {};
      DIAG_SCREEN_STATE.byModule = {};
      DIAG_SCREEN_STATE.byEntryType = {};
      DIAG_SCREEN_STATE.lastCritical = [];
    }


    // Debug flag
    G.__DEBUG__ =
      typeof global.__DEBUG__ !== "undefined" ? global.__DEBUG__ : true;
      // typeof global.__DEBUG__ !== "undefined" ? global.__DEBUG__ : false;
    
    global.env = global.env || {};
    // Toggle for *logger self-diagnostics visibility*.
    // IMPORTANT: must not change runtime behavior by throwing from the logger.
    global.env.DEBUG_DEGRADES = true;   // включить
    // global.env.DEBUG_DEGRADES = false; // выключить
    const env = global.env;


    // Save original console methods
    const origConsole = {
      log: console.log && console.log.bind(console),
      warn: console.warn && console.warn.bind(console),
      error: console.error && console.error.bind(console),
      info: console.info && console.info.bind(console),
      debug: console.debug && console.debug.bind(console),
      trace: console.trace && console.trace.bind(console),
    };

    function getLoggerGuard() {
      if (!G.__LOGGER_GUARD__) {
        Object.defineProperty(G, "__LOGGER_GUARD__", {
          value: { count: 0, last: null, lastAt: null },
          writable: true,
          configurable: true,
          enumerable: false
        });
      }
      return G.__LOGGER_GUARD__;
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
        const mode = G.__LOGGER_GUARD_MODE__;
        return !!(mode && typeof mode === "object" && Number(mode.probeExpectedThrowDepth) > 0);
      } catch (_) {
        return false;
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
    G._logLevel = global._logLevel || "log";

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
        try {
          const incident = normalizeDiagIncident(entry, null);
          if (incident) pushDiagScreenIncident(incident);
        } catch (_) {}
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
    G.__DEGRADE__ = function (code, err, extra) {
    degradeFn = G.__DEGRADE__;
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

    Object.defineProperty(G.__DEGRADE__, "getBuffer", {
      value() {
        return _buf().slice();
      },
      enumerable: false,
      writable: false,
      configurable: false
    });

    /**
     * window.__DEGRADE__.diag(level, code, ctx, err?)
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
    Object.defineProperty(G.__DEGRADE__, "diag", {
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
      const safeData = (dataIn === null) ? null : normalizeForJSON(dataIn);

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
        recordExpectedReceiverThrow(normalizedCode, err || null, extraObj);
        return;
      }

      G.__DEGRADE__(normalizedCode, err, extraObj);

      } catch (e) { try { recordLoggerError(e, "diag"); } catch (_) {} }

    },
    enumerable: false,
    writable: false,
    configurable: false
  });
  global.__DEGRADE__ = G.__DEGRADE__;

  // ===== Stage 0/1: runtime-evaluate alerts + optional live-summary state =====
  Object.defineProperty(global, "__DIAG_ALERTS__", {
    value: function (opts) { return pullDiagAlerts(opts); },
    enumerable: false,
    writable: false,
    configurable: true
  });

  Object.defineProperty(global, "DIAG_SCREEN_ON", {
    value: function (opts) {
      try {
        const cfg = diagScreenGetConfig();
        if (isPlainObject(opts)) {
          if (Object.prototype.hasOwnProperty.call(opts, "criticalOnly")) cfg.criticalOnly = !!opts.criticalOnly;
          if (Object.prototype.hasOwnProperty.call(opts, "includeData")) cfg.includeData = !!opts.includeData;
          if (Object.prototype.hasOwnProperty.call(opts, "lastN")) cfg.lastN = toPosInt(opts.lastN, 30);
        }
        cfg.enabled = true;
      } catch (_) {}
      return diagScreenSnapshot();
    },
    enumerable: false,
    writable: false,
    configurable: true
  });

  Object.defineProperty(global, "DIAG_SCREEN_OFF", {
    value: function () {
      try {
        const cfg = diagScreenGetConfig();
        cfg.enabled = false;
      } catch (_) {}
      return diagScreenSnapshot();
    },
    enumerable: false,
    writable: false,
    configurable: true
  });

  Object.defineProperty(global, "DIAG_SCREEN_RESET", {
    value: function () {
      resetDiagScreenState();
      return diagScreenSnapshot();
    },
    enumerable: false,
    writable: false,
    configurable: true
  });

  Object.defineProperty(global, "DIAG_SCREEN_SNAPSHOT", {
    value: function () {
      return diagScreenSnapshot();
    },
    enumerable: false,
    writable: false,
    configurable: true
  });


    // ===== 2) Core logger: pushLog (console + errors) =====
    function pushLog(level, args, withStack, module) {
      try {
        if (!levelAllows(G._logLevel, level)) return;

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

        const e = {
          type: "console",
          level: level,
          module: module || "global",
          message: msgParts.join(" "),
          expanded: normArgs,
          timestamp: new Date().toISOString(),
        };

        if (withStack) {
          try {
            const st = new Error().stack;
            e.stack = st ? String(st) : null;
          } catch (_) {
            e.stack = null;
          }
        }

        pushEntry(e); // <-- обязательно вернуть
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

        // keep your existing filter
        for (let i = 0; i < args.length; i++) {
          const a = args[i];
          if (typeof a === "string" && a.indexOf("undetected chromedriver") !== -1) {
            return;
          }
        }

        pushLog(
          level,
          args,
          level === "error" || level === "warn" || level === "log",
          "console"
        );

        if (G.__DEBUG__) {
          guardedApply(orig, console, args, "console." + level);
        }
      };
    }

    // ===== 4) Module logger window.log (no double logging) =====
    global._logConfig = global._logConfig || {
      global: { enabled: true, level: "log" },
      WEBGLlogger: { enabled: true, level: "log" },
      CanvasLogger: { enabled: true, level: "debug" },
      Contextlogger: { enabled: true, level: "debug" },
      Navigatorlogger: { enabled: true, level: "debug" },
      WRKlogger: { enabled: true, level: "debug" },
    };

    global.log = function (module, level) {
      const args = Array.prototype.slice.call(arguments, 2);
      const config = global._logConfig[module] || global._logConfig.global;
      if (!config || !config.enabled) return;
      if (!levelAllows(config.level, level)) return;

      // Output to DevTools without recursion through patched console
      const prefix = "%c[" + module + "]%c";
      const style1 =
        "color:#fff;background:#0070f3;border-radius:2px;padding:2px 4px;";
      const style2 = "color:inherit;";
      const callArgs = [prefix, style1, style2].concat(args);

      const orig = origConsole[level] || origConsole.log;
      if (orig) guardedApply(orig, console, callArgs, "log." + level);

      // Store entry
      pushLog(level, args, level === "error" || level === "warn" || level === "log", module);
    };

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
    global.exportMyDebugLog = function () {
      try {
        if (typeof document === "undefined" || !document) return;
        const list = (typeof G.__DEGRADE__ === "function" && typeof G.__DEGRADE__.getBuffer === "function")
          ? G.__DEGRADE__.getBuffer()
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
    };

    // ===== 7) One-click toggles (no markers) =====
    global.DEBUG_ALL_ON = function () {
      try {
        global.__DEBUG__ = true;
        global._logLevel = "trace";
        if (global._logConfig) {
          for (const k in global._logConfig) {
            global._logConfig[k].enabled = true;
            global._logConfig[k].level = "trace";
          }
        }
        if (typeof global.__DEGRADE__ === "function") {
          global.__DEGRADE__("DEBUG_ALL_ON", null);
        }
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "DEBUG_ALL_ON"); } catch (_) {}
        }
      }
    };

    global.DEBUG_ALL_OFF = function () {
      try {
        global.__DEBUG__ = false;
        global._logLevel = "error";
        if (global._logConfig) {
          for (const k in global._logConfig) {
            global._logConfig[k].enabled = false;
          }
        }
        if (typeof global.__DEGRADE__ === "function") {
          global.__DEGRADE__("DEBUG_ALL_OFF", null);
        }
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "DEBUG_ALL_OFF"); } catch (_) {}
        }
      }
    };

    global.DEBUG_ALL_TOGGLE = function () {
      try {
        if (global.__DEBUG__) global.DEBUG_ALL_OFF();
        else global.DEBUG_ALL_ON();
      } catch (e) {
        if (env && env.DEBUG_DEGRADES) {
          if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
          try { recordLoggerError(e, "DEBUG_ALL_TOGGLE"); } catch (_) {}
        }
      }
    };

    // Logger self-diagnostics mode toggles (controls verbosity, not runtime throws)
    global.DEBUG_DEGRADES_ON = function () {
      try {
        global.env = global.env || {};
        global.env.DEBUG_DEGRADES = true;
        if (typeof global.__DEGRADE__ === "function") global.__DEGRADE__("DEBUG_DEGRADES_ON", null);
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_ON"); } catch (_) {}
      }
    };

    global.DEBUG_DEGRADES_OFF = function () {
      try {
        global.env = global.env || {};
        global.env.DEBUG_DEGRADES = false;
        if (typeof global.__DEGRADE__ === "function") global.__DEGRADE__("DEBUG_DEGRADES_OFF", null);
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_OFF"); } catch (_) {}
      }
    };

    global.DEBUG_DEGRADES_TOGGLE = function () {
      try {
        global.env = global.env || {};
        global.env.DEBUG_DEGRADES = !global.env.DEBUG_DEGRADES;
        if (typeof global.__DEGRADE__ === "function") global.__DEGRADE__("DEBUG_DEGRADES_TOGGLE", null, { enabled: !!global.env.DEBUG_DEGRADES });
      } catch (e) {
        if (origConsole && origConsole.error) { try { origConsole.error(e); } catch (_) {} }
        try { recordLoggerError(e, "DEBUG_DEGRADES_TOGGLE"); } catch (_) {}
      }
    };
    // DIAG_SCREEN_ON({ includeData: true })



        // after all logger globals are assigned (Window realm only):
      if (W) {
        Object.defineProperty(W, "_logLevel",   { value: W._logLevel,   writable:true, configurable:true, enumerable:false });
        Object.defineProperty(W, "_logConfig",  { value: W._logConfig,  writable:true, configurable:true, enumerable:false });
        Object.defineProperty(W, "__DEBUG__",   { value: W.__DEBUG__,   writable:true, configurable:true, enumerable:false });
        Object.defineProperty(W, "__DEGRADE__", { value: W.__DEGRADE__, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "log",         { value: W.log,         writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "exportMyDebugLog", { value: W.exportMyDebugLog, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DEBUG_ALL_ON",     { value: W.DEBUG_ALL_ON,     writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DEBUG_ALL_OFF",    { value: W.DEBUG_ALL_OFF,    writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DEBUG_ALL_TOGGLE", { value: W.DEBUG_ALL_TOGGLE, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "__DIAG_ALERTS__", { value: W.__DIAG_ALERTS__, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DIAG_SCREEN_ON", { value: W.DIAG_SCREEN_ON, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DIAG_SCREEN_OFF", { value: W.DIAG_SCREEN_OFF, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DIAG_SCREEN_RESET", { value: W.DIAG_SCREEN_RESET, writable:false, configurable:true, enumerable:false });
        Object.defineProperty(W, "DIAG_SCREEN_SNAPSHOT", { value: W.DIAG_SCREEN_SNAPSHOT, writable:false, configurable:true, enumerable:false });
      }
    }
    
}
