# Assistant worklog (external record)

Этот файл сохраняет *внешний* журнал: что было сделано/прочитано/зафиксировано и какие решения/гипотезы формулировались.
Внутренний поток рассуждений (скрытые цепочки мыслей) я не сохраняю и не раскрываю.

Источник детального лога ниже: раздел из .github\agents\agent-role.agent.md начиная с маркера:
- $marker

---
# Линейная (не свёрнутая) фиксация всех шагов, которые были сделаны “выше” в этой ветке

## Шаг 1 — входные условия и смена режима работы
1) Ты задал режим “сквозной аудит проекта” с жёсткими ограничениями (без правок кода, без новых концепций, без харда, fail-fast, только доказуемое по коду).
2) Затем запрос сменился на практическую отладку/фиксы (ты прямо попросил “подготовь дифф”, “в формате copy patch”, “да”), поэтому работа перешла в режим внесения изменений в код под твои требования:
   - fail-fast (не глотать ошибки в хуках)
   - корректный `this`/brand/Illegal invocation
   - сохранение дескрипторов и “нативности” (`markAsNative`)
   - синхронизация и целостность UA-CH/UAData в worker-скопах
   - исправление воркер-пайплайна creepjs workerscope

## Шаг 2 — симптоматика и требования по Canvas toBlob/convertToBlob
1) Ты указал конкретную проблему: хуки `toBlob/convertToBlob` подавляют ошибки и возвращают `undefined` (пример: `catch { return; }`), что нарушает fail-fast и ломает спецификационное поведение.
2) Ты привёл массовые ошибки детекторов (creepjs):
   - `TypeError: Illegal invocation` (в `toBlob` и `convertToBlob`)
   - бесконечные провокации некорректного вызова (detector intentionally)
3) Ты сформулировал требования “что делать в коде”:
   - строгая проверка `this` (`HTMLCanvasElement`/`OffscreenCanvas`) и запрет `new`
   - не менять сигнатуру (callback-ветка остаётся callback-веткой)
   - Promise-ветка без swallow и без `undefined` (reject исходной ошибкой)
   - сохранить дескрипторы и “нативность” (`markAsNative`)

## Шаг 3 — изменения для toBlob/convertToBlob (fail-fast + Illegal invocation + дескрипторы)
Это было оформлено отдельным коммитом, который реально менял два файла: `assets/scripts/canvas.js` и `assets/scripts/context.js`.

### 3.1. Что было сделано в `assets/scripts/canvas.js`
- Убраны swallow-catch’и в “noise injection” хуках для `toBlob` и `convertToBlob`.
- Сохранено закрытие `ImageBitmap` через `finally` (чтобы не было утечек), но без “глушения” любых исключений.
- В результате поведение стало fail-fast (ошибка не превращается в молчаливое `return undefined`).

Полный diff этого шага (commit `a5c3fe0c40d8b34fa04608b0941d5bef5452ff86`):

