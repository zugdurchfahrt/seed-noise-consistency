# Proxy Mechanics Registry

Format: `object/provider [wrapperClass=...] --- mechanic`
Scope: modules injected by `sunami/main.py` (`build_page_bundle`) and related new-document patches.

## wrapperClass (CORE2.0 vCurrent)

Норматив (см. `Samples4Context/CORE2.0-vCurrent.md`): **для каждого wrapper-target до apply обязателен выбор `wrapperClass`** и фиксация в diag/registry; data-only descriptor path фиксируется как `descriptor_data` (без wrapperClass).

Текущая реализация в Core оперирует полем `wrapLayer` внутри `Core.applyTargets` (`sunami/assets/scripts/window/core/core_window.js`):
- `descriptor_only` — descriptor redefine без Proxy; для `kind=data` это data-descriptor путь без создания wrapper-функций.
- `named_wrapper` — именованный wrapper + `__ensureMarkAsNative` (без Proxy).
- `named_wrapper_strict` — accessor strict-контракт (apply на `descriptorOwner`, shape-guard, execution через `__wrapNativeAccessor`/Proxy).
- `core_wrapper` — Proxy-wrapper (`__wrapNativeApply`/`__wrapNativeAccessor`/`__wrapNativeCtor`).
- `auto` — legacy-режим Core-реализации; в registry-контрактах не допускается.

Маппинг в терминах `wrapperClass` из методологии:
- `synthetic_named` ⇔ `wrapLayer=named_wrapper` (именованный wrapper + `__ensureMarkAsNative`, без Proxy).
- `core_proxy` ⇔ `wrapLayer=core_wrapper` или `wrapLayer=named_wrapper_strict`, а также прямое использование `__wrapNative*` / Core `Function.prototype.toString` bridge.

Нормативные опоры (MDN/WHATWG):
- `Function.prototype.toString`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString
- `Proxy` get invariants: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
- `Object.defineProperty`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
- WebIDL invocation-check: https://webidl.spec.whatwg.org/

Семантический контракт (норматив):
- `descriptor_data` = не создаём новые функции (меняем только descriptor fields/flags).
- `wrapper_*` = создаём/меняем `get`/`set` функцию-обёртку.
- Для `kind=accessor` `wrapLayer='descriptor_only'` не применяется: accessor-target либо использует wrapper-path (меняет `get/set`), либо пропускается (native/skip).

⚠️ `wrapLayer=auto` не допускается в registry-контрактах.


##  Proxy use (outside `Function.prototype.toString`)

### Allowed (only)

1. `Core.applyTargets(...)` с явным `wrapLayer` из списка:

   * `descriptor_only` (только `kind=data`, без новых функций),
   * `named_wrapper` (`synthetic_named`, без Proxy),
   * `named_wrapper_strict` (accessor strict, core_proxy),
   * `core_wrapper` (core_proxy: `__wrapNativeApply/__wrapNativeAccessor/__wrapNativeCtor`).

2. Любое исполнение оригинала в apply/get/set идёт native-first через `Reflect.apply(orig, receiver, args)`; invalidThis/brand проверка делегируется движку (engine-throw pass-through).

### Forbidden (hard)

A) `wrapLayer='auto'` и любые implicit-auto контракты (targets без `wrapLayer`).
B) module-local “вторые мосты” `Function.prototype.toString` / `__NativeToString*` / `__TOSTRING_*` / отдельные WeakMap-реестры меток. Пример класса нарушений: самостоятельная установка глобального toString-bridge в `RTCPeerConnection.js` (локальные `__NativeToString/__NativeToStringMap` и `__TOSTRING_PROXY_INSTALLED__`).
C) Object-proxy (Proxy на возвращаемых объектах) запрещён по умолчанию; допускается только как “masked return-object view” в явно перечисленных кейсах реестра (напр. `TextMetrics proxy view`) и не должен нарушать ownKeys/descriptor-инварианты.

### Gate (enforcement)

Если миграция конкретного target в `core_proxy` не уменьшает brand/receiver/descriptor класс ошибок и увеличивает proxy-анома́лии (recursion/reflect-set-proto/object-toString), target возвращается на прежний путь (обычно `synthetic_named` или `descriptor_only`) и фиксируется как “no-proxy-by-gate”.



### Минимальный чистый контракт для accessor-targets (норматив для targets)

