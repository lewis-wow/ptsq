import { Route, Router } from 'api';
import { QueryClient } from './query';
import { MutationClient } from './mutation';

export type Client<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route<'query'>
    ? QueryClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Route<'mutation'>
    ? MutationClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Router
    ? Client<TRouter['routes'][K]>
    : never;
};
