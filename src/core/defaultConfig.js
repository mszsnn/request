import { CREDENTIALS } from '../constant';
import abortHandler from '../plugins/abortHandler';
import basicHandler from '../plugins/basicHandler';
import senscorsHandler from '../plugins/senscorsHandler';
import internalPlugin from '../plugins/internalPlugin';

const defaultConfig = {
  baseURL: '/',
  timeout: 0,
  method: 'get',
  requestId: true,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  credentials: CREDENTIALS.INCLUDE,
  plugins: [abortHandler, basicHandler, senscorsHandler, internalPlugin]
};

export default defaultConfig;
