import { createShorthand } from '../src';

describe('createShorthand throw error', function () {
  it('createShorthand config throw error', async function () {
    expect(() => {
      createShorthand.default(123);
    }).toThrowError('argument is not object type');
  });

  it('should config be object', function () {
    expect(() => {
      createShorthand.config();
    }).toThrowError('argument is not a object type');
  });
});

