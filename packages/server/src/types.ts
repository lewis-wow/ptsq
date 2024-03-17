import type {
  Static,
  StaticDecode,
  TSchema,
  TUndefined,
  TVoid,
} from '@sinclair/typebox';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

/**
 * @internal
 */
export type inferStaticInput<TTSchema extends TSchema | undefined> =
  TTSchema extends TSchema ? StaticDecode<TTSchema> : undefined;

/**
 * @internal
 */
export type inferStaticOutput<TTSchema extends TSchema | undefined> =
  TTSchema extends TSchema ? StaticDecode<TTSchema> : undefined;

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
  : TResolverArgs extends TSchema
    ? Static<TResolverArgs>
    : TResolverArgs;

/**
 * Infers the output type of the zod validation schema or the introspected schema
 */
export type inferClientResolverOutput<TResolverOutput> =
  TResolverOutput extends TSchema ? Static<TResolverOutput> : TResolverOutput;

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

/**
 * @internal
 */
export type OverrideConfig<
  TConfig extends object,
  TNextConfig extends object,
> = Simplify<Omit<TConfig, keyof TNextConfig> & TNextConfig>;
