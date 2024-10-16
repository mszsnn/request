import { rest } from 'msw';

const success = (req, res, ctx) => {
  return res(
    ctx.text('success'),
  );
};

const returnJsonData = (req, res, ctx) => {
  return res(
    ctx.json({
      success: true
    }),
  );
};

const returnStatus404 = (req, res, ctx) => {
  return res(ctx.status(404, 'Custom status text'));
};

const returnDelay = (req, res, ctx) => {
  return res(
    ctx.delay(2000),
    ctx.json({
      id: 'abc-123',
    }),
  );
};

export const handlers = [
  rest.get('/', returnJsonData),
  rest.get('/global/test', returnJsonData),
  rest.get('/instance/test', returnJsonData),
  rest.post('/global/test', returnJsonData),
  rest.get('/someone/test', returnJsonData),
  rest.get('/instance/testError', returnStatus404),
  rest.post('/instance/testError', returnStatus404),
  rest.get('/instance/testTimeout', returnDelay),
  rest.post('/instance/testTimeout', returnDelay),
  rest.get('/get', success),
  rest.delete('/delete', success),
  rest.head('/head', success),
  rest.options('/options', success),
  rest.post('/post', success),
  rest.post('/post/1', success),
  rest.patch('/patch', success),
  rest.put('/put', success)
];
