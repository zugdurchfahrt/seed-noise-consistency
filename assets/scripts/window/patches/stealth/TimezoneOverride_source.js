const TimezonePatchModule = function TimezonePatchModule(window) {
  function patchTimeZone() {
    const __MODULE = "tz";
    const __SURFACE = "timezone";
    const __tzTypePipeline = "pipeline missing data";
    const __tzTypeBrowser = "browser structure missing data";
    const __flagKey = "__TZ_PATCHED__";
    const __core = window.Core;
    const __D = window.__DEGRADE__;
    const __diag = (__D && typeof __D.diag === "function") ? __D.diag.bind(__D) : null;

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
        module: __MODULE,
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __MODULE,
        surface: __SURFACE,
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
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __MODULE
      }), err);
    }

    function diagBrowser(level, code, extra, err) {
      const x = (extra && typeof extra === "object") ? extra : {};
      return diag(level, code, Object.assign({}, x, {
        type: (typeof x.type === "string" && x.type) ? x.type : __tzTypeBrowser,
        diagTag: (typeof x.diagTag === "string" && x.diagTag) ? x.diagTag : __MODULE
      }), err);
    }

    let __guardToken = null;
    function releaseGuard(rollbackOk) {
      try {
        if (__core && typeof __core.releaseGuardFlag === "function") {
          return __core.releaseGuardFlag(__flagKey, __guardToken, rollbackOk === true, __MODULE);
        }
      } catch (e) {
        diagPipeline("warn", "tz:guard_release_failed", {
          key: __flagKey,
          stage: "rollback",
          message: "releaseGuardFlag threw",
          data: { outcome: "rollback", reason: "guard_release_failed", rollbackOk: rollbackOk === true }
        }, e);
      }
      return false;
    }

    try {
      if (!__core || typeof __core.guardFlag !== "function") {
        diagPipeline("warn", "tz:guard_missing", {
          key: __flagKey,
          stage: "guard",
          message: "Core.guardFlag missing",
          data: { outcome: "skip", reason: "missing_dep_core_guard" }
        }, null);
        return;
      }
      __guardToken = __core.guardFlag(__flagKey, __MODULE);
    } catch (e) {
      diagPipeline("warn", "tz:guard_failed", {
        key: __flagKey,
        stage: "guard",
        message: "guardFlag threw",
        data: { outcome: "skip", reason: "guard_failed" }
      }, e);
      return;
    }
    if (!__guardToken) return;

    const timezone = window.__TIMEZONE__;
    const offsetMinutes = window.__OFFSET_MINUTES__;

    const spoofedLocales = Array.isArray(window.__normalizedLanguages)
      ? window.__normalizedLanguages
      : (typeof window.__normalizedLanguages === "string" ? [window.__normalizedLanguages] : null);

    const spoofedLocale = spoofedLocales ? spoofedLocales[0] : null;

    const safeDefine =
      (window && typeof window.__safeDefine === "function")
        ? window.__safeDefine
        : function(obj, prop, desc) { Object.defineProperty(obj, prop, desc); };

    if (!timezone || typeof timezone !== "string") {
      diagPipeline("error", "tz:missing_timezone", {
        key: __flagKey,
        stage: "preflight",
        message: "timezone source missing",
        data: { outcome: "skip", reason: "missing_timezone" }
      }, null);
      releaseGuard(true);
      return;
    }
    if (typeof offsetMinutes !== "number") {
      diagPipeline("error", "tz:missing_offsetMinutes", {
        key: __flagKey,
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

    const __coreApplyTargets = (__core && typeof __core.applyTargets === "function")
      ? __core.applyTargets
      : null;
    if (typeof __coreApplyTargets !== "function") {
      diagPipeline("warn", "tz:missing_core_applyTargets", {
        key: __flagKey,
        stage: "preflight",
        message: "Core.applyTargets missing",
        data: { outcome: "skip", reason: "missing_dep_core_applyTargets", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
    }
    const __wrapNativeCtor = (window && typeof window.__wrapNativeCtor === "function") ? window.__wrapNativeCtor : null;
    if (typeof __wrapNativeCtor !== "function") {
      diagPipeline("warn", "tz:missing_wrapNativeCtor", {
        key: __flagKey,
        stage: "preflight",
        message: "__wrapNativeCtor missing",
        data: { outcome: "skip", reason: "missing_dep_wrapNativeCtor", timezone: timezone }
      }, null);
      releaseGuard(true);
      return;
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

    function applyCoreTargetsGroup(groupTag, targets, policy) {
      let plans = [];
      const Core = window && window.Core;
      if (!Core || typeof Core.applyTargets !== "function") {
        const e = new Error("[patchTimeZone] missing Core.applyTargets");
        diagPipeline("error", groupTag + ":missing_core_applyTargets", {
          stage: "preflight",
          message: "Core.applyTargets missing",
          data: { outcome: "throw", reason: "missing_dep_core_applyTargets" }
        }, e);
        throw e;
      }
      const coreRegisterPatchedTarget = (typeof Core.registerPatchedTarget === "function")
        ? Core.registerPatchedTarget
        : null;
      if (typeof coreRegisterPatchedTarget !== "function") {
        const e = new Error("[patchTimeZone] missing Core.registerPatchedTarget");
        diagPipeline("error", groupTag + ":missing_core_registerPatchedTarget", {
          stage: "preflight",
          message: "Core.registerPatchedTarget missing",
          data: { outcome: "throw", reason: "missing_dep_core_registerPatchedTarget" }
        }, e);
        throw e;
      }
      try {
        plans = Core.applyTargets(targets, window.__PROFILE__, []);
      } catch (e) {
        diagPipeline("error", groupTag + ":preflight_failed", {
          stage: "preflight",
          message: "Core.applyTargets preflight failed",
          data: { outcome: "throw", reason: "preflight_failed" }
        }, e);
        throw e;
      }
      if (!Array.isArray(plans) || !plans.length) {
        const reason = plans && plans.reason ? plans.reason : "group_skipped";
        diagPipeline("warn", groupTag + ":" + reason, {
          stage: "preflight",
          message: "Core.applyTargets returned empty plan",
          data: { outcome: "throw", reason: reason }
        }, null);
        throw new Error("[patchTimeZone] core plan skipped");
      }
      const applied = [];
      try {
        for (let i = 0; i < plans.length; i++) {
          const p = plans[i];
          if (!p || p.skipApply) continue;
          if (!p.owner || typeof p.key !== "string" || !p.nextDesc) {
            throw new Error("[patchTimeZone] invalid core plan item");
          }
          Object.defineProperty(p.owner, p.key, p.nextDesc);
          const after = Object.getOwnPropertyDescriptor(p.owner, p.key);
          if (!sameDesc(after, p.nextDesc)) {
            throw new Error("[patchTimeZone] descriptor post-check mismatch");
          }
          applied.push(p);
        }

        for (let i = 0; i < applied.length; i++) {
          const p = applied[i];
          coreRegisterPatchedTarget(p.owner, p.key);
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
            diagBrowser("error", groupTag + ":rollback_failed", {
              key: p.key || null,
              stage: "rollback",
              message: "group rollback failed",
              data: { outcome: "rollback", reason: "rollback_failed" }
            }, re);
          }
        }
        if (rollbackErr) {
          throw rollbackErr;
        }
        diagPipeline("error", groupTag + ":apply_failed", {
          stage: "apply",
          message: "group apply failed",
          data: { outcome: "throw", reason: "apply_failed" }
        }, e);
        throw e;
      }
      return applied.length;
    }

    function redefineValue(obj, prop, value, diagTag) {
      const d = Object.getOwnPropertyDescriptor(obj, prop);
      const t = {
        owner: obj,
        key: prop,
        kind: "data",
        wrapLayer: "descriptor_only",
        policy: "throw",
        diagTag: diagTag || ("tz:redefineValue:" + prop),
        value,
        writable: d ? !!d.writable : true,
        configurable: d ? !!d.configurable : true,
        enumerable: d ? !!d.enumerable : false
      };
      const applied = applyCoreTargetsGroup(diagTag || ("tz:redefineValue:" + prop), [t], "throw");
      if (applied !== 1) {
        const e = new Error("[patchTimeZone] redefineValue failed: " + String(prop));
        diagPipeline("error", "tz:redefineValue:apply_failed", {
          key: String(prop),
          diagTag: (diagTag || null),
          stage: "apply",
          message: "redefineValue failed",
          data: { outcome: "throw", reason: "redefineValue_apply_failed" }
        }, e);
        throw e;
      }
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
      const PatchedDTF = __wrapNativeCtor(OrigDTF, "DateTimeFormat", (argList) => {
        let locales = (argList.length >= 1) ? argList[0] : undefined;
        let options = (argList.length >= 2) ? argList[1] : undefined;
        if (locales == null) locales = spoofedLocales;
        if (options == null) options = { timeZone: timezone };
        else options = Object.assign({}, options, { timeZone: timezone });
        return [locales, options];
      });
      redefineValue(Intl, "DateTimeFormat", PatchedDTF, "tz:DateTimeFormat");

      if (OrigDTF && OrigDTF.prototype && typeof OrigDTF.prototype.resolvedOptions === "function") {
        const proto = OrigDTF.prototype;
        rememberProtoValue(proto, "resolvedOptions");
        applyCoreTargetsGroup("tz:DateTimeFormat:resolvedOptions", [{
          owner: proto,
          key: "resolvedOptions",
          kind: "method",
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          allowNamedWrapperBrandStrict: true,
          policy: "throw",
          diagTag: "tz:DateTimeFormat:resolvedOptions",
          validThis(self) {
            try {
              return !!(self && self instanceof OrigDTF);
            } catch (e) {
              diagBrowser("warn", "tz:DateTimeFormat:resolvedOptions:guard_failed", {
                stage: "guard",
                message: "validThis check failed",
                data: { reason: "guard_failed", timezone: timezone }
              }, e);
              return false;
            }
          },
          invalidThis: "throw",
          invoke(orig, args) {
            let ro;
            try {
              ro = Reflect.apply(orig, this, args || []);
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
          }
        }], "throw");
      }

      function patchIntlCtorDefaultLocales(ctorName) {
        if (!Intl || typeof Intl[ctorName] !== "function") return;
        rememberValue(Intl, ctorName);
        const OrigCtor = Intl[ctorName];
        let PatchedCtor = null;
        try {
          PatchedCtor = __wrapNativeCtor(OrigCtor, ctorName, (argList) => {
            let locales = (argList.length >= 1) ? argList[0] : undefined;
            const options = (argList.length >= 2) ? argList[1] : undefined;
            if (locales == null) locales = spoofedLocales;
            return [locales, options];
          });
        } catch (e) {
          diagPipeline("error", "tz:wrapNativeCtor_failed", {
            key: String(ctorName),
            stage: "apply",
            message: "__wrapNativeCtor failed",
            data: { outcome: "throw", reason: "wrapNativeCtor_failed", timezone: timezone }
          }, e);
          throw e;
        }
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
        applyCoreTargetsGroup("tz:IntlResolvedOptions", [{
          owner: proto,
          key: "resolvedOptions",
          kind: "method",
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          allowNamedWrapperBrandStrict: true,
          policy: "throw",
          diagTag: "tz:IntlResolvedOptions",
          validThis(self) {
            try {
              return !!(self && self.constructor && self.constructor.prototype && self.constructor.prototype.isPrototypeOf(self));
            } catch (e) {
              diagBrowser("warn", "tz:IntlResolvedOptions:guard_failed", {
                stage: "guard",
                message: "validThis check failed",
                data: { reason: "guard_failed", timezone: timezone }
              }, e);
              return false;
            }
          },
          invalidThis: "throw",
          invoke(orig, args) {
            let options;
            try {
              options = Reflect.apply(orig, this, args || []);
            } catch (e) {
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
          }
        }], "throw");
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
      applyCoreTargetsGroup("tz:Date:toLocale*", [
        {
          owner: Date.prototype,
          key: "toLocaleString",
          kind: "method",
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          allowNamedWrapperBrandStrict: true,
          policy: "throw",
          diagTag: "tz:Date:toLocaleString",
          validThis(self) {
            try {
              return !!(self && self instanceof Date);
            } catch (e) {
              diagBrowser("warn", "tz:Date:toLocaleString:guard_failed", {
                stage: "guard",
                message: "validThis check failed",
                data: { reason: "guard_failed", timezone: timezone }
              }, e);
              return false;
            }
          },
          invalidThis: "throw",
          invoke(orig, args) {
            let locales = (args && args.length >= 1) ? args[0] : undefined;
            let options = (args && args.length >= 2) ? args[1] : undefined;
            if (locales == null) locales = spoofedLocales;
            options = Object.assign({}, options, { timeZone: timezone });
            try {
              return Reflect.apply(orig, this, [locales, options]);
            } catch (e) {
              diagBrowser("warn", "tz:Date:toLocaleString:native_throw", {
                stage: "runtime",
                message: "native toLocaleString threw",
                data: { reason: "native_throw", timezone: timezone }
              }, e);
              throw e;
            }
          }
        },
        {
          owner: Date.prototype,
          key: "toLocaleDateString",
          kind: "method",
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          allowNamedWrapperBrandStrict: true,
          policy: "throw",
          diagTag: "tz:Date:toLocaleDateString",
          validThis(self) {
            try {
              return !!(self && self instanceof Date);
            } catch (e) {
              diagBrowser("warn", "tz:Date:toLocaleDateString:guard_failed", {
                stage: "guard",
                message: "validThis check failed",
                data: { reason: "guard_failed", timezone: timezone }
              }, e);
              return false;
            }
          },
          invalidThis: "throw",
          invoke(orig, args) {
            let locales = (args && args.length >= 1) ? args[0] : undefined;
            let options = (args && args.length >= 2) ? args[1] : undefined;
            if (locales == null) locales = spoofedLocales;
            options = Object.assign({}, options, { timeZone: timezone });
            try {
              return Reflect.apply(orig, this, [locales, options]);
            } catch (e) {
              diagBrowser("warn", "tz:Date:toLocaleDateString:native_throw", {
                stage: "runtime",
                message: "native toLocaleDateString threw",
                data: { reason: "native_throw", timezone: timezone }
              }, e);
              throw e;
            }
          }
        },
        {
          owner: Date.prototype,
          key: "toLocaleTimeString",
          kind: "method",
          wrapLayer: "named_wrapper",
          invokeClass: "brand_strict",
          allowNamedWrapperBrandStrict: true,
          policy: "throw",
          diagTag: "tz:Date:toLocaleTimeString",
          validThis(self) {
            try {
              return !!(self && self instanceof Date);
            } catch (e) {
              diagBrowser("warn", "tz:Date:toLocaleTimeString:guard_failed", {
                stage: "guard",
                message: "validThis check failed",
                data: { reason: "guard_failed", timezone: timezone }
              }, e);
              return false;
            }
          },
          invalidThis: "throw",
          invoke(orig, args) {
            let locales = (args && args.length >= 1) ? args[0] : undefined;
            let options = (args && args.length >= 2) ? args[1] : undefined;
            if (locales == null) locales = spoofedLocales;
            options = Object.assign({}, options, { timeZone: timezone });
            try {
              return Reflect.apply(orig, this, [locales, options]);
            } catch (e) {
              diagBrowser("warn", "tz:Date:toLocaleTimeString:native_throw", {
                stage: "runtime",
                message: "native toLocaleTimeString threw",
                data: { reason: "native_throw", timezone: timezone }
              }, e);
              throw e;
            }
          }
        }
      ], "throw");

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

  const W = (typeof window !== "undefined") ? window : null;
  if (W && !Object.prototype.hasOwnProperty.call(W, "patchTimeZone")) {
    Object.defineProperty(W, "patchTimeZone", {
      value: patchTimeZone,
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
};