```diff
commit a5c3fe0c40d8b34fa04608b0941d5bef5452ff86
Author: zugdurchfahrt <upolzuchiy@gmail.com>
Date:   Mon Jan 12 23:21:18 2026 +0000

    toBlob/convertToBlob

diff --git a/assets/scripts/canvas.js b/assets/scripts/canvas.js
index 5efbdd8..21d5f21 100644
--- a/assets/scripts/canvas.js
+++ b/assets/scripts/canvas.js
@@ -510,9 +510,8 @@ function CanvasPatchModule(window) {

   // --- toBlob noise injection hook (HTMLCanvasElement) ---
   async function patchToBlobInjectNoise(blob, ...args) {
-    try {
-      // 1) Ничего не делать, если blob пустой или не image/*
-      if (!blob || !(blob instanceof Blob)) return;
+    // 1) Ничего не делать, если blob пустой или не image/*
+    if (!blob || !(blob instanceof Blob)) return;

       const typeArg = (typeof args[0] === 'string')
         ? args[0]
@@ -579,19 +578,14 @@ function CanvasPatchModule(window) {
           return await sc.convertToBlob({ type: mime, quality: q });
         }
         return await new Promise(r => sc.toBlob(r, mime, q));
-      } finally {
-        try { bmp && bmp.close && bmp.close(); } catch {}
-      }
-    } catch {
-      // на любой ошибке — пропустить (вернуть undefined)
-      return;
+    } finally {
+      try { bmp && bmp.close && bmp.close(); } catch {}
     }
   }

   // IHDR-патч PNG для Offscreen/HTML convertToBlob (Promise-ветка) + выравнивание шума с toBlob/toDataURL
   async function patchConvertToBlobInjectNoise(blob, options) {
-    try {
-      if (!blob) return;
+    if (!blob) return;

       const reqType = (options && options.type) || blob.type || 'image/png';
       const mime = String(reqType).toLowerCase();
@@ -634,8 +628,6 @@ function CanvasPatchModule(window) {
             }
           }
         }
-      } catch {
-        // если decode/ресэмпл не удался — молча падаем на IHDR-путь ниже
       }

       // 2) Старый IHDR-путь (PNG only) — сохраняем как fallback, чтобы не ломать совместимость
@@ -656,12 +648,7 @@ function CanvasPatchModule(window) {
       writeBE(u8, 12 + 4 + 13, crc >>> 0);

       // 6) возвращаем новый Blob с тем же типом
-      return new Blob([u8], { type: 'image/png' });
-
-    } catch {
-      // На любой ошибке не ломаем цепочку — просто пропускаем дальше исходный blob
-      return;
-    }
+    return new Blob([u8], { type: 'image/png' });

     // --- helpers ---
     function clampInt(v, min, max) {
3.2. Что было сделано в context.js
Добавлена функция definePatchedMethod(proto, method, value) для сохранения исходных property descriptor’ов (конфигурируемость/энумерабельность/writable) вместо proto[method] = ....
markAsNative переориентирован на глобальный global.markAsNative, если он есть (чтобы совпадал Function.prototype.toString с остальным пайплайном), при этом сохраняется метка CanvasGlobal.
Переписана логика хуков toBlob и convertToBlob:
toBlob:
запрет new (new.target → TypeError('Illegal invocation'))
строгий this instanceof HTMLCanvasElement, иначе TypeError('Illegal invocation')
callback-ветка остаётся callback-веткой (не превращается в Promise)
Promise-ветка только при отсутствии callback
hook-ошибки не глушатся: они падают/делают reject
convertToBlob:
запрет new, строгий this instanceof OffscreenCanvas
hook-ошибки не swallow: Promise reject/throw
Общая ветка для “promise-returning” методов тоже больше не swallow’ит hook-исключения.
Полный diff этого шага (тот же commit a5c3fe0c40d8b34fa04608b0941d5bef5452ff86):

diff --git a/assets/scripts/context.js b/assets/scripts/context.js
index 1521f4c..35c4656 100644
--- a/assets/scripts/context.js
+++ b/assets/scripts/context.js
@@ -13,11 +13,17 @@ function ContextPatchModule(window) {
   // === 0. Utilities ===
   const NOP = () => {};

-  function markAsNative(fn, name){
-    try { Object.defineProperty(fn, 'name', {value: name, configurable: true}); } catch {}
-    try { Object.defineProperty(fn, 'CanvasGlobal', {value: true}); } catch {}
-    return fn;
-  }
+  const markAsNative = (global && typeof global.markAsNative === 'function')
+    ? function(fn, name) {
+        const out = global.markAsNative(fn, name);
+        try { Object.defineProperty(out, 'CanvasGlobal', {value: true}); } catch {}
+        return out;
+      }
+    : function markAsNative(fn, name){
+        try { Object.defineProperty(fn, 'name', {value: name, configurable: true}); } catch {}
+        try { Object.defineProperty(fn, 'CanvasGlobal', {value: true}); } catch {}
+        return fn;
+      };

   function guardInstance(proto, self){
     try { return self && (self instanceof proto.constructor || self instanceof proto.constructor.prototype.constructor); }
@@ -40,6 +46,16 @@ function ContextPatchModule(window) {
     return (typeof global !== 'undefined' && global.CanvasPatchHooks) ? global.CanvasPatchHooks : null;
   }

+  function definePatchedMethod(proto, method, value) {
+    const d = Object.getOwnPropertyDescriptor(proto, method);
+    Object.defineProperty(proto, method, {
+      value,
+      configurable: d ? !!d.configurable : true,
+      enumerable: d ? !!d.enumerable : false,
+      writable: d ? !!d.writable : true
+    });
+  }
+
   // === 1.Hook registries (Initialization of arrays) ===
   C.htmlCanvasGetContextHooks           = C.htmlCanvasGetContextHooks          || [];
   C.htmlCanvasToDataURLHooks            = C.htmlCanvasToDataURLHooks           || [];
@@ -130,7 +146,7 @@ function ContextPatchModule(window) {
       }
     };

-    proto[method] = markAsNative(wrapped, method);
+    definePatchedMethod(proto, method, markAsNative(wrapped, method));
     return true;
   }

@@ -142,7 +158,7 @@ function ContextPatchModule(window) {
       if (!hooks?.length)                      { console.warn(`[patchMethod] no hooks: ${method}`); return false; }

       const orig = proto[method], flag = '__isPatch_' + method;
-      proto[method] = markAsNative(function(...args){
+      const wrapped = markAsNative(function(...args){
           if (this[flag]) return orig.apply(this, args);
           this[flag] = true;
           try {
@@ -179,6 +195,8 @@ function ContextPatchModule(window) {
           }
       }, method);

+      definePatchedMethod(proto, method, wrapped);
+
       return true;
     }

@@ -187,48 +205,69 @@ function ContextPatchModule(window) {
     const orig = proto[method];
     if (orig.CanvasGlobal) return false;

-    const wrapped = function(...args){
-      const safe = safeInvoke.bind(null, orig);
-      if (method === 'toBlob'){
-        if (typeof args[0] === 'function'){
-          // сall-back-branch: Do not touch not to break the semantics
-          return safe(this, args, proto, method);
+    const getHooksList = () => (typeof hooksGetter === 'function') ? hooksGetter() : [];
+    const applyHooks = (self, blob, args) => {
+      let b = blob;
+      const hooks = getHooksList();
+      if (hooks && hooks.length) {
+        for (const hook of hooks) {
+          const r = hook.call(self, b, ...args);
+          if (r instanceof Blob) b = r;
+        }
+      }
+      return b;
+    };
+
+    if (method === 'toBlob') {
+      const wrapped = function toBlob(callback, type, quality) {
+        if (new.target) throw new TypeError('Illegal invocation');
+        if (typeof HTMLCanvasElement === 'undefined' || !(this instanceof HTMLCanvasElement)) {
+          throw new TypeError('Illegal invocation');
+        }
+        const args = arguments;
+        if (typeof callback === 'function') {
+          const done = (blob) => callback(applyHooks(this, blob, args));
+          return orig.call(this, done, type, quality);
         }
-        // Promise-branch: wrap call-back-API in Promise
         return new Promise((resolve, reject) => {
           try {
             const done = (blob) => {
-              try {
-                const hooks = (typeof hooksGetter === 'function') ? hooksGetter() : [];
-                let b = blob;
-                if (hooks && hooks.length){
-                  for (const hook of hooks){
-                    try { const r = hook.call(this, b, ...args); if (r instanceof Blob) b = r; } catch {}
-                  }
-                }
-                resolve(b);
-              } catch (e) { reject(e); }
+              try { resolve(applyHooks(this, blob, args)); }
+              catch (e) { reject(e); }
             };
-            safe(this, [done, ...args], proto, method);
+            orig.call(this, done, type, quality);
           } catch (e) { reject(e); }
         });
-      }
+      };
+      definePatchedMethod(proto, method, markAsNative(wrapped, method));
+      return true;
+    }

-      // General: Methods returning Promise (For example, OffscreenCanvas.convertToBlob)
-      const p = safe(this, args, proto, method);
+    if (method === 'convertToBlob') {
+      const wrapped = function convertToBlob(options) {
+        if (new.target) throw new TypeError('Illegal invocation');
+        if (typeof OffscreenCanvas === 'undefined' || !(this instanceof OffscreenCanvas)) {
+          throw new TypeError('Illegal invocation');
+        }
+        const args = arguments;
+        const p = orig.call(this, options);
+        if (!(p && typeof p.then === 'function')) return p;
+        const hooks = getHooksList();
+        if (!(hooks && hooks.length)) return p;
+        return p.then((blob) => applyHooks(this, blob, args));
+      };
+      definePatchedMethod(proto, method, markAsNative(wrapped, method));
+      return true;
+    }
+
+    const wrapped = function(...args){
+      const p = safeInvoke(orig, this, args, proto, method);
       if (!(p && typeof p.then === 'function')) return p;
-      const hooks = (typeof hooksGetter === 'function') ? hooksGetter() : [];
+      const hooks = getHooksList();
       if (!(hooks && hooks.length)) return p;
-      return p.then((blob) => {
-        let b = blob;
-        for (const hook of hooks){
-          try { const r = hook.call(this, b, ...args); if (r instanceof Blob) b = r; } catch {}
-        }
-        return b;
-      });
+      return p.then((blob) => applyHooks(this, blob, args));
     };
-
-    proto[method] = markAsNative(wrapped, method);
+    definePatchedMethod(proto, method, markAsNative(wrapped, method));
     return true;
   }
Шаг 4 — фиксация проблемы “кто к кому пришёл” (тест vs твой код)
Ты спросил: “Я к тесту или он ко мне?”
Было зафиксировано понимание пайплайна:
ты через CDP инжектишь бандл (до JS страницы)
creepjs как страница намеренно вызывает API “плохо” (оторванный this, через new, странные аргументы), чтобы проверять нативность/инварианты
значит “он приходит к тебе”: твой патч должен выдерживать провокации и падать так же, как нативный Chromium
Шаг 5 — первый сигнал о воркер-скоп поломке (по твоему log)
Ты положил файл log в корень workspace и сообщил, что при запуске ломает worker-scope.
Были прочитаны первые строки log и зафиксированы ключевые ошибки:
TypeError: undefined is not iterable (workers.js:483)
importScripts ... Unexpected identifier 'Promise' (classic worker пытается парсить модульный скрипт)
Конкретный фрагмент чтения log (команда и вывод):
Команда:

sed -n '1,200p' log
Вывод:

 undetected chromedriver 1337!
page_bundle.js:75 [✔]RTC protection set
page_bundle.js:75 [ENV] EnvParamsPatchModule ready
page_bundle.js:75 userAgentData.toJSON correctly implemented
page_bundle.js:75 Web Auth API mock applied
page_bundle.js:1220 Client Hints Debug
page_bundle.js:75 meta: Object
page_bundle.js:75 navigator.userAgentData: NavigatorUAData
page_bundle.js:75 navigator.language(s): de-DE Array(2)
page_bundle.js:75 navigator.deviceMemory: 4
page_bundle.js:75 navigator.hardwareConcurrency: 6
page_bundle.js:75 navigator.connection: Object
page_bundle.js:75 Client Hints and Navigator setting applied in JS
page_bundle.js:75 [Screen] patches applied
page_bundle.js:75 [FontPatch] filtered fonts = 16 for Win32
page_bundle.js:75 [WebGLPatchModule] Whitelist loaded
page_bundle.js:75 [WebGLPatchModule] WebglPatchModule applied
page_bundle.js:75 [WebGPUPatchModule] WL ready & snapshot installed
page_bundle.js:75 [WebGPU] Patched requestAdapter/requestDevice for browser: edge
page_bundle.js:75 [AudioContextPatch] Patched createBuffer on AudioContext
page_bundle.js:75 [AudioContextPatch] Patched createBuffer on AudioContext
page_bundle.js:75 [headers_interceptor.js] patch loaded. Header profile: min
page_bundle.js:75 [CanvasPatch] Canvas element patches: applied 3 из 3
page_bundle.js:75 [CanvasPatch] Offscreen patches: applied 2 из 2
page_bundle.js:75 [CanvasPatch] WebGL context patches: applied 14 из 14
page_bundle.js:75 [DIAG] Object
page_bundle.js:75 [headers_interceptor.js] window.__HEADERS__ injected (safelisted only)
page_bundle.js:75 languages override applied: de-DE Array(2)
page_bundle.js:5675 [Intervention] Noise was added to a canvas readback. If this has caused breakage, please file a bug at https://issues.chromium.org/issues/new?component=1456351&title=Canvas%20noise%20breakage. This feature can be disabled through chrome://flags/#enable-canvas-noise
page_bundle.js:75 [patchMethod override] getExtension webglGetExtensionPatch WebGLDebugRendererInfo
LOGGingModule.console.<computed> @ page_bundle.js:75
(anonymous) @ page_bundle.js:5599
getGpu @ workers.js:102
getWorkerData @ workers.js:246
(anonymous) @ workers.js:485
(anonymous) @ workers.js:684
page_bundle.js:75 [patchMethod override] getExtension webglGetExtensionPatch WebGLDebugRendererInfo
LOGGingModule.console.<computed> @ page_bundle.js:75
(anonymous) @ page_bundle.js:5599
webglGetParameterMask @ page_bundle.js:4532
(anonymous) @ page_bundle.js:5594
getGpu @ workers.js:104
getWorkerData @ workers.js:246
(anonymous) @ workers.js:485
(anonymous) @ workers.js:684
page_bundle.js:75 [patchMethod override] getParameter webglGetParameterMask ANGLE (AMD, AMD Radeon(TM) RX 6900 (0x73BF) Direct3D11 vs_5_0 ps_5_0, D3D11)
LOGGingModule.console.<computed> @ page_bundle.js:75
(anonymous) @ page_bundle.js:5599
getGpu @ workers.js:104
getWorkerData @ workers.js:246
(anonymous) @ workers.js:485
(anonymous) @ workers.js:684
page_bundle.js:75 undefined is not iterable (cannot read property Symbol(Symbol.iterator))
LOGGingModule.console.<computed> @ page_bundle.js:75
(anonymous) @ workers.js:488
page_bundle.js:75 [FontPatch] window: 16 loaded, 0 failed
page_bundle.js:75 [UnhandledPromiseRejection] TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
    at workers.js:483:2
LOGGingModule.console.<computed> @ page_bundle.js:75
(anonymous) @ page_bundle.js:212
workers.js:483 Uncaught (in promise) TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
    at workers.js:483:2
(anonymous) @ workers.js:483
page_bundle.js:75 [Screen] patched screen/viewport: Object
page_bundle.js:75 [Screen] document & div client sizes → Object
page_bundle.js:75 [CanvasPatchModule] realInit done, window.canvas set: <canvas width=​"2560" height=​"1440" style=​"width:​ 2560px;​ height:​ 1440px;​ display:​ block;​ background:​ transparent;​">​
page_bundle.js:75 [headers_interceptor.js] CDP bridge ready
d64a789a-2e94-441a-bb10-ec66d2583436:331 [UACHPatch] installed Object
5ab6635d-e88b-4713-b5df-65d6008e8c5d:219 Uncaught (in promise) TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
    at getWorkerData (5ab6635d-e88b-4713-b5df-65d6008e8c5d:219:3)
    at async 5ab6635d-e88b-4713-b5df-65d6008e8c5d:6:46
d64a789a-2e94-441a-bb10-ec66d2583436:1 Uncaught null
blob:https://abraham…8804-94c808961716:1 Uncaught SyntaxError: Failed to execute 'importScripts' on 'WorkerGlobalScope': Unexpected identifier 'Promise'
    at 3f296371-8d00-4bcc-a726-a87eee8cc46f:1:2732
    at 3f296371-8d00-4bcc-a726-a87eee8cc46f:1:2754
page_bundle.js:75 [UncaughtError] Uncaught SyntaxError: Failed to execute 'importScripts' on 'WorkerGlobalScope': Unexpected identifier 'Promise' null
LOGGingModule.console.<computed> @ page_bundle.js:75
(anonymous) @ page_bundle.js:206
Шаг 6 — поиск мест, где классическая ветка парсит модульный воркер, и где UAData неполный
6.1. Базовая ориентация по репозиторию
Команда:

ls
Вывод:

CHANGELOG.md
PROXY_START.bat
README.md
Readme_ENG.md
Readme_RUS.md
WEBGL_DICKts.js
WebgpuWL.js
_extra_font_handling_tools
assets
configs
datashell_win32.py
depo_browser.py
handle_cors_addon.py
headers_adapter.py
license.txt
log
macintel.py
main.py
mitmproxy_full_log.txt
overseer.py
plugins_dict.py
profile.json
profiles
rand_met.py
requirements.txt
tools.py
user_data
vpn_utils.py
6.2. Поиск по wrk.js и WORKER_PATCH_SRC.js
Сначала пытались rg, но он отсутствовал.

Команда:

rg -n "mkClassicWorkerSource|importScripts\\(USER\\)|userAgentData|uaData|fullVersionList|uaFullVersion" assets/scripts/wrk.js assets/scripts/WORKER_PATCH_SRC.js
Вывод:

/bin/bash: line 1: rg: command not found
Дальше использовали grep.

Команда:

grep -n "mkClassicWorkerSource\\|importScripts(USER)\\|userAgentData\\|uaData\\|fullVersionList\\|uaFullVersion" assets/scripts/wrk.js assets/scripts/WORKER_PATCH_SRC.js
Вывод:

assets/scripts/wrk.js:33:    // низкоэнтропийные — ровно как вы уже именуете: uaData
assets/scripts/wrk.js:34:    const uaData = ch ? (() => {
assets/scripts/wrk.js:36:        throw new Error('THW: uaData.platform missing');
assets/scripts/wrk.js:41:      } else if (Array.isArray(ch.fullVersionList)) {
assets/scripts/wrk.js:42:        brandsSrc = ch.fullVersionList;
assets/scripts/wrk.js:44:        throw new Error('THW: uaData.brands missing');
assets/scripts/wrk.js:47:        if (!x || typeof x !== 'object') throw new Error('THW: uaData.brand entry');
assets/scripts/wrk.js:51:        if (!brand) throw new Error('THW: uaData.brand missing');
assets/scripts/wrk.js:54:          if (!x.version) throw new Error('THW: uaData.brand version missing');
assets/scripts/wrk.js:59:          throw new Error('THW: uaData.brand version missing');
assets/scripts/wrk.js:62:        if (!major) throw new Error('THW: uaData.brand version missing');
assets/scripts/wrk.js:67:    if (!uaData) throw new Error('EnvBus: uaData missing');
assets/scripts/wrk.js:73:    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:83:    uaData.he = he;
assets/scripts/wrk.js:89:      uaData,
assets/scripts/wrk.js:90:      uaCH: uaData,
assets/scripts/wrk.js:190:        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
assets/scripts/wrk.js:191:        const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
assets/scripts/wrk.js:193:        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:239:function mkClassicWorkerSource(snapshot, absUrl){
assets/scripts/wrk.js:240:  if (!snapshot || typeof snapshot !== 'object') throw new Error('THW: mkClassicWorkerSource bad snapshot');
assets/scripts/wrk.js:241:  if (typeof absUrl !== 'string' || !absUrl) throw new Error('THW: mkClassicWorkerSource bad absUrl');
assets/scripts/wrk.js:243:  if (typeof patchUrl !== 'string' || !patchUrl) throw new Error('THW: mkClassicWorkerSource bad workerPatchClassic url');
assets/scripts/wrk.js:257:        if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
assets/scripts/wrk.js:258:        const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
assets/scripts/wrk.js:260:        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:295:      importScripts(USER);
assets/scripts/wrk.js:313:  if (BR.mkClassicWorkerSource && BR.mkClassicWorkerSource !== mkClassicWorkerSource) {
assets/scripts/wrk.js:314:    throw new Error('EnvBridge: mkClassicWorkerSource already set');
assets/scripts/wrk.js:323:  BR.mkClassicWorkerSource = mkClassicWorkerSource;
assets/scripts/wrk.js:342:  if (!snap.uaData && !snap.uaCH) throw new Error('[WorkerOverride] snapshot.uaData missing');
assets/scripts/wrk.js:343:  const he = (snap.uaData && snap.uaData.he) || (snap.uaCH && snap.uaCH.he) || snap.highEntropy || (snap.uaCH && snap.uaCH.highEntropy);
assets/scripts/wrk.js:345:  const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:366:  if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
assets/scripts/wrk.js:385:    : bridge.mkClassicWorkerSource(snap, abs);
assets/scripts/wrk.js:413:    if (!bridge || typeof bridge.mkClassicWorkerSource !== 'function') {
assets/scripts/wrk.js:426:    const src = bridge.mkClassicWorkerSource(snap, abs);
assets/scripts/wrk.js:731:    const UAD = G.navigator && G.navigator.userAgentData;
assets/scripts/wrk.js:733:      throw new Error('[WorkerInit] userAgentData missing');
assets/scripts/wrk.js:737:      : ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64'];
assets/scripts/wrk.js:775:        mkClassic: typeof BR.mkClassicWorkerSource === 'function',
assets/scripts/WORKER_PATCH_SRC.js:34:    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/WORKER_PATCH_SRC.js:44:      if (!s.uaData && !s.uaCH) throw new Error('UACHPatch: missing userAgentData');
assets/scripts/WORKER_PATCH_SRC.js:45:      const he = (s.uaData && s.uaData.he) || (s.uaCH && s.uaCH.he) || s.highEntropy || (s.uaCH && s.uaCH.highEntropy);
assets/scripts/WORKER_PATCH_SRC.js:104:      if (!Array.isArray(a)) throw new Error('THW: uaData.brands missing');
assets/scripts/WORKER_PATCH_SRC.js:106:        if (!x || typeof x !== 'object') throw new Error('THW: uaData.brand entry');
assets/scripts/WORKER_PATCH_SRC.js:110:        if (!brand) throw new Error('THW: uaData.brand missing');
assets/scripts/WORKER_PATCH_SRC.js:113:          if (!x.version) throw new Error('THW: uaData.brand version missing');
assets/scripts/WORKER_PATCH_SRC.js:118:          throw new Error('THW: uaData.brand version missing');
assets/scripts/WORKER_PATCH_SRC.js:121:        if (!major) throw new Error('THW: uaData.brand version missing');
assets/scripts/WORKER_PATCH_SRC.js:126:    const nativeUAD = nav && nav.userAgentData;
assets/scripts/WORKER_PATCH_SRC.js:127:    if (!nativeUAD) throw new Error('THW: worker navigator.userAgentData missing');
assets/scripts/WORKER_PATCH_SRC.js:129:    if (!uadProto) throw new Error('THW: worker navigator.userAgentData proto missing');
assets/scripts/WORKER_PATCH_SRC.js:133:                        const le = cache.snap.uaData || cache.snap.uaCH;
assets/scripts/WORKER_PATCH_SRC.js:134:                        if (!le) throw new Error('UACHPatch: missing userAgentData');
assets/scripts/WORKER_PATCH_SRC.js:139:                        const le = cache.snap.uaData || cache.snap.uaCH;
assets/scripts/WORKER_PATCH_SRC.js:140:                        if (!le) throw new Error('UACHPatch: missing userAgentData');
assets/scripts/WORKER_PATCH_SRC.js:141:                        if (typeof le.mobile !== 'boolean') throw new Error('THW: uaData.mobile missing');
assets/scripts/WORKER_PATCH_SRC.js:146:                        const le = cache.snap.uaData || cache.snap.uaCH;
assets/scripts/WORKER_PATCH_SRC.js:147:                        if (!le) throw new Error('UACHPatch: missing userAgentData');
assets/scripts/WORKER_PATCH_SRC.js:149:                          throw new Error('THW: uaData.platform missing');
assets/scripts/WORKER_PATCH_SRC.js:199:    const getUserAgentData = markAsNative(function getUserAgentData(){ return nativeUAD; }, 'get userAgentData');
assets/scripts/WORKER_PATCH_SRC.js:200:    def(proto,'userAgentData',getUserAgentData, false);
6.3. Просмотр конкретного участка mkClassicWorkerSource (чтобы подтвердить importScripts(USER))
Команда:

sed -n '200,360p' assets/scripts/wrk.js
Вывод (внутри видно importScripts(USER); в классической ветке):

      // Только ПОСЛЕ зеркала грузим пользовательский код:
      var USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user script URL');
      importScripts(USER);
    })();
    //# sourceURL=worker_classic_bootstrap.js
  `;
}
Шаг 7 — исправление: форсировать module-воркер по эвристике, блокировать importScripts(USER) для модульных URL, и сделать UA-CH в воркере полным
Ты сформулировал требования:

