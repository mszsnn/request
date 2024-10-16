let toString = Object.prototype.toString;

function isArray(val) {
  return toString.call(val) === '[object Array]';
}

function isUndefined(val) {
  return typeof val === 'undefined';
}

function isFormData(val) {
  return typeof FormData !== 'undefined' && val instanceof FormData;
}

function isString(val) {
  return typeof val === 'string';
}

function isNumber(val) {
  return typeof val === 'number';
}

function isObject(val) {
  return val !== null && typeof val === 'object';
}

function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

function objectToQueryString(object) {
  let queryString = '';
  for (let [key, item] of Object.entries(object)) {
    queryString += key + '=' + item + '&';
  }

  queryString = queryString.replace(/&$/, '');
  return '?' + queryString;
}

function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}

function createProxy(instance) {
  return new Proxy(function () {}, {
    get(target, p) {
      return Reflect.get(instance, p);
    },
    set(target, p, value) {
      return Reflect.set(instance, p, value);
    },
    apply(target, thisArg, argArray) {
      return instance.request.apply(instance, argArray);
    }
  });
}

export default {
  isArray,
  isFormData,
  isString,
  isNumber,
  isObject,
  isPlainObject,
  isUndefined,
  isFunction,
  objectToQueryString,
  combineURLs,
  createProxy
};
