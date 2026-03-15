# План правок  для `nav_butify`

## 1. Зафиксированная контрольная точка

На основании `statement` и `nav_butify_GPU_webdriver_trace` текущая картина должна считаться зафиксированной так:

- в `window scope` подтверждён только один наблюдаемый класс нарушений: `failed toString`;
- в `worker scope` проблема шире и включает множественные invariant-failures;
- значит текущий набор правок нельзя проектировать как «общий ремонт всего pipeline»;
- первый целевой контур изменений должен быть ограничен `window-path` и теми surface, через которые уже подтверждён корневой механизм сбоя: `Navigator.webdriver` и `GPU.requestAdapter`.

Это важно, потому что иначе в один пакет будут смешаны две разные задачи:
1. устранение `window failed toString`;
2. отдельный ремонт `worker`-контрактов.

Для данного этапа в план включается только первая задача. Worker-проблемы фиксируются как следующий этап, но не входят в текущий scope.

## 2. Что именно надо изменить в постановке задачи

Текущий `solution5` хорошо описывает диагноз, но ещё недостаточно жёстко задаёт исполнимый план. Его надо перевести из режима:

- «обнаружены architectural deviations и compensating shims»

в режим:

- «какие подсистемы меняются»;
- «в каком порядке»;
- «какие текущие исключения удаляются»;
- «какой путь считается целевым»;
- «какие критерии готовности обязательны до перехода к следующему этапу».

Иными словами, итоговый документ должен перестать быть аналитическим выводом и стать управляющим планом внедрения.

## 3. Целевая архитектурная цель

Цель правок формулируется так:

`window`-patch pipeline должен давать корректный observable contract без компенсирующих проектных обходов.

Это означает:

1. surface, критичные к `toString`, не должны зависеть от `synthetic_named + markAsNative` как от основного механизма маскировки;
2. `GPU.requestAdapter` не должен вызываться побочно до того, как установлен его штатный patch-path;
3. `strict` accessor/method path должен быть реализован внутри самой архитектуры `Core`, а не поддерживаться внешними исключениями и обходами;
4. результат должен измеряться не внутренними эвристиками, а тем же внешним анализатором, который использован в `statement`.

## 4. Главный архитектурный вывод, который должен быть зафиксирован в новом solution

Нужно явно зафиксировать одно решение верхнего уровня:

### Решение

`named_wrapper` и `named_wrapper_strict` перестают быть допустимым конечным execution-path для contract-sensitive surface в `window scope`, если для них требуется нативно выглядящий `toString`.

Для таких surface целевым становится только `Core-native wrapper path`, то есть путь, в котором финальная обёртка строится через core-level native bridge (`__wrapNativeApply`, `__wrapNativeAccessor`, `__wrapStrictAccessor` или их единый унифицированный эквивалент), а не через synthetic named function.

Это решение должно быть принято архитектурно, а не как частный фикс только для двух API.

## 5. План правок

## Этап 0. Зафиксировать границы текущего change set


### Зачем

Потому что `statement` подтверждает единый bucket `failed toString` для window-части, но не доказывает, что все `39` entry можно безопасно переключить одним массовым изменением без промежуточной валидации.

### Критерий готовности этапа

В документе появляется отдельный раздел `Scope / Non-scope`, где явно записано:

- current scope = `window failed toString`;
- current pilot = `Navigator.webdriver` и `GPU.requestAdapter`;
- worker invariant-failures excluded.

---

## Этап 1. Убрать из целевой архитектуры зависимость от synthetic-named wrappers

### Что делаем

Нужно переписать целевую модель `Core.applyTargets` так, чтобы для contract-sensitive target был только один допустимый финальный класс обёртки:

- либо новый единый `native_bridge_wrapper`, решено переименовать и унифицировать API Core.

При этом:

- `synthetic_named` допускается только как fallback для некритичных surface;
- для surface, которые попадают в analyzer bucket `failed toString`, этот путь должен быть запрещён policy-уровнем.

### Что именно надо изменить в архитектурных правилах

В новом плане нужно потребовать:

1. убрать архитектурное исключение, при котором `brand_strict` может идти через `named_wrapper`;
2. убрать ситуацию, при которой strict accessor логически объявлен как strict-path, но фактически не использует `__wrapStrictAccessor`;
3. ввести явную классификацию target:
   - `descriptor-sensitive`;
   - `receiver-sensitive`;
   - `toString-sensitive`;
   - `constructor/meta-sensitive`.

Для класса `toString-sensitive` конечный path через `synthetic_named` должен быть запрещён.

### Зачем

Сейчас `solution5` показывает, что проблема сосредоточена не в descriptor/receiver semantics, а именно в том, что наружу публикуется synthetic function-path, который не даёт нативный observable `toString`.

