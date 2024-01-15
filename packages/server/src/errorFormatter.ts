import type { PtsqError } from './ptsqError';
import type { MaybePromise } from './types';

export type ErrorFormatter = (
  error: PtsqError,
) => MaybePromise<PtsqError | Record<string, any> | null>;
