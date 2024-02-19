import { UndefinedAction } from './undefinedAction';

export type CreateProxyUntypedClientArgs<TArgs extends readonly unknown[]> = {
  fetch: (options: { route: string[]; action: string; args: TArgs }) => unknown;
};

export const createProxyUntypedClient = <TArgs extends readonly unknown[]>({
  fetch,
}: CreateProxyUntypedClientArgs<TArgs>): unknown =>
  _createProxyUntypedClient({
    route: [],
    fetch,
  });

const _createProxyUntypedClient = <TArgs extends readonly unknown[]>({
  route,
  fetch,
}: CreateProxyUntypedClientArgs<TArgs> & { route: string[] }): unknown => {
  /**
   * assign noop function to proxy to create only appliable proxy handler
   * the noop function is never called in proxy
   */

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Proxy(() => {}, {
    get: (_target, key: string) =>
      _createProxyUntypedClient({ route: [...route, key], fetch }),
    apply: (_target, _thisArg, argumentsList) => {
      const action = route.pop();
      if (!action) throw new UndefinedAction();

      return fetch({
        route,
        action,
        args: argumentsList as unknown as TArgs,
      });
    },
  });
};
