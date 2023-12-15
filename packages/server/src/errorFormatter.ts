import type { HTTPError } from './httpError';
import type { MaybePromise } from './types';

export type ErrorFormatter = (
  error: HTTPError,
) => MaybePromise<HTTPError | null | Record<string, any>>;
