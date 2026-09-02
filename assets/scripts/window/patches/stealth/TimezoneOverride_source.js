const TimezonePatchModule = function TimezonePatchModule(window) {
  function patchTimeZone() {
    const __module = "Timezone";
    const __tag = __module;
    const __surface = "timezone";
    const __tzTypePipeline = "pipeline missing data";
    const __tzTypeBrowser = "browser structure missing data";
    const __flagKey = '__PATCH_TIMEZONE__';
    const __core = window && window.Core;
    const __FERNWEH_DIAG__ = function(level, code, extra, err) {
  try {
    const G_ = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || {};
    if (G_.FernwehContext && G_.FernwehContext.__logger && G_.FernwehContext.__logger.__DEGRADE__ && typeof G_.FernwehContext.__logger.__DEGRADE__.diag === 'function') {
      G_.FernwehContext.__logger.__DEGRADE__.diag(level, code, extra, err);
    } else if (G_.__loggerRoot && G_.__loggerRoot.__DEGRADE__ && typeof G_.__loggerRoot.__DEGRADE__.diag === 'function') {
      G_.__loggerRoot.__DEGRADE__.diag(level, code, extra, err);
    }
  } catch (_) {}
};


   
   
    function __emit(level, code, ctx, err) {
      return (__FERNWEH_DIAG__ ? __FERNWEH_DIAG__(level, code, ctx, err) : undefined);
    }

    function diag(level, code, extra, err) {
      const x = (extra && typeof extra === "object") ? extra : {};
      const ctx = {
        module: __module,
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __module,
        surface: __surface,
        key: (typeof x.key === "string" && x.key) ? x.key : ((typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __flagKey),
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
      const C = window && window.FernwehContext;
      if (!C || typeof C !== 'object') return null;
      const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
      if (stateRoot && stateRoot.__GEO_STATE__ && typeof stateRoot.__GEO_STATE__ === 'object') {
        return stateRoot.__GEO_STATE__;
      }
      return null;
    }

    function __resolveLangTransitState() {
      const C = window && window.FernwehContext;
      if (!C || typeof C !== 'object') return null;
      const stateRoot = (C.state && typeof C.state === 'object') ? C.state : null;
      if (stateRoot && stateRoot.__LANG_STATE__ && typeof stateRoot.__LANG_STATE__ === 'object') {
        return stateRoot.__LANG_STATE__;
      }
      return null;
    }

    const geoTransitState = __resolveGeoTransitState();
    const langTransitState = __resolveLangTransitState();
    const timezone = (geoTransitState && typeof geoTransitState.timezone === "string" && geoTransitState.timezone)
      ? geoTransitState.timezone
      : null;
    const offsetMinutes = (geoTransitState && typeof geoTransitState.offsetMinutes === "number")
      ? geoTransitState.offsetMinutes
      : null;

    const spoofedLocales = (langTransitState && Array.isArray(langTransitState.normalizedLanguages))
      ? langTransitState.normalizedLanguages
      : null;

    const spoofedLocale = spoofedLocales ? spoofedLocales[0] : null;

    const safeDefine =
      (__core && typeof __core.__safeDefine === "function")
        ? __core.__safeDefine
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
        key: 'state.__LANG_STATE__.normalizedLanguages',
        stage: "preflight",
        message: "normalized languages missing",
        data: { outcome: "skip", reason: "missing_normalizedLanguages", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
    }

    const __applyTargets = (__core && typeof __core.applyTargets === "function")
      ? __core.applyTargets
      : null;
    const __wrapNativeCtor = (__core && typeof __core.__wrapNativeCtor === "function")
      ? __core.__wrapNativeCtor
      : null;
    if (typeof __applyTargets !== "function") {
      diagPipeline("warn", "tz:applyTargets_missing", {
        key: "Core.applyTargets",
        stage: "preflight",
        message: "Core.applyTargets missing",
        data: { outcome: "skip", reason: "missing_apply_targets", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
    }
    const __registerPatchedTarget = (__core && typeof __core.registerPatchedTarget === "function")
      ? __core.registerPatchedTarget
      : null;

    function createNativeShapedMethod(name, nativeFn, impl) {
      if (typeof nativeFn !== "function") {
        throw new TypeError("[patchTimeZone] native method missing for " + String(name));
      }
      if (typeof impl !== "function") {
        throw new TypeError("[patchTimeZone] impl missing for " + String(name));
      }
      return impl;
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
      let plans = [];
      try {
        plans = __applyTargets([{
          owner,
          key,
          resolve: "own",
          kind: "method",
          wrapLayer: "named_wrapper",
          policy: "throw",
          diagTag,
          invoke(orig, args) {
            return Reflect.apply(patchedValue, this, Array.isArray(args) ? args : []);
          }
        }], null, []);
      } catch (e) {
        diagBrowser("error", diagTag + ":preflight_failed", {
          key: String(key),
          stage: "preflight",
          message: "Core.applyTargets threw",
          data: { outcome: "throw", reason: "preflight_failed" }
        }, e);
        throw e;
      }
      if (!Array.isArray(plans) || plans.ok === false || plans.length !== 1) {
        const e = new Error("[patchTimeZone] method plan missing: " + String(key));
        diagBrowser("error", diagTag + ":plan_missing", {
          key: String(key),
          stage: "preflight",
          message: "Core.applyTargets returned invalid plan set",
          data: { outcome: "throw", reason: (plans && plans.reason) ? plans.reason : "plan_missing" }
        }, e);
        throw e;
      }
      const plan = plans[0];
      if (!plan || plan.skipApply || !plan.owner || typeof plan.key !== "string" || !plan.nextDesc) {
        const e = new Error("[patchTimeZone] invalid plan item: " + String(key));
        diagBrowser("error", diagTag + ":invalid_plan_item", {
          key: String(key),
          stage: "contract",
          message: "Core.applyTargets returned invalid plan item",
          data: { outcome: "throw", reason: "invalid_plan_item" }
        }, e);
        throw e;
      }
      safeDefine(plan.owner, plan.key, plan.nextDesc);
      const after = Object.getOwnPropertyDescriptor(plan.owner, plan.key);
      if (!sameDesc(after, plan.nextDesc)) {
        try {
          if (plan.origDesc) safeDefine(plan.owner, plan.key, plan.origDesc);
        } catch (restoreErr) {
          diagBrowser("error", diagTag + ":rollback_failed", {
            key: String(key),
            stage: "rollback",
            message: "restore failed after descriptor mismatch",
            data: { outcome: "rollback", reason: "restore_failed" }
          }, restoreErr);
        }
        const e = new Error("[patchTimeZone] redefineMethod descriptor mismatch: " + String(key));
        diagBrowser("error", diagTag + ":descriptor_mismatch", {
          key: String(key),
          stage: "contract",
          message: "redefineMethod descriptor mismatch",
          data: { outcome: "throw", reason: "descriptor_mismatch" }
        }, e);
        throw e;
      }
      pushRestore(() => {
        if (plan.origDesc) safeDefine(plan.owner, plan.key, plan.origDesc);
      });
      if (__registerPatchedTarget) {
        try {
          __registerPatchedTarget(plan.owner, plan.key);
        } catch (e) {
          diagBrowser("warn", diagTag + ":register_failed", {
            key: String(key),
            stage: "apply",
            message: "registerPatchedTarget failed",
            data: { outcome: "return", reason: "register_failed" }
          }, e);
        }
      }
    }

    if (typeof Date.prototype.getTimezoneOffset === "function") {
      const nowOff = (new Date()).getTimezoneOffset();
      if (nowOff !== -offsetMinutes) {
        diagPipeline("error", "tz:offset_mismatch", {
          key:Date.prototype.getTimezoneOffset,
          stage: "preflight",
          message: "current timezone offset mismatch",
          data: { outcome: "skip", reason: "offset_mismatch", nowOff: nowOff, expected: -offsetMinutes, timezone: timezone }
        }, null);
        releaseGuard(true);
        return;
      }
    } else {
      diagBrowser("warn", "tz:missing_getTimezoneOffset", {
        key: Date.prototype.getTimezoneOffset,
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
        const dtfProtoMismatch = Object.prototype.hasOwnProperty.call(OrigDTF, "prototype") && PatchedDTF.prototype !== OrigDTF.prototype;
        const dtfChainMismatch = Object.getPrototypeOf(PatchedDTF) !== Object.getPrototypeOf(OrigDTF);
        if (typeof PatchedDTF !== "function" || dtfProtoMismatch || dtfChainMismatch) {
          diagPipeline("warn", "tz:wrapNativeCtor_contract_violation", {
            key: "DateTimeFormat",
            stage: "contract",
            message: "Core.__wrapNativeCtor returned invalid constructor surface",
            data: { outcome: "skip", reason: "invalid_wrap_native_ctor_surface", timezone: timezone }
          }, new Error("invalid wrap native ctor surface"));
        } else {
          redefineValue(Intl, "DateTimeFormat", PatchedDTF, "tz:DateTimeFormat");
        }
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
        diagPipeline("info", "tz:DateTimeFormat:resolvedOptions_native_passthrough", {
          key: "DateTimeFormat.prototype.resolvedOptions",
          stage: "apply",
          message: "DateTimeFormat.prototype.resolvedOptions left native; constructor patch owns defaults",
          data: { outcome: "return", reason: "native_passthrough", timezone: timezone }
        }, null);
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
        const ctorProtoMismatch = Object.prototype.hasOwnProperty.call(OrigCtor, "prototype") && PatchedCtor.prototype !== OrigCtor.prototype;
        const ctorChainMismatch = Object.getPrototypeOf(PatchedCtor) !== Object.getPrototypeOf(OrigCtor);
        if (typeof PatchedCtor !== "function" || ctorProtoMismatch || ctorChainMismatch) {
          diagPipeline("warn", "tz:wrapNativeCtor_contract_violation", {
            key: ctorName,
            stage: "contract",
            message: "Core.__wrapNativeCtor returned invalid constructor surface",
            data: { outcome: "skip", reason: "invalid_wrap_native_ctor_surface", timezone: timezone }
          }, new Error("invalid wrap native ctor surface"));
          return;
        }
        redefineValue(Intl, ctorName, PatchedCtor, "tz:" + ctorName);
      }

      patchIntlCtorDefaultLocales("NumberFormat");
      patchIntlCtorDefaultLocales("Collator");
      patchIntlCtorDefaultLocales("ListFormat");
      patchIntlCtorDefaultLocales("PluralRules");
      patchIntlCtorDefaultLocales("RelativeTimeFormat");
      if (Intl && typeof Intl.DisplayNames === "function") {
        diagPipeline("info", "tz:DisplayNames:ctor_native_passthrough", {
          key: "DisplayNames",
          stage: "apply",
          message: "Intl.DisplayNames left native; mandatory options keep constructor on native path",
          data: {
            outcome: "return",
            reason: "mandatory_options_native_ctor_path",
            timezone: timezone,
            locale: spoofedLocale
          }
        }, null);
      }

      function patchIntlResolvedOptions(proto, fields) {
        const origResolvedOptions = proto.resolvedOptions;
        if (typeof origResolvedOptions !== "function") return;
        const ctorName = (proto && proto.constructor && typeof proto.constructor.name === "string" && proto.constructor.name)
          ? proto.constructor.name
          : "Intl";
        diagPipeline("info", "tz:IntlResolvedOptions:native_passthrough", {
          key: ctorName + ".prototype.resolvedOptions",
          stage: "apply",
          message: ctorName + ".prototype.resolvedOptions left native; constructor patch owns defaults",
          data: { outcome: "return", reason: "native_passthrough", fields: fields, timezone: timezone }
        }, null);
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
      diagPipeline("info", "tz:Date:toLocale_native_passthrough", {
        key: "Date.prototype.toLocale*",
        stage: "apply",
        message: "Date.prototype.toLocale* left native for timezone spoof experiment",
        data: { outcome: "return", reason: "native_passthrough", timezone: timezone, locale: spoofedLocale }
      }, null);

      diagPipeline("info", "tz:applied", {
        key: null,
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