- `Core.applyTargets(kind=accessor, wrapLayer='named_wrapper_strict', policy='strict')` [wrapperClass=core_proxy] --- жёсткий descriptor-контракт: preflight обязан найти `origDesc` и `descriptorOwner` по proto-chain; `defineProperty` делается только на `descriptorOwner`; shape change `accessor -> data` запрещён, кроме явного `allowShapeChange=true`; `enumerable/configurable` берутся из `origDesc`; `set` переносится из `origDesc` как есть (включая `undefined/null`); `get=wrappedGet`.
- `wrappedGet` для `named_wrapper_strict` [wrapperClass=core_proxy] --- getter исполняется через `__wrapNativeAccessor` (Proxy-target = native getter), invalid-this путь делегируется в native getter через `Reflect.apply`.
- `Core.applyTargets(kind=accessor, wrapLayer='auto')` [wrapperClass=unsupported] --- не допускается.

### Контракт trace (зачем wrapperClass обязателен)

Core2.0 trace-контракт построен так, чтобы:
1) не ломать дескрипторы/флаги и owner-инвариант (планируется `descriptorOwner`, хранится `origDesc`);
2) не терять receiver/brand (класс `invokeClass` и политика `invalidThis`);
3) не раздувать Proxy-pressure без необходимости (выбор `wrapLayer`).

Практическая схема выбора (эталон для модулей):
- `kind=data` ⇒ `wrapLayer='descriptor_only'` (`descriptor_data`, без создания новых функций).
- `kind=accessor` и нужен строгий descriptor-owner/shape контракт ⇒ `wrapLayer='named_wrapper_strict'` + `policy='strict'` (`wrapperClass=core_proxy`).
- `kind` ∈ (`method`,`promise_method`) и `invokeClass` ≠ `normal` ⇒ `wrapLayer='core_wrapper'` (`wrapperClass=core_proxy`, не полагаться на `auto`).
- иначе: `wrapLayer='named_wrapper'` (`wrapperClass=synthetic_named`).

## Core providers

- `window.__wrapNativeApply` (`core_window.js`) [wrapperClass=core_proxy] --- `Proxy(nativeFn,{apply})`; apply-trap calls `applyImpl(target,thisArg,argList)` (forwarding via `Reflect.apply` is responsibility of `applyImpl`).
- `window.__wrapNativeAccessor` (`core_window.js`) [wrapperClass=core_proxy] --- accessor wrapper built on `__wrapNativeApply`.
- `window.__wrapNativeCtor` (`core_window.js`) [wrapperClass=core_proxy] --- constructor/function wrapper via `Proxy(nativeFn,{apply,construct})`.
- `Function.prototype.toString` (`core_window.js`) [wrapperClass=synthetic_named] --- named wrapper bridge over `nativeToString` (без Proxy apply-trap на публичном entrypoint); override only for functions marked in `toStringOverrideMap` (or mapped proxy target); all other function/non-function paths go through native `Reflect.apply(nativeToString, thisArg, args)`. (Invariant self-checks exist at install time.)
- `window.Core.applyTargets` (`core_window.js`) [wrapperClass=engine] --- declarative descriptor-plan engine (`accessor|method|promise_method|data`) with preflight + plan + rollback-info (apply/rollback делает вызывающий код); materializes `wrapLayer`/`invokeClass`/`policy` in returned plan-items (contract trace), включая strict accessor-контракт (`named_wrapper_strict`, `allowShapeChange`).

## Context module (`context.js`)

