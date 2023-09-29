import { Route, Router, router, query, mutation, ResolverType } from 'api';
import { z } from 'zod';
import { Query, QueryClient } from './query';
import { Mutation } from './mutation';

export type Client<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route<'query'>
    ? QueryClient<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Route<'mutation'>
    ? Mutation<z.infer<TRouter['routes'][K]['input']>, Promise<z.infer<TRouter['routes'][K]['output']>>>
    : TRouter['routes'][K] extends Router
    ? Client<TRouter['routes'][K]>
    : never;
};
