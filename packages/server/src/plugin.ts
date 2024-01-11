import type { OnErrorHook } from './hooks/onErrorHook';
import type { OnExecuteHook } from './hooks/onExecuteHook';
import type { OnRequestHook } from './hooks/onRequestHook';

export type Plugin = {
  onError?: OnErrorHook;
  onRequest?: OnRequestHook;
  onExecute?: OnExecuteHook;
};
