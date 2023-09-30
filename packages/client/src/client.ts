import { Route, Router, App } from 'schema';
import { QueryClient } from './query';
import { MutationClient } from './mutation';

export type ClientRouter<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route<'query'>
    ? QueryClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Route<'mutation'>
    ? MutationClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Router
    ? ClientRouter<TRouter['routes'][K]>
    : never;
};

export type Client<TApp extends App> = {
  router: ClientRouter<App['router']>;
  transformer: TApp['transformer'];
};
