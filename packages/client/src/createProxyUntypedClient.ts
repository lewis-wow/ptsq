export type CreateProxyUntypedClientArgs<TArgs extends readonly unknown[]> = {
  route: string[];
  fetch: (options: { route: string; type: string; args: TArgs }) => unknown;
};

export const createProxyUntypedClient = <TArgs extends readonly unknown[]>({
  route,
  fetch,
}: CreateProxyUntypedClientArgs<TArgs>): unknown => {
  /**
   * assign noop function to proxy to create only appliable proxy handler
   * the noop function is never called in proxy
   */

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Proxy(() => {}, {
    get: (_target, key: string) =>
      createProxyUntypedClient({ route: [...route, key], fetch }),
    apply: (_target, _thisArg, argumentsList) => {
      const type = route.pop();
      if (!type) throw new TypeError();

      return fetch({
        route: route.join('.'),
        type: type,
        args: argumentsList as unknown as TArgs,
      });
    },
  });
};
