import type { z, ZodUndefined, ZodVoid } from 'zod';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

export type inferClientResolverArgs<TResolverArgs> = TResolverArgs extends
  | undefined
  | ZodUndefined
  | void
  | ZodVoid
  ? undefined | void
  : TResolverArgs extends z.Schema
  ? z.input<TResolverArgs>
  : TResolverArgs;

export type inferClientResolverOutput<TResolverOutput> =
  TResolverOutput extends z.Schema
    ? z.output<TResolverOutput>
    : TResolverOutput;
