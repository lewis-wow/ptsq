import { expect, test } from 'vitest';
import { PtsqError, PtsqErrorCode } from './ptsqError';

test('Should throw PtsqError', async () => {
  await expect(async () => {
    await Promise.resolve(1);
    throw new PtsqError({ code: PtsqErrorCode.BAD_REQUEST_400 });
  }).rejects.toThrowError(
    new PtsqError({ code: PtsqErrorCode.BAD_REQUEST_400 }),
  );
});

test('Should throw PtsqError and return true for isPtsqError', () => {
  const error = new PtsqError({ code: PtsqErrorCode.BAD_REQUEST_400 });
  expect(PtsqError.isPtsqError(error)).toBe(true);
});
