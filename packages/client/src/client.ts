import type { ClientRoute, ClientRouter } from './types';
import { ProxyClient } from './createProxyClient';
import { inferResolverValidationSchema } from '@schema-rpc/server';

type QueryClient<TClientRoute extends ClientRoute> = {
  query: typeof ProxyClient.prototype.request<
    inferResolverValidationSchema<TClientRoute['inputValidationSchema']>,
    inferResolverValidationSchema<TClientRoute['outputValidationSchema']>
  >;
};

type MutationClient<TClientRoute extends ClientRoute> = {
  mutate: typeof ProxyClient.prototype.request<
    inferResolverValidationSchema<TClientRoute['inputValidationSchema']>,
    inferResolverValidationSchema<TClientRoute['outputValidationSchema']>
  >;
};

export type Client<TRouter extends ClientRouter> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends ClientRouter
    ? Client<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRoute<'query'>
    ? QueryClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRoute<'mutation'>
    ? MutationClient<TRouter['routes'][K]>
    : never;
};
