import { Route, Router, App, DataTransformer } from 'schema';
import { QueryClient } from './createQueryClient';
import { MutationClient } from './createMutationClient';

export type ClientRouter<TRouter extends Router, TDataTransformer extends DataTransformer> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route<'query'>
    ? QueryClient<TRouter['routes'][K], TDataTransformer>
    : TRouter['routes'][K] extends Route<'mutation'>
    ? MutationClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Router
    ? ClientRouter<TRouter['routes'][K], TDataTransformer>
    : never;
};

export type Client<TApp extends App> = {
  router: ClientRouter<App['router'], TApp['transformer']>;
  transformer: TApp['transformer'];
};
