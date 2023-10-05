import type { Route, Router } from '@schema-rpc/server';
import type { QueryClient } from './createQueryClient';
import type { MutationClient } from './createMutationClient';

export type ClientRouter<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route<'query'>
    ? QueryClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Route<'mutation'>
    ? MutationClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Router
    ? ClientRouter<TRouter['routes'][K]>
    : never;
};

export type Client<TRouter extends Router> = ClientRouter<TRouter>;
