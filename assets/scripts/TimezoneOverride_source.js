(function() {
  window.patchTimeZone = function patchTimeZone() {
    if (window.__TZ_PATCHED__) return;
    window.__TZ_PATCHED__ = true;

    const timezone = window.__TIMEZONE__;
    const offsetMinutes = window.__OFFSET_MINUTES__;
    const spoofedLocale = Array.isArray(window.__normalizedLanguages)
      ? window.__normalizedLanguages[0]
      : window.__normalizedLanguages;

    if (!timezone || typeof offsetMinutes !== "number") {
      console.warn("patchTimeZone: timezone/offset undefined");
      return;
    }

    Object.defineProperty(Date.prototype, "getTimezoneOffset", {
      value: () => -offsetMinutes,
      writable: false,
      configurable: true,
    });

    const OrigDTF = Intl.DateTimeFormat;
    function PatchedDTF(...args) {
      const dtf = new OrigDTF(...args);
      const originalResolvedOptions = dtf.resolvedOptions.bind(dtf);
      dtf.resolvedOptions = () => {
        const options = originalResolvedOptions();
        options.timeZone = timezone;
        return options;
      };
      return dtf;
    }
    PatchedDTF.prototype = OrigDTF.prototype;
    Intl.DateTimeFormat = PatchedDTF;

    function patchIntlResolvedOptions(prototype, fields) {
      const origResolvedOptions = prototype.resolvedOptions;
      prototype.resolvedOptions = function() {
        const options = origResolvedOptions.call(this);
        fields.forEach(([field, value]) => options[field] = value);
        return options;
      };
    }

    [
      Intl.Collator,
      Intl.NumberFormat,
      Intl.ListFormat,
      Intl.PluralRules,
      Intl.RelativeTimeFormat,
      Intl.DisplayNames
    ].forEach(IntlClass => {
      if (IntlClass && IntlClass.prototype && IntlClass.prototype.resolvedOptions) {
        patchIntlResolvedOptions(IntlClass.prototype, [['locale', spoofedLocale]]);
      }
    });

    const origToLocaleString = Date.prototype.toLocaleString;
    const origToLocaleDateString = Date.prototype.toLocaleDateString;
    const origToLocaleTimeString = Date.prototype.toLocaleTimeString;

    Date.prototype.toLocaleString = function(locale, options) {
      locale = locale || spoofedLocale;
      options = Object.assign({}, options, { timeZone: timezone });
      return origToLocaleString.call(this, locale, options);
    };
    Date.prototype.toLocaleDateString = function(locale, options) {
      locale = locale || spoofedLocale;
      options = Object.assign({}, options, { timeZone: timezone });
      return origToLocaleDateString.call(this, locale, options);
    };
    Date.prototype.toLocaleTimeString = function(locale, options) {
      locale = locale || spoofedLocale;
      options = Object.assign({}, options, { timeZone: timezone });
      return origToLocaleTimeString.call(this, locale, options);
    };

    console.log("patchTimeZone: timezone/locale patch applied:", timezone, offsetMinutes, spoofedLocale);
  };
})();
