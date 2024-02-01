import type { CreateHttpTestServerPayload } from './createHttpTestServer';

export type CallbackCbFunction = (
  payload: CreateHttpTestServerPayload,
) => void | Promise<void>;

export const callback = (
  serverAdapterPromise: Promise<CreateHttpTestServerPayload>,
) => {
  let subscribers: CallbackCbFunction[] = [];
  let payloadResult: CreateHttpTestServerPayload | null = null;

  serverAdapterPromise.then((payload) => {
    subscribers.forEach((subscriber) => {
      subscriber(payload);
    });

    payloadResult = payload;
    subscribers = [];
  });

  return {
    subscribe: (cb: CallbackCbFunction) => {
      if (payloadResult) cb(payloadResult);
      else subscribers.push(cb);
    },
    subscribers,
  };
};
