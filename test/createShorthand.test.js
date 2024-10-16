import { createShorthand, request } from '../src/index.js';
import { addSuccessResult } from './help';
addSuccessResult(request);

describe('createShorthand function', function () {
  it('should createShorthand  function one argument query data', async function () {
    const exampleQuery = createShorthand({
      url: '/get',
      method: 'get',
      query: {
        age: 20
      }
    });

    await exampleQuery({
      query: {
        name: 'lisi'
      }
    }).then(res => {
      const { method, url } = res.config;
      expect(method).toBe('get');
      expect(url).toBe('/get?name=lisi&age=20');
    });
  });

  it('should createShorthand function one argument body data', async function () {
    const bodyData = { name: 'lisi', habit: ['play'] };
    const exampleBody = createShorthand({
      url: '/post',
      method: 'post',
      body: {
        age: 20
      }
    });

    await exampleBody({
      body: bodyData
    }).then(res => {
      const { method, body, headers } = res.config;
      expect(method).toBe('post');
      expect(body).toEqual(JSON.stringify(Object.assign(bodyData, { age: 20 })));
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });
  });

  it('should createShorthand function one argument path parser', async function () {
    const bodyData = { name: 'lisi' };
    const exampleBody = createShorthand({
      url: '/post/:id',
      method: 'post',
      query: {
        number: 137
      },
      body: {
        age: 20
      }
    });

    await exampleBody({
      body: bodyData,
      query: {
        card: 'test'
      },
      path: {
        id: 1
      }
    }).then(res => {
      const { method, body, headers, url } = res.config;
      expect(method).toBe('post');
      expect(url).toBe('/post/1?card=test&number=137');
      expect(body).toEqual(JSON.stringify(Object.assign(bodyData, { age: 20 })));
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });
  });
  it('should createShorthand function path', async function () {
    const bodyData = { name: 'lisi' };
    const exampleBody = createShorthand({
      url: '/post/:id/:name',
      method: 'post'
    });

    await exampleBody({
      body: bodyData,
      path: {
        id: 1
      }
    }).then(res => {
      const { method, headers, url } = res.config;
      expect(method).toBe('post');
      expect(url).toBe('/post/1');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });
  });

  it('should createShorthand  function more argument query data', async function () {
    const exampleQuery = createShorthand({
      url: '/test',
      method: 'get',
      query: {
        age: 20
      }
    });

    await exampleQuery({
      name: 'lisi'
    }, {
      baseURL: '/global'
    }).then(res => {
      const { method, url } = res.config;
      expect(method).toBe('get');
      expect(url).toBe('/global/test?name=lisi&age=20');
    });
  });

  it('should  createShorthand  function more argument body data', async function () {
    const bodyData = { name: 'lisi' };
    const exampleBody = createShorthand({
      url: '/test',
      method: 'post',
      body: {
        age: 20
      }
    });

    await exampleBody(bodyData, {
      baseURL: '/global'
    }).then(res => {
      const { method, body, headers, url } = res.config;
      expect(method).toBe('post');
      expect(url).toBe('/global/test');
      expect(body).toEqual(JSON.stringify(Object.assign(bodyData, { age: 20 })));
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });
  });

  it('should request or instance send request', async function () {
    request.globalConfig({
      baseURL: '/global'
    });

    const instance = request.create({
      baseURL: '/instance'
    });

    createShorthand.config({
      instance: instance
    });

    const globalInstance = createShorthand({
      url: '/test'
    });

    await globalInstance().then(res => {
      expect(res.config.url).toBe('/global/test');
    });

    const instanceExample = createShorthand.instance({ url: '/test' });

    await instanceExample().then(res => {
      expect(res.config).toBeUndefined();
    });
  });
});
