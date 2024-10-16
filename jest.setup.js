
// Polyfill "window.fetch" used in the React component.
import 'whatwg-fetch';

// Extend Jest "expect" functionality with Testing Library assertions.

import { server } from './__mocks__/server';

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