### Критерий готовности этапа

В документе появляется новая таблица архитектурных правил:

- `accessor + strict + toString-sensitive` → только native bridge path;
- `promise_method + brand_strict + toString-sensitive` → только native bridge path;
- `named_wrapper` запрещён для этих классов target.

---

## Этап 2. Переделать strict accessor path для `Navigator.webdriver`(и вех иных объектов с аналричными харктеристиками)

### Что делаем

Для `Navigator.webdriver` нужно не просто «сохранить текущее поведение», а перевести его на архитектурно корректный strict accessor path.

Это означает следующие обязательные изменения:

1. `hide_webdriver` продолжает резолвить дескриптор по `proto_chain` и сохранять контроль owner/shape;
2. но final wrapping больше не должен завершаться в `wrapGetter(...)->named synthetic getter->markAsNative`;
3. strict accessor должен идти через `__wrapStrictAccessor` либо через новый унифицированный strict native-bridge path;
4. invalid receiver path должен остаться нативным по observable результату;
5. descriptor shape на `Navigator.prototype` не должен измениться относительно текущего ожидаемого Chromium-shape.

### Что не допускается после правки

После этого этапа в трассе `Navigator.webdriver` больше не должно быть такого финального состояния:

- `wrapperClass = synthetic_named`;
- `toString`-маскировка обеспечивается только `markAsNative`;
- `__wrapStrictAccessor` не участвует.

### Критерий готовности этапа

Новый trace для `Navigator.webdriver` должен показывать:

- strict accessor реально проходит через core-native bridge path;
- synthetic named getter не является финальной опубликованной функцией;
- analyzer не фиксирует `failed toString` на этом surface.

---

## Этап 3. Убрать special-case для `GPU.requestAdapter`

### Что делаем

Для `GPU.requestAdapter` надо убрать архитектурное исключение, которое сейчас разрешает `brand_strict` через `named_wrapper`.

Новый план должен требовать:

1. удалить зависимость от `allowNamedWrapperBrandStrict: true` как от production-исключения;
2. привести `GPU.requestAdapter` к тому же core-native wrapper policy, что и остальные strict brand-sensitive methods;
3. final wrapper для `requestAdapter` строить не через `buildPromiseMethodWrapperByArity(...) + markAsNative`, а через native-bridge path уровня Core.

### Почему это обязательно

Пока это исключение существует, `GPU.requestAdapter` формально остаётся в ветке, которую сам Core считает неосновной и допускает только по special-case. Значит проблема не решена архитектурно, а лишь разрешена локально.

### Критерий готовности этапа

В целевом trace для `GPU.requestAdapter`:

- отсутствует reliance на `allowNamedWrapperBrandStrict`;
- `wrapLayer` не приводит к synthetic named final wrapper;
- `requestAdapter` проходит внешний `toString`-контроль.

---

## Этап 4. Разорвать побочный runtime-path в `WebgpuWL`

### Что делаем

Нужно развести две роли, которые сейчас смешаны:

- сбор whitelist/snapshot;
- публикация observable API patch.

`WebgpuWL` не должен делать ранний вызов `navigator.gpu.requestAdapter()` до установки штатного patch-path.

### Требуемая архитектурная перестройка

В новом solution надо зафиксировать один из двух допустимых вариантов:

####  reorder orchestration

Сначала публикуется core-level patch для `GPU.requestAdapter`, и только потом выполняется whitelist/snapshot, уже через целевой observable path.


### Критерий готовности этапа

В документе должна появиться новая фазовая модель загрузки:

1. `core_window` ready;
2. patch publication for GPU surface;
3. whitelist/snapshot;
4. remaining webgpu initialization.

И должно быть явно записано: ранний прямой вызов `requestAdapter` до публикации patch запрещён.

---

## Этап 5. Понизить роль `markAsNative` и `__CORE_TOSTRING_STATE__`

### Что делаем

Текущий bridge-слой `toString` не должен оставаться архитектурным основанием для исправления contract-sensitive surface.

В новом плане надо разделить два режима:

#### Режим 1 — core contract path

Используется для surface, которые должны проходить внешний analyzer. Здесь результат должен обеспечиваться самим типом wrapper-path, а не скрытыми map-labels.

#### Режим 2 — internal compatibility layer

`markAsNative`, `overrideMap`, `proxyTargetMap`, `__CORE_TOSTRING_STATE__` остаются только как внутренняя совместимость и fallback для менее критичных patch-path.

### Что это меняет practically

- `markAsNative` больше не считается достаточным механизмом для stealth-sensitive API;
- наличие `__CORE_TOSTRING_STATE__` перестаёт быть аргументом, что path уже «нативизирован»;
- solution должен требовать миграции важных surface из map-labeling в native-bridge wrappers.

