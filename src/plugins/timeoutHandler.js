import utils from '../utils';
import { TIMEOUT_ACTION } from '../constant';

const defaultTimeoutTime = 0;
const defaultTimeoutAction = TIMEOUT_ACTION.CONTINUE;

class TimeoutHandler {
  timeoutWarning(config) {
    const { url } = config;
    return new Error(`request url:${url} timeout`);
  }

  initParams(finalConfig) {
    // 合并参数， 处理默认参数
    const { timeout } = finalConfig;
    let time = defaultTimeoutTime;
    let action = defaultTimeoutAction;
    if (utils.isNumber(timeout)) {
      time = timeout;
    } else {
      const finallyTimoutConfig = Object.assign({
        time: defaultTimeoutTime,
        action: defaultTimeoutAction
      }, timeout);
      ({ time, action } = finallyTimoutConfig);
    }
    return {
      time, action
    };
  }

  core(context, createFetch) {
    const { instance, finalConfig } = context;
    const { _syncHookAndCallbackExecutor } = instance;

    // 触发超时
    const emitTimeout = () => _syncHookAndCallbackExecutor({
      hookName: 'timeout',
      hookPreload: context,
      callback: context.finalConfig.onTimeout || context.globalConfig.onTimeout,
      callbackPreload: [context.finalConfig]
    });

    const { time, action } = this.initParams(finalConfig);

    if (action === 'reject' || action === 'retry') {
      // 超时重试或 reject
      return Promise.race([createFetch(context), new Promise((resolve, reject) => {
        finalConfig._timeoutT = setTimeout(() => {
          reject(action);
          clearTimeout(finalConfig._timeoutT);
        }, time);
      })]).then(res => {
        return res;
      }, (err) => {
        // 异常处理
        if (typeof err === 'string' && err === 'retry') {
          if (!finalConfig._again) {
            finalConfig._again = true;
            emitTimeout();
            // 重新执行一次
            return this.core(context, createFetch);
          } else {
            return Promise.reject(this.timeoutWarning(finalConfig));
          }
        } else if (err === 'reject') {
          emitTimeout();
          return Promise.reject(this.timeoutWarning(finalConfig));
        } else {
          return Promise.reject(err);
        }
      });
    } else {
      // 仅仅提醒超时
      return new Promise((resolve) => {
        finalConfig._timeoutT = setTimeout(() => {
          emitTimeout();
          console.warn(this.timeoutWarning(finalConfig));
          clearTimeout(finalConfig._timeoutT);
        }, time);
        resolve(createFetch(context));
      });
    }
  }

  init = (instance) => {
    instance.hookManager.getHook('request').tap('timeout', (context) => {
      const { finalConfig } = context;
      const { timeout } = finalConfig;
      if (timeout) {
        // 保存原始 createFetch
        const createFetch = context.createFetch;
        // 包装一层
        context.createFetch = () => this.core(context, createFetch);
      }
    });
  }
}

export default new TimeoutHandler();
