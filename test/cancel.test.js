import { request } from '../src/index.js';

describe('cancel request ', function () {
  it('should custom cancel in use', async function () {
    const abort = request.createAbortHandler();

    const config = {
      abortSignal: abort,
      method: 'get',
      url: '/get'
    };
    abort.abort();

    await request(config).catch(err => {
      expect(err.message).toBe('abort fetch');
    });
  });

  it('should custom cancel by clear', async function () {
    const cancel = request.createAbortHandler();
    const config = {
      abortSignal: cancel,
      method: 'get',
      url: '/get'
    };
    const example = request(config).catch(err => {
      expect(err.message).toBe('abort all fetch');
    });
    request.clear();
    await example;
  });

  it('should custom cancel by id', async function () {
    const config = {
      method: 'get',
      url: '/get'
    };

    const example = request(config);
    const id = example.requestId;

    request.abort(id);

    await example.catch(err => {
      expect(err.message).toBe('abort fetch');
    });
  });

  it('should custom cancel by itself', async function () {
    const config = {
      method: 'get',
      url: '/get'
    };

    const example = request(config);
    example.abort('cancel');

    await example.catch(err => {
      expect(err.message).toBe('cancel');
    });
  });
  it('should custom cancel by itself two', async function () {
    const config = {
      method: 'get',
      url: '/get'
    };

    const example = request(config);
    setTimeout(() => {
      example.abort('cancel');
    });

    await example.catch(err => {
      expect(err.message).toBe('cancel');
    });
  });
});
