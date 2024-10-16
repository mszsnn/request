export const addSuccessResult = function (request) {
  request.hookManager.getHook('success').tap('addSuccessResult', (context) => {
    const { expected, finalConfig } = context;
    const { url, method, headers, body } = finalConfig;
    context.expected = {
      data: expected,
      config: {
        url,
        method,
        headers,
        body
      }
    };
  });
};

