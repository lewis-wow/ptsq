import type {
  Static,
  StaticDecode,
  TAnySchema,
  TUndefined,
  TVoid,
} from '@sinclair/typebox';
import type { ResolverSchema } from './resolver';

export type MaybePromise<T> = T | Promise<T>;

/**
 * @internal
 */
export type inferStaticInput<TSchema extends ResolverSchema | undefined> =
  TSchema extends ResolverSchema ? StaticDecode<TSchema> : undefined;

/**
 * @internal
 */
export type inferStaticOutput<TSchema extends ResolverSchema | undefined> =
  TSchema extends ResolverSchema ? StaticDecode<TSchema> : undefined;

/**
 * Infers the arguments type of the zod validation schema or the introspected schema
 */
export type inferClientResolverArgs<TResolverArgs> = TResolverArgs extends
  | undefined
  | TUndefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void
  | TVoid
  ? // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    undefined | void
  : TResolverArgs extends TAnySchema
  ? Static<TResolverArgs>
  : TResolverArgs;

/**
 * Infers the output type of the zod validation schema or the introspected schema
 */
export type inferClientResolverOutput<TResolverOutput> =
  TResolverOutput extends TAnySchema
    ? Static<TResolverOutput>
    : TResolverOutput;

/**
 * @internal
 */
export type ErrorMessage<TMessage extends string> = TMessage & TypeError;

/**
 * @internal
 */
export type ShallowMerge<T extends object, U extends object> = {
  [K in keyof T]: K extends keyof U ? U[K] : T[K];
} & U;

/**
 * @internal
 *
 * Simplify the object structure for readability in IDE
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Simplify<T> = { [K in keyof T]: T[K] } & {};
