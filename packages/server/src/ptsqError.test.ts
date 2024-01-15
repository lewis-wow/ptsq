import { expect, test } from 'vitest';
import { PtsqError } from './ptsqError';

test('Should throw PtsqError', async () => {
  await expect(async () => {
    await Promise.resolve(1);
    throw new PtsqError({ code: 'BAD_REQUEST' });
  }).rejects.toThrowError(new PtsqError({ code: 'BAD_REQUEST' }));
});

test('Should throw PtsqError and return true for isPtsqError', () => {
  const error = new PtsqError({ code: 'BAD_REQUEST' });
  expect(PtsqError.isPtsqError(error)).toBe(true);
});
