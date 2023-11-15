import type { z } from 'zod';
import type { inferResolverArgs, ResolverArgs } from './resolver';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

export type inferResolverArgsInput<TResolverArgs extends ResolverArgs> =
  TResolverArgs extends Record<string, never>
    ? // make it voidable, so the input is not required
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      undefined | void | Record<string, never>
    : TResolverArgs extends ResolverArgs
    ? inferResolverArgs<TResolverArgs>
    : never;

export type inferResolverArgsOutput<TResolveOutput> =
  TResolveOutput extends z.Schema ? z.input<TResolveOutput> : TResolveOutput;

export type inferResolverValidationSchemaInput<TResolveOutput> =
  TResolveOutput extends z.Schema ? z.input<TResolveOutput> : TResolveOutput;

export type inferResolverValidationSchemaOutput<TResolveOutput> =
  TResolveOutput extends z.Schema ? z.output<TResolveOutput> : TResolveOutput;
