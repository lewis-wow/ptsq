import type { z } from 'zod';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

/**
 * Infers the arguments type of the zod validation schema or the introspected schema
 */
export type inferClientResolverArgs<TResolverArgs> = TResolverArgs extends
  | undefined
  | z.ZodUndefined
  | void
  | z.ZodVoid
  ? undefined | void
  : TResolverArgs extends z.Schema
  ? z.input<TResolverArgs>
  : TResolverArgs;

/**
 * Infers the output type of the zod validation schema or the introspected schema
 */
export type inferClientResolverOutput<TResolverOutput> =
  TResolverOutput extends z.Schema
    ? z.output<TResolverOutput>
    : TResolverOutput;

/**
 * Simplify the object structure for readability in IDE
 */
export type Simplify<T> = { [K in keyof T]: T[K] } & {};
