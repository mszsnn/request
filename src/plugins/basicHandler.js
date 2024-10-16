import utils from '../utils';
import { METHODS } from '../constant';

class BasicHandler {
  init = (instance) => {
    const afterMergeConfig = instance.hookManager.getHook('afterMergeConfig');

    // 合并 baseURL 和 请求 URL
    afterMergeConfig.tap('handlerURL', ({ finalConfig }) => {
      const { url, baseURL } = finalConfig;
      finalConfig.url = utils.combineURLs(baseURL, url);
    });

    // query 允许字符串和对象形式
    afterMergeConfig.tap('handlerData', ({ finalConfig }) => {
      const { query, url } = finalConfig;
      if (query && utils.isObject(query)) {
        finalConfig.url = url + utils.objectToQueryString(query);
      } else if (query && utils.isString(query)) {
        finalConfig.url = query.startsWith('?') ? url + query : url + '?' + query;
      }
    });

    // 根据 body 类型， 添加 Content-Type
    afterMergeConfig.tap('handlerBody', ({ finalConfig }) => {
      const { method, body, headers } = finalConfig;
      if (method
        && [METHODS.PUT, METHODS.PATCH, METHODS.POST].includes(method)
        && body && headers) {
        if (utils.isFormData(body)) {
          headers['Content-Type'] = 'multipart/form-data';
        } else if (utils.isObject(body)) {
          headers['Accept'] = 'application/json';
          headers['Content-Type'] = 'application/json';
          finalConfig.body = JSON.stringify(body);
        }
      }
    });
  }
}

export default new BasicHandler();