- `HTMLCanvasElement.toDataURL` [wrapperClass=core_proxy] --- wrapper logic исполняется через `__wrapNativeApply` (Proxy target = native method) + post-hook chain.
- `HTMLCanvasElement.toBlob` [wrapperClass=core_proxy] --- callback/promise wrapper logic через `__wrapNativeApply` + async post-hooks.
- `HTMLCanvasElement.getContext` [wrapperClass=core_proxy] --- hook dispatch (`2d|webgl|html`) через `__wrapNativeApply` with native return path.
- `OffscreenCanvas.convertToBlob` [wrapperClass=core_proxy] --- promise wrapper logic через `__wrapNativeApply` + async post-hooks.
- `OffscreenCanvas.getContext` [wrapperClass=core_proxy] --- hook dispatch через `__wrapNativeApply`.
- `CanvasRenderingContext2D.measureText` [wrapperClass=core_proxy] --- direct method wrapper via `__wrapNativeApply` + hook call.
- `CanvasRenderingContext2D.fillText` [wrapperClass=core_proxy] --- direct method wrapper via `__wrapNativeApply` + hook call.
- `CanvasRenderingContext2D.strokeText` [wrapperClass=core_proxy] --- direct method wrapper via `__wrapNativeApply` + hook call.
- `CanvasRenderingContext2D.fillRect` [wrapperClass=core_proxy] --- direct method wrapper via `__wrapNativeApply` + hook call.
- `CanvasRenderingContext2D.drawImage` [wrapperClass=core_proxy] --- direct method wrapper via `__wrapNativeApply` + hook call.
- `WebGLRenderingContext/WebGL2RenderingContext.getParameter` [wrapperClass=core_proxy] --- `patchMethod` logic executed via `__wrapNativeApply` (Proxy target = native method).
- `WebGLRenderingContext/WebGL2RenderingContext.getSupportedExtensions` [wrapperClass=core_proxy] --- `patchMethod` logic via `__wrapNativeApply`.
- `WebGLRenderingContext/WebGL2RenderingContext.getExtension` [wrapperClass=core_proxy] --- `patchMethod` logic via `__wrapNativeApply`.
- `WebGLRenderingContext/WebGL2RenderingContext.readPixels` [wrapperClass=core_proxy] --- `patchMethod` logic via `__wrapNativeApply` (`orig.apply` once + post-hooks).
- `WebGLRenderingContext/WebGL2RenderingContext.getShaderPrecisionFormat` [wrapperClass=core_proxy] --- `patchMethod` logic via `__wrapNativeApply`.
- `WebGLRenderingContext/WebGL2RenderingContext.shaderSource` [wrapperClass=core_proxy] --- `patchMethod` logic via `__wrapNativeApply`.
- `WebGLRenderingContext/WebGL2RenderingContext.getUniform` [wrapperClass=core_proxy] --- `patchMethod` logic via `__wrapNativeApply`.

## Standalone modules

- `RTCPeerConnection.prototype.createOffer/createAnswer/setLocalDescription/addIceCandidate/setConfiguration` (`RTCPeerConnection.js`) [wrapperClass=core_proxy] --- `__wrapNativeApply`.
- `RTCPeerConnection.prototype.addEventListener/removeEventListener` (`RTCPeerConnection.js`) [wrapperClass=core_proxy] --- `__wrapNativeApply` + listener remap.
- `RTCPeerConnection.prototype.onicecandidate` (`RTCPeerConnection.js`) [wrapperClass=core_proxy] --- accessor patch via `__wrapNativeAccessor`.

- `Navigator.webdriver` (`hide_webdriver.js`) [wrapperClass=core_proxy] --- target-contract: accessor-path с `wrapLayer='named_wrapper_strict'` + `policy='strict'` (strict accessor исполняется через `__wrapNativeAccessor`).

- `Navigator.userAgent` (`override_ua_data.js`) [wrapperClass=core_proxy] --- accessor patch via `Core.applyTargets(kind=accessor, wrapLayer='core_wrapper', invalidThis='native')`; invalid receiver path delegates to native getter, valid path returns profile UA value. **Disabled by default** (opt-in via `window.__PROFILE__.override_ua_data_enabled === true`).
- `Navigator.platform` (`nav_total_set.js`) [wrapperClass=synthetic_named] --- named getter wrapper + `redefineAcc` (no Proxy).
- `Navigator.vendor` (`nav_total_set.js`) [wrapperClass=synthetic_named] --- named getter wrapper + `redefineAcc` (no Proxy).
- `Navigator.appVersion` (`nav_total_set.js`) [wrapperClass=synthetic_named] --- named getter wrapper + `redefineAcc` (no Proxy).
- `Navigator.productSub/maxTouchPoints/buildID/globalPrivacyControl/vendorSub` (`nav_total_set.js`) [wrapperClass=synthetic_named] --- accessor-path: named getter + `defineAccWithFallback` → `Core.applyTargets` with `wrapLayer='named_wrapper'`; data-path: `Core.applyTargets` `kind=data` with `wrapLayer='descriptor_only'` (без wrapper-классификации).
- `Navigator.deviceMemory/hardwareConcurrency/language/languages` (`nav_total_set.js`) [wrapperClass=core_proxy] --- target-contract: accessor redefine via `Core.applyTargets` with `wrapLayer='named_wrapper_strict'` + `policy='strict'` (owner/flags shape-stability); group-level policy fixed as `throw` (без downgrade в `skip`).