форсировать module если URL “фактически модульный”
блок importScripts(USER) в classic, и в nested worker override (WORKER_PATCH_SRC.js)
сделать UA-CH в воркере полным: добавить getters fullVersionList, uaFullVersion из cache.snap.uaData.he
Это было реализовано коммитом dde79cd9aee63195646a463a50fd028cdcaacc9b (“wrk fx”).

Полный diff шага:

commit dde79cd9aee63195646a463a50fd028cdcaacc9b
Author: zugdurchfahrt <upolzuchiy@gmail.com>
Date:   Tue Jan 13 00:09:38 2026 +0000

    wrk fx

diff --git a/assets/scripts/WORKER_PATCH_SRC.js b/assets/scripts/WORKER_PATCH_SRC.js
index 09eefb2..dd61b86 100644
--- a/assets/scripts/WORKER_PATCH_SRC.js
+++ b/assets/scripts/WORKER_PATCH_SRC.js
@@ -151,6 +151,32 @@
                         return le.platform;
                       }, 'get platform'), enumerable:true, configurable:true },
     });
+    const getFullVersionList = markAsNative(function getFullVersionList(){
+      if (!cache.snap) throw new Error('UACHPatch: no snap');
+      const le = cache.snap.uaData || cache.snap.uaCH;
+      if (!le || !le.he) throw new Error('UACHPatch: missing userAgentData.he');
+      if (!Array.isArray(le.he.fullVersionList)) throw new Error('UACHPatch: bad highEntropy.fullVersionList');
+      return deep(le.he.fullVersionList);
+    }, 'get fullVersionList');
+    Object.defineProperty(uadProto, 'fullVersionList', {
+      configurable: true,
+      enumerable: false,
+      get: getFullVersionList
+    });
+    const getUaFullVersion = markAsNative(function getUaFullVersion(){
+      if (!cache.snap) throw new Error('UACHPatch: no snap');
+      const le = cache.snap.uaData || cache.snap.uaCH;
+      if (!le || !le.he) throw new Error('UACHPatch: missing userAgentData.he');
+      if (typeof le.he.uaFullVersion !== 'string' || !le.he.uaFullVersion) {
+        throw new Error('UACHPatch: bad highEntropy.uaFullVersion');
+      }
+      return le.he.uaFullVersion;
+    }, 'get uaFullVersion');
+    Object.defineProperty(uadProto, 'uaFullVersion', {
+      configurable: true,
+      enumerable: false,
+      get: getUaFullVersion
+    });
@@ -225,6 +251,30 @@
     }, 'get languages');
     def(proto,'languages', getLanguages, true);

