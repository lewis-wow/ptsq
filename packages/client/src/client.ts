import type { ClientRoute, ClientRouter } from './types';
import type { Requester } from './requester';

type QueryClient<TClientRoute extends ClientRoute> = {
  query: typeof Requester.prototype.query<TClientRoute>;
};
type MutationClient<TClientRoute extends ClientRoute> = {
  mutate: typeof Requester.prototype.mutate<TClientRoute>;
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