- `NavigatorUAData.brands/mobile/platform` (`nav_total_set.js`) [wrapperClass=mixed] --- `userAgentData.*` primitive patches via `Core.applyTargets` (`descriptor_only` for data-shape, otherwise accessor strict path via `wrapLayer='named_wrapper_strict'` + `policy='strict'`).
- `NavigatorUAData.getHighEntropyValues` (`nav_total_set.js`) [wrapperClass=core_proxy] --- promise_method patch via `Core.applyTargets(..., invokeClass='brand_strict', wrapLayer='core_wrapper')` with native-first `Reflect.apply(orig, this, args)` + post-process HE-ключей.
- `Navigator.userAgentData` (`nav_total_set.js`) [wrapperClass=mixed] --- accessor patch for `navigator.userAgentData` + `NavigatorUAData.prototype.getHighEntropyValues/toJSON` (см. entries ниже).

- `Permissions.query` (`nav_total_set.js`) [wrapperClass=core_proxy] --- `promise_method`/`brand_strict` path через `wrapLayer='core_wrapper'` + native-first вызов.
- `MediaDevices.enumerateDevices` (`nav_total_set.js`) [wrapperClass=core_proxy] --- `promise_method`/`brand_strict` path через `wrapLayer='core_wrapper'` + native-first вызов и post-process списка.
- `StorageManager.estimate` (`nav_total_set.js`) [wrapperClass=core_proxy] --- `promise_method`/`brand_strict` path через `wrapLayer='core_wrapper'`.
- `StorageManager.persist` (`nav_total_set.js`) [wrapperClass=core_proxy] --- `promise_method`/`brand_strict` path через `wrapLayer='core_wrapper'`.
- `StorageManager.persisted` (`nav_total_set.js`) [wrapperClass=core_proxy] --- `promise_method`/`brand_strict` path через `wrapLayer='core_wrapper'`.
- `CredentialsContainer.create/get` (`nav_total_set.js`) [wrapperClass=core_proxy] --- `promise_method`/`brand_strict` path через `wrapLayer='core_wrapper'`.
- `Performance.memory` (`nav_total_set.js`) [wrapperClass=mixed] --- accessor redefine (`redefineAcc` / own define fallback); no Proxy expected on the redefine path.
- `nav_total_set.js` module apply lifecycle [wrapperClass=engine] --- group-level `apply+postcheck+rollback` via `applyCoreTargetsGroup`; top-level fatal path performs module-wide rollback of already applied descriptors and rethrows (без swallow `fatal+return`).

- `window.matchMedia` (`screen.js`) [wrapperClass=core_proxy] --- `Core.applyTargets` method patch with `wrapLayer='core_wrapper'` (fallback path in module may use `__wrapNativeApply`).
- `MediaQueryList.prototype.matches` (`screen.js`) [wrapperClass=core_proxy] --- accessor patch via `__wrapNativeAccessor`.
- `screen.*` (`screen.js`) [wrapperClass=core_proxy] --- target-contract: accessor-descriptor через `wrapLayer='named_wrapper_strict'` + `policy='strict'` на `descriptorOwner`; data-only fields остаются в `descriptor_only` режиме (без wrapper-классификации).
- `screen.orientation.*` (`screen.js`) [wrapperClass=core_proxy] --- target-contract: accessor-path через `named_wrapper_strict + policy='strict'`; data-only fields в `descriptor_only` режиме.
- `window.innerWidth/innerHeight/outerWidth/outerHeight` (`screen.js`) [wrapperClass=core_proxy] --- target-contract: accessor path только через strict descriptor-policy; data-only fields в `descriptor_only` режиме.
- `visualViewport.*` (`screen.js`) [wrapperClass=core_proxy] --- target-contract: accessor path только через strict descriptor-policy; data-only fields в `descriptor_only` режиме.
- `Element.prototype.clientWidth/clientHeight` (`screen.js`) [wrapperClass=core_proxy] --- target-contract: accessor path только через strict descriptor-policy; data-only fields в `descriptor_only` режиме.

