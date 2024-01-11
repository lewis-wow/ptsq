import type { HTTPError } from '../httpError';
import type { MaybePromise } from '../types';

export type OnErrorHook = (
  error: HTTPError,
) => MaybePromise<HTTPError | null | undefined>;
