// === env-worker-bridge (главный бандл) ===
(() => {
  const G = (typeof globalThis !== 'undefined' && globalThis)
      || (typeof self       !== 'undefined' && self)
      || (typeof window     !== 'undefined' && window)
      || (typeof global     !== 'undefined' && global)
      || {};
  if (typeof self==='undefined' || typeof WorkerGlobalScope==='undefined' || !(self instanceof WorkerGlobalScope)) {
    throw new Error('UworkerInit: not in WorkerGlobalScope');
  }






  const BR = (global.__ENV_BRIDGE__ = global.__ENV_BRIDGE__ || {});

  const SEED_NATIVIZATION_SRC = 
        // --- Seed nativization (Window → Worker). No runtime coupling after start. ---
        try {
          const nativeGetOwnProp = Object.getOwnPropertyDescriptor;
          const fpToStringDesc = nativeGetOwnProp(Function.prototype, 'toString');
          const currentToString = fpToStringDesc && fpToStringDesc.value;

          const existingState = self.__CORE_TOSTRING_STATE__;
          const existingStateOk = !!(existingState
            && existingState.__CORE_TOSTRING_STATE__ === true
            && typeof existingState.nativeToString === 'function'
            && (existingState.overrideMap instanceof WeakMap)
            && (existingState.proxyTargetMap instanceof WeakMap));

          const toStringOverrideMap = existingStateOk
            ? existingState.overrideMap
            : new WeakMap();
          const toStringProxyTargetMap = existingStateOk
            ? existingState.proxyTargetMap
            : new WeakMap();

          const currentRealmToString = (typeof currentToString === 'function')
            ? currentToString
            : Function.prototype.toString;

          function resolveToStringBridgeTarget(candidate) {
            if (typeof candidate !== 'function') return null;
            var bridgeTarget = candidate;
            var seenBridgeTargets = new WeakSet();
            while (typeof bridgeTarget === 'function') {
              if (seenBridgeTargets.has(bridgeTarget)) {
                try {
                  var d0 = self && self.__DEGRADE__;
                  if (typeof d0 === 'function') {
                    var ctx0 = {
                      type: 'contract violation',
                      stage: 'preflight',
                      module: 'wrk',
                      diagTag: 'wrk',
                      surface: 'worker_bootstrap',
                      key: 'Function.prototype.toString',
                      message: 'Function.prototype.toString bridge candidate cycle',
                      data: { outcome: 'return', reason: 'bridge_candidate_cycle', fallback: 'current_realm_toString' }
                    };
                    if (typeof d0.diag === 'function') d0.diag('warn', 'wrk:toString_bridge_candidate_cycle', ctx0, null);
                    else d0('wrk:toString_bridge_candidate_cycle', null, Object.assign({}, ctx0, { level: 'warn' }));
                  }
                } catch (_e0) {}
                return null;
              }
              seenBridgeTargets.add(bridgeTarget);
              var nextTarget = toStringProxyTargetMap.get(bridgeTarget);
              if (typeof nextTarget !== 'function') break;
              bridgeTarget = nextTarget;
            }
            return (typeof bridgeTarget === 'function') ? bridgeTarget : null;
          }

          const nativeToStringCandidate = existingStateOk
            ? existingState.nativeToString
            : (currentRealmToString || Function.prototype.toString);
          const nativeToString = resolveToStringBridgeTarget(nativeToStringCandidate)
            || resolveToStringBridgeTarget(currentRealmToString)
            || null;
          if (typeof nativeToString !== 'function') {
            throw new Error('UACHPatch: Function.prototype.toString missing');
          }

          function baseMarkAsNative(func, name = "") {
            if (typeof func !== 'function') return func;
            const t = toStringProxyTargetMap.get(func);
            if (t) func = t;
            const n = name || func.name || "";
            const label = n
              ? ('function ' + n + '() { [native code] }')
              : 'function () { [native code] }';
            toStringOverrideMap.set(func, label);
            return func;
          }

          let memoMarkAsNative = null;
          function ensureMarkAsNative() {
            if (memoMarkAsNative) return memoMarkAsNative;
            memoMarkAsNative = baseMarkAsNative;
            return memoMarkAsNative;
          }

          if (typeof self.__ensureMarkAsNative !== 'function') {
            Object.defineProperty(self, '__ensureMarkAsNative', {
              value: ensureMarkAsNative,
              writable: true,
              configurable: true,
              enumerable: false
            });
          }

          const ensure = (typeof self.__ensureMarkAsNative === 'function')
            ? self.__ensureMarkAsNative
            : ensureMarkAsNative;
          const markAsNative = ensure();
          if (typeof markAsNative !== 'function') {
            throw new Error('UACHPatch: markAsNative seed missing');
          }
          markAsNative(ensure, '__ensureMarkAsNative');

          const seedProbe = function seedProbe(){};
          markAsNative(seedProbe);
          const seedExpected = toStringOverrideMap.get(seedProbe);
          if (seedExpected === undefined) {
            throw new Error('UACHPatch: toString probe missing label');
          }

          if (existingStateOk) {
            if (typeof currentToString !== 'function') {
              throw new Error('UACHPatch: Function.prototype.toString missing');
            }
            const actual = Reflect.apply(currentToString, seedProbe, []);
            if (actual !== seedExpected) {
              throw new Error('UACHPatch: toString bridge mismatch');
            }
          }

          const toString = function toString(...argList) {
            const target = nativeToString;
            const thisArg = this;
            if (typeof thisArg !== 'function') {
              try {
                return Reflect.apply(target, thisArg, argList);
              } catch (e) {
                try {
                  var d = self && self.__DEGRADE__;
                  if (typeof d === 'function') {
                    var ctx = {
                      type: 'browser structure missing data',
                      stage: 'runtime',
                      module: 'wrk',
                      diagTag: 'wrk',
                      surface: 'worker_bootstrap',
                      key: 'Function.prototype.toString',
                      message: 'Function.prototype.toString illegal invocation',
                      data: { outcome: 'throw', reason: 'native_illegal_invocation' }
                    };
                    if (typeof d.diag === 'function') d.diag('warn', 'wrk:toString_illegal_invocation', ctx, e);
                    else d('wrk:toString_illegal_invocation', e, Object.assign({}, ctx, { level: 'warn' }));
                  }
                } catch (_e) {}
                throw e;
              }
            }
            try {
              var direct = toStringOverrideMap.get(thisArg);
              if (direct !== undefined) return direct;

              var bridgeTarget = toStringProxyTargetMap.get(thisArg);
              if (typeof bridgeTarget === 'function') {
                var seenBridgeTargets = new WeakSet();
                while (typeof bridgeTarget === 'function') {
                  if (seenBridgeTargets.has(bridgeTarget)) {
                    try {
                      var d1 = self && self.__DEGRADE__;
                      if (typeof d1 === 'function') {
                        var ctx1 = {
                          type: 'contract violation',
                          stage: 'runtime',
                          module: 'wrk',
                          diagTag: 'wrk',
                          surface: 'worker_bootstrap',
                          key: 'Function.prototype.toString',
                          message: 'Function.prototype.toString bridge cycle',
                          data: { outcome: 'return', reason: 'bridge_cycle', fallback: 'native' }
                        };
                        if (typeof d1.diag === 'function') d1.diag('error', 'wrk:toString_bridge_cycle', ctx1, null);
                        else d1('wrk:toString_bridge_cycle', null, Object.assign({}, ctx1, { level: 'error' }));
                      }
                    } catch (_e1) {}
                    return Reflect.apply(target, thisArg, argList);
                  }
                  seenBridgeTargets.add(bridgeTarget);

                  var bridgeLabel = toStringOverrideMap.get(bridgeTarget);
                  if (bridgeLabel !== undefined) return bridgeLabel;

                  var nextBridgeTarget = toStringProxyTargetMap.get(bridgeTarget);
                  if (typeof nextBridgeTarget !== 'function') break;
                  bridgeTarget = nextBridgeTarget;
                }
                if (bridgeTarget !== thisArg && typeof bridgeTarget === 'function') {
                  try {
                    return Reflect.apply(target, bridgeTarget, argList);
                  } catch (mappedErr) {
                    try {
                      var d2 = self && self.__DEGRADE__;
                      if (typeof d2 === 'function') {
                        var ctx2 = {
                          type: 'browser structure missing data',
                          stage: 'hook',
                          module: 'wrk',
                          diagTag: 'wrk',
                          surface: 'worker_bootstrap',
                          key: 'Function.prototype.toString',
                          message: 'Function.prototype.toString mapped forward failed',
                          data: { outcome: 'return', reason: 'mapped_forward_failed', fallback: 'native' }
                        };
                        if (typeof d2.diag === 'function') d2.diag('warn', 'wrk:toString_mapped_forward_failed', ctx2, mappedErr);
                        else d2('wrk:toString_mapped_forward_failed', mappedErr, Object.assign({}, ctx2, { level: 'warn' }));
                      }
                    } catch (_e2) {}
                  }
                }
              }
              return Reflect.apply(target, thisArg, argList);
            } catch (e) {
              try {
                var d3 = self && self.__DEGRADE__;
                if (typeof d3 === 'function') {
                  var ctx3 = {
                    type: 'browser structure missing data',
                    stage: 'runtime',
                    module: 'wrk',
                    diagTag: 'wrk',
                    surface: 'worker_bootstrap',
                    key: 'Function.prototype.toString',
                    message: 'Function.prototype.toString apply failed',
                    data: { outcome: 'return', reason: 'apply_failed', fallback: 'native' }
                  };
                  if (typeof d3.diag === 'function') d3.diag('error', 'wrk:toString_apply_failed', ctx3, e);
                  else d3('wrk:toString_apply_failed', e, Object.assign({}, ctx3, { level: 'error' }));
                }
              } catch (_e3) {}
              try {
                return Reflect.apply(target, thisArg, argList);
              } catch (nativeErr) {
                throw nativeErr;
              }
            }
          };

          const installDesc = {
            value: toString,
            writable: fpToStringDesc ? !!fpToStringDesc.writable : true,
            configurable: fpToStringDesc ? !!fpToStringDesc.configurable : true,
            enumerable: fpToStringDesc ? !!fpToStringDesc.enumerable : false
          };
          const prevCoreStateDesc = nativeGetOwnProp(self, '__CORE_TOSTRING_STATE__');
          try {
            toStringProxyTargetMap.set(toString, nativeToString);
            markAsNative(toString, 'toString');

            Object.defineProperty(Function.prototype, 'toString', installDesc);

            const installedDesc = nativeGetOwnProp(Function.prototype, 'toString');
            if (!installedDesc || installedDesc.value !== toString) {
              throw new Error('UACHPatch: toString install descriptor mismatch');
            }
            if (!!installedDesc.writable !== !!installDesc.writable
              || !!installedDesc.configurable !== !!installDesc.configurable
              || !!installedDesc.enumerable !== !!installDesc.enumerable) {
              throw new Error('UACHPatch: toString install flags mismatch');
            }

            let nonFnErr = null;
            try {
              Reflect.apply(toString, {}, []);
            } catch (e) {
              nonFnErr = e;
            }
            if (!nonFnErr) {
              throw new Error('UACHPatch: toString brand-check lost');
            }

            const directProbe = function directProbe(){};
            const expectedNative = Reflect.apply(nativeToString, directProbe, []);
            const actualNative = Reflect.apply(toString, directProbe, []);
            if (actualNative !== expectedNative) {
              throw new Error('UACHPatch: toString native forwarding mismatch');
            }

            try {
              var p = Reflect.getPrototypeOf(toString);
              var ok = Reflect.setPrototypeOf(toString, p);
              if (ok !== true) {
                try {
                  var d4 = self && self.__DEGRADE__;
                  if (typeof d4 === 'function') {
                    var ctx4 = {
                      type: 'contract violation',
                      stage: 'contract',
                      module: 'wrk',
                      diagTag: 'wrk',
                      surface: 'worker_bootstrap',
                      key: 'Function.prototype.toString',
                      message: 'Reflect.setPrototypeOf(toString, currentProto) returned false',
                      data: { outcome: 'return', ok: false }
                    };
                    if (typeof d4.diag === 'function') d4.diag('warn', 'wrk:toString_setProto_failed', ctx4, null);
                    else d4('wrk:toString_setProto_failed', null, Object.assign({}, ctx4, { level: 'warn' }));
                  }
                } catch (_e4) {}
              }
            } catch (setProtoErr) {
              try {
                var d5 = self && self.__DEGRADE__;
                if (typeof d5 === 'function') {
                  var ctx5 = {
                    type: 'contract violation',
                    stage: 'contract',
                    module: 'wrk',
                    diagTag: 'wrk',
                    surface: 'worker_bootstrap',
                    key: 'Function.prototype.toString',
                    message: 'Reflect.setPrototypeOf(toString, currentProto) threw',
                    data: { outcome: 'return' }
                  };
                  if (typeof d5.diag === 'function') d5.diag('error', 'wrk:toString_setProto_threw', ctx5, setProtoErr);
                  else d5('wrk:toString_setProto_threw', setProtoErr, Object.assign({}, ctx5, { level: 'error' }));
                }
              } catch (_e5) {}
            }

            Object.defineProperty(self, '__CORE_TOSTRING_STATE__', {
              value: {
                __CORE_TOSTRING_STATE__: true,
                nativeToString: nativeToString,
                overrideMap: toStringOverrideMap,
                proxyTargetMap: toStringProxyTargetMap
              },
              writable: false,
              configurable: true,
              enumerable: false
            });
          } catch (e) {
            toStringProxyTargetMap.delete(toString);
            toStringOverrideMap.delete(toString);

            if (typeof currentToString === 'function') {
              Object.defineProperty(Function.prototype, 'toString', {
                value: currentToString,
                writable: fpToStringDesc ? !!fpToStringDesc.writable : true,
                configurable: fpToStringDesc ? !!fpToStringDesc.configurable : true,
                enumerable: fpToStringDesc ? !!fpToStringDesc.enumerable : false
              });
            }

            if (prevCoreStateDesc) {
              Object.defineProperty(self, '__CORE_TOSTRING_STATE__', prevCoreStateDesc);
            } else {
              delete self.__CORE_TOSTRING_STATE__;
            }
            throw e;
          }
        } catch (e) {
          self.__ENV_SEED_ERROR__ = String((e && (e.stack || e.message)) || e);
          throw e;
        }
  ;

})();

