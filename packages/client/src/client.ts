import type { ClientRoute, ClientRouter } from './types';
import type { ProxyClient } from './createProxyClient';
import type { inferResolverValidationSchemaInput, inferResolverValidationSchemaOutput } from '@schema-rpc/server';

type QueryClient<TClientRoute extends ClientRoute> = {
  query: typeof ProxyClient.prototype.request<
    inferResolverValidationSchemaInput<TClientRoute['inputValidationSchema']>,
    inferResolverValidationSchemaOutput<TClientRoute['outputValidationSchema']>
  >;
};

type MutationClient<TClientRoute extends ClientRoute> = {
  mutate: typeof ProxyClient.prototype.request<
    inferResolverValidationSchemaInput<TClientRoute['inputValidationSchema']>,
    inferResolverValidationSchemaOutput<TClientRoute['outputValidationSchema']>
  >;
};

/**
 * Client type for casting proxy client to correct types
 */
export type Client<TRouter extends ClientRouter> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends ClientRouter
    ? Client<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRoute<'query'>
    ? QueryClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRoute<'mutation'>
    ? MutationClient<TRouter['routes'][K]>
    : never;
};
