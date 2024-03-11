import { Type, type TIntersect, type TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { defaultJsonSchemaParser, JsonSchemaParser } from './jsonSchemaParser';
import {
  AnyMiddlewareFunction,
  inferContextFromMiddlewareResponse,
  Middleware,
  middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
  type MiddlewareMeta,
} from './middleware';
import { Mutation } from './mutation';
import {
  AnyPtsqError,
  AnyPtsqErrorTemplate,
  PtsqError,
  PtsqErrorTemplate,
} from './ptsqError';
import { Query } from './query';
import {
  type ErrorMessage,
  type inferStaticInput,
  type inferStaticOutput,
  type MaybePromise,
  type ShallowMerge,
  type Simplify,
} from './types';

/**
 * Resolver allows you to create queries, mutations and middlewares
 */
export class Resolver<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema | undefined,
  TRootContext extends Context,
  TContext extends Context,
  TDescription extends string | undefined,
  TErrors extends Record<string, AnyPtsqError>,
> {
  _def: {
    middlewares: AnyMiddleware[];
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    description: TDescription;
    parser: JsonSchemaParser;
    errors: TErrors;
  };

  constructor(resolverOptions: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
    errors: TErrors;
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
      TRootContext,
      TContext,
      TNextDescription,
      TErrors
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: description,
      parser: this._def.parser,
      errors: this._def.errors,
    });
  }

  canThrow<const TPtsqErrorTemplate extends AnyPtsqErrorTemplate>(
    ptsqErrorTemplate: TPtsqErrorTemplate,
  ) {
    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TRootContext,
      TContext,
      TDescription,
      Simplify<
        TErrors & { [key in TPtsqErrorTemplate['code']]: TPtsqErrorTemplate }
      >
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      parser: this._def.parser,
      errors: {
        ...this._def.errors,
        [ptsqErrorTemplate.code]: ptsqErrorTemplate,
      },
    });
  }

  /**
   * Add a middleware to the resolver
   *
   * Middlewares can update a context, transform output or input, or throw an error if something is wrong
   */
  use<
    TMiddlewareFunction extends
      | MiddlewareFunction<inferStaticInput<TArgsSchema>, TContext, TErrors>
      | Middleware<
          inferStaticInput<TArgsSchema>,
          TContext,
          Record<string, number>
        >,
  >(middleware: TMiddlewareFunction) {
    type NextMiddlewareFunction =
      TMiddlewareFunction extends AnyMiddlewareFunction
        ? TMiddlewareFunction
        : TMiddlewareFunction extends AnyMiddleware
          ? TMiddlewareFunction['_def']['middlewareFunction']
          : never;

    type NextContext = inferContextFromMiddlewareResponse<
      Awaited<ReturnType<NextMiddlewareFunction>>
    >;

    const nextErrors = {
      ...this._def.errors,
      ...(typeof middleware !== 'function' ? middleware._def.errors : {}),
    };

    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TRootContext,
      NextContext,
      TDescription,
      TErrors
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: this._def.argsSchema,
          middlewareFunction:
            typeof middleware === 'function'
              ? middleware
              : middleware._def.middlewareFunction,
          parser: this._def.parser,
          errors: this._def.errors,
        }),
      ] as AnyMiddleware[],
      description: this._def.description,
      parser: this._def.parser,
      errors: nextErrors,
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
      TRootContext,
      TContext,
      TDescription,
      TErrors
    >({
      argsSchema: nextArgsSchema as NextArgsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      parser: this._def.parser,
      errors: this._def.errors,
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
      TRootContext,
      TContext,
      TDescription,
      TErrors
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: nextOutputSchema as NextSchemaOutput,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      parser: this._def.parser,
      errors: this._def.errors,
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
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Mutation<
        TArgsSchema,
        TOutputSchema,
        TContext,
        ResolveFunction<
          inferStaticInput<TArgsSchema>,
          inferStaticOutput<TOutputSchema>,
          TContext
        >,
        TDescription
      >
    : ErrorMessage<`Mutation cannot be used without output schema.`> {
    return new Mutation({
      argsSchema: this._def.argsSchema,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      outputSchema: this._def.outputSchema!,
      resolveFunction: resolve,
      middlewares: this._def.middlewares,
      description: this._def.description,
      parser: this._def.parser,
    }) as TOutputSchema extends TSchema
      ? Mutation<
          TArgsSchema,
          TOutputSchema,
          TContext,
          ResolveFunction<
            inferStaticInput<TArgsSchema>,
            inferStaticOutput<TOutputSchema>,
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
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Query<
        TArgsSchema,
        TOutputSchema,
        TContext,
        TOutputSchema extends TSchema
          ? ResolveFunction<
              inferStaticInput<TArgsSchema>,
              inferStaticOutput<TOutputSchema>,
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
      resolveFunction: resolve,
      middlewares: this._def.middlewares,
      description: this._def.description,
      parser: this._def.parser,
    }) as TOutputSchema extends TSchema
      ? Query<
          TArgsSchema,
          TOutputSchema,
          TContext,
          TOutputSchema extends TSchema
            ? ResolveFunction<
                inferStaticInput<TArgsSchema>,
                inferStaticOutput<TOutputSchema>,
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
      TContext,
      TContext,
      undefined,
      {}
    >({
      argsSchema: undefined,
      outputSchema: undefined,
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
  TContext extends Context,
> = (options: {
  input: TInput;
  ctx: TContext;
  meta: MiddlewareMeta;
}) => MaybePromise<TOutput>;

/**
 * @internal
 */
export type AnyResolveFunction = ResolveFunction<any, any, any>;

/**
 * @internal
 */
export type inferResolverRootContextType<TResolver> =
  TResolver extends Resolver<
    any,
    any,
    infer RootContext,
    any,
    string | undefined,
    Record<string, AnyPtsqError>
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
    infer Context,
    string | undefined,
    Record<string, AnyPtsqError>
  >
    ? Context
    : never;

const m1 = middleware()
  .canThrow({ code: 'XXX', httpStatus: 400 })
  .create(({ next, PtsqError }) => {
    throw PtsqError({ code: 'XXX' });
  });

const resolver = Resolver.createRoot<{ test: 1 | 2 }>().canThrow({
  code: 'CUSTOM_ERROR',
  httpStatus: 500,
});
