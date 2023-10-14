import type { z } from 'zod';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

export type inferResolverValidationSchema<TResolveOutput> = TResolveOutput extends z.Schema
  ? z.infer<TResolveOutput>
  : TResolveOutput;

export type inferResolverValidationSchemaInput<TResolveOutput> = TResolveOutput extends z.Schema
  ? z.input<TResolveOutput>
  : TResolveOutput;

export type inferResolverValidationSchemaOutput<TResolveOutput> = TResolveOutput extends z.Schema
  ? z.output<TResolveOutput>
  : TResolveOutput;
