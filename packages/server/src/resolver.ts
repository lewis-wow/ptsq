import { Type, type TIntersect, type TSchema } from '@sinclair/typebox';
import { Compiler } from './compiler';
import type { Context } from './context';
import {
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
  type MiddlewareMeta,
} from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableSchema } from './serializable';
import {
  type ErrorMessage,
  type inferStaticInput,
  type inferStaticOutput,
  type MaybePromise,
  type ShallowMerge,
  type Simplify,
} from './types';

export type ResolverSchema = TSchema;

/**
 * Resolver allows you to create queries, mutations and middlewares
 */

export class Resolver<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema | undefined,
  TRootContext extends Context,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _def: {
    middlewares: AnyMiddleware[];
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    description: TDescription;
    /**
     * @internal
     * type only - cannot access context while creating resolver
     */
    context: TContext;
    /**
     * @internal
     * type only - cannot access context while creating resolver
     */
    rootContext: TRootContext;
    compiler: Compiler;
  };

  constructor(resolverOptions: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    middlewares: AnyMiddleware[];
    description: TDescription;
    compiler: Compiler;
  }) {
    this._def = {
      ...resolverOptions,
      description: resolverOptions.description,
      context: {} as TContext,
      rootContext: {} as TRootContext,
    };
  }

  description<TNextDescription extends string>(description: TNextDescription) {
    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TRootContext,
      TContext,
      TNextDescription
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: description,
      compiler: this._def.compiler,
    });
  }

  /**
   * Add a middleware to the resolver
   *
   * @example
   * ```ts
   * .use(({ ctx, next }) => {
   *    if(!ctx.user) throw new PtsqError({ code: 'UNAUTHORIZED' });
   *
   *    return next({
   *      ...ctx,
   *      user: ctx.user
   *    });
   * })
   * .output(...)
   * .query(...)
   * ```
   */
  use<
    TMiddlewareFunction extends MiddlewareFunction<
      inferStaticInput<TArgsSchema>,
      TContext
    >,
  >(middleware: TMiddlewareFunction) {
    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TRootContext,
      Awaited<ReturnType<TMiddlewareFunction>>['ctx'],
      TDescription
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: this._def.argsSchema,
          middlewareFunction: middleware,
          compiler: this._def.compiler,
        }),
      ] as AnyMiddleware[],
      description: this._def.description,
      compiler: this._def.compiler,
    });
  }

  /**
   * Add additional arguments by the validation schema to the resolver
   *
   * The next validation schema must extends the previous one
   *
   * @example
   * ```ts
   * .args(z.object({ firstName: z.string() }))
   * // ...
   * .args(z.object({ firstName: z.string(), lastName: z.string() }))
   * .output(...)
   * .query(...)
   * ```
   */
  args<TNextSchemaArgs extends ResolverSchema>(
    nextSchemaArgs: SerializableSchema<TNextSchemaArgs>,
  ) {
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
      TDescription
    >({
      argsSchema: nextArgsSchema as NextArgsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      compiler: this._def.compiler,
    });
  }

  /**
   * Add output validation schema
   *
   * The next output validation schema must extends the previous one
   *
   * @example
   * ```ts
   * .output(z.object({ firstName: z.string() }))
   * // ...
   * .output(z.object({ firstName: z.string(), lastName: z.string() }))
   * .query(...)
   * ```
   */
  output<TNextSchemaOutput extends ResolverSchema>(
    nextSchemaOutput: SerializableSchema<TNextSchemaOutput>,
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
      TDescription
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: nextOutputSchema as NextSchemaOutput,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      compiler: this._def.compiler,
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
      compiler: this._def.compiler,
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
      compiler: this._def.compiler,
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

  static createRoot<TContext extends Context>(rootResolverOptions?: {
    compiler?: Compiler;
  }) {
    return new Resolver<undefined, undefined, TContext, TContext, undefined>({
      argsSchema: undefined,
      outputSchema: undefined,
      middlewares: [],
      description: undefined,
      compiler: rootResolverOptions?.compiler ?? new Compiler(),
    });
  }

  static merge<
    TResolverA extends Resolver<any, any, any, any, string | undefined>,
    TResolverB extends Resolver<any, any, any, any, string | undefined>,
  >(
    resolverA: TResolverA,
    resolverB: TResolverA['_def']['context'] extends TResolverB['_def']['rootContext']
      ? TResolverB
      : ErrorMessage<`Context of resolver B have to extends context of resolver A.`>,
  ) {
    const _resolverB = resolverB as TResolverB;

    const nextArgsSchema =
      resolverA._def.argsSchema === undefined &&
      _resolverB._def.argsSchema === undefined
        ? undefined
        : resolverA._def.argsSchema === undefined
          ? _resolverB._def.argsSchema
          : _resolverB._def.argsSchema === undefined
            ? resolverA._def.argsSchema
            : Type.Intersect([
                resolverA._def.argsSchema,
                _resolverB._def.argsSchema,
              ]);

    type NextArgsSchema = TResolverA['_def']['argsSchema'] extends TSchema
      ? TResolverB['_def']['argsSchema'] extends TSchema
        ? TIntersect<
            [TResolverA['_def']['argsSchema'], TResolverB['_def']['argsSchema']]
          >
        : TResolverA['_def']['argsSchema']
      : TResolverB['_def']['argsSchema'];

    const nextOutputSchema =
      resolverA._def.outputSchema === undefined &&
      _resolverB._def.outputSchema === undefined
        ? undefined
        : resolverA._def.outputSchema === undefined
          ? _resolverB._def.outputSchema
          : _resolverB._def.outputSchema === undefined
            ? resolverA._def.outputSchema
            : Type.Intersect([
                resolverA._def.outputSchema,
                _resolverB._def.outputSchema,
              ]);

    type NextOutputSchema = TResolverA['_def']['outputSchema'] extends TSchema
      ? TResolverB['_def']['outputSchema'] extends TSchema
        ? TIntersect<
            [
              TResolverA['_def']['outputSchema'],
              TResolverB['_def']['outputSchema'],
            ]
          >
        : TResolverA['_def']['outputSchema']
      : TResolverB['_def']['outputSchema'];

    return new Resolver<
      NextArgsSchema,
      NextOutputSchema,
      TResolverA['_def']['rootContext'],
      Simplify<
        ShallowMerge<
          TResolverA['_def']['context'],
          TResolverB['_def']['context']
        >
      >,
      TResolverB['_def']['description']
    >({
      argsSchema: nextArgsSchema as NextArgsSchema,
      outputSchema: nextOutputSchema as NextOutputSchema,
      middlewares: [
        ...resolverA._def.middlewares,
        ..._resolverB._def.middlewares,
      ],
      description: _resolverB._def.description,
      compiler: resolverA._def.compiler,
    });
  }
}

export type ResolveFunction<
  TInput,
  TOutput,
  TContext extends Context,
> = (options: {
  input: TInput;
  ctx: TContext;
  meta: MiddlewareMeta;
}) => MaybePromise<TOutput>;

export type AnyResolveFunction = ResolveFunction<any, any, any>;
