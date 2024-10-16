import utils from '../utils';
import { THROTTLE_ACTION } from '../constant';
import md5 from 'md5';

const defaultThrottleConfig = {
  time: 0,
  send: 'first',
  action: 'reject'
};

class ThrottleHandler {
  constructor() {
    /*
    请求映射
    [hash] : {
      promise, // 等待时间读秒
      first: true, // 是否是第一个请求
      response: null, // 保存的请求
      resolve: [] // 使用最后一个请求时，保存的 resolve 集合
    };
    */

    this._requestThrottleMap = {};
  }

  repeatRequestWarning(config) {
    const { url } = config;
    return new Error(`repeat request url:${url} reject`);
  }

  init(instance) {
    instance.hookManager.getHook('request').tap('throttle', (context) => {
      const { config } = context;
      const { throttle } = config;
      let flag = false;
      if (utils.isNumber(throttle)) {
        flag = !!throttle;
      } else {
        flag = !!throttle.time;
      }
      if (!flag) return;
      // 根据 config 生成 hash
      const hash = md5(JSON.stringify(config));
      // 存储原始 createFetch
      const createFetch = context.createFetch;

      // 在原始 createFetch 上包装一层
      context.createFetch = async () => {
        let response = await this.core(context, hash, createFetch);
        // response 默认只能被消费一次
        response = response.clone();
        return response;
      };
    });

    instance.hookManager.getHook('finish').tap('clearTimeout', ({ finalConfig }) => {
      // 清掉时间
      clearTimeout(finalConfig._timeoutT);
    });
  }

  initParams(finalConfig) {
    const { throttle } = finalConfig;
    // 参数
    let { time, send, action } = defaultThrottleConfig;
    if (utils.isNumber(throttle)) {
      time = throttle;
    } else {
      const throttleConfig = Object.assign({}, defaultThrottleConfig, throttle);
      ({ time, send, action } = throttleConfig);
    }
    return { time, send, action };
  }

  core = ({ finalConfig, config }, hash, createFetch) => {
    // 参数
    let { time, send, action } = this.initParams(finalConfig);

    // 没有节流等待缓存
    if (!this._requestThrottleMap[hash]) {
      // 开启节流等待， 不管是第一个还是最后一个， 都先开启节流等待读秒
      const promise = new Promise((resolve) => {
        const t = setTimeout(() => {
          resolve();
          clearTimeout(t);
        }, time);
      }).then(() => {
        // 等待时间结束时， 需要处理是需要最后一个请求的节流
        if (send === 'last' && this._requestThrottleMap[hash].resolve.length) {
          // 发送最后一个请求， 其他请求全部 resolve
          const request = createFetch(); // 最后的那个请求
          this._requestThrottleMap[hash].resolve.forEach(({ resolve }) => {
            resolve(request);
          });
        }
        delete this._requestThrottleMap[hash];
      });

      this._requestThrottleMap[hash] = {
        promise, // 等待时间读秒
        first: true, // 是否是第一个请求
        response: null, // 保存的请求
        resolve: [] // 使用最后一个请求时，保存的 resolve 集合
      };
    }

    const wait = this._requestThrottleMap[hash];

    // 使用等待时间的第一个请求
    if (send === 'first') {
      // 需要判断是不是第一个， 如果是第一个， 发送这个配置进行请求， 如果不是第一个，判断是 abort 还是 resolve,
      if (wait.first) {
        // 是第一个请求
        wait.first = false;
        // 发送请求， 后续请求都直接返回这次的 promise
        const request = createFetch();
        wait.response = request;
        return request;
      } else {
        // 不是第一个请求的情况
        if (action === THROTTLE_ACTION.REJECT) {
          return Promise.reject(this.repeatRequestWarning(config));
        } else {
          return wait.response;
        }
      }
    } else {
      // 使用等待时间的最后一个请求
      // 需要处理是否是等待时间的最后一个请求, 如果确认不是最后一个， 并且是abort , 直接 reject
      const request = {};
      const res = new Promise((resolve, reject) => {
        request.resolve = (response) => {
          resolve(response);
        };
        request.reject = (error) => {
          reject(error);
        };
      });

      if (action === THROTTLE_ACTION.REJECT) {
        const promise = wait.resolve.shift();
        if (promise) {
          let { reject } = promise;
          reject(this.repeatRequestWarning(config));
        }
        wait.resolve.push(request);
      } else {
        wait.resolve.push(request);
      }
      return res;
    }
  }
}

export default new ThrottleHandler();

