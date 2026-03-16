const TimezonePatchModule = function TimezonePatchModule(window) {
  function patchTimeZone() {
    const __module = "Timezone";
    const __tag = __module;
    const __surface = "timezone";
    const __tzTypePipeline = "pipeline missing data";
    const __tzTypeBrowser = "browser structure missing data";
    const __flagKey = '__PATCH_TIMEZONE__';
    const __core = window && window.Core;
    const __loggerRoot = (window && window.CanvasPatchContext && window.CanvasPatchContext.__logger && typeof window.CanvasPatchContext.__logger === 'object')
      ? window.CanvasPatchContext.__logger
      : null;
    const __D = (__loggerRoot && typeof __loggerRoot.__DEGRADE__ === 'function') ? __loggerRoot.__DEGRADE__ : null;
    const __diag = (__D && typeof __D.diag === 'function') ? __D.diag.bind(__D) : null;

   
   
    function __emit(level, code, ctx, err) {
      try {
        if (__diag) return __diag(level, code, ctx, err);
        if (typeof __D === "function") {
          const safeCtx = (ctx && typeof ctx === "object") ? ctx : {};
          const safeLevel = (level === undefined || level === null) ? "info" : level;
          const safeErr = (err === undefined || err === null) ? null : err;
          return __D(code, safeErr, Object.assign({}, safeCtx, { level: safeLevel }));
        }
      } catch (emitErr) {
        return undefined;
      }
    }

    function diag(level, code, extra, err) {
      const x = (extra && typeof extra === "object") ? extra : {};
      const ctx = {
        module: __module,
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __module,
        surface: __surface,
        key: (typeof x.key === "string" || x.key === null) ? x.key : null,
        stage: x.stage,
        message: x.message,
        data: Object.prototype.hasOwnProperty.call(x, "data") ? x.data : null,
        type: x.type
      };
      return __emit(level, code, ctx, err);
    }

    function diagPipeline(level, code, extra, err) {
      const x = (extra && typeof extra === "object") ? extra : {};
      return diag(level, code, Object.assign({}, x, {
        type: (typeof x.type === "string" && x.type) ? x.type : __tzTypePipeline,
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __module
      }), err);
    }

    function diagBrowser(level, code, extra, err) {
      const x = (extra && typeof extra === "object") ? extra : {};
      return diag(level, code, Object.assign({}, x, {
        type: (typeof x.type === "string" && x.type) ? x.type : __tzTypeBrowser,
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __module
      }), err);
    }

    let __guardToken = null;
    try {
      if (!__core || typeof __core.guardFlag !== 'function') {
        diagPipeline('warn', __tag + ':guard_missing', {
          key: __flagKey,
          stage: 'guard',
          message: 'Core.guardFlag missing',
          data: { outcome: 'skip', reason: 'missing_dep_core_guard' }
        }, null);
        return;
      }
      __guardToken = __core.guardFlag(__flagKey, __tag);
    } catch (e) {
      diagPipeline('warn', __tag + ':guard_failed', {
        key: __flagKey,
        stage: 'guard',
        message: 'guardFlag threw',
        data: { outcome: 'skip', reason: 'guard_failed' }
      }, e);
      return;
    }
    if (!__guardToken) return;

    function releaseGuard(rollbackOk) {
      try {
        if (__core && typeof __core.releaseGuardFlag === "function") {
          __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk === true, __tag);
        }
      } catch (e) {
        diagPipeline("warn", __tag + ":guard_release_exception", {
          key: __flagKey,
          stage: "rollback",
          message: "releaseGuardFlag failed",
          data: { outcome: "skip", reason: "guard_release_exception" }
        }, e);
      }
    }

    function __resolveGeoTransitState() {
      const C = window && window.CanvasPatchContext;
      if (!C || typeof C !== 'object') return null;
      const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
      if (stateRoot && stateRoot.__GEO_STATE__ && typeof stateRoot.__GEO_STATE__ === 'object') {
        return stateRoot.__GEO_STATE__;
      }
      if (C.__GEO_STATE__ && typeof C.__GEO_STATE__ === 'object') {
        return C.__GEO_STATE__;
      }
      return null;
    }

    const geoTransitState = __resolveGeoTransitState();
    const timezone = (geoTransitState && typeof geoTransitState.timezone === "string" && geoTransitState.timezone)
      ? geoTransitState.timezone
      : window.__TIMEZONE__;
    const offsetMinutes = (geoTransitState && typeof geoTransitState.offsetMinutes === "number")
      ? geoTransitState.offsetMinutes
      : window.__OFFSET_MINUTES__;

    const spoofedLocales = Array.isArray(window.__normalizedLanguages)
      ? window.__normalizedLanguages
      : (typeof window.__normalizedLanguages === "string" ? [window.__normalizedLanguages] : null);

    const spoofedLocale = spoofedLocales ? spoofedLocales[0] : null;

    const safeDefine =
      (window && typeof window.__safeDefine === "function")
        ? window.__safeDefine
        : function(obj, prop, desc) { Object.defineProperty(obj, prop, desc); };

    function applyDefaultTimeZoneOption(options) {
      if (options == null) return { timeZone: timezone };
      const nextOptions = Object.assign({}, options);
      if (nextOptions.timeZone == null) nextOptions.timeZone = timezone;
      return nextOptions;
    }

    if (!timezone || typeof timezone !== "string") {
      diagPipeline("error", "tz:missing_timezone", {
        key: 'state.__GEO_STATE__.timezone',
        stage: "preflight",
        message: "timezone source missing",
        data: { outcome: "skip", reason: "missing_timezone" }
      }, null);
      releaseGuard(true);
      return;
    }
    if (typeof offsetMinutes !== "number") {
      diagPipeline("error", "tz:missing_offsetMinutes", {
        key: 'state.__GEO_STATE__.offsetMinutes',
        stage: "preflight",
        message: "offsetMinutes source missing",
        data: { outcome: "skip", reason: "missing_offsetMinutes", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
    }
    if (!spoofedLocales || !spoofedLocales.length || typeof spoofedLocale !== "string" || !spoofedLocale) {
      diagPipeline("error", "tz:missing_normalizedLanguages", {
        key: __flagKey,
        stage: "preflight",
        message: "normalized languages missing",
        data: { outcome: "skip", reason: "missing_normalizedLanguages", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
    }

    const __ensureMarkAsNative = (window && typeof window.__ensureMarkAsNative === "function")
      ? window.__ensureMarkAsNative
      : null;
    const markAsNative = __ensureMarkAsNative ? __ensureMarkAsNative() : null;
    const __wrapNativeCtor = (__core && typeof __core.__wrapNativeCtor === "function")
      ? __core.__wrapNativeCtor
      : null;
    if (typeof markAsNative !== "function") {
      diagPipeline("warn", "tz:missing_markAsNative", {
        key: __flagKey,
        stage: "preflight",
        message: "__ensureMarkAsNative missing",
        data: { outcome: "skip", reason: "missing_dep_markAsNative", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
    }
    const __registerPatchedTarget = (__core && typeof __core.registerPatchedTarget === "function")
      ? __core.registerPatchedTarget
      : null;

    function createNativeShapedMethod(name, impl) {
      const method = ({ [name](...args) {
        return Reflect.apply(impl, this, args);
      } })[name];
      return markAsNative(method, name);
    }

    function sameDesc(actual, expected) {
      if (!actual || !expected) return false;
      const keys = ["configurable", "enumerable", "writable", "value", "get", "set"];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (Object.prototype.hasOwnProperty.call(expected, k)) {
          if (actual[k] !== expected[k]) return false;
        }
      }
      return true;
    }

    function redefineValue(obj, prop, value, diagTag) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      const nextDesc = {
        writable: d ? !!d.writable : true,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false,
        value
      };
      safeDefine(obj, prop, nextDesc);
      const after = Object.getOwnPropertyDescriptor(obj, prop);
      if (!sameDesc(after, nextDesc)) {
        const e = new Error("[patchTimeZone] redefineValue descriptor mismatch: " + String(prop));
        diagPipeline("error", (diagTag || ("tz:redefineValue:" + prop)) + ":descriptor_mismatch", {
          key: String(prop),
          stage: "apply",
          message: "redefineValue descriptor mismatch",
          data: { outcome: "throw", reason: "descriptor_mismatch" }
        }, e);
        throw e;
      }
      if (__registerPatchedTarget) {
        try {
          __registerPatchedTarget(obj, prop);
        } catch (e) {
          diagBrowser("warn", (diagTag || ("tz:redefineValue:" + prop)) + ":register_failed", {
            key: String(prop),
            stage: "apply",
            message: "registerPatchedTarget failed",
            data: { outcome: "return", reason: "register_failed" }
          }, e);
        }
      }
    }

    function redefineMethod(owner, key, patchedValue, diagTag) {
      const desc = Object.getOwnPropertyDescriptor(owner, key);
      if (!desc || typeof desc.value !== "function") {
        const e = new Error("[patchTimeZone] method descriptor missing: " + String(key));
        diagBrowser("error", diagTag + ":descriptor_missing", {
          key: String(key),
          stage: "preflight",
          message: "method descriptor missing",
          data: { outcome: "throw", reason: "descriptor_missing" }
        }, e);
        throw e;
      }
      redefineValue(owner, key, patchedValue, diagTag);
    }

    if (typeof Date.prototype.getTimezoneOffset === "function") {
      const nowOff = (new Date()).getTimezoneOffset();
      if (nowOff !== -offsetMinutes) {
        diagPipeline("error", "tz:offset_mismatch", {
          key: __flagKey,
          stage: "preflight",
          message: "current timezone offset mismatch",
          data: { outcome: "skip", reason: "offset_mismatch", nowOff: nowOff, expected: -offsetMinutes, timezone: timezone }
        }, null);
        releaseGuard(true);
        return;
      }
    } else {
      diagBrowser("warn", "tz:missing_getTimezoneOffset", {
        key: __flagKey,
        stage: "preflight",
        message: "Date.prototype.getTimezoneOffset missing",
        data: { outcome: "skip", reason: "missing_getTimezoneOffset", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
    }

    const restores = [];
    function pushRestore(fn) { restores.push(fn); }
    function rollback(reasonTag) {
      let rollbackOk = true;
      for (let i = restores.length - 1; i >= 0; i--) {
        try {
          restores[i]();
        } catch (e) {
          rollbackOk = false;
          diagBrowser("error", (reasonTag || "tz:rollback") + ":restore_failed", {
            stage: "rollback",
            message: "restore failed during rollback",
            data: { outcome: "rollback", reason: "restore_failed" }
          }, e);
        }
      }
      return rollbackOk;
    }

    function rememberValue(obj, prop) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      pushRestore(() => {
        if (d) safeDefine(obj, prop, d);
      });
      return d;
    }

    function rememberProtoValue(obj, prop) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      pushRestore(() => {
        if (d) safeDefine(obj, prop, d);
      });
      return d;
    }

    try {
      rememberValue(Intl, "DateTimeFormat");
      const OrigDTF = Intl.DateTimeFormat;
      if (typeof __wrapNativeCtor === "function") {
        const PatchedDTF = __wrapNativeCtor(OrigDTF, "DateTimeFormat", function patchDateTimeFormatArgs(argList) {
          const nextArgs = Array.isArray(argList) ? argList.slice() : [];
          if (nextArgs[0] == null) nextArgs[0] = spoofedLocales;
          nextArgs[1] = applyDefaultTimeZoneOption(nextArgs[1]);
          return nextArgs;
        });
        redefineValue(Intl, "DateTimeFormat", PatchedDTF, "tz:DateTimeFormat");
      } else {
        diagPipeline("warn", "tz:wrapNativeCtor_missing", {
          key: "DateTimeFormat",
          stage: "preflight",
          message: "Core.__wrapNativeCtor missing (skip constructor patch)",
          data: { outcome: "skip", reason: "missing_wrap_native_ctor", timezone: timezone }
        }, null);
      }

      if (OrigDTF && OrigDTF.prototype && typeof OrigDTF.prototype.resolvedOptions === "function") {
        const proto = OrigDTF.prototype;
        rememberProtoValue(proto, "resolvedOptions");
        const origResolvedOptions = proto.resolvedOptions;
        // Keep this path unchanged until constructor-time caller intent can be tracked per instance.
        const patchedResolvedOptions = createNativeShapedMethod("resolvedOptions", function resolvedOptionsImpl() {
          let ro;
          try {
            ro = Reflect.apply(origResolvedOptions, this, []);
          } catch (e) {
            diagBrowser("warn", "tz:DateTimeFormat:resolvedOptions:native_throw", {
              stage: "runtime",
              message: "native resolvedOptions threw",
              data: { reason: "native_throw", timezone: timezone }
            }, e);
            throw e;
          }
          try {
            if (ro && typeof ro === "object") ro.timeZone = timezone;
          } catch (e) {
            diagBrowser("error", "tz:DateTimeFormat:resolvedOptions:post_failed", {
              stage: "hook",
              message: "resolvedOptions post-processing failed",
              data: { reason: "post_failed", timezone: timezone }
            }, e);
          }
          return ro;
        });
        redefineMethod(proto, "resolvedOptions", patchedResolvedOptions, "tz:DateTimeFormat:resolvedOptions");
      }

      function patchIntlCtorDefaultLocales(ctorName) {
        if (!Intl || typeof Intl[ctorName] !== "function") return;
        rememberValue(Intl, ctorName);
        const OrigCtor = Intl[ctorName];
        if (typeof __wrapNativeCtor !== "function") {
          diagPipeline("warn", "tz:wrapNativeCtor_missing", {
            key: ctorName,
            stage: "preflight",
            message: "Core.__wrapNativeCtor missing (skip constructor patch)",
            data: { outcome: "skip", reason: "missing_wrap_native_ctor", timezone: timezone }
          }, null);
          return;
        }
        const PatchedCtor = __wrapNativeCtor(OrigCtor, ctorName, function patchIntlCtorArgs(argList) {
          const nextArgs = Array.isArray(argList) ? argList.slice() : [];
          if (nextArgs[0] == null) nextArgs[0] = spoofedLocales;
          return nextArgs;
        });
        redefineValue(Intl, ctorName, PatchedCtor, "tz:" + ctorName);
      }

      patchIntlCtorDefaultLocales("NumberFormat");
      patchIntlCtorDefaultLocales("Collator");
      patchIntlCtorDefaultLocales("ListFormat");
      patchIntlCtorDefaultLocales("PluralRules");
      patchIntlCtorDefaultLocales("RelativeTimeFormat");
      patchIntlCtorDefaultLocales("DisplayNames");

      function patchIntlResolvedOptions(proto, fields) {
        const origResolvedOptions = proto.resolvedOptions;
        if (typeof origResolvedOptions !== "function") return;
        rememberProtoValue(proto, "resolvedOptions");
        // Keep this path unchanged until constructor-time caller intent can be tracked per instance.
        const patchedResolvedOptions = createNativeShapedMethod("resolvedOptions", function resolvedOptionsImpl() {
          let options;
          try {
            options = Reflect.apply(origResolvedOptions, this, []);
          } catch (e) {
            const nativeThrowMsg = (e && e.message) ? String(e.message) : "";
            if (e instanceof TypeError && /(?:illegal invocation|incompatible receiver|called on incompatible receiver)/i.test(nativeThrowMsg)) {
              throw e;
            }
            diagBrowser("warn", "tz:IntlResolvedOptions:native_throw", {
              stage: "runtime",
              message: "native resolvedOptions threw",
              data: { reason: "native_throw", timezone: timezone }
            }, e);
            throw e;
          }
          try {
            fields.forEach(([field, value]) => {
              try {
                options[field] = value;
              } catch (e) {
                diagBrowser("error", "tz:IntlResolvedOptions:post_failed", {
                  stage: "hook",
                  message: "resolvedOptions field post-processing failed",
                  data: { reason: "post_failed", field: field, timezone: timezone }
                }, e);
              }
            });
          } catch (e) {
            diagBrowser("error", "tz:IntlResolvedOptions:post_failed", {
              stage: "hook",
              message: "resolvedOptions post-processing failed",
              data: { reason: "post_failed", timezone: timezone }
            }, e);
          }
          return options;
        });
        redefineMethod(proto, "resolvedOptions", patchedResolvedOptions, "tz:IntlResolvedOptions");
      }

      [
        Intl.ListFormat,
        Intl.PluralRules,
        Intl.RelativeTimeFormat,
        Intl.DisplayNames
      ].forEach(IntlClass => {
        if (IntlClass && IntlClass.prototype && typeof IntlClass.prototype.resolvedOptions === "function") {
          patchIntlResolvedOptions(IntlClass.prototype, [["locale", spoofedLocale]]);
        }
      });

      rememberProtoValue(Date.prototype, "toLocaleString");
      rememberProtoValue(Date.prototype, "toLocaleDateString");
      rememberProtoValue(Date.prototype, "toLocaleTimeString");

      const origToLocaleString = Date.prototype.toLocaleString;
      const origToLocaleDateString = Date.prototype.toLocaleDateString;
      const origToLocaleTimeString = Date.prototype.toLocaleTimeString;
      if (typeof origToLocaleString !== "function" || typeof origToLocaleDateString !== "function" || typeof origToLocaleTimeString !== "function") {
        const e = new Error("[patchTimeZone] Date.toLocale* originals missing");
        diagBrowser("error", "tz:Date:toLocale*:missing_originals", {
          stage: "preflight",
          message: "Date.toLocale* originals missing",
          data: { outcome: "throw", reason: "missing_originals", timezone: timezone }
        }, e);
        throw e;
      }
      const patchedToLocaleString = createNativeShapedMethod("toLocaleString", function toLocaleStringImpl(locales, options) {
        if (locales == null) locales = spoofedLocales;
        options = applyDefaultTimeZoneOption(options);
        try {
          return Reflect.apply(origToLocaleString, this, [locales, options]);
        } catch (e) {
          diagBrowser("warn", "tz:Date:toLocaleString:native_throw", {
            stage: "runtime",
            message: "native toLocaleString threw",
            data: { reason: "native_throw", timezone: timezone }
          }, e);
          throw e;
        }
      });
      const patchedToLocaleDateString = createNativeShapedMethod("toLocaleDateString", function toLocaleDateStringImpl(locales, options) {
        if (locales == null) locales = spoofedLocales;
        options = applyDefaultTimeZoneOption(options);
        try {
          return Reflect.apply(origToLocaleDateString, this, [locales, options]);
        } catch (e) {
          diagBrowser("warn", "tz:Date:toLocaleDateString:native_throw", {
            stage: "runtime",
            message: "native toLocaleDateString threw",
            data: { reason: "native_throw", timezone: timezone }
          }, e);
          throw e;
        }
      });
      const patchedToLocaleTimeString = createNativeShapedMethod("toLocaleTimeString", function toLocaleTimeStringImpl(locales, options) {
        if (locales == null) locales = spoofedLocales;
        options = applyDefaultTimeZoneOption(options);
        try {
          return Reflect.apply(origToLocaleTimeString, this, [locales, options]);
        } catch (e) {
          diagBrowser("warn", "tz:Date:toLocaleTimeString:native_throw", {
            stage: "runtime",
            message: "native toLocaleTimeString threw",
            data: { reason: "native_throw", timezone: timezone }
          }, e);
          throw e;
        }
      });
      redefineMethod(Date.prototype, "toLocaleString", patchedToLocaleString, "tz:Date:toLocaleString");
      redefineMethod(Date.prototype, "toLocaleDateString", patchedToLocaleDateString, "tz:Date:toLocaleDateString");
      redefineMethod(Date.prototype, "toLocaleTimeString", patchedToLocaleTimeString, "tz:Date:toLocaleTimeString");

      diagPipeline("info", "tz:applied", {
        key: __flagKey,
        stage: "apply",
        message: "timezone patch applied",
        data: { outcome: "return", timezone: timezone, offsetMinutes: Number(offsetMinutes), locale: spoofedLocale }
      }, null);
    } catch (e) {
      const rollbackOk = rollback("tz:apply_failed");
      diagBrowser("error", "tz:fatal", {
        key: null,
        stage: "apply",
        message: "fatal module error",
        data: { outcome: "throw", reason: "fatal", rollbackOk: rollbackOk }
      }, e);
      releaseGuard(rollbackOk);
      throw e;
    }
  }

  return patchTimeZone;
};
