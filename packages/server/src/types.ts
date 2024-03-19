import {
  type Static,
  type StaticDecode,
  type TSchema,
} from '@sinclair/typebox';
import { PtsqError, PtsqErrorShape } from './ptsqError';

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

export type SimpleRoute = {
  _def: {
    nodeType: 'route';
    type: ResolverType;
    errorShape: PtsqErrorShape;
    outputSchema: any;
    argsSchema: any;
    description: string | undefined;
  };
};

export type SimpleRouter = {
  _def: {
    nodeType: 'router';
    routes: {
      [key: string]: SimpleRouter | SimpleRoute;
    };
  };
};

/**
 * ERROR
 */
export type inferErrorFromErrorShape<TErrorShape extends PtsqErrorShape> =
  PtsqError<keyof TErrorShape extends string ? keyof TErrorShape : never>;

export type inferError<TRoute extends SimpleRoute> = inferErrorFromErrorShape<
  TRoute['_def']['errorShape']
>;

export type inferErrorCodes<TNode extends SimpleRoute | SimpleRouter> =
  TNode extends SimpleRoute
    ? keyof TNode['_def']['errorShape']
    : TNode extends SimpleRouter
      ? inferErrorCodes<TNode['_def']['routes'][keyof TNode['_def']['routes']]>
      : never;

/**
 * OUTPUT
 */
export type inferOutputFromOutputSchema<TOutputSchema> =
  TOutputSchema extends TSchema ? Static<TOutputSchema> : TOutputSchema;

export type inferOutput<TRoute extends SimpleRoute> =
  inferOutputFromOutputSchema<TRoute['_def']['outputSchema']>;

/**
 * ARGS
 */
export type inferArgsFromArgsSchema<TArgsSchema> = TArgsSchema extends
  | undefined
  | void
  ? undefined | void
  : TArgsSchema extends TSchema
    ? Static<TArgsSchema>
    : TArgsSchema;

export type inferArgs<TRoute extends SimpleRoute> = inferArgsFromArgsSchema<
  TRoute['_def']['argsSchema']
>;

/**
 * DESCRIPTION
 */
export type inferDescription<TNode extends SimpleRoute | SimpleRouter> =
  TNode extends SimpleRoute
    ? TNode['_def']['description']
    : TNode extends SimpleRouter
      ? inferDescription<TNode['_def']['routes'][keyof TNode['_def']['routes']]>
      : never;

/**
 * RESOLVER TYPE
 */
export type inferResolverType<TRoute extends SimpleRoute> =
  TRoute['_def']['type'];

/**
 * RESPONSE
 */
export type inferResponse<TNode extends SimpleRoute | SimpleRouter> =
  TNode extends SimpleRoute
    ? {
        data: inferOutput<TNode> | null;
        error: PtsqError<
          keyof TNode['_def']['errorShape'] extends string
            ? keyof TNode['_def']['errorShape']
            : never
        > | null;
      }
    : TNode extends SimpleRouter
      ? inferResponse<TNode['_def']['routes'][keyof TNode['_def']['routes']]>
      : never;
