(function () {
  const g = window;
  // Starting ignore list for CDP interceptor: challenge domains are not touched
  const CH_PASS = ['.cloudflare.com','.challenge.cloudflare.com','.akamaihd.net','.perimeterx.net','.hcaptcha.com','.recaptcha.net'];
  g.__CDP_ALLOW_SUFFIXES   = g.__CDP_ALLOW_SUFFIXES   || [];
  g.__CDP_IGNORED_SUFFIXES = g.__CDP_IGNORED_SUFFIXES || [];
  CH_PASS.forEach(s => { if (!g.__CDP_IGNORED_SUFFIXES.includes(s)) g.__CDP_IGNORED_SUFFIXES.push(s); });
  function norm(s){ return !s ? s : (s[0] === "." ? s : "." + s); }
  function wire(){
    const api = g.HeadersInterceptor;
    if (!api) return;
    // 1) Поднять актуальные наборы из JS-интерсептора
    const allowFromJs  = (api.listAllow?.()  || []).map(norm);
    const ignoreFromJs = (api.listIgnore?.() || []).map(norm);

    g.__CDP_ALLOW_SUFFIXES   = Array.from(new Set([...(g.__CDP_ALLOW_SUFFIXES || []), ...allowFromJs]));
    g.__CDP_IGNORED_SUFFIXES = Array.from(new Set([...(g.__CDP_IGNORED_SUFFIXES || []), ...ignoreFromJs]));

    // 2) Обернуть методы, чтобы любые дальнейшие изменения синхронизировались
    const _addAllow  = api.addAllow?.bind(api);
    const _addIgnore = api.addIgnore?.bind(api);

    if (_addAllow) {
      api.addAllow = function(s){
        try { _addAllow(s); } finally {
          s = norm(s);
          if (s && !g.__CDP_ALLOW_SUFFIXES.includes(s)) g.__CDP_ALLOW_SUFFIXES.push(s);
        }
      };
    }
    if (_addIgnore) {
      api.addIgnore = function(s){
        try { _addIgnore(s); } finally {
          s = norm(s);
          if (s && !g.__CDP_IGNORED_SUFFIXES.includes(s)) g.__CDP_IGNORED_SUFFIXES.push(s);
        }
      };
    }
    g.__HEADERS_BRIDGE_READY__ = true;
    console.log("[headers_interceptor.js] CDP bridge ready");
  }

  if (document.readyState === "complete" || document.readyState === "interactive") wire();
  else g.addEventListener("DOMContentLoaded", wire);
})();
//# sourceURL=headers_bridge.js
