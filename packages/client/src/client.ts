import type { ClientRoute } from './clientRoute';
import type { ClientRouter } from './clientRouter';
import { inferResolverInput, ParseResolverOutput } from '@schema-rpc/server';

export type Client<TRouter extends ClientRouter> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends ClientRouter
    ? Client<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRoute<'query'>
    ? QueryClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRoute<'mutation'>
    ? MutationClient<TRouter['routes'][K]>
    : never;
};

export type QueryClient<TRoute extends ClientRoute<'query'>> = {
  query: (input: inferResolverInput<TRoute['input']>) => ParseResolverOutput<TRoute['output']>;
};

export type MutationClient<TRoute extends ClientRoute<'mutation'>> = {
  mutate: (input: inferResolverInput<TRoute['input']>) => ParseResolverOutput<TRoute['output']>;
};
