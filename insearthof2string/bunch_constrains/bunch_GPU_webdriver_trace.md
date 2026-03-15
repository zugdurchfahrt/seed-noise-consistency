
А сейчас внимательно! Очень вимательно к делаям описания задачи!

сейчас с тобой пойдем в другое репо:
bunch\

это Копия оснвног оже pipeline, но другая реализация. 
Там так же называются файлы, та же  в целом последовательность действий,  он "под капотом" есть отличия. 

Я создал в workspace отдельную папку, где буду  cобирать весь контекст по этому заданию. 
\Samples4Context\insearthof2string\

Ввнути созданы и отдельные папки для кажого pipeline:
\Samples4Context\insearthof2string\nav_butify_constrains
\Samples4Context\insearthof2string\bunch_constrains

Я положил в корень
\Samples4Context\insearthof2string\bunch_constrains
данные по lie и ознакомительный лог, и  файл, содержащий описание задачи:
Samples4Context\insearthof2string\bunch_constrains\bunch_GPU_webdriver_trace.md
 
Она совпадает содержательно с той задачей, которую ты уже сделал в nav_butify\. Зедесь чуть-чуть  по формулировке и по оформлению отличается, но это не имеет никакого отношения к содержанию. 
 
Ты выполняешь аналогичную задачу, которую мы  с тобой делали в nav_butify\, но в теперь в репозитарии bunch\. 
То есть ты сейчас идешь в репозиторий bunch\, и там выполняешь аналогичное задание: делаешь статический анализ trace этих же Navigator.webdriver и GPU.requestAdapter в файле bunch\assets\scripts\window\core\core_window.js, но уже репозитарии bunch\.


задача

Берем конкретно два апи, которые есть в pipelie -  Это Navigator.webdriver и  GPU.requestAdapter.
WebgpuWL.js - несамостоятельный модуль, это техническая реализация whitelist для модуля webgpu.js, где "живет" GPU.requestAdapter, и является ассоциированные с webgpu.js элементом, он не самостоятельен. Это приложение . Но без него просто webgpu.js может не работать. 


Необходимо статически проаналзировать  trace Navigator.webdriver и  GPU.requestAdapter  в core_window.js. работы в рамках pipeline.  оркестрация исполнения тут  -  main.py  357-697 (расположение может чуть отличаться в завимиости от версии main.py, ориентируйся  как на точку начала):

```js

    def build_page_bundle(init_params: str) 

```





Рамка:
[statement.md](/c:/55555/switch/Evensteam/Samples4Context/insearthof2string/statement.md)


Статическая трасса pipeline в `bunch`, без runtime-проверок и без расширения выводов за пределы кода.

**Оркестрация**
В `bunch` порядок bundle тот же: [main.py](/c:/55555/switch/Evensteam/bunch/main.py#L357) загружает [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js), затем [hide_webdriver.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/stealth/hide_webdriver.js), заметно позже [WebgpuWL.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/WebgpuWL.js), и после него [webgpu.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/webgpu.js). Page bundle целиком ставится в new-document hook в [main.py](/c:/55555/switch/Evensteam/bunch/main.py#L696). Отдельно worker bridge публикуется раньше через `worker_bootstrap_env_js` в [main.py](/c:/55555/switch/Evensteam/bunch/main.py#L638), но для двух рассматриваемых window-surface он только общий инфраструктурный фон.

**Trace: `Navigator.webdriver`**
Модуль [hide_webdriver.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/stealth/hide_webdriver.js#L301) резолвит `webdriver` по `proto_chain`, отвергает missing/non-configurable/instance-owner и собирает target с `kind: 'accessor'`, `policy: 'strict'`, `wrapLayer: 'strict_accessor_gateway'`, `validThis`, `invalidThis: 'native'` в [hide_webdriver.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/stealth/hide_webdriver.js#L387). Дальше он идёт в `Core.applyTargets(...)` через `applyTargetGroup` в [hide_webdriver.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/stealth/hide_webdriver.js#L184).

В `core_window` это уже не старый `named_wrapper_strict`, а unified accessor gateway. Это видно в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L811) и [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1312): strict accessor допускается и через `strict_accessor_gateway`. В `wrapGetter` gateway-path не строит synthetic named getter напрямую, а уходит в `__wrapStrictAccessor(...)` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1132). А `__wrapStrictAccessor`, если есть native `origGet`, уже строит `__wrapNativeAccessor`/`__wrapNativeApply` proxy-path в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L385). То есть фактический runtime-path для `webdriver` здесь proxy-based, хотя `patchAccessor` всё ещё маркирует `wrapperClass = 'synthetic_named'` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1340). Это важный внутренний split: label у планировщика и реальный механизм больше не совпадают полностью. Invalid receiver при этом сохраняет native-first path через `onInvalidThis -> Reflect.apply(origFn, self, args)` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1070).

**Trace: `GPU.requestAdapter`**
[WebgpuWL.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/WebgpuWL.js#L449) здесь так же не патчит `requestAdapter` сам, но делает ранний runtime-вызов `navigator.gpu.requestAdapter(...)` для snapshot/whitelist до установки основного патча. Это не самостоятельный модуль, но это не нейтральный шаг: он прогревает целевой API до его обёртки.

Собственно патч живёт в [webgpu.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/patches/graphics/webgpu.js#L989): `kind: 'promise_method'`, `wrapLayer: 'core_wrapper'`, `invokeClass: 'brand_strict'`, `validThis: self === gpu`, `invalidThis: 'throw'`. В отличие от `nav_butify`, здесь нет special-case `allowNamedWrapperBrandStrict`; preflight проходит по обычному правилу `brand_strict requires core_wrapper` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1781). Дальше `patchPromiseMethod` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1577) ставит `wrapperClass = 'core_proxy'` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1615) и реально строит wrapper через `__wrapNativeApply(...)` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1697). То есть `GPU.requestAdapter` в `bunch` идёт уже по чистому proxy/core-wrapper path, а не по synthetic named path, как в `nav_butify`. Invalid receiver и здесь сохраняет native-first semantics через `onInvalidThis` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1642) и [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L1070).

**Ключевое отличие `bunch`**
Главное архитектурное отличие от `nav_butify` в `bunch` не в самих модулях `hide_webdriver`/`webgpu`, а в том, что [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L494) здесь **публично переустанавливает `Function.prototype.toString`** через Proxy и пытается связать его с `toStringOverrideMap`/`toStringProxyTargetMap`, с проверками brand-check, native forwarding и `Reflect.setPrototypeOf` в [core_window.js](/c:/55555/switch/Evensteam/bunch/assets/scripts/window/core/core_window.js#L589). Поэтому оба trace в `bunch` завязаны уже не просто на внутренний `markAsNative`, а на полноценный публичный toString-bridge. В статике это означает следующее: если в `nav_butify` оба surface заканчивались synthetic/named path при неизменённом публичном `Function.prototype.toString`, то в `bunch` `Navigator.webdriver` и `GPU.requestAdapter` уже опираются на proxy-first core-path плюс публичную `toString`-механику. Именно это и есть главное место расхождения двух реализаций “под капотом”.

