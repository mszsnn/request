import createAbortHandler from '../core/abortController';
import { v4 as uuid } from 'uuid';

class AbortHandler {
  constructor() {
    // 全局请求映射 uuid : abort
    this._abortMap = {};
  }

  init = (instance) => {
    // 实例添加 abort
    instance.abort = (requestId, reason = 'abort fetch') => {
      if (!this._abortMap[requestId]) return;
      this._abortMap[requestId](reason);
      delete this._abortMap[requestId];
    };

    // 实例添加 clear
    instance.clear = () => {
      Object.values(this._abortMap).forEach(abort => {
        abort('abort all fetch');
      });
      this._abortMap = {};
    };

    const beforeMergeConfigHook = instance.hookManager.getHook('beforeMergeConfig');

    // 生成 uuid
    beforeMergeConfigHook.tap('requestIdAndAddAbortFun', (context) => {
      context.requestId = uuid();
    });

    const beforeSendHooks = instance.hookManager.getHook('beforeSend');
    const finishedHooks = instance.hookManager.getHook('finish');

    // 取消浏览器默认的异常抛出， 统一异常格式化
    beforeSendHooks.tap('cancelDefaultAbortErrorMessage', (context) => {
      const { createFetch } = context;
      context.createFetch = () => {
        return createFetch(context).then(res => res).catch(err => {
          if (err.name && err.name === 'AbortError') {
            throwIfAborted(context);
          } else {
            throw err;
          }
        });
      };
    });

    // 取消钩子触发时机
    beforeSendHooks.tap('listenAbort', (context) => {
      const { finalConfig, instance, requestId } = context;
      const { _syncHookAndCallbackExecutor } = instance;

      if (!finalConfig.abortSignal) {
        finalConfig.abortSignal = createAbortHandler();
      }
      const { abortRequestInstance, abort } = finalConfig.abortSignal;

      // 添加 finalConfig.signal 为真正  signal
      const { controller } = abortRequestInstance;
      finalConfig.signal = controller.signal;

      this._abortMap[requestId] = abort;
      // 触发取消钩子
      abortRequestInstance.promise.then((reason) => {
        context.reason = reason;
        // 去除可能存在的取消缓存
        instance.abort(requestId, reason);

        // 触发钩子
        _syncHookAndCallbackExecutor({
          hookName: 'afterAbort',
          hookPreload: context,
          callback: context.finalConfig.onAbort || context.globalConfig.onAbort,
          callbackPreload: [context.finalConfig, reason]
        });
      });
    });

    const throwIfAborted = ({ finalConfig }) => {
      const { abortRequestInstance } = finalConfig.abortSignal;
      abortRequestInstance.throwIfAborted();
    };

    // 请求发送前和请求完成时，判断是否取消
    beforeSendHooks.tap('throwIfAborted', throwIfAborted);
    finishedHooks.tap('throwIfAborted', throwIfAborted);

    // 清除缓存映射
    finishedHooks.tap('removeAbortMap', ({ requestId }) => {
      delete this._abortMap[requestId];
    });

    const requestFinallyHooks = instance.hookManager.getHook('requestEstablished');

    // 添加 promise.abort
    requestFinallyHooks.tap('addAbort', (context) => {
      const { responsePromise, requestId, instance } = context;
      responsePromise.requestId = requestId;
      responsePromise.abort = (reason) => {
        instance.abort(requestId, reason);
      };
    });
  }
}

export default new AbortHandler();
