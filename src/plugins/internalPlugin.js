import utils from '../utils';
import timeoutHandler from './timeoutHandler';
import throttleHandler from './throttleHandler';

class InternalPlugin {
  init = (instance) => {
    instance.hookManager.getHook('beforeMergeConfig').tap('pluginRegister', ({ config, instance }) => {
      const { hookManager: hookManagerInstance } = instance;
      const register = (prop, handler) => {
        const value = config[prop];
        const isNeedRegister = utils.isNumber(value) && value || utils.isObject(value) && value.time;
        // 需要注册且未注册
        if (isNeedRegister && !hookManagerInstance.hasHooksHandler('request', prop)) {
          instance._pluginRegister([handler]);
        }
      };
      register('timeout', timeoutHandler);
      register('throttle', throttleHandler);
    });
  }
}

export default new InternalPlugin();