### Критерий готовности этапа

В документе появляется отдельное решение:

`WeakMap-labeling is not an acceptance mechanism for contract-sensitive surfaces`.

---

## Этап 6. Ввести rollout-стратегию не по модулям, а по классам surface

### Что делаем

После пилота на `Navigator.webdriver` и `GPU.requestAdapter` развёртывание должно идти не хаотично по файлам, а по типам target.

### Порядок rollout

1. strict accessors в `window scope`;
2. brand-strict methods / promise methods;
3. остальные window methods, попавшие в `failed toString` bucket;
4. только после стабилизации window — отдельный worker workstream.

### Почему так

Потому что именно эти два первых класса уже доказаны текущим trace как опорные представители корневой проблемы.

### Критерий готовности этапа

В solution появляется migration roadmap, где каждое расширение на следующий класс surface допускается только после прохождения acceptance на предыдущем.

---

## Этап 7. Зафиксировать обязательную матрицу проверок

### Что проверяем обязательно

Для каждого surface после миграции проверяются четыре уровня:

1. **Descriptor contract**
   - owner
   - enumerable/configurable
   - accessor vs data shape
   - отсутствие лишнего own-instance shadowing

2. **Receiver contract**
   - valid receiver
   - invalid receiver
   - ошибка/throw path должен совпадать по наблюдаемому поведению

3. **Invocation contract**
   - обычный вызов
   - extracted call
   - Reflect/apply path
   - Promise/async outcome для `requestAdapter`

4. **Representation contract**
   - `Function.prototype.toString`
   - function name
   - наличие/отсутствие observable own properties
   - результаты внешнего analyzer

### Главный acceptance criterion

Для текущего этапа change set считается завершённым только если:

- `Navigator.webdriver` больше не даёт `failed toString`;
- `GPU.requestAdapter` больше не даёт `failed toString`;
- при этом не появляются новые window invariant-failures у этих surface.

---

## Этап 8. расширение на остальные `39` window entries

### Что делаем

провести классификацию остальных `window`-entry из analyzer-списка.

Их нужно разбить не по модулям, а по механике:

- accessors;
- regular methods;
- promise methods;
- canvas/webgl-related methods;
- locale/date/intl-related methods.

Для каждой группы принимается одно решение:

- переводить ли их на тот же native-bridge path;
- либо оставлять текущий path, если group не чувствительна к внешнему observable `toString`.

### Почему это важно

Иначе команда сразу начнёт массовую переделку `Date`, `Canvas`, `WebGL`, `Navigator`, `Permissions`, `StorageManager` и других surface без доказанного минимального шаблона миграции.

### Критерий готовности этапа

Появляется отдельная таблица `window failed toString backlog`, где для каждой группы указан:

- тип surface;
- текущий wrapper-path;
- целевой wrapper-path;
- приоритет миграции.

## 6. Общий горизонт изменени


Проблема текущего change set не в том, что `toString` надо «докрутить отдельно», а в том, что contract-sensitive surfaces завершаются не в native-bridge wrapper path, а в `synthetic_named`.

Следовательно, целевая правка должна менять не косметику `toString`, а routing rules внутри `Core.applyTargets` и orchestration вокруг `GPU.requestAdapter`.

`markAsNative`, `WeakMap`-labeling и `__CORE_TOSTRING_STATE__` могут оставаться как internal compatibility layer, но не могут быть критерием готовности для stealth-sensitive surface.


Первый внедряемый change set ограничен `window scope` и пилотируется на `Navigator.webdriver` и `GPU.requestAdapter`; worker fixes выводятся в отдельный последующий этап.

## 7. Рекомендуемый порядок внесения правок в кодовую базу

1. Переписать `solution` как план внедрения с явным scope.
2. Зафиксировать policy-level запрет на final `synthetic_named` для `toString-sensitive` target.
3. Переделать strict accessor path для `Navigator.webdriver`.
4. Удалить special-case `allowNamedWrapperBrandStrict` для `GPU.requestAdapter`.
5. Перестроить orchestration `WebgpuWL` так, чтобы ранний вызов `requestAdapter` исчез.
6. Прогнать внешний analyzer только на pilot surface.
7. классифицировать и мигрировать остальные `window` entries.
8. Отдельным change set перейти к `worker scope`.

## 8. Итог


Главная линия правки такая:

- не лечить `failed toString` точечно;
- убрать из критичных surface зависимость от synthetic wrappers;
- перевести их на native-bridge path уровня `Core`;
- убрать ранний вызов `GPU.requestAdapter` до публикации patch;
- доказывать результат внешним analyzer сначала на двух опорных surface, потом расширять на остальные window-entry.