import utils from '../utils';
import _ from 'lodash';
import { METHODS } from '../constant';

const pathRegExp = /\/:(\w+)/g;

// 根据参数个数， 识别配置项
function handlerConfig(...args) {
  const length = args.length;
  let result = {};
  if (length > 1) {
    const [data, config] = args;
    // 临时存储在 _data
    result = _.merge({
      _data: data
    }, config);
  } else if (length === 1) {
    result = args[0];
  }
  return result;
}

// 有 :id 路径， 匹配参数
function handlerPath(config) {
  const { path } = config;
  if (path && utils.isObject(path)) {
    let { url } = config;
    const matchResult = url.match(pathRegExp);
    matchResult.forEach(item => {
      const key = item.slice(2);
      const replace = path[key] ? `/${path[key]}` : '';
      url = url.replace(item, replace);
    });
    config.url = url;
  }
  return config;
}

/*

默认这个方法调用的实例为全局实例
提供了 createShorthand.config 方法设置实例
{
  default: request,
  namespace: instance
}

createShorthand.config({
  default: request,
  example: instanceExample
});

const getList = createShorthand.example({})

根据请求 methods 方法和参数个数， 识别配置项
getList(query{}, config{})
getList(body{}, config{})
getList(config{})
*/

const createShorthand = new Proxy(handlerConfig, {
  // 默认使用全局实例
  apply: function (target, thisArg, argumentsList) {
    return target.default(...argumentsList);
  },

  get: function (target, prop) {
    if (prop === 'config') {
      return function config(object) {
        if (!utils.isObject(object)) {
          throw new Error('argument is not a object type');
        }

        for (const [namespace, instance] of Object.entries(object)) {
          target[namespace] = function (params) {
            if (params && !utils.isPlainObject(params)) {
              throw new Error('argument is not object type');
            }
            return function (...config) {
              config = handlerConfig(...config);
              const method = config.method || params.method || METHODS.GET;

              if ([METHODS.DELETE, METHODS.GET, METHODS.HEAD, METHODS.OPTIONS].includes(method)) {
                // 识别为 query
                config = _.merge({
                  query: config._data || config.query
                }, config, params);
              } else {
                // 识别为  body
                config = _.merge({
                  body: config._data || config.body
                }, config, params);
              }
              // 删除临时属性
              delete config._data;
              // 匹配 :id 等路径
              config = handlerPath(config);
              return instance.request(config);
            };
          };
        }
      };
    } else {
      return Reflect.get(target, prop);
    }
  }
});

export default createShorthand;
