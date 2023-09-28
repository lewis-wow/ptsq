import { Route, Router, router, query, mutation, ResolverType } from 'api';
import { z } from 'zod';
import { Query } from './query';
import { Mutation } from './mutation';

export type Client<
  TRouter extends Router<ThisType, TInput, TOutput>,
  TType extends ResolverType,
  TInput extends z.Schema | undefined,
  TOutput extends z.Schema | undefined,
> = Proxy<{
  [K in keyof TRouter]: TRouter[K] extends Route<'query'>
    ? Query<z.infer<TRouter[K]['input']>, Promise<z.infer<TRouter[K]['output']>>>
    : TRouter[K] extends Route<'mutation'>
    ? Mutation<z.infer<TRouter[K]['input']>, Promise<z.infer<TRouter[K]['output']>>>
    : TRouter[K] extends Router
    ? Client<TRouter[K], TType, TInput, TOutput>
    : never;
}>;
