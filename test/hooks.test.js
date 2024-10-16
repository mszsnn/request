import request from '../src';
describe('hooks manage', function () {
  it('should global beforeMergeConfig hook use', async function () {
    const fn = jest.fn(({ config }) => {
      config.method = 'post';
    });
    request.hookManager.getHook('beforeMergeConfig').tap('before', fn);

    const config = {
      url: '/post'
    };
    await request(config).then((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({
        config: expect.objectContaining({ 'method': 'post' })
      }), undefined);
      expect(res).toBe('success');
    });
  });

  it('should global afterMergeConfig hook use', async function () {
    const fn = jest.fn(({ finalConfig }) => {
      finalConfig.runAfter = true;
    });
    request.hookManager.getHook('afterMergeConfig').tap('after', fn);

    const config = {
      url: '/post'
    };
    await request(config).then((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({
        finalConfig: expect.objectContaining({ runAfter: true })
      }), undefined);
      expect(res).toBe('success');
    });
  });

  it('should global beforeSend  hook use', async function () {
    const fn = jest.fn(() => {});

    request.hookManager.getHook('beforeSend').tap('after', fn);
    const config = {
      url: '/post'
    };
    await request(config).then((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({ finalConfig: expect.any(Object) }), undefined);
      expect(res).toBe('success');
    });
  });

  it('should global finish  hook use', async function () {
    const fn = jest.fn(() => {});

    request.hookManager.getHook('finish').tap('handler', fn);

    const config = {
      url: '/post'
    };
    await request(config).then((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({
        response: expect.any(Response),
      }), undefined);
      expect(res).toBe('success');
    });
  });

  it('should global success  hook use', async function () {
    const fn = jest.fn();

    request.hookManager.getHook('success').tap('handler', fn);

    const config = {
      url: '/post'
    };
    await request(config).then((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({
        expected: 'success'
      }), undefined);
      expect(res).toBe('success');
    });
  });

  it('should global fail hook use', async function () {
    const fn = jest.fn(({ error }) => {
      error.runFail = true;
    });

    request.hookManager.getHook('fail').tap('handler', fn);

    const config = {
      url: '/instance/testError'
    };

    await request(config).catch((res) => {
      const error = expect.objectContaining({
        status: 404,
        runFail: true
      });
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({
        error: error,
      }), undefined);
      expect(res.config.method).toBe('post');
      expect(res.config.runAfter).toBeTruthy();
      expect(res.runFail).toBeTruthy();
    });
  });

  it('should global timeout hook use', async function () {
    const fn = jest.fn();

    request.hookManager.getHook('timeout').tap('handler', fn);

    const config = {
      url: '/instance/testTimeout',
      timeout: 1000
    };

    await request(config).catch((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(res.config.method).toBe('post');
      expect(res.config.runAfter).toBeTruthy();
    });
  });

  it('should global afterAbort hook use', async function () {
    const fn = jest.fn();

    request.hookManager.getHook('afterAbort').tap('handler', fn);

    const config = {
      url: '/instance/testTimeout',
      timeout: 1000
    };

    const example = request(config);
    example.abort('cancel');
    await example.catch((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({
        reason: expect.any(Error)
      }), undefined);
      expect(res.message).toBe('cancel');
    });
  });

  it('should instance beforeMergeConfig hook use', async function () {
    const fn = jest.fn(({ config }) => {
      config.method = 'get';
    });
    const instance = request.create();
    instance.hookManager.getHook('beforeMergeConfig').tap('instance', fn);

    const config = {
      url: '/get'
    };
    await instance(config).then((res) => {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(res).toBe('success');
    });
  });
});