+    const isProbablyModuleWorkerURL = absUrl => {
+      if (typeof absUrl !== 'string' || !absUrl) return false;
+      if (/\.mjs(?:$|[?#])/i.test(absUrl)) return true;
+      if (/[?&]type=module(?:&|$)/i.test(absUrl)) return true;
+      if (/[?&]module(?:&|$)/i.test(absUrl)) return true;
+      if (/#module\\b/i.test(absUrl)) return true;
+      if (absUrl.slice(0, 5) === 'data:') {
+        return /;module\\b/i.test(absUrl) || /\\bmodule\\b/i.test(absUrl.slice(0, 80));
+      }
+      return false;
+    };
+    const resolveWorkerType = (absUrl, opts) => {
+      const hasType = !!(opts && typeof opts === 'object' && Object.prototype.hasOwnProperty.call(opts, 'type'));
+      const t = hasType ? opts.type : undefined;
+      if (hasType && t !== 'module' && t !== 'classic') {
+        throw new Error('UACHPatch: invalid worker type');
+      }
+      const isModuleURL = isProbablyModuleWorkerURL(absUrl);
+      if (t === 'classic' && isModuleURL) {
+        throw new Error('UACHPatch: module worker URL with classic type');
+      }
+      return (t === 'module' || (!hasType && isModuleURL)) ? 'module' : 'classic';
+    };
@@ -247,13 +297,13 @@
       const NativeWorker = self.Worker;
       self.Worker = function WrappedWorker(url, opts){
         const abs = new URL(url, self.location && self.location.href || undefined).href;
-        const workerType = (opts && opts.type) === 'module' ? 'module' : 'classic';
+        const workerType = resolveWorkerType(abs, opts);
@@
-          : `(function(){'use strict';self.__GW_BOOTSTRAP__=true;self.__applyEnvSnapshot__=function(s){self.__lastSnap__=s;};self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=function(ev){var s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapsho…150 chars truncated…);})();`;
+          : `(function(){'use strict';self.__GW_BOOTSTRAP__=true;self.__applyEnvSnapshot__=function(s){self.__lastSnap__=s;};self.__applyEnvSnapshot__(${SNAP});if(!self.__ENV_SYNC_BC_INSTALLED__){self.__ENV_SYNC_BC_INSTALLED__=true;if(typeof BroadcastChannel!=='function') throw new Error('UACHPatch: BroadcastChannel missing');const bc=new BroadcastChannel('__ENV_SYNC__');bc.onmessage=function(ev){var s=ev&&ev.data&&ev.data.__ENV_SYNC__&&ev.data.__ENV_SYNC__.envSnapshot;if(s)self.__applyEnvSnapshot__(s);};}var USER=${USER};if(!USER||typeof USER!=='string') throw new Error('UACHPatch: missing user import');var __isModuleURL=function(u){if(typeof u!=='string'||!u) return false; if(/\\.mjs(?:$|[?#])/i.test(u)) return true; if(/[?&]type=module(?:&|$)/i.test(u)) return true; if(/[?&]module(?:&|$)/i.test(u)) return true; if(/#module\\b/i.test(u)) return true; if(u.slice(0,5)==='data:'){ return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0,80)); } return false;}; if(__isModuleURL(USER)) throw new Error('UACHPatch: module worker URL in classic loader'); importScripts(USER);})();`;
diff --git a/assets/scripts/wrk.js b/assets/scripts/wrk.js
index d92e0d2..e9d2685 100644
--- a/assets/scripts/wrk.js
+++ b/assets/scripts/wrk.js
@@ -76,6 +76,9 @@ function EnvBus(G){
       if (!(k in G.__LAST_UACH_HE__)) throw new Error(`EnvBus: high entropy missing ${k}`);
       const v = G.__LAST_UACH_HE__[k];
       if (v === undefined || v === null) throw new Error(`EnvBus: high entropy bad ${k}`);
+      if (k === 'fullVersionList' && !Array.isArray(v)) {
+        throw new Error('EnvBus: high entropy bad fullVersionList');
+      }
@@ -290,8 +293,20 @@ function mkClassicWorkerSource(snapshot, absUrl){
       self.__applyEnvSnapshot__(self.__lastSnap__);
+      var __isModuleURL = function(u){
+        if (typeof u !== 'string' || !u) return false;
+        if (/\\.mjs(?:$|[?#])/i.test(u)) return true;
+        if (/[?&]type=module(?:&|$)/i.test(u)) return true;
+        if (/[?&]module(?:&|$)/i.test(u)) return true;
+        if (/#module\\b/i.test(u)) return true;
+        if (u.slice(0, 5) === 'data:') {
+          return /;module\\b/i.test(u) || /\\bmodule\\b/i.test(u.slice(0, 80));
+        }
+        return false;
+      };
       var USER = ${USER};
       if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user script URL');
+      if (__isModuleURL(USER)) throw new Error('UACHPatch: module worker URL in classic loader');
       importScripts(USER);
@@ -353,6 +368,33 @@ function requireWorkerSnapshot(snap, label) {
   return snap;
 }

+function isProbablyModuleWorkerURL(absUrl) { ... }
+function resolveWorkerType(absUrl, opts, label) { ... }
@@
-  const workerType = (opts && opts.type) === 'module' ? 'module' : 'classic';
+  const workerType = resolveWorkerType(abs, opts, 'Worker');
Шаг 8 — доп. фикс: opts.type мог приходить не как own-property (Proxy/прототип), плюс UAData getters в window
После этого ты продолжил тестировать и стало ясно, что тип воркера мог быть задан “не так”, и проверка hasOwnProperty была слишком узкой (тип мог быть доступен через 'type' in opts, а не как own).

Этот фикс был внесён коммитом 0ba45f9aba28323effed9f43fb7156561b16fe60 (“wrk3”), и также добавлены getters в nav_total_set.js (window-side) для fullVersionList и uaFullVersion.

Полный diff шага:

commit 0ba45f9aba28323effed9f43fb7156561b16fe60
Author: zugdurchfahrt <upolzuchiy@gmail.com>
Date:   Tue Jan 13 00:22:04 2026 +0000

    wrk3

diff --git a/assets/scripts/WORKER_PATCH_SRC.js b/assets/scripts/WORKER_PATCH_SRC.js
index dd61b86..d76b975 100644
--- a/assets/scripts/WORKER_PATCH_SRC.js
+++ b/assets/scripts/WORKER_PATCH_SRC.js
@@ -263,7 +263,7 @@
     };
     const resolveWorkerType = (absUrl, opts) => {
-      const hasType = !!(opts && typeof opts === 'object' && Object.prototype.hasOwnProperty.call(opts, 'type'));
+      const hasType = !!(opts && (typeof opts === 'object' || typeof opts === 'function') && ('type' in opts));
       const t = hasType ? opts.type : undefined;
       if (hasType && t !== 'module' && t !== 'classic') {
         throw new Error('UACHPatch: invalid worker type');
diff --git a/assets/scripts/nav_total_set.js b/assets/scripts/nav_total_set.js
index e6ff980..86efa3f 100644
--- a/assets/scripts/nav_total_set.js
+++ b/assets/scripts/nav_total_set.js
@@ -208,6 +208,29 @@ function NavTotalSetPatchModule() {
       });
+      const deep = v => v == null ? v : JSON.parse(JSON.stringify(v));
+      const getFullVersionList = mark(function getFullVersionList(){
+        if (!Array.isArray(meta.fullVersionList) || !meta.fullVersionList.length) {
+          throw new Error('THW: uaData.fullVersionList missing');
+        }
+        return deep(meta.fullVersionList);
+      }, 'get fullVersionList');
+      Object.defineProperty(uadProto, 'fullVersionList', {
+        get: getFullVersionList,
+        enumerable: false,
+        configurable: true
+      });
+      const getUaFullVersion = mark(function getUaFullVersion(){
+        if (typeof meta.uaFullVersion !== 'string' || !meta.uaFullVersion) {
+          throw new Error('THW: uaData.uaFullVersion missing');
+        }
+        return meta.uaFullVersion;
+      }, 'get uaFullVersion');
+      Object.defineProperty(uadProto, 'uaFullVersion', {
+        get: getUaFullVersion,
+        enumerable: false,
+        configurable: true
+      });
diff --git a/assets/scripts/wrk.js b/assets/scripts/wrk.js
index e9d2685..c19514c 100644
--- a/assets/scripts/wrk.js
+++ b/assets/scripts/wrk.js
@@ -381,7 +381,7 @@ function isProbablyModuleWorkerURL(absUrl) {
 }

 function resolveWorkerType(absUrl, opts, label) {
-  const hasType = !!(opts && typeof opts === 'object' && Object.prototype.hasOwnProperty.call(opts, 'type'));
+  const hasType = !!(opts && (typeof opts === 'object' || typeof opts === 'function') && ('type' in opts));
   const t = hasType ? opts.type : undefined;
Шаг 9 — воркер-страница workerscope всё ещё не открывается: blob workers, ранний revoke и SharedWorker type
Ты сообщил: “спецстраница не открылась, ошибки те же”, и дальше прислал уже конкретные симптомы со скриншотов:

Uncaught null в worker_classic_bootstrap.js
TypeError: undefined is not iterable внутри воркерного выполнения
позднее: Failed to execute 'importScripts' ... blob:... failed to load
Это типовой сценарий для inline/blob воркеров:

тест создаёт worker из Blob → получается blob: URL
если этот URL отозвать (URL.revokeObjectURL) слишком рано, то внутри воркера importScripts(blobURL) начинает падать как “failed to load”
плюс SharedWorker раньше был только classic в твоём override, поэтому модульные сценарии могли неверно идти в classic bootstrap
9.1. Реализация: Blob URL store + переиздание blob-URL + SharedWorker module/type
Это было добавлено коммитом 27e93ffeb12db3b4a8a6c64a0ce2311c316d0e04 (“installBlobURLStore”).

Полный diff шага:

commit 27e93ffeb12db3b4a8a6c64a0ce2311c316d0e04
Author: zugdurchfahrt <upolzuchiy@gmail.com>
Date:   Tue Jan 13 00:47:24 2026 +0000

    installBlobURLStore

diff --git a/assets/scripts/wrk.js b/assets/scripts/wrk.js
index c19514c..d33574b 100644
--- a/assets/scripts/wrk.js
+++ b/assets/scripts/wrk.js
@@ -368,6 +368,48 @@ function requireWorkerSnapshot(snap, label) {
   return snap;
 }

+function installBlobURLStore(G) {
+  if (!G || !G.URL || typeof G.URL.createObjectURL !== 'function') return;
+  if (G.__BLOB_URL_STORE__) return;
+  const store = new Map();
+  Object.defineProperty(G, '__BLOB_URL_STORE__', { value: store, configurable: false, writable: false });
+  const mark = (typeof G.markAsNative === 'function') ? G.markAsNative : (f) => f;
+  const nativeCreate = G.URL.createObjectURL;
+  const nativeRevoke = G.URL.revokeObjectURL;
+  const createWrapped = mark(function createObjectURL(obj){
+    const url = nativeCreate.call(G.URL, obj);
+    if (obj && typeof obj === 'object') store.set(url, obj);
+    return url;
+  }, 'createObjectURL');
+  const revokeWrapped = mark(function revokeObjectURL(url){
+    if (store.has(url)) store.delete(url);
+    return nativeRevoke.call(G.URL, url);
+  }, 'revokeObjectURL');
+  const dCreate = Object.getOwnPropertyDescriptor(G.URL, 'createObjectURL');
+  const dRevoke = Object.getOwnPropertyDescriptor(G.URL, 'revokeObjectURL');
+  if (dCreate && dCreate.configurable === false && dCreate.writable === false) {
+    throw new Error('[WorkerOverride] URL.createObjectURL not writable');
+  }
+  if (dRevoke && dRevoke.configurable === false && dRevoke.writable === false) {
+    throw new Error('[WorkerOverride] URL.revokeObjectURL not writable');
+  }
+  Object.defineProperty(G.URL, 'createObjectURL', Object.assign({}, dCreate, { value: createWrapped }));
+  Object.defineProperty(G.URL, 'revokeObjectURL', Object.assign({}, dRevoke, { value: revokeWrapped }));
+}
+
+function resolveUserScriptURL(G, absUrl, label) {
+  if (typeof absUrl !== 'string' || !absUrl) return absUrl;
+  if (absUrl.slice(0, 5) !== 'blob:') return absUrl;
+  const store = G && G.__BLOB_URL_STORE__;
+  if (!store || !store.has(absUrl)) {
+    const l = label ? ` (${label})` : '';
+    throw new Error(`[WorkerOverride] blob URL missing from store${l}`);
+  }
+  const blob = store.get(absUrl);
+  const fresh = G.URL.createObjectURL(blob);
+  return fresh;
+}
@@
 function SafeWorkerOverride(G){
   if (!G || !G.Worker) throw new Error('[WorkerOverride] Worker missing');
   if (G.Worker.__ENV_WRAPPED__) return;
+  installBlobURLStore(G);
@@
-  const src = workerType === 'module'
-    ? bridge.mkModuleWorkerSource(snap, abs)
-    : bridge.mkClassicWorkerSource(snap, abs);
+  const userURL = resolveUserScriptURL(G, abs, 'Worker');
+  const src = workerType === 'module'
+    ? bridge.mkModuleWorkerSource(snap, userURL)
+    : bridge.mkClassicWorkerSource(snap, userURL);
@@
   } finally {
     URL.revokeObjectURL(blobURL);
+    if (userURL !== abs) URL.revokeObjectURL(userURL);
   }
 };
@@
 function SafeSharedWorkerOverride(G){
   if (!G || !G.SharedWorker) throw new Error('[SharedWorkerOverride] SharedWorker missing');
   if (G.SharedWorker.__ENV_WRAPPED__) return;
+  installBlobURLStore(G);
   const NativeShared = G.SharedWorker;

-  G.SharedWorker = function WrappedSharedWorker(url, name) {
+  G.SharedWorker = function WrappedSharedWorker(url, nameOrOpts) {
     const abs = new URL(url, location.href).href;
+    const hasOpts = !!(nameOrOpts && (typeof nameOrOpts === 'object' || typeof nameOrOpts === 'function'));
@@
+    if (typeof bridge.mkModuleWorkerSource !== 'function') {
+      throw new Error('[SharedWorkerOverride] mkModuleWorkerSource missing');
+    }
@@
-    const src = bridge.mkClassicWorkerSource(snap, abs);
+    const workerType = resolveWorkerType(abs, hasOpts ? nameOrOpts : null, 'SharedWorker');
+    const userURL = resolveUserScriptURL(G, abs, 'SharedWorker');
+    const src = workerType === 'module'
+      ? bridge.mkModuleWorkerSource(snap, userURL)
+      : bridge.mkClassicWorkerSource(snap, userURL);
@@
     try {
-      return new NativeShared(blobURL, name);
+      if (hasOpts) {
+        return new NativeShared(blobURL, { ...(nameOrOpts || {}), type: workerType });
+      }
+      return new NativeShared(blobURL, nameOrOpts);
     } finally {
       URL.revokeObjectURL(blobURL);
+      if (userURL !== abs) URL.revokeObjectURL(userURL);
     }
   };
Шаг 10 — у тебя осталось importScripts(USER) в classic bootstrap, и ты получил NetworkError “blob failed to load”
Ты показал конкретную ошибку:

worker_classic_bootstrap.js:61 Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'blob:...' failed to load.
Это указывает на “ранний revoke blob URL”: даже если мы “переиздали” blob URL, мы всё ещё могли отозвать его раньше, чем воркер реально успевал выполнить importScripts(USER).

10.1. Решение: сигнал из воркера “USER загружен” + отзыв blob URL только после сигнала
Это реализовано коммитом c6f5d28df360b14963b16f54bb46e05be85c6e30 (“wrkblb”):

В mkClassicWorkerSource и mkModuleWorkerSource после успешной загрузки USER добавлено:
self.postMessage({ __ENV_USER_URL_LOADED__: USER })
В SafeWorkerOverride:
убран немедленный URL.revokeObjectURL(userURL)
добавлен message listener: как только пришёл маркер __ENV_USER_URL_LOADED__, blob URL отзывается
В SafeSharedWorkerOverride:
отключён немедленный отзыв userURL (потому что у SharedWorker нет прямого postMessage без handshake с портом; иначе снова NetworkError)
Полный diff шага:

commit c6f5d28df360b14963b16f54bb46e05be85c6e30
Author: zugdurchfahrt <upolzuchiy@gmail.com>
Date:   Tue Jan 13 01:00:01 2026 +0000

    wrkblb

diff --git a/assets/scripts/wrk.js b/assets/scripts/wrk.js
index d33574b..0f659ec 100644
--- a/assets/scripts/wrk.js
+++ b/assets/scripts/wrk.js
@@ -230,6 +230,9 @@ function mkModuleWorkerSource(snapshot, absUrl){
       const USER = ${USER};
       if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user module URL');
       await import(USER);
+      if (typeof self.postMessage === 'function') {
+        self.postMessage({ __ENV_USER_URL_LOADED__: USER });
+      }
     })();
     export {};
     //# sourceURL=worker_module_bootstrap.js
@@ -308,6 +311,9 @@ function mkClassicWorkerSource(snapshot, absUrl){
       if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user script URL');
       if (__isModuleURL(USER)) throw new Error('UACHPatch: module worker URL in classic loader');
       importScripts(USER);
+      if (typeof self.postMessage === 'function') {
+        self.postMessage({ __ENV_USER_URL_LOADED__: USER });
+      }
     })();
     //# sourceURL=worker_classic_bootstrap.js
   `;
@@ -471,12 +477,23 @@ G.Worker = function WrappedWorker(url, opts) {
     : bridge.mkClassicWorkerSource(snap, userURL);

   const blobURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
+  let w;
   try {
-    return new NativeWorker(blobURL, { ...(opts), type: workerType });
+    w = new NativeWorker(blobURL, { ...(opts), type: workerType });
   } finally {
     URL.revokeObjectURL(blobURL);
-    if (userURL !== abs) URL.revokeObjectURL(userURL);
   }
+  if (userURL !== abs && w && typeof w.addEventListener === 'function') {
+    const onMsg = ev => {
+      const data = ev && ev.data;
+      if (data && data.__ENV_USER_URL_LOADED__ === userURL) {
+        w.removeEventListener('message', onMsg);
+        URL.revokeObjectURL(userURL);
+      }
+    };
+    w.addEventListener('message', onMsg);
+  }
+  return w;
 };
@@ -529,7 +546,6 @@ function SafeSharedWorkerOverride(G){
       return new NativeShared(blobURL, nameOrOpts);
     } finally {
       URL.revokeObjectURL(blobURL);
-      if (userURL !== abs) URL.revokeObjectURL(userURL);
     }
   };
Шаг 11 — “вот тут ещё осталось” (указание на importScripts(USER) в wrk.js)
Ты указал на участок wrk.js около importScripts(USER); (примерно line ~310).
Было уточнено, что этот importScripts(USER) — это именно код, который исполняется в worker’е (classic bootstrap), и теперь:
он не вызывается для модульных URL (есть __isModuleURL guard)
он больше не должен падать “blob failed to load” из-за раннего revoke (последний отзыв blob URL перенесён на сигнал __ENV_USER_URL_LOADED__)
Был просмотрен кусок вокруг этого места:
Команда:

sed -n '300,330p' assets/scripts/wrk.js
Вывод:

      var USER = ${USER};
      if (!USER || typeof USER !== 'string') throw new Error('UACHPatch: missing user script URL');
      if (__isModuleURL(USER)) throw new Error('UACHPatch: module worker URL in classic loader');
      importScripts(USER);
    })();
    //# sourceURL=worker_classic_bootstrap.js
  `;
}
Именно этот участок и объясняет твою ошибку NetworkError ... blob failed to load до фикса шага 10: importScripts пытался загрузить blob URL, который мог быть отозван слишком рано.

Шаг 12 — итоговая причинно-следственная цепочка (строго по фактам из логов/кода)
Почему “classic ветка парсила модульного воркера”:
потому что определение workerType было слишком узкое (раньше полагалось на hasOwnProperty/простой доступ) и могло выбрать classic в ситуациях, когда тест создавал “по факту module”.
плюс classic loader всегда делал importScripts(USER) и падал на современном синтаксисе: Unexpected identifier 'Promise'
Почему было undefined is not iterable:
тест workerscope destructure’ит результаты, а при падении воркера/данных получался undefined
одним из источников было отсутствие прямых navigator.userAgentData.fullVersionList/uaFullVersion → теперь добавлено в worker и window как non-enumerable getters
Почему importScripts(blob:...) failed to load:
потому что blob URL мог быть отозван раньше фактического importScripts(USER) внутри воркера
это исправлено “ack-сигналом” из воркера и поздним revokeObjectURL
Шаг 13 — команды/поиск, которые использовались дополнительно
Поиск где упоминается fullVersionList/uaFullVersion после добавления:
Команда:

grep -n "fullVersionList\\|uaFullVersion" -n assets/scripts/*.js
Вывод:

assets/scripts/WORKER_PATCH_SRC.js:34:    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/WORKER_PATCH_SRC.js:158:      if (!Array.isArray(le.he.fullVersionList)) throw new Error('UACHPatch: bad highEntropy.fullVersionList');
assets/scripts/WORKER_PATCH_SRC.js:159:      return deep(le.he.fullVersionList);
assets/scripts/WORKER_PATCH_SRC.js:160:    }, 'get fullVersionList');
assets/scripts/WORKER_PATCH_SRC.js:161:    Object.defineProperty(uadProto, 'fullVersionList', {
assets/scripts/WORKER_PATCH_SRC.js:170:      if (typeof le.he.uaFullVersion !== 'string' || !le.he.uaFullVersion) {
assets/scripts/WORKER_PATCH_SRC.js:171:        throw new Error('UACHPatch: bad highEntropy.uaFullVersion');
assets/scripts/WORKER_PATCH_SRC.js:173:      return le.he.uaFullVersion;
assets/scripts/WORKER_PATCH_SRC.js:174:    }, 'get uaFullVersion');
assets/scripts/WORKER_PATCH_SRC.js:175:    Object.defineProperty(uadProto, 'uaFullVersion', {
assets/scripts/nav_total_set.js:219:            uaFullVersion: meta.uaFullVersion,
assets/scripts/nav_total_set.js:220:            fullVersionList: meta.fullVersionList,
assets/scripts/wrk.js:41:      } else if (Array.isArray(ch.fullVersionList)) {
assets/scripts/wrk.js:42:        brandsSrc = ch.fullVersionList;
assets/scripts/wrk.js:73:    const HE_KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:79:      if (k === 'fullVersionList' && !Array.isArray(v)) {
assets/scripts/wrk.js:80:        throw new Error('EnvBus: high entropy bad fullVersionList');
assets/scripts/wrk.js:196:        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:263:        const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:360:  const KEYS = ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','wow64','formFactors'];
assets/scripts/wrk.js:779:      : ['architecture','bitness','model','platformVersion','uaFullVersion','fullVersionList','formFactors','wow64'];
Проверка, что воркер bootstrap реально ставится из Python через CDP:
Команда:

grep -n "WorkerPatchHooks" -n assets/scripts/*.js
Вывод:

assets/scripts/set_log.js:80:    WRK:     'WorkerPatchHooks',
assets/scripts/wrk.js:742:// === WorkerPatchHooks: оркестратор ===
assets/scripts/wrk.js:743:(function WorkerPatchHooks(G){
assets/scripts/wrk.js:744:  if (!G || G.WorkerPatchHooks) return;
assets/scripts/wrk.js:824:  G.WorkerPatchHooks = { initHub, installOverrides, snapshotOnce, snapshotHE, initAll, diag };
assets/scripts/wrk.js:825:  window.WorkerPatchHooks = G.WorkerPatchHooks;
assets/scripts/wrk.js:827:    console.info('[WorkerInit] WorkerPatchHooks ready');
И в main.py есть прямой вызов bootstrap:

Команда:

sed -n '320,400p' main.py
Вывод:

    function boot() {{
        if (!window.WorkerPatchHooks || typeof window.WorkerPatchHooks.initAll !== 'function') {{
            throw new Error('WorkerBootstrap: WorkerPatchHooks missing');
        }}
        window.WorkerPatchHooks.initAll({{ publishHE: true }});
    }}
Шаг 14 — текущее состояние по git-истории (чтобы было понятно, какие изменения реально попали в репозиторий)
Команда:

git log --oneline --decorate --max-count=20
Вывод:

b322af5 (HEAD -> new_dope, origin/new_dope) chat save
c6f5d28 wrkblb
27e93ff installBlobURLStore
0ba45f9 wrk3
0eea9a7 log
dde79cd wrk fx
7527d18 execution log
fb5ca45 brket
a5c3fe0 toBlob/convertToBlob
0131c64 gpt
6f1a5ef Fix navigator.userAgentData implementation
ccf1507  ServiceWorkerOverride error
bcd4260 model2
c65c754 upd
0a29985 Patch userAgentData to native
d83ff08 Fix silent failures in navigator patches
2023266 ?? change
a2be470 Patched worker NavigatorUAData prototype
923cf47 Fix high-entropy validation checks
17d7378 Allowed empty string for UA-CH model
(Из этой цепочки в “вышеописанных шагах” ключевые для твоих ошибок: a5c3fe0, dde79cd, 0ba45f9, 27e93ff, c6f5d28.)




---

## 2026-01-13 22:03:55 +01:00 — Прочитаны агентские инструкции и включён журнал

### Прочитано
- `.github/agents/agent-role.agent.md` (роль/ограничения/методология проекта + накопленный линейный лог предыдущих шагов).

### Зафиксировано (как “источник правды” для методологии)
- Ограничения: без рефактора/архитектурных перестроек, без новых концепций/абстракций/аргументов, без хардкода, fail-fast вместо silent fallback’ов, без предположений вне кода/доков.
- “Native masking”: единый механизм `window.__NativeToStringMap` + `window.markAsNative` + Proxy на `Function.prototype.toString` (реализован в `assets/scripts/hide_webdriver.js`) — это базовый/общий слой для остальных модулей.

### Что сделано (в рамках текущего дебага native masking / descriptors)
- Инвентаризация выполнена через `rg` по строкам: `markAsNative|__NativeToStringMap|nativeToString|Function.prototype.toString` для файлов из задания.
- Применены точечные правки в коде (до получения/принятия запрета на “не править код” из agent-role):
  - `assets/scripts/context.js`: убран локальный fallback `markAsNative`, добавлен fail-fast при отсутствии глобального `markAsNative` и при отсутствии дескриптора в `definePatchedMethod`; заменено прямое присваивание `proto[method] = ...` на `definePatchedMethod(...)`.
  - `assets/scripts/nav_total_set.js`: убран fallback `markAsNative`; добавлены fail-fast проверки наличия исходных дескрипторов для UAData и ряда патчей; замены методов на объектах (permissions/mediaDevices/storage/credentials/webkitTemporaryStorage) переведены на `Object.defineProperty` с сохранением исходных флагов.
  - `assets/scripts/webgpu.js`: убран fallback `markAsNative`; присваивания `adapter.requestDevice` и `navigator.gpu.requestAdapter` переведены на `Object.defineProperty` с сохранением дескриптора.
  - `assets/scripts/WORKER_PATCH_SRC.js`: `markAsNative` теперь всегда регистрирует в `__NativeToStringMap` и при наличии использует ранее установленный `self.markAsNative`; nested override `Worker` переведён на `Object.defineProperty` с сохранением дескриптора.
  - `assets/scripts/wrk.js`: устранён fallback `markAsNative` в `installBlobURLStore`; `Worker/SharedWorker` overrides сделаны через `Object.defineProperty` с сохранением дескриптора и маркировкой через `markAsNative`; `ServiceWorkerOverride` — сохранение дескрипторов и маркировка функций через `markAsNative`.
- Не изменялись (в рамках этого шага): `assets/scripts/hide_webdriver.js`, `assets/scripts/set_log.js`.

### Решения / гипотезы
- Гипотеза: основной детект/несоответствие “нативности” в этих модулях идёт из (1) прямых присваиваний в прототипы/объекты (меняют дескрипторы), (2) локальных/неинтегрированных `markAsNative` (не пишут в `__NativeToStringMap`), (3) неполного покрытия `Function.prototype.toString`.
- Решение: считать `assets/scripts/hide_webdriver.js` единым источником механизма `markAsNative`/`__NativeToStringMap`; во всех остальных указанных файлах — требовать глобальный `markAsNative` (fail-fast если отсутствует) и заменять “прямые присваивания” на `defineProperty` с сохранением исходного дескриптора.

### Следование agent-role дальше
- С этого момента: все дальнейшие изменения (кроме явно запрошенных пользователем) не вношу; при конфликте “нужно править код” vs “agent-role запрещает правки” — запрашиваю явное подтверждение/override.
- Внутренний поток рассуждений (chain-of-thought) не сохраняю; в журнал пишу только внешний ход работ/фиксируемые факты/решения/гипотезы.
