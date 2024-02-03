import { middleware } from './middleware';
import type { PtsqError } from './ptsqError';
import type { MaybePromise } from './types';

export type ErrorFormatter = (error: PtsqError) => MaybePromise<PtsqError>;

export const errorFormatter = (formatter: ErrorFormatter) =>
  middleware(async ({ next }) => {
    const response = await next();

    if (response.ok) return response;

    return {
      ...response,
      error: await formatter(response.error),
    };
  });
