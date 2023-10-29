import type { ResolverType } from '@ptsq/server';
import type { ProxyClient } from './createProxyClient';
import type { inferResolverValidationSchemaInput, inferResolverValidationSchemaOutput } from '@ptsq/server';

/**
 * more general route type than in server package, because of introspection result
 */
export type ClientRoute<TType extends ResolverType = ResolverType> = {
  nodeType: 'route';
  type: TType;
  inputValidationSchema?: any;
  outputValidationSchema: any;
};

/**
 * more general router type than in server package, because of introspection result
 */
export type ClientRouter = {
  nodeType: 'router';
  routes: {
    [key: string]: ClientRouter | ClientRoute;
  };
};

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
