import utils from '../utils';

class AbortRequest {
  constructor() {
    // 取消原因
    this.reason = null;
    // 取消 controller 实例
    this.controller = new AbortController();

    let resolvePromise;
    // promise 用于触发取消之后的一些清理和钩子
    this.promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    // 调用取消触发 onabort 方法， resolve promise
    const { signal } = this.controller;
    signal.onabort = () => {
      resolvePromise(this.reason);
    };
  }

  // 如果已经取消， 直接 throw error
  throwIfAborted() {
    if (this.controller.signal.aborted) {
      // 已经取消
      throw this.reason;
    }
  }
}

// 导出全局取消请求方法

function createAbortHandler () {
  const instance = new AbortRequest();
  return {
    abortRequestInstance: instance,
    abort: (reason = 'abort fetch') => {
      // 模拟发送之后取消， 浏览器的报错
      if (utils.isString(reason)) {
        instance.reason = new DOMException(reason);
      } else {
        instance.reason = reason;
      }
      // 调用真正取消方法
      instance.controller.abort();
    }
  };
}
export default createAbortHandler;
