import request from '../src';

describe('throttle request', function () {
  it('should use first request and reject', async function () {
    const onFinished = jest.fn();
    const config = {
      url: '/get',
      method: 'get',
      throttle: 1000,
      onFinished
    };
    const example1 = request(config).then(res => {
      expect(res).toBe('success');
    });
    const example2 = request(config).catch(res => {
      expect(res.message).toBe('repeat request url:/get reject');
    });
    const example3 = request(config).catch(res => {
      expect(res.message).toBe('repeat request url:/get reject');
    });
    await example1;
    await example2;
    await example3;
    expect(onFinished).toHaveBeenCalledTimes(1);
  });
  it('should no throttle', async function () {
    const onFinished = jest.fn();
    const config = {
      url: '/get',
      method: 'get',
      throttle: 0,
      onFinished
    };
    const example1 = request(config).then(res => {
      expect(res).toBe('success');
    });
    const example2 = request(config).then(res => {
      expect(res).toBe('success');
    });
    const example3 = request(config).then(res => {
      expect(res).toBe('success');
    });
    await example1;
    await example2;
    await example3;
    expect(onFinished).toHaveBeenCalledTimes(3);
  });

  it('should use last request and reject', async function () {
    const onFinished = jest.fn();
    const config = {
      url: '/get',
      method: 'get',
      throttle: {
        time: 500,
        action: 'reject',
        send: 'last'
      },
      onFinished
    };
    const example1 = request(config).catch(res => {
      expect(res.message).toBe('repeat request url:/get reject');
    });
    const example2 = request(config).catch(res => {
      expect(res.message).toBe('repeat request url:/get reject');
    });
    const example3 = request(config).then(res => {
      expect(res).toBe('success');
    });
    await example1;
    await example2;
    await example3;
    expect(onFinished).toHaveBeenCalledTimes(1);
  });
  it('should use first request and resolve', async function () {
    const config = {
      url: '/get',
      method: 'get',
      throttle: {
        time: 1000,
        send: 'first',
        action: 'resolve'
      }
    };

    const fn = jest.fn(() => {
      return Promise.resolve(
        new Response('success', {
          status: 200,
          statusText: 'ok'
        })
      );
    });

    const originFetch = window.fetch;
    window.fetch = fn;

    const example1 = request(config).then(res => {
      expect(res).toBe('success');
    });

    const example2 = request(config).then(res => {
      expect(res).toBe('success');
    });

    const example3 = request(config).then(res => {
      expect(res).toBe('success');
    });
    await example1;
    await example2;
    await example3;
    expect(fn).toHaveBeenCalledTimes(1);

    window.fetch = originFetch;
  });
  it('should use last request and resolve', async function () {
    const config = {
      url: '/get',
      method: 'get',
      throttle: {
        time: 1000,
        send: 'last',
        action: 'resolve'
      }
    };

    const fn = jest.fn(() => {
      return Promise.resolve(new Response('success', {
        status: 200,
        statusText: 'ok'
      }));
    });

    const originFetch = window.fetch;
    window.fetch = fn;

    const example1 = request(config).then(res => {
      expect(res).toBe('success');
    });

    const example2 = request(config).then(res => {
      expect(res).toBe('success');
    });

    const example3 = request(config).then(res => {
      expect(res).toBe('success');
    });
    await example1;
    await example2;
    await example3;
    expect(fn).toHaveBeenCalledTimes(1);
    window.fetch = originFetch;
  });
});

