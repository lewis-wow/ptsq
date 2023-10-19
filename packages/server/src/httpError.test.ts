import { expect, test } from 'vitest';
import { HTTPError } from './httpError';

test('Should throw HTTPError', () => {
  try {
    throw new HTTPError({ code: 'BAD_REQUEST' });
  } catch (error) {
    expect(error).toStrictEqual(new HTTPError({ code: 'BAD_REQUEST' }));
  }
});

test('Should throw HTTPError and return true for isHTTPError', () => {
  try {
    throw new HTTPError({ code: 'BAD_REQUEST' });
  } catch (error) {
    expect(HTTPError.isHttpError(error)).toBe(true);
  }
});
