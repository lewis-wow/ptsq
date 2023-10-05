import { z } from 'zod';
import { Route } from './route';
import { Router } from './createRouterFactory';
import { ResolveFunction } from './resolver';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

export type ParseResolverInput<TResolveInput extends z.Schema | undefined> = TResolveInput extends z.Schema
  ? z.infer<TResolveInput>
  : TResolveInput;

export type ParseResolverOutput<TResolveOutput extends z.Schema | any> = TResolveOutput extends z.Schema
  ? z.infer<TResolveOutput>
  : TResolveOutput;

export type ServerRouter<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route
    ? ResolveFunction<TRouter['routes'][K], any>
    : TRouter['routes'][K] extends Router
    ? ServerRouter<TRouter['routes'][K]>
    : never;
};

export type Server<TRouter extends Router> = ServerRouter<TRouter>;
