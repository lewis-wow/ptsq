import type { MaybePromise } from '../dist/types';
import type { Context } from './context';
import type { OnErrorHook } from './hooks/onErrorHook';
import type { OnExecuteDoneHook } from './hooks/onExecuteDoneHook';
import type { OnExecuteHook } from './hooks/onExecuteHook';
import type { OnRequestHook } from './hooks/onRequestHook';
import type { OnResponseHook } from './hooks/OnResponseHook';
import type { HTTPError } from './httpError';
import type { MiddlewareMeta, MiddlewareResponse } from './middleware';

export class Hook {
  _def: Partial<HookDefinition>;

  constructor(def: Partial<HookDefinition>) {
    this._def = def;
  }

  onError(error: HTTPError): MaybePromise<HTTPError | undefined | null> {
    if (!this._def.onError) return error;

    return this._def.onError(error);
  }

  async onRequest(options: {
    request: Request;
  }): Promise<{ request: Request }> {
    if (!this._def.onRequest) return options;

    const onRequestResult = await this._def.onRequest(options);

    this._def.onResponse = onRequestResult?.onResponse;

    return { ...options, request: onRequestResult?.request ?? options.request };
  }

  async onResponse(options: {
    response: Response;
  }): Promise<{ response: Response }> {
    if (!this._def.onResponse) return options;

    const onResponseResult = await this._def.onResponse(options);

    return {
      ...options,
      response: onResponseResult?.response ?? options.response,
    };
  }

  async onExecute(options: { meta: MiddlewareMeta }) {
    const onExecuteResult = await this._def.onExecute?.(options);

    this._def.onExecuteDone = onExecuteResult?.onExecuteDone;
  }

  onExecuteDone(options: { response: MiddlewareResponse<Context> }) {
    this._def.onExecuteDone?.(options);
  }
}

export type HookDefinition = {
  onError: OnErrorHook;
  onRequest: OnRequestHook;
  onResponse: OnResponseHook;
  onExecute: OnExecuteHook;
  onExecuteDone: OnExecuteDoneHook;
};
