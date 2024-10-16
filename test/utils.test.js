import utils from '../src/utils';
describe('utils ', function () {
  it('should isArray', function () {
    expect(utils.isArray([])).toBeTruthy();
    expect(utils.isArray({})).toBeFalsy();
  });
  it('should isUndefined', function () {
    expect(utils.isUndefined(undefined)).toBeTruthy();
    expect(utils.isUndefined(null)).toBeFalsy();
  });
  it('should isFormData', function () {
    expect(utils.isFormData(new FormData())).toBeTruthy();
    expect(utils.isFormData(null)).toBeFalsy();
  });
  it('should isString', function () {
    expect(utils.isString('')).toBeTruthy();
    expect(utils.isString([])).toBeFalsy();
  });
  it('should isNumber', function () {
    expect(utils.isNumber(123)).toBeTruthy();
    expect(utils.isNumber([])).toBeFalsy();
  });
  it('should isObject', function () {
    expect(utils.isObject({})).toBeTruthy();
    expect(utils.isObject(null)).toBeFalsy();
  });
  it('should isPlainObject', function () {
    expect(utils.isPlainObject({})).toBeTruthy();
    expect(utils.isPlainObject(new FormData())).toBeFalsy();
  });
  it('should isFunction', function () {
    expect(utils.isFunction(function () {})).toBeTruthy();
    expect(utils.isFunction(new FormData())).toBeFalsy();
  });
  it('should objectToQueryString', function () {
    expect(utils.objectToQueryString({})).toBe('?');
    expect(utils.objectToQueryString({
      name: 'lisi',
      age: 30
    })).toBe('?name=lisi&age=30');
  });
  it('should combineURLs', function () {
    expect(utils.combineURLs('/api/', '/get')).toBe('/api/get');
  });
  it('should createProxy', function () {
    const fun = {
      data: 1,
      request: function () {
        return 1;
      }
    };
    const f = utils.createProxy(fun);

    expect(f()).toBe(1);
    expect(f.data).toBe(1);

    f.p = 'call';
    expect(fun.p).toBe('call');
  });
});
