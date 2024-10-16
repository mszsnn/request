export class HookManager {
  _slots = {};

  hasHooksHandler = (slotsName, hookName) => {
    const flag = this.isSlotRegisted(slotsName);
    return flag && this._slots[slotsName].find(item => item.name === hookName);
  }

  cloneHooks = () => {
    // 浅拷贝
    if (!Object.keys(this._slots)) {
      return {};
    }
    const target = {};
    Object.keys(this._slots).forEach(name => {
      target[name] = this._slots[name].slice();
    });
    return target;
  };

  runHooks = (name, payload) => {
    if (!this._slots[name]) {
      return;
    }
    let returnVal;
    this._slots[name].forEach(({ hook }) => {
      returnVal = hook(payload, returnVal);
    });
    return returnVal;
  };

  registSlot = (name, config) => {
    if (this._slots[name] && this._slots[name]._config && config) {
      console.warn('[SEF] HookManager', `Hook Slot ${name} already registed, with config`, this._slots[name]._config, 'but registed again with config', config);
    }
    this._initSlot(name);
    this._slots[name]._config = config || {};
  };

  _initSlot = (name) => {
    if (!this._slots[name]) {
      this._slots[name] = [];
    }
  };

  isSlotRegisted = (name) => {
    return this._slots[name] && this._slots[name]._config;
  };

  getHook = (name) => {
    return new Proxy({
      tap: () => {
      },
      tapAsync: () => {
      },
      unTap: () => {
      }
    }, this._generateHookProxy(name));
  };

  _generateHookProxy = (name) => {
    return {
      get: (target, prop) => {
        switch (prop) {
          case 'tap':
            return new Proxy(() => {}, {
              apply: (target, thisArg, argumentsList) => {
                let [hookName, hookFunc, options = {}] = argumentsList;
                const { once } = options;
                if (once) {
                  const oldHookFunc = hookFunc;
                  hookFunc = (...args) => {
                    oldHookFunc(...args);
                    Reflect.apply(this._untap, this, [name, hookName, hookFunc]);
                  };
                }

                return Reflect.apply(this._tap, this, [name, hookName, hookFunc]);
              }
            });
          case 'tapAsync':
            return new Proxy(() => {
            }, {
              apply: (target, thisArg, argumentsList) => {
                let [hookName, hookFunc, options = {}] = argumentsList;
                const { once } = options;
                if (once) {
                  const oldHookFunc = hookFunc;
                  hookFunc = (...args) => {
                    oldHookFunc(...args);
                    Reflect.apply(this._untap, this, [name, hookName, hookFunc, 'async']);
                  };
                }

                const oldHookFunc = hookFunc;
                hookFunc = async (payload, returnVal) => {
                  const response = await returnVal;
                  return oldHookFunc(payload, response);
                };

                return Reflect.apply(this._tap, this, [name, hookName, hookFunc, 'async']);
              }
            });
          case 'unTap':
            return new Proxy(() => {
            }, {
              apply: (target, thisArg, argumentsList) => {
                let [hookName, hookFunc] = argumentsList;
                return Reflect.apply(this._untap, this, [name, hookName, hookFunc]);
              }
            });
        }
      }
    };
  };

  _tap = (soltName, hookName, hookFunc) => {
    if (!this._slots[soltName]) {
      this._slots[soltName] = [];
    }
    this._slots[soltName].push({
      name: hookName, hook: hookFunc
    });
  };

  _untap = (soltName, hookName, hookFunc) => {
    if (!this._slots[soltName]) return;
    this._slots[soltName] = this._slots[soltName].filter(t => t.name !== hookName || t.hook !== hookFunc);
  };
}

function createHookManager() {
  const hookManager = new HookManager();

  // for IE 11 :(
  hookManager.useHook = (name) => {
    if (!hookManager.isSlotRegisted(name)) {
      hookManager._initSlot(name);
    }
    return hookManager.getHook(name);
  };

  hookManager.hooks = new Proxy({}, {
    get: (target, prop) => {
      return hookManager.useHook(prop);
    }
  });

  return hookManager;
}

export {
  createHookManager
};

