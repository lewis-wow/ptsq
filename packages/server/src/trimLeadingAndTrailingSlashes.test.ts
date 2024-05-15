import { expect, test } from 'vitest';
import { trimLeadingAndTrailingSlashes } from './trimLeadingAndTrailingSlashes';

test('Should trim trailing commas', () => {
  expect(trimLeadingAndTrailingSlashes('/api/ptsq/')).toBe('api/ptsq');

  expect(trimLeadingAndTrailingSlashes('api/ptsq/')).toBe('api/ptsq');

  expect(trimLeadingAndTrailingSlashes('/api/ptsq')).toBe('api/ptsq');

  expect(trimLeadingAndTrailingSlashes('api/ptsq')).toBe('api/ptsq');
});
