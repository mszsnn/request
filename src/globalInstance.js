import Request from './core/request';
import defaultConfig from './core/defaultConfig';
import createShorthand from './core/createShorthand';
import mergeConfig from './core/mergeConfig';
import createAbortHandler from './core/abortController';
import utils from './utils/index';

const globalInstance = new Request(defaultConfig);
createShorthand.config({
  default: globalInstance
});

// 创建实例
globalInstance.create = function (config) {
  const instance = new Request(mergeConfig(this._config, config));
  return utils.createProxy(instance);
};

// 设全局配置
globalInstance.globalConfig = function (config) {
  this._config = mergeConfig(this._config, config);
};

globalInstance.createAbortHandler = createAbortHandler;

const request = utils.createProxy(globalInstance);

export {
  createShorthand
};
export default request;
