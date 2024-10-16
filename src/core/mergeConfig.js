import utils from '../utils';
import _ from 'lodash';
/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */

// 合并策略  config

function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  let config = {};

  // 以 config2 为准, 来覆盖 config1
  let valueFromConfig2Keys = ['url', 'params', 'body'];

  // 深度合并
  let mergeDeepPropertiesKeys = ['headers'];

  // 如果 config2 有值， 用 config2, 否则使用 config1
  let defaultToConfig2Keys = ['withCredentials', 'onConfigMerge', 'onBefore', 'onSuccess', 'onFail', 'onFinished', 'onTimeout'];

  // 简单合并
  let directMergeKeys = ['projectName', 'intl', 'timeout', 'baseURL', 'method', 'plugins'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return _.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return _.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  _.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  _.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  _.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  _.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  let keys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  let otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter((key) => {
      return keys.indexOf(key) === -1;
    });

  _.forEach(otherKeys, mergeDeepProperties);

  return config;
}

export default mergeConfig;
