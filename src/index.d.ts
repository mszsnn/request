/* eslint-disable */

export type METHODS = 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'

export type TIMEOUT_ACTION = 'continue' | 'reject' | 'retry';

export type THROTTLE_SEND = 'first' | 'last';

export type THROTTLE_ACTION = 'reject' | 'resolve'

export type CREDENTIALS = 'same-origin' | 'include' | 'omit'

export interface TimeoutInterface {
  time: number;
  action: TIMEOUT_ACTION
}

export interface ThrottleInterface {
  time: number;
  send: THROTTLE_SEND;
  action: THROTTLE_ACTION
}

export interface EncryptionInterface {
  pubKey: string
}

export interface RequestConfig {
  projectName?: string;
  productName?: string;
  intl?:string;
  url?: string;
  method?: METHODS;
  baseURL?: string;
  headers?: any;
  query?: any;
  body?: any;
  timeout?: number | TimeoutInterface;
  requestId?: boolean;
  abortSignal?: CreateAbortHandler;
  throttle?: number | ThrottleInterface;
  encryption?: string | EncryptionInterface;
  credentials?: CREDENTIALS;
  onConfigMerge?(config: RequestConfig) : RequestConfig;
  onConfigMerged?(config: RequestConfig) : RequestConfig;
  onBefore?(config: RequestConfig) : RequestConfig;
  onSuccess?(response: RequestResponse,config: RequestConfig) : RequestResponse;
  onFail?(error: RequestResponse,config: RequestConfig) : RequestResponse;
  onFinished?(response: Response,config: RequestConfig) : Response;
  onTimeout?(config: RequestConfig) : void;
  onAbort?(config: RequestConfig, reason: any) : void;
}

export interface RequestResponse<T = any> {
  data: T;
  status: number;
  headers: any;
  config?: RequestConfig;
}

export interface HookHandler {
  tap(namespace: string, handler: (preload: any) => any ): any;
  tapAsync(namespace: string, handler: (preload: any) => any): any;
  unTap(namespace: string, handler: (preload: any) => any): any;
}


export interface HookManagerInstance {
  hasHooksHandler(hookName: string): boolean;
  isSlotRegisted(hookName: string): boolean;
  runHooks(hookName: string, payload: any): any;
  getHook(hookName: string): HookHandler;
}

export interface PromiseExtend<T> extends Promise<T>{
  abort(reason: string): void,
  requestId: string
}

export interface RequestInstance {
  (config: RequestConfig): PromiseExtend<any>;
  hookManager: HookManagerInstance;
  abort(requestId: string, reason: string): void;
  clear(): void;
  request<T = any, R = RequestResponse<T>> (config: RequestConfig): PromiseExtend<R>;
  get<T = any, R = RequestResponse<T>>(url: string, config?: RequestConfig): PromiseExtend<R>;
  delete<T = any, R = RequestResponse<T>>(url: string, config?: RequestConfig): PromiseExtend<R>;
  head<T = any, R = RequestResponse<T>>(url: string, config?: RequestConfig): PromiseExtend<R>;
  options<T = any, R = RequestResponse<T>>(url: string, config?: RequestConfig): PromiseExtend<R>;
  post<T = any, R = RequestResponse<T>>(url: string, data?: any, config?: RequestConfig): PromiseExtend<R>;
  put<T = any, R = RequestResponse<T>>(url: string, data?: any, config?: RequestConfig): PromiseExtend<R>;
  patch<T = any, R = RequestResponse<T>>(url: string, data?: any, config?: RequestConfig): PromiseExtend<R>;
}



export interface CreateAbortHandler {
  abort(reason: string): void;
}

export interface RequestStatic extends RequestInstance {
  create(config?: RequestConfig): RequestInstance;
  globalConfig(config: RequestConfig): void;
  createAbortHandler():  CreateAbortHandler
}



export interface RequestProxy {
  (config: object): Promise<any>;
  (body: object, config: object): Promise<any>;
  (params: object, config: object): Promise<any>;
}

export interface CreateShorthandConfig  {
  [name: string]: (params: object) => RequestProxy
}

export type CreateShorthand = {
  (config: RequestConfig): RequestProxy;
  config(config: CreateShorthandConfig): void
} | CreateShorthandConfig

export interface Throttle {
  (params: object): Promise<any>;
}

export interface UseRequestResponse {
  response: RequestResponse;
  loading: boolean;
  error: RequestResponse;
  refresh(params: RequestConfig): void
}

export interface UseRequest {
  (config: RequestConfig, deps: Array<any>): UseRequestResponse
}


declare const request: RequestStatic;
declare const createShorthand: CreateShorthand;
declare const throttle: Throttle
declare const useRequest: UseRequest





export {
  createShorthand,
  throttle,
  useRequest
}

export default request;
