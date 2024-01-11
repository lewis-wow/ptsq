import type { MaybePromise } from '../types';
import type { OnResponseHook } from './OnResponseHook';

export type OnRequestHook = (options: { request: Request }) => MaybePromise<
  | {
      request?: Request;
      onResponse?: OnResponseHook;
    }
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void
>;
