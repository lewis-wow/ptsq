import { Type, type TIntersect, type TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { defaultJsonSchemaParser, JsonSchemaParser } from './jsonSchemaParser';
import {
  AnyMiddlewareFunction,
  inferContextFromMiddlewareResponse,
  Middleware,
  middleware,
  StandaloneMiddleware,
  type AnyMiddleware,
  type MiddlewareFunction,
  type MiddlewareMeta,
} from './middleware';
import { Mutation } from './mutation';
import { AnyPtsqError, PtsqError } from './ptsqError';
import { Query } from './query';
import {
  type ErrorMessage,
  type inferStaticInput,
  type inferStaticOutput,
  type MaybePromise,
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
  TErrors extends AnyPtsqError[],
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

  canThrow<TNextPtsqErrorCode extends string>(
    ptsqError: PtsqError<TNextPtsqErrorCode>,
  ) {
    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TRootContext,
      TContext,
      TDescription,
      [...TErrors, PtsqError<TNextPtsqErrorCode>]
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      parser: this._def.parser,
      errors: [...this._def.errors, ptsqError],
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
      | StandaloneMiddleware<inferStaticInput<TArgsSchema>, TContext, any>,
  >(middleware: TMiddlewareFunction) {
    type NextContext = inferContextFromMiddlewareResponse<
      Awaited<
        ReturnType<
          TMiddlewareFunction extends AnyMiddlewareFunction
            ? TMiddlewareFunction
            : TMiddlewareFunction extends StandaloneMiddleware<any, any, any>
              ? TMiddlewareFunction['_def']['middlewareFunction']
              : never
        >
      >
    >;

    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TRootContext,
      NextContext,
      TDescription,
      [
        ...TErrors,
        ...(TMiddlewareFunction extends StandaloneMiddleware<any, any, any>
          ? TMiddlewareFunction['_def']['errors']
          : []),
      ]
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
          errors: [
            ...this._def.errors,
            ...(typeof middleware === 'function' ? [] : middleware._def.errors),
          ] as any,
        }),
      ] as AnyMiddleware[],
      description: this._def.description,
      parser: this._def.parser,
      errors: [
        ...this._def.errors,
        ...(typeof middleware === 'function' ? [] : middleware._def.errors),
      ] as any,
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
      []
    >({
      argsSchema: undefined,
      outputSchema: undefined,
      middlewares: [],
      description: undefined,
      parser: rootResolverOptions?.parser ?? defaultJsonSchemaParser,
      errors: [],
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
    AnyPtsqError[]
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
    AnyPtsqError[]
  >
    ? Context
    : never;

const m1 = middleware()
  .canThrow(new PtsqError({ code: 'FORBIDDEN' }))
  .create(({ error }) => {
    throw error({ code: 'FORBIDDEN' });
  });

const resolver = Resolver.createRoot()
  .canThrow(new PtsqError({ code: 'UNAUTHORIZED' }))
  .use(({ error }) => {
    throw error({ code: 'UNAUTHORIZED' });
  })
  .use(m1);
