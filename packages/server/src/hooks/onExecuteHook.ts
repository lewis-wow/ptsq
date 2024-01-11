import type { MaybePromise } from 'rollup';
import type { MiddlewareMeta } from 'src/middleware';
import type { OnExecuteDoneHook } from './onExecuteDoneHook';

export type OnExecuteHook = (options: { meta: MiddlewareMeta }) => MaybePromise<
  | {
      onExecuteDone?: OnExecuteDoneHook;
    }
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void
>;
