

**Статический trace**

`Navigator.webdriver`:
- модуль делает правильный внешний заход: `kind: 'accessor'`, `policy: 'strict'`, `resolve: 'proto_chain'`, `wrapLayer: 'strict_accessor_gateway'`, `invalidThis: 'native'` в [hide_webdriver.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/stealth/hide_webdriver.js#L387).
- preflight в Core поддерживает accessor-gateway как strict path и форсит `proto_chain`: [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1755).
- `patchAccessor()` при этом маркирует gateway как `wrapperClass = 'synthetic_named'` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1340).
- но `wrapGetter()` для unified gateway уходит в `__wrapStrictAccessor(...)` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1132).
- а `__wrapStrictAccessor(...)`, если есть `origGet`, строит wrapper через `__wrapNativeAccessor(...) -> __wrapNativeApply(...)` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L365), [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L385).

Итог по `webdriver`: внешний kind выбран верно, receiver-path в intent тоже верный, но внутренняя label-модель и фактический callable path расходятся.

`GPU.requestAdapter`:
- whitelist-модуль до основного патча делает ранний runtime-call `navigator.gpu.requestAdapter(...)` в [WebgpuWL.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/WebgpuWL.js#L445). Это не install-failure, но это ранний side-effect до штатной обёртки.
- основной target задаётся как `kind: 'promise_method'`, `wrapLayer: 'core_wrapper'`, `invokeClass: 'brand_strict'` в [webgpu.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/webgpu.js#L989).
- preflight требует для `brand_strict` именно `core_wrapper` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1781).
- `patchPromiseMethod()` последовательно ставит `wrapperClass = 'core_proxy'` и реально строит path через `__wrapNativeApply(...)` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1616), [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1697).

Итог по `GPU.requestAdapter`: тут planner и executor согласованы лучше; основная проблема не в local label, а в том, что поверх всего уже висит глобальный Proxy-bridge `Function.prototype.toString` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L494).

**Нормативная рамка**

Сверять надо только с внешним контрактом:
- ECMAScript: `Proxy exotic object`, `[[Call]]`, descriptor semantics, `Function.prototype.toString` observable behavior. Источник: <https://tc39.es/ecma262/>
- Web IDL: regular attributes/operations, interface prototype object, implementation-checked receiver. Источник: <https://webidl.spec.whatwg.org/>
- Chromium fact для `navigator.webdriver`: accessor на prototype, `configurable: true`, `enumerable: true`, `set === undefined`. Источник: <https://chromium.googlesource.com/chromium/src/%2B/66.0.3359.158/third_party/WebKit/LayoutTests/navigator_webdriver/navigator_webdriver_enabled.html>
- `GPU.requestAdapter()` обязан оставаться Promise-returning method surface. Источник: <https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter>

Отсюда критерии аудита:
- `wrapperClass` не нормативен вообще; он должен лишь правдиво описывать runtime.
- `wrapLayer` тоже не нормативен; он допустим только пока сохраняет observable surface.
- единственные реальные ограничения: object/function/proxy kind, descriptor shape, receiver contract, apply/call path, native bad-receiver behavior, public `toString` surface.

**Проблемы**

1. `webdriver`: несогласованность внутренних ярлыков  
- planner пишет `synthetic_named`, executor уходит в proxy path.  
- Это не просто cosmetic drift: валидатор/diag/аудит начинают читать один механизм, а работает другой.

2. `Function.prototype.toString` как глобальный смещающий слой  
- Core публично подменяет `Function.prototype.toString` через Proxy в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L494).
- lie-bucket у `Function.toString`, `GPU.requestAdapter`, `Navigator.webdriver` общий по типу ошибок. Это сильный признак, что общий meta-layer сейчас значимее, чем локальные patch-path каждого surface.

3. `WebgpuWL` делает ранний call до патча  
- Это ухудшает чистоту trace для `GPU.requestAdapter`: patch уже не первый наблюдаемый runtime-path.

4. fail-fast нарушен локально в public toString bridge  
- В Proxy-bridge `Function.prototype.toString` есть fallback “залогировать и вернуть native” в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L549).  
- Для публичного meta-layer это даёт слабую наблюдаемость причины и размывает диагностику.

**План правок**

1. Зафиксировать одну truth-model для внутренних ярлыков  
- Для каждого patch-path определить: label описывает  фактический runtime mechanism.  
- Принять одно правило на весь Core: `wrapperClass` всегда отражает фактический построенный callable object.  
- После этого пройти минимум по `patchAccessor()` и `patchPromiseMethod()` и убрать случаи, где один и тот же path объявляется `synthetic_named`, а строится через `__wrapNativeApply`.

