import { Type, type TIntersect, type TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { defaultJsonSchemaParser, JsonSchemaParser } from './jsonSchemaParser';
import {
  inferContextFromMiddlewareResponse,
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
  type MiddlewareMeta,
} from './middleware';
import { Mutation } from './mutation';
import {
  AnyPtsqError,
  AnyPtsqErrorShape,
  PtsqError,
  PtsqErrorShape,
} from './ptsqError';
import { AnyMiddlewareResponse, PtsqResponse } from './ptsqResponse';
import { Query } from './query';
import {
  Simplify,
  type ErrorMessage,
  type inferStaticInput,
  type inferStaticOutput,
  type MaybePromise,
} from './types';

export type ResolverConfig = {
  argsSchema: TSchema | undefined;
  outputSchema: TSchema | undefined;
  error: PtsqError<string>;
  rootContext: Context;
  context: Context;
  description: string | undefined;
};

/**
 * Resolver allows you to create queries, mutations and middlewares
 */
export class Resolver<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema | undefined,
  TError extends Record<string, AnyPtsqErrorShape>,
  TRootContext extends Context,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _def: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorSchema: TError;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
    errors: Record<string, AnyPtsqError>;
  };

  constructor(resolverOptions: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorSchema: TError;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
    errors: Record<string, AnyPtsqError>;
  }) {
    this._def = resolverOptions;
  }

  /**
   * Add a description to the resolver and routes created from it
   *
   * Description is then available on the client side
   */
  description<TNextDescription extends string>(description: TNextDescription) {
    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TError,
      TRootContext,
      TContext,
      TNextDescription
    >({
      ...this._def,
      description,
    });
  }

  /**
   * Add a middleware to the resolver
   *
   * Middlewares can update a context, transform output or input, or throw an error if something is wrong
   */
  use<
    TMiddlewareFunction extends MiddlewareFunction<
      inferStaticInput<TArgsSchema>,
      inferStaticOutput<TOutputSchema>,
      PtsqError<keyof TError extends string ? keyof TError : never>,
      TContext
    >,
  >(middleware: TMiddlewareFunction) {
    type NextContext = inferContextFromMiddlewareResponse<
      Awaited<ReturnType<TMiddlewareFunction>>
    >;

    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TError,
      TRootContext,
      NextContext,
      TDescription
    >({
      ...this._def,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: this._def.argsSchema,
          middlewareFunction: middleware,
          parser: this._def.parser,
        }),
      ] as AnyMiddleware[],
    });
  }

  /**
   * Add additional argument validation schema to the resolver
   */
  args<TNextSchemaArgs extends TSchema>(nextSchemaArgs: TNextSchemaArgs) {
    type NextArgsSchema = TArgsSchema extends TSchema
      ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
      : TNextSchemaArgs;

    const nextArgsSchema =
      this._def.argsSchema === undefined
        ? nextSchemaArgs
        : Type.Intersect([
            this._def.argsSchema,
            nextSchemaArgs as TNextSchemaArgs,
          ]);

    return new Resolver<
      NextArgsSchema,
      TOutputSchema,
      TError,
      TRootContext,
      TContext,
      TDescription
    >({
      ...this._def,
      argsSchema: nextArgsSchema as NextArgsSchema,
    });
  }

  error<TErrorCode extends string>(ptsqError: PtsqErrorShape<TErrorCode>) {
    type NextError = Simplify<
      TError & Record<TErrorCode, PtsqErrorShape<TErrorCode>>
    >;

    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      NextError,
      TRootContext,
      TContext,
      TDescription
    >({
      ...this._def,
      errorSchema: {
        ...this._def.errorSchema,
        [ptsqError.code]: ptsqError,
      },
    });
  }

  /**
   * Add additional output validation schema to the resolver
   */
  output<TNextSchemaOutput extends TSchema>(
    nextSchemaOutput: TNextSchemaOutput,
  ) {
    type NextSchemaOutput = TOutputSchema extends TSchema
      ? TIntersect<[TOutputSchema, TNextSchemaOutput]>
      : TNextSchemaOutput;

    const nextOutputSchema =
      this._def.outputSchema === undefined
        ? nextSchemaOutput
        : Type.Intersect([
            this._def.outputSchema,
            nextSchemaOutput as TNextSchemaOutput,
          ]);

    return new Resolver<
      TArgsSchema,
      NextSchemaOutput,
      TError,
      TRootContext,
      TContext,
      TDescription
    >({
      ...this._def,
      outputSchema: nextOutputSchema as NextSchemaOutput,
    });
  }

  /**
   * Creates a mutation endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using mutation
   */
  mutation(
    resolve: ResolveFunction<
      inferStaticInput<TArgsSchema>,
      inferStaticOutput<TOutputSchema>,
      PtsqError<keyof TError extends string ? keyof TError : never>,
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Mutation<
        TArgsSchema,
        TOutputSchema,
        TError,
        TContext,
        ResolveFunction<
          inferStaticInput<TArgsSchema>,
          inferStaticOutput<TOutputSchema>,
          PtsqError<keyof TError extends string ? keyof TError : never>,
          TContext
        >,
        TDescription
      >
    : ErrorMessage<`Mutation cannot be used without output schema.`> {
    return new Mutation({
      argsSchema: this._def.argsSchema,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      outputSchema: this._def.outputSchema!,
      errorSchema: this._def.errorSchema,
      resolveFunction: resolve,
      middlewares: this._def.middlewares,
      description: this._def.description,
      parser: this._def.parser,
      response: new PtsqResponse({ errorShema: this._def.errorSchema }),
    }) as TOutputSchema extends TSchema
      ? Mutation<
          TArgsSchema,
          TOutputSchema,
          TError,
          TContext,
          ResolveFunction<
            inferStaticInput<TArgsSchema>,
            inferStaticOutput<TOutputSchema>,
            PtsqError<keyof TError extends string ? keyof TError : never>,
            TContext
          >,
          TDescription
        >
      : ErrorMessage<`Mutation cannot be used without output schema.`>;
  }

  /**
   * Creates a query endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using query
   */
  query(
    resolve: ResolveFunction<
      inferStaticInput<TArgsSchema>,
      inferStaticOutput<TOutputSchema>,
      PtsqError<keyof TError extends string ? keyof TError : never>,
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Query<
        TArgsSchema,
        TOutputSchema,
        TError,
        TContext,
        TOutputSchema extends TSchema
          ? ResolveFunction<
              inferStaticInput<TArgsSchema>,
              inferStaticOutput<TOutputSchema>,
              PtsqError<keyof TError extends string ? keyof TError : never>,
              TContext
            >
          : never,
        TDescription
      >
    : ErrorMessage<`Query cannot be used without output schema.`> {
    return new Query({
      argsSchema: this._def.argsSchema,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      outputSchema: this._def.outputSchema!,
      errorSchema: this._def.errorSchema,
      resolveFunction: resolve,
      middlewares: this._def.middlewares,
      description: this._def.description,
      parser: this._def.parser,
      response: new PtsqResponse({ errorShema: this._def.errorSchema }),
    }) as TOutputSchema extends TSchema
      ? Query<
          TArgsSchema,
          TOutputSchema,
          TError,
          TContext,
          TOutputSchema extends TSchema
            ? ResolveFunction<
                inferStaticInput<TArgsSchema>,
                inferStaticOutput<TOutputSchema>,
                PtsqError<keyof TError extends string ? keyof TError : never>,
                TContext
              >
            : never,
          TDescription
        >
      : ErrorMessage<`Query cannot be used without output schema.`>;
  }

  /**
   * Creates a blank resolver
   */
  static createRoot<TContext extends Context>(rootResolverOptions?: {
    parser?: JsonSchemaParser;
  }) {
    return new Resolver<
      undefined,
      undefined,
      {},
      TContext,
      TContext,
      undefined
    >({
      argsSchema: undefined,
      outputSchema: undefined,
      errorSchema: {},
      middlewares: [],
      description: undefined,
      parser: rootResolverOptions?.parser ?? defaultJsonSchemaParser,
      errors: {},
    });
  }
}

/**
 * @internal
 */
export type ResolveFunction<
  TInput,
  TOutput,
  TError extends AnyPtsqError,
  TContext extends Context,
> = (options: {
  input: TInput;
  ctx: TContext;
  meta: MiddlewareMeta;
  response: PtsqResponse<TOutput, TError>;
}) => MaybePromise<AnyMiddlewareResponse>;

/**
 * @internal
 */
export type AnyResolveFunction = ResolveFunction<any, any, any, any>;

/**
 * @internal
 */
export type inferResolverRootContextType<TResolver> =
  TResolver extends Resolver<
    any,
    any,
    any,
    infer RootContext,
    any,
    string | undefined
  >
    ? RootContext
    : never;

/**
 * @internal
 */
export type inferResolverContextType<TResolver> =
  TResolver extends Resolver<
    any,
    any,
    any,
    any,
    infer Context,
    string | undefined
  >
    ? Context
    : never;
