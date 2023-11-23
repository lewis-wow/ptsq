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
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void
  | z.ZodVoid
  ? // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    undefined | void
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
 * @internal
 *
 * Simplify the object structure for readability in IDE
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * @internal
 *
 * Deeply merge 2 types where the second one has priority
 */
export type DeepMerge<T, U> = T extends any[]
  ? DeepMergeArray<T, U>
  : T extends object
  ? U extends object
    ? {
        [K in keyof (T & U)]: K extends keyof U
          ? K extends keyof T
            ? DeepMerge<T[K], U[K]>
            : U[K]
          : K extends keyof T
          ? T[K]
          : never;
      }
    : U
  : U;

/**
 * @internal
 *
 * Deeply merge 2 arrays where the second one has priority
 */
export type DeepMergeArray<T extends any[], U> = U extends any[]
  ? T extends [any, ...any[]]
    ? U extends [any, ...any[]]
      ? T['length'] extends U['length']
        ? {
            [K in keyof T]: K extends keyof U ? DeepMerge<T[K], U[K]> : never;
          }
        : U
      : DeepMerge<T[number], U[number]>[]
    : DeepMerge<T[number], U[number]>[]
  : U;
