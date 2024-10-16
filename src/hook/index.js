import { useState, useEffect } from 'react';
import request from '../globalInstance';
import mergeConfig from '../core/mergeConfig';

function useRequest(config, deps = []) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const executor = (params = {}) => {
    setLoading(true);
    const lastConfig = mergeConfig(params, config);
    console.log(lastConfig, '---');
    request(lastConfig)
      .then((res) => setResponse(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const [initialRequest = true] = deps;
    if (initialRequest) {
      executor();
    }
  }, deps);

  return {
    response, loading, error, refresh: executor
  };
}

export default useRequest;

