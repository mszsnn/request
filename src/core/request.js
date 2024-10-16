import utils from '../utils/index';
import mergeConfig from './mergeConfig';
import { METHODS, FETCH_INIT_KEYS } from '../constant';
import _ from 'lodash';
import getHookManager from './addHooks';
import requestFormat from './requestFormat';

class Request {
  constructor(config) {
    // 默认参数
    this._config = config;
    // 插件
    this._plugins = config.plugins;
    // 钩子系统
    this.hookManager = getHookManager();

    // 添加别名方法 delete、get、head、options -> request
    [METHODS.DELETE, METHODS.GET, METHODS.HEAD, METHODS.OPTIONS].forEach(method => {
      Object.defineProperty(this, method, {
        value: (url, config) => {
          return this.request(mergeConfig(config || {}, {
            method: method,
            url: url,
            params: (config || {}).params
          }));
        },
        writable: false,
        enumerable: false,
        configurable: false
      });
    });

    // 添加别名方法 post、put、patch -> request
    [METHODS.POST, METHODS.PUT, METHODS.PATCH].forEach(method => {
      Object.defineProperty(this, method, {
        value: (url, data, config) => {
          return this.request(mergeConfig(config || {}, {
            method: method, url: url, body: data
          }));
        },
        writable: false,
        enumerable: false,
        configurable: false
      });
    });

    this._pluginRegister(this._plugins);
  }

  // 注册插件, 插件为一个有 init 方法的类
  _pluginRegister = (plugins) => {
    plugins.forEach(plugin => {
      plugin.init(this);
    });
  }

  // 异步钩子和回调执行器
  _asyncHookAndCallbackExecutor = async ({ hookName, hookPreload, callback, callbackPreload }) => {
    await this.hookManager.runHooks(hookName, hookPreload);
    if (callback && utils.isFunction(callback)) {
      callback(...callbackPreload);
    }
  }

  // 同步钩子和回调执行器
  _syncHookAndCallbackExecutor = ({ hookName, hookPreload, callback, callbackPreload }) => {
    this.hookManager.runHooks(hookName, hookPreload);
    if (callback && utils.isFunction(callback)) {
      callback(...callbackPreload);
    }
  }

  // 最基础的fetch 调用，返回 promise
  _createFetch = ({ finalConfig }) => {
    const { url, ...rest } = _.pick(finalConfig, FETCH_INIT_KEYS);
    return fetch(url, rest);
  };

  // 请求核心逻辑
  async _coreRequest(context) {
    // 请求发送前
    this._syncHookAndCallbackExecutor({
      hookName: 'beforeSend',
      hookPreload: context,
      callback: context.finalConfig.onBefore || context.globalConfig.onBefore,
      callbackPreload: [context.finalConfig]
    });

    this.hookManager.runHooks('request', context);

    // 添加请求返回结果
    context.response = await context.createFetch();

    await this._asyncHookAndCallbackExecutor({
      hookName: 'finish',
      hookPreload: context,
      callback: context.finalConfig.onFinished || context.globalConfig.onFinished,
      callbackPreload: [context.response, context.finalConfig]
    });

    const { status } = context.response;

    // 根据返回结果状态 status, 区分成功 or 失败
    if (status < 200 || status >= 300) {
      // 添加错误 error
      context.error = await requestFormat.formatError(context.response, context.finalConfig);
      await this._asyncHookAndCallbackExecutor({
        hookName: 'fail',
        hookPreload: context,
        callback: context.finalConfig.onFail || context.globalConfig.onFail,
        callbackPreload: [context.error, context.finalConfig],
      });
      return Promise.reject(context.error);
    } else {
      // 添加成功 expected
      context.expected = await requestFormat.format(context.response);
      await this._asyncHookAndCallbackExecutor({
        hookName: 'success',
        hookPreload: context,
        callback: context.finalConfig.onSuccess || context.globalConfig.onSuccess,
        callbackPreload: [context.expected, context.finalConfig],
      });
      return context.expected;
    }
  }

  // 请求
  request(config = {}) {
    // 生成一个当前请求的 context, 包含了所有的参数， 以及参数可能附加的参数
    const context = {
      config: config, // 传进来的配置
      globalConfig: _.cloneDeep(this._config), // 全局配置
      instance: this, // 当前实例对象
      createFetch: () => this._createFetch(context), // 请求创建方法
    };

    // 参数合并之前
    this._syncHookAndCallbackExecutor({
      hookName: 'beforeMergeConfig',
      hookPreload: context,
      callback: context.config.onConfigMerge || context.globalConfig.onConfigMerge,
      callbackPreload: [context.config]
    });

    // 合并参数,  添加 finalConfig 最终参数
    context.finalConfig = mergeConfig(context.globalConfig, context.config);

    // 参数合并后
    this._syncHookAndCallbackExecutor({
      hookName: 'afterMergeConfig',
      hookPreload: context,
      callback: context.finalConfig.onConfigMerged || context.globalConfig.onConfigMerged,
      callbackPreload: [context.finalConfig]
    });

    // 获取返回的 promise， 添加 responsePromise 属性
    context.responsePromise = this._coreRequest(context);

    // 请求已经建立， 返回 promise
    this.hookManager.runHooks('requestEstablished', context);

    return context.responsePromise;
  }
}

export default Request;
