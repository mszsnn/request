import request from '../src/index.js';
import { addSuccessResult } from './help';
addSuccessResult(request);

describe('request methods', function () {
  it('should request get method in use', async function () {
    await request.get('/get', {
      query: 'name=lisi'
    }).then(res => {
      const { method, url } = res.config;
      expect(method).toBe('get');
      expect(url).toBe('/get?name=lisi');
    });

    await request.get('/get', {
      query: '?name=lisi'
    }).then(res => {
      const { url } = res.config;
      expect(url).toBe('/get?name=lisi');
    });

    await request.head('/head').then(res => {
      expect(res.config.url).toBe('/head');
    });

    await request.delete('/delete').then(res => {
      expect(res.config.url).toBe('/delete');
    });

    await request.options('/options').then(res => {
      expect(res.config.url).toBe('/options');
    });

    const bodyData = 'sen';
    await request.post('/post', bodyData).then(res => {
      const { method, body } = res.config;
      expect(method).toBe('post');
      expect(body).toBe('sen');
    });

    await request.put('/put', bodyData).then(res => {
      const { method, body } = res.config;
      expect(method).toBe('put');
      expect(body).toBe(bodyData);
    });

    await request.patch('/patch', bodyData).then(res => {
      const { method, body } = res.config;
      expect(method).toBe('patch');
      expect(body).toBe(bodyData);
    });
  });

  it('should be encryption', async function () {
    const bodyData = { name: 'lisi' };
    const type = expect.objectContaining({
      'Aes-Salt': expect.any(String),
      'Aes-Iv': expect.any(String),
      'Aes-Passphrase': expect.any(Boolean)
    });

    await request.post('/post', bodyData, {
      encryption: {
        pubKey: '123'
      }
    }).then(res => {
      const { method, body, headers } = res.config;
      expect(method).toBe('post');
      expect(body).toEqual(expect.any(String));
      expect(headers).toEqual(type);
    });

    await request.post('/post', bodyData, {
      encryption: '123'
    }).then(res => {
      const { method, body, headers } = res.config;
      expect(method).toBe('post');
      expect(body).toEqual(expect.any(String));
      expect(headers).toEqual(type);
    });
  });

  it('should be timeout in use', async function () {
    await request.get('/instance/testTimeout', {
      timeout: 100
    }).then(res => {
      expect(res.data).toEqual(expect.anything());
    });

    await request.get('/instance/testTimeout', {
      timeout: {
        time: 500,
        action: 'reject'
      }
    }).catch(err => {
      expect(err.message).toBe('request url:/instance/testTimeout timeout');
    });

    await request.get('/instance/testTimeout', {
      timeout: {
        time: 500,
        action: 'retry'
      }
    }).catch(err => {
      expect(err.message).toBe('request url:/instance/testTimeout timeout');
    });
  });

  it('should be timeout no use and cancel', async function () {
    const abortHandler = request.createAbortHandler();
    setTimeout(() => {
      abortHandler.abort('cancel');
    }, 1000);
    await request.get('/instance/testTimeout', {
      timeout: {
        time: 3000,
        action: 'reject'
      },
      abortSignal: abortHandler
    }).catch(res => {
      // 请求已经发出后， 报错为浏览器默认行为的提示
      expect(res.message).toBe('cancel');
    });
  });

  it('should formData in use', async function () {
    const data = new FormData();
    data.append('name', 'lisi');
    await request({
      method: 'post',
      body: data,
      url: '/post'
    }).then(res=> {
      expect(res.config.headers).toHaveProperty('Content-Type', 'multipart/form-data');
    });
  });
});

