import request from '../src/index.js';

describe('request api', function () {
  it('request methods or property type', function () {
    expect(typeof request).toEqual('function');
    expect(typeof request.request).toEqual('function');
    expect(typeof request.get).toEqual('function');
    expect(typeof request.head).toEqual('function');
    expect(typeof request.options).toEqual('function');
    expect(typeof request.delete).toEqual('function');
    expect(typeof request.post).toEqual('function');
    expect(typeof request.put).toEqual('function');
    expect(typeof request.patch).toEqual('function');
    expect(typeof request.clear).toEqual('function');
    expect(typeof request.abort).toEqual('function');
    expect(typeof request.create).toEqual('function');
    expect(typeof request.globalConfig).toEqual('function');
    expect(typeof request.createAbortHandler).toEqual('function');
    expect(typeof request.hookManager).toEqual('object');
  });

  it('should request methods return promise with abort', function () {
    const example = request();
    expect(typeof example.catch).toEqual('function');
    expect(typeof example.then).toEqual('function');
    expect(typeof example.finally).toEqual('function');
    expect(typeof example.abort).toEqual('function');
    expect(typeof example.requestId).toEqual('string');
  });

  it('should createAbortHandler return value cancel and instance ', function () {
    const createAbortHandler = request.createAbortHandler();
    expect(typeof createAbortHandler.abort).toEqual('function');
  });
});

describe('request instance api', function () {
  const instance = request.create();

  it('should have request methods', function () {
    expect(typeof instance.request).toEqual('function');
    expect(typeof instance.get).toEqual('function');
    expect(typeof instance.options).toEqual('function');
    expect(typeof instance.head).toEqual('function');
    expect(typeof instance.delete).toEqual('function');
    expect(typeof instance.post).toEqual('function');
    expect(typeof instance.put).toEqual('function');
    expect(typeof instance.patch).toEqual('function');
    expect(typeof instance.clear).toEqual('function');
    expect(typeof instance.abort).toEqual('function');
    expect(instance.create).toBeUndefined();
    expect(instance.globalConfig).toBeUndefined();
    expect(instance.createAbortHandler).toBeUndefined();
    expect(typeof instance.hookManager).toEqual('object');
  });
});
