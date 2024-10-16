import { useRequest } from '../src';
import { renderHook } from '@testing-library/react-hooks';

describe('react hook ', function () {
  it('should useRequest is function', function () {
    expect(typeof useRequest).toBe('function');
  });

  it('should useRequest is in use', function () {
    const setUp = renderHook(({ config, deps }) => {
      return useRequest(config, deps);
    }, {
      initialProps: {
        config: {
          url: '/get'
        },
        deps: [false]
      }
    });
    const { result } = setUp;
    const { response, loading, error, refresh } = result.current;
    expect(response).toBeNull();
    expect(loading).toBeFalsy();
    expect(error).toBeNull();
    expect(refresh).toEqual(expect.any(Function));
  });

  it('should useRequest Request is true', async function () {
    const setUp = renderHook(({ config, deps }) => {
      return useRequest(config, deps);
    }, {
      initialProps: {
        config: {
          url: '/get'
        }
      }
    });
    const { result, waitForNextUpdate } = setUp;
    expect(result.current.loading).toBeTruthy();
    await waitForNextUpdate();
    const { response, loading, error, refresh } = result.current;
    expect(loading).toBeFalsy();
    expect(error).toBeNull();
    expect(response).not.toBeNull();
    expect(refresh).toEqual(expect.any(Function));
  });
  it('should useRequest Request is fail', async function () {
    const setUp = renderHook(({ config, deps }) => {
      return useRequest(config, deps);
    }, {
      initialProps: {
        config: {
          url: '/get/1'
        },
        deps: []
      }
    });
    const { result, waitForNextUpdate } = setUp;
    expect(result.current.loading).toBeTruthy();
    await waitForNextUpdate();
    const { response, loading, error, refresh } = result.current;
    expect(loading).toBeFalsy();
    expect(error).not.toBeNull();
    expect(response).toBeNull();
    expect(refresh).toEqual(expect.any(Function));
  });
});
