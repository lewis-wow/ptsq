import { MaybePromise } from '@ptsq/server';
import { UndefinedAction } from './undefinedAction';

export type Fetcher<TArgs extends Record<string, any>> = (
  options: {
    route: string[];
  } & KeyValueUnion<TArgs>,
) => MaybePromise<unknown>;

type KeyValueUnion<TObject extends Record<string, any>> = {
  [K in keyof TObject]: { action: K; args: TObject[K] };
}[keyof TObject];

/**
 * Creates vanillajs proxy based client with untyped actions
 */
export const createProxyUntypedClient = <TArgs extends Record<string, any>>(
  fetcher: Fetcher<TArgs>,
): unknown =>
  _createProxyUntypedClient({
    route: [],
    fetcher: fetcher,
  });

/**
 * @internal
 */
const _createProxyUntypedClient = <TArgs extends Record<string, any>>({
  route,
  fetcher,
}: {
  route: string[];
  fetcher: Fetcher<TArgs>;
}): unknown => {
  /**
   * assign noop function to proxy to create only appliable proxy handler
   * the noop function is never called in proxy
   */

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Proxy(
    /* istanbul ignore next -- @preserve */
    () => {},
    {
      get: (_target, key: string) =>
        _createProxyUntypedClient({ route: [...route, key], fetcher }),
      apply: (_target, _thisArg, argumentsList) => {
        const action = route.pop();
        if (!action) throw new UndefinedAction();

        return fetcher({
          route,
          action: action,
          args: argumentsList as TArgs[keyof TArgs],
        });
      },
    },
  );
};