2. Развести два accessor-path явно  
- `strict_accessor_gateway` должен либо:
  - строить только synthetic named accessor path,
  - либо официально считаться proxy/gateway path.
- Смешанный вариант оставить нельзя, потому что он ломает консистентность `object/function/proxy/property kinds`.

3. Для `Navigator.webdriver` привести pipeline к одной модели  
- Проверить, что целевой descriptor owner остаётся prototype-owner, не instance-owner.
- Проверить, что на выходе остаётся accessor property с исходными `enumerable/configurable`, без `set`, с native bad-receiver path.
- После выбора единой модели обновить:
  - planner label,
  - gateway runtime path,
  - diag metadata
  так, чтобы они описывали одно и то же.

4. Для `GPU.requestAdapter` сохранить current `core_wrapper` path, но убрать ранний pre-call из whitelist-слоя  
- `WebgpuWL` не должен вызывать `navigator.gpu.requestAdapter()` до регистрации основного patch-path.
- Если snapshot нужен, он должен идти:
  - либо после patch install,
  - либо через отдельный безопасный internal gate, который не меняет первый observable runtime-path API.


5. Пересмотреть глобальный `Function.prototype.toString` bridge как общий источник bucket-а  
-  по себе Proxy вокруг функции не запрещён спецификацией. ([tc39.es][1])

НО Как только observable Proxy появляется на глобальом `Function.prototype.toString`,  создаётеся новый высокочувствительный surface: меняется identity/descriptor/behavior-layer самого метода, и детекторы начинают проверять уже не только патченные API, но и глобальный мост, через который проходит всё. 
 Для stealth это почти всегда хуже, чем чинить конкретные wrapper-path на уровне целевых surface. Это следует и из спецификации про callable/native representation, и из proxy invariant model. ([tc39.es][1])


Практический вывод для  плана такой:
* **публичный Proxy на `Function.prototype.toString`** — не использовать;
**не трогать глобальный `Function.prototype.toString`**, 


- Отдельно проверить:
  - descriptor flags installed `toString`
  - receiver path for non-function / wrapped function / proxy target
  - `Reflect.setPrototypeOf` interaction
  - bridge-cycle handling
- Цель правки: либо bridge остаётся и полностью подчиняется external observable contract, либо он убирается как источник систематического drift.

6. Синхронизировать validator/diag vocabulary с runtime reality  
- Все `wrapLayer:selected`, `wrapperClass`, `patches_applied` должны логировать тот же механизм, который реально построен.
- Иначе любые последующие lie/trace отчёты будут методологически загрязнены.

7. Порядок внедрения  
- Сначала `core_window.js`: truth-model labels + accessor gateway + toString bridge policy.
- Затем `hide_webdriver.js`: только доведение target до новой truth-model, без изменения внешнего contract.
- Затем `WebgpuWL.js`: убрать ранний pre-call.
- Затем `webgpu.js`: оставить `core_wrapper`, проверить owner/resolve/invalidThis against updated Core.
- Только после этого повторно сверять `lie-bunch.json`-bucket по `Function.toString`, `Navigator.webdriver`, `GPU.requestAdapter`.

**Что не доказано**
- Не доказано, что именно `planner` ошибается, а `executor` прав. Возможен и обратный вариант.
- Не доказано, что весь current lie-bucket порождён только `Function.prototype.toString` bridge; но это главный общий кандидат по статике и по структуре lie-данных.


**Карта состояния**

Оркестрация в `bunch` для обоих trace однозначная: [main.py](/c:/55555/switch/Evensteam/bunch/main.py#L357) грузит `core_window.js` раньше [hide_webdriver.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/stealth/hide_webdriver.js) и раньше пары [WebgpuWL.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/WebgpuWL.js) + [webgpu.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/webgpu.js). По логу install-stage явных apply/preflight-срывов нет: [my_debug_log_2026-03-15T121550.993.json](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/bunch_constrains/my_debug_log_2026-03-15T121550.993.json#L26), [my_debug_log_2026-03-15T121550.993.json](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/bunch_constrains/my_debug_log_2026-03-15T121550.993.json#L65), [my_debug_log_2026-03-15T121550.993.json](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/bunch_constrains/my_debug_log_2026-03-15T121550.993.json#L459), [my_debug_log_2026-03-15T121550.993.json](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/bunch_constrains/my_debug_log_2026-03-15T121550.993.json#L478). Но lie-данные уже показывают отдельный meta-layer bucket именно для `Function.toString`, `GPU.requestAdapter`, `Navigator.webdriver`: [lie-bunch.json](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/bunch_constrains/lie-bunch.json#L2), [lie-bunch.json](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/bunch_constrains/lie-bunch.json#L16), [lie-bunch.json](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/bunch_constrains/lie-bunch.json#L72).