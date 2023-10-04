import { z } from 'zod';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

export type ParseResolverInput<TResolveInput extends z.Schema | undefined> = TResolveInput extends z.Schema
  ? z.infer<TResolveInput>
  : TResolveInput;

export type ParseResolverOutput<TResolveOutput extends z.Schema | any> = TResolveOutput extends z.Schema
  ? z.infer<TResolveOutput>
  : TResolveOutput;
