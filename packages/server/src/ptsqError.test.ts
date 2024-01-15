import { expect, test } from 'vitest';
import { PtsqError } from './ptsqError';

test('Should throw PtsqError', () => {
  try {
    throw new PtsqError({ code: 'BAD_REQUEST' });
  } catch (error) {
    expect(error).toStrictEqual(new PtsqError({ code: 'BAD_REQUEST' }));
  }
});

test('Should throw PtsqError and return true for isPtsqError', () => {
  try {
    throw new PtsqError({ code: 'BAD_REQUEST' });
  } catch (error) {
    expect(PtsqError.isPtsqError(error)).toBe(true);
  }
});