- `AudioContext.sampleRate/baseLatency` (`audiocontext.js`) [wrapperClass=core_proxy] --- strict accessor contract via `Core.applyTargets(..., kind='accessor', policy='strict', wrapLayer='named_wrapper_strict')`; Core validates invalid-receiver engine-throw pass-through + wrapper invariants, module validates descriptor post-check + rollback.
- `AudioContext.createBuffer/createAnalyser` (`audiocontext.js`) [wrapperClass=core_proxy] --- method patch via `Core.applyTargets(..., kind='method', invokeClass='brand_strict', wrapLayer='core_wrapper')`.
- `AnalyserNode.getByteFrequencyData/getFloatFrequencyData/getByteTimeDomainData/getFloatTimeDomainData` (`audiocontext.js`) [wrapperClass=core_proxy] --- method patch via `Core.applyTargets(..., kind='method', invokeClass='brand_strict', wrapLayer='core_wrapper')`.
- `OfflineAudioContext.startRendering` (`audiocontext.js`) [wrapperClass=n/a] --- snapshot-вариант: не патчится (`do not touch OfflineAudioContext.startRendering`).

- `TextMetrics proxy view` (`canvas.js`) [wrapperClass=n/a] --- return-object `new Proxy(nativeMetrics,{get,has})` in `applyMeasureTextHook` (object-proxy, not Core wrapLayer).

- `navigator.gpu.requestAdapter` (`webgpu.js`) [wrapperClass=core_proxy] --- target-contract: `promise_method` с `invokeClass='brand_strict'` и явным `wrapLayer='core_wrapper'` (без `auto`).
- `GPUAdapter.requestDevice/requestAdapterInfo/limits/features` (`webgpu.js`) [wrapperClass=core_proxy] --- target-contract: prototype patch-on-access через явный `wrapLayer='core_wrapper'` для strict receiver/brand surfaces.
- `GPUDevice.features` (`webgpu.js`) [wrapperClass=n/a] --- masked return-object proxy for `GPUSupportedFeatures`.
- `GPUDevice.limits` (`webgpu.js`) [wrapperClass=n/a] --- masked return-object proxy for `GPUSupportedLimits`.

- `window.fetch` (`headers_interceptor.js`) [wrapperClass=synthetic_named] --- direct function reassignment wrapper (`_fetch.call/_fetch.apply`).
- `XMLHttpRequest.prototype.open/send` (`headers_interceptor.js`) [wrapperClass=synthetic_named] --- direct function reassignment wrappers (`apply`).
- `HeadersInterceptor.addAllow/addIgnore` (`headers_bridge.js`) [wrapperClass=synthetic_named] --- wrapper-over-wrapper reassignment (no Proxy).

- `Intl.DateTimeFormat/NumberFormat/Collator/ListFormat/PluralRules/RelativeTimeFormat/DisplayNames` (`TimezoneOverride_source.js`) [wrapperClass=core_proxy] --- constructor patch via `__wrapNativeCtor`.
- `Intl.*.resolvedOptions` (`TimezoneOverride_source.js`) [wrapperClass=core_proxy] --- method patch via `Core.applyTargets(..., kind='method', invokeClass='brand_strict', wrapLayer='core_wrapper')` with native-first `Reflect.apply(orig, this, args)`.
- `Date.prototype.toLocaleString/toLocaleDateString/toLocaleTimeString` (`TimezoneOverride_source.js`) [wrapperClass=core_proxy] --- method patch via `Core.applyTargets(..., kind='method', invokeClass='brand_strict', wrapLayer='core_wrapper')` with locale/timeZone post-args normalization.

- `Geolocation.getCurrentPosition/watchPosition/clearWatch` (`GeoOverride_source.js`) [wrapperClass=core_proxy] --- target-contract: method patch with `invokeClass='brand_strict'` + явный `wrapLayer='core_wrapper'` (без `auto`) + wrapped success callback.

- `Function.prototype.toString` worker realm (`wrk.js`) [wrapperClass=synthetic_named] --- method-style wrapper + WeakMap map (no Proxy in worker path).
- `ServiceWorkerContainer.register/getRegistrations/getRegistration` (`wrk.js`) [wrapperClass=synthetic_named] --- direct method replacement via `Object.defineProperty`.

Обновлено: 2026-03-05
