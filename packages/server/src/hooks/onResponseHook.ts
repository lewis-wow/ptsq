import type { MaybePromise } from '../types';

export type OnResponseHook = (options: { response: Response }) => MaybePromise<
  | {
      response?: Response;
    }
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void
>;
