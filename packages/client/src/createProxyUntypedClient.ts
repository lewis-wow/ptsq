export type ProxyClientArgs<TArgs extends readonly unknown[]> = {
  route: string[];
  resolveType: (rawResolverType: string) => 'query' | 'mutation';
  fetch: (options: {
    route: string;
    type: 'query' | 'mutation';
    args: TArgs;
  }) => Promise<unknown>;
};

export const createProxyUntypedClient = <TArgs extends readonly unknown[]>({
  route,
  resolveType,
  fetch,
}: ProxyClientArgs<TArgs>): unknown => {
  /**
   * assign noop function to proxy to create only appliable proxy handler
   * the noop function is never called in proxy
   */

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Proxy(() => {}, {
    get: (_target, key: string) =>
      createProxyUntypedClient({ route: [...route, key], resolveType, fetch }),
    apply: (_target, _thisArg, argumentsList) => {
      const type = route.pop();
      if (!type) throw new TypeError();

      const resolverType = resolveType(type);

      return fetch({
        route: route.join('.'),
        type: resolverType,
        args: argumentsList as unknown as TArgs,
      });
    },
  });
};
