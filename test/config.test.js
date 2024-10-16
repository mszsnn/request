import request from '../src/index.js';
import defaultConfig from '../src/core/defaultConfig';
import { addSuccessResult } from './help';

// 添加请求成功的返回键
addSuccessResult(request);

beforeEach(() => {
  // 重置默认全局配置
  request._config = defaultConfig;
});

describe('default config', function () {
  it('should default config', function () {
    const instance = request.create();
    expect(instance._config).toEqual(defaultConfig);
  });

  it('should global config', function () {
    const globalConfig = {
      baseURL: '/api',
      timeout: 500,
      method: 'post',
      requestId: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'same-origin',
      abortSignal: '',
      projectName: 'sensors',
      intl: 'test',
      onTimeout: () => {},
      onConfigMerge: () => {},
      other: [1, 2]
    };

    request.globalConfig(globalConfig);
    expect(request._config).toEqual(expect.objectContaining(globalConfig));

    const instance = request.create();
    expect(instance._config).toEqual(expect.objectContaining(globalConfig));
  });
});

describe('config will be merge', function () {
  it('should instance config', function () {
    const instanceConfig = {
      credentials: 'omit',
      baseURL: '/api',
      onConfigMerge: () => {
        return true;
      }
    };
    const instance = request.create(instanceConfig);
    expect(instance._config).toEqual(Object.assign({}, defaultConfig, instanceConfig));
  });

  it('should request config', async function () {
    request.globalConfig({
      baseURL: '/global'
    });

    const instance = request.create({
      baseURL: '/instance'
    });

    const config = {
      url: '/test'
    };

    await request(config).then(res => {
      expect(res.config.url).toBe('/global/test');
    });

    await instance(config).then(res => {
      expect(res.config).toBeUndefined();
    });

    await instance({
      baseURL: '/someone',
      url: '/test'
    }).then(res => {
      expect(res.config).toBeUndefined();
    });
  });
});

describe('config is in use', function () {
  const configType = {
    url: expect.any(String),
    abortSignal: expect.any(Object),
    credentials: expect.any(String),
    method: expect.any(String),
    timeout: expect.anything(),
    baseURL: expect.any(String)
  };

  const responseType = {
    status: expect.any(Number),
    headers: expect.any(Object),
    url: expect.any(String),
    ok: expect.any(Boolean)
  };

  const responseFailType = {
    config: expect.any(Object),
    status: expect.any(Number),
    headers: expect.any(Object),
    error: expect.anything(),
    url: expect.any(String)
  };

  it('should projectName,intl,baseURL,requestId,headers,method in use', async function () {
    await request({
      projectName: 'default',
      productName: 'test',
      intl: 'en',
      baseURL: '/global',
      url: '/test',
      requestId: false,
      headers: {
        global: 'request'
      },
      method: 'post'
    }).then(res => {
      const { headers, method, url } = res.config;
      expect(headers).toEqual({
        'sensorsdata-project': 'default',
        'Sensors-Language': 'en',
        'Sensors-Referer': 'test',
        'Content-Type': 'application/x-www-form-urlencoded',
        'global': 'request'
      });
      expect(method).toBe('post');
      expect(url).toBe('/global/test');
    });
  });

  it('should onConfigMerge function in use', async function () {
    const fn = jest.fn();
    const config = {
      baseURL: '/instance',
      url: 'test',
      onConfigMerge: fn
    };
    await request(config).then(() => {
      expect(fn).toHaveBeenCalledWith(config);
    });
  });

  it('should onBefore function in use', async function () {
    const fn = jest.fn();
    const config = {
      baseURL: '/instance',
      url: '/test',
      onBefore: fn
    };
    await request(config).then(() => {
      const type = Object.assign({}, configType, {
        onBefore: expect.any(Function)
      });
      expect(fn).toHaveBeenCalledWith(expect.objectContaining(type));
    });
  });

  it('should onSuccess in use', async function () {
    const fn = jest.fn(() =>{});
    const config = {
      baseURL: '/instance',
      url: '/test',
      onSuccess: fn
    };
    await request(config).then(() => {
      const type = Object.assign({}, configType, {
        onSuccess: fn
      });
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({ success: true }), expect.objectContaining(type));
    });
  });

  it('should onFinished in use', async function () {
    const fn = jest.fn(() =>{});
    const config = {
      baseURL: '/instance',
      url: '/test',
      onFinished: fn
    };
    await request(config).then(() => {
      const type = Object.assign({}, configType, {
        onFinished: fn
      });
      expect(fn).toHaveBeenCalledWith(expect.objectContaining(responseType), expect.objectContaining(type));
    });
  });

  it('should onFail in use', async function () {
    const fn = jest.fn(() =>{});
    const config = {
      baseURL: '/instance',
      url: '/testError',
      onFail: fn
    };
    await request(config).catch(() => {
      const type = Object.assign({}, configType, {
        onFail: fn
      });
      expect(fn).toHaveBeenCalledWith(expect.objectContaining(responseFailType), expect.objectContaining(type));
    });
  });

  it('should onTimeout in use reject', async function () {
    const fn = jest.fn(() => {});
    const config = {
      baseURL: '/instance',
      url: '/testTimeout',
      timeout: {
        time: 1000,
        action: 'reject'
      },
      onTimeout: fn
    };
    await request(config).catch(() => {
      const type = Object.assign({}, configType, {
        onTimeout: fn
      });
      expect(fn).toHaveBeenCalledWith(expect.objectContaining(type));
    });
  });

  it('should onTimeout in use resolve', async function () {
    const fn = jest.fn(() => {});
    const config = {
      baseURL: '/instance',
      url: '/testTimeout',
      timeout: {
        time: 3000,
        action: 'reject'
      },
      onTimeout: fn
    };
    await request(config).then(() => {
      expect(fn).not.toBeCalled();
    });
  });

  it('should onAbort in use', async function () {
    const fn = jest.fn(() => {});
    const createAbortHandler = request.createAbortHandler();
    const config = {
      baseURL: '/instance',
      url: '/testTimeout',
      timeout: {
        time: 1000,
        action: 'reject'
      },
      abortSignal: createAbortHandler,
      onAbort: fn
    };
    createAbortHandler.abort('cancel');
    await request(config).catch(() => {});
    const type = Object.assign({}, configType, {
      onAbort: fn
    });
    expect(fn).toHaveBeenCalledWith(expect.objectContaining(type), expect.any(Error));
  });
});
