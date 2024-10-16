// 请求方法

const METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  HEAD: 'head',
  DELETE: 'delete',
  PATCH: 'patch',
  OPTIONS: 'options'
};

// 超时类型
const TIMEOUT_ACTION = {
  CONTINUE: 'continue',
  REJECT: 'reject',
  RETRY: 'retry'
};

// 节流使用第一个或者最后一个
const THROTTLE_SEND = {
  FIRST: 'first',
  LAST: 'last'
};

// 节流时其他请求的处理方式
const THROTTLE_ACTION = {
  REJECT: 'reject',
  RESOLVE: 'resolve'
};

// cookie 的处理方式
const CREDENTIALS = {
  SAME_ORIGIN: 'same-origin',
  INCLUDE: 'include',
  OMIT: 'omit'
};

// fetch 需要的参数
const FETCH_INIT_KEYS = [
  'url', 'method', 'headers', 'body',
  'signal', 'mode', 'credentials',
  'cache', 'redirect', 'referrer',
  'referrerPolicy', 'integrity'
];

export {
  METHODS,
  TIMEOUT_ACTION,
  THROTTLE_SEND,
  THROTTLE_ACTION,
  CREDENTIALS,
  FETCH_INIT_KEYS
};
