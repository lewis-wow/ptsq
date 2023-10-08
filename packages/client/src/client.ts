import type { ClientRoute } from './clientRoute';
import type { ClientRouter } from './clientRouter';
import type { ClientResolver } from './clientResolver';

export type Client<TRouter extends ClientRouter> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends ClientRoute
    ? ClientResolver<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRouter
    ? Client<TRouter['routes'][K]>
    : never;
};
