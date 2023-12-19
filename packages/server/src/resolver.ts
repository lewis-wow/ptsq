import {
  Type,
  type Static,
  type TAnySchema,
  type TIntersect,
  type TSchema,
} from '@sinclair/typebox';
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
import { type AnyTransformation } from './transformation';
import type { ErrorMessage, MaybePromise, Simplify } from './types';

export type ResolverSchema = TSchema;

export type inferResolverArgs<TResolverArgs> = TResolverArgs extends TAnySchema
  ? Static<TResolverArgs>
  : TResolverArgs;

export type inferResolverOutput<TResolverOutput> =
  TResolverOutput extends TAnySchema
    ? Static<TResolverOutput>
    : TResolverOutput;

type inferStatic<TTypeBoxSchema extends TSchema | undefined> =
  TTypeBoxSchema extends TSchema ? Static<TTypeBoxSchema> : undefined;

/**
 * Resolver allows you to create queries, mutations and middlewares
 */
export class Resolver<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema | undefined,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _middlewares: AnyMiddleware[];
  _transformations: AnyTransformation[];
  _outputTransformations: AnyTransformation[];
  _schemaArgs: TArgsSchema;
  _schemaOutput: TOutputSchema;
  _description: TDescription;
  _context: TContext = {} as TContext;

  constructor(resolverOptions: {
    schemaArgs: TArgsSchema;
    schemaOutput: TOutputSchema;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    outputTransformations: AnyTransformation[];
    description?: TDescription;
  }) {
    this._schemaArgs = resolverOptions.schemaArgs;
    this._schemaOutput = resolverOptions.schemaOutput;
    this._middlewares = resolverOptions.middlewares;
    this._transformations = resolverOptions.transformations;
    this._outputTransformations = resolverOptions.outputTransformations;
    this._description =
      resolverOptions.description ?? (undefined as TDescription);
  }

  description<TNextDescription extends string>(description: TNextDescription) {
    return new Resolver<TArgsSchema, TOutputSchema, TContext, TNextDescription>(
      {
        schemaArgs: this._schemaArgs,
        schemaOutput: this._schemaOutput,
        transformations: [...this._transformations],
        outputTransformations: [...this._outputTransformations],
        middlewares: [...this._middlewares],
        description: description,
      },
    );
  }

  /**
   * Add a middleware to the resolver
   *
   * @example
   * ```ts
   * .use(({ ctx, next }) => {
   *    if(!ctx.user) throw new HTTPError({ code: 'UNAUTHORIZED' });
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
  use<TNextContext extends Context>(
    middleware: MiddlewareFunction<
      inferStatic<TArgsSchema>,
      TContext,
      TNextContext
    >,
  ) {
    return new Resolver<TArgsSchema, TOutputSchema, TNextContext, TDescription>(
      {
        schemaArgs: this._schemaArgs,
        schemaOutput: this._schemaOutput,
        transformations: [...this._transformations],
        outputTransformations: [...this._outputTransformations],
        middlewares: [
          ...this._middlewares,
          new Middleware({
            schemaArgs: this._schemaArgs,
            transformations: [...this._transformations],
            middlewareFunction: middleware,
          }),
        ] as AnyMiddleware[],
      },
    );
  }

  merge<
    TResolver extends Resolver<
      TSchema | undefined,
      TSchema | undefined,
      any,
      string | undefined
    >,
  >(
    resolver: TContext extends TResolver['_context']
      ? TResolver
      : ErrorMessage<`The context have to extends the context of the merged resolver.`>,
  ) {
    if (typeof resolver === 'string') throw new TypeError();

    const nextArgsSchema =
      this._schemaArgs === undefined && resolver._schemaArgs === undefined
        ? undefined
        : this._schemaArgs === undefined
        ? resolver._schemaArgs
        : resolver._schemaArgs === undefined
        ? this._schemaArgs
        : Type.Intersect([this._schemaArgs, resolver._schemaArgs]);

    type NextArgsSchema = TArgsSchema extends TSchema
      ? TResolver['_schemaArgs'] extends TSchema
        ? TIntersect<[TArgsSchema, TResolver['_schemaArgs']]>
        : TArgsSchema
      : TResolver['_schemaArgs'];

    const nextOutputSchema =
      this._schemaOutput === undefined && resolver._schemaOutput === undefined
        ? undefined
        : this._schemaOutput === undefined
        ? resolver._schemaOutput
        : resolver._schemaOutput === undefined
        ? this._schemaOutput
        : Type.Intersect([this._schemaOutput, resolver._schemaOutput]);

    type NextOutputSchema = TArgsSchema extends TSchema
      ? TResolver['_schemaOutput'] extends TSchema
        ? TIntersect<[TArgsSchema, TResolver['_schemaOutput']]>
        : TArgsSchema
      : TResolver['_schemaOutput'];

    return new Resolver<
      NextArgsSchema,
      NextOutputSchema,
      TContext,
      TDescription
    >({
      schemaArgs: nextArgsSchema as NextArgsSchema,
      schemaOutput: nextOutputSchema as NextOutputSchema,
      transformations: [...this._transformations],
      outputTransformations: [...this._outputTransformations],
      middlewares: [...this._middlewares, ...resolver._middlewares],
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
    if (typeof nextSchemaArgs === 'string')
      throw new TypeError(
        `The args schema cannot be string and must be serializable.`,
      );

    type NextArgsSchema = TArgsSchema extends TSchema
      ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
      : TNextSchemaArgs;

    const nextArgsSchema =
      this._schemaArgs === undefined
        ? nextSchemaArgs
        : Type.Intersect([this._schemaArgs, nextSchemaArgs]);

    return new Resolver<NextArgsSchema, TOutputSchema, TContext, TDescription>({
      schemaArgs: nextArgsSchema as NextArgsSchema,
      schemaOutput: this._schemaOutput,
      transformations: [],
      outputTransformations: [...this._outputTransformations],
      middlewares: [...this._middlewares],
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
    if (typeof nextSchemaOutput === 'string')
      throw new TypeError(
        `The output schema cannot be string and must be serializable.`,
      );

    type NextSchemaOutput = TOutputSchema extends TSchema
      ? TIntersect<[TOutputSchema, TNextSchemaOutput]>
      : TNextSchemaOutput;

    const nextOutputSchema =
      this._schemaOutput === undefined
        ? nextSchemaOutput
        : Type.Intersect([this._schemaOutput, nextSchemaOutput]);

    return new Resolver<TArgsSchema, NextSchemaOutput, TContext, TDescription>({
      schemaArgs: this._schemaArgs,
      schemaOutput: nextOutputSchema as NextSchemaOutput,
      middlewares: this._middlewares,
      transformations: [...this._transformations],
      outputTransformations: [],
    });
  }

  /**
   * Creates a mutation endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using mutation
   */
  mutation(
    resolve: ResolveFunction<
      Simplify<inferStatic<TArgsSchema>>,
      inferStatic<TOutputSchema>,
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Mutation<
        TArgsSchema,
        TOutputSchema,
        ResolveFunction<
          Simplify<inferStatic<TArgsSchema>>,
          inferStatic<TOutputSchema>,
          TContext
        >,
        TDescription
      >
    : ErrorMessage<`Mutation cannot be used without output schema.`> {
    if (this._schemaOutput === undefined) throw new TypeError();

    return new Mutation({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
    }) as TOutputSchema extends TSchema
      ? Mutation<
          TArgsSchema,
          TOutputSchema,
          ResolveFunction<
            Simplify<inferStatic<TArgsSchema>>,
            inferStatic<TOutputSchema>,
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
      Simplify<inferStatic<TArgsSchema>>,
      inferStatic<TOutputSchema>,
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Query<
        TArgsSchema,
        TOutputSchema,
        TOutputSchema extends TSchema
          ? ResolveFunction<
              Simplify<inferStatic<TArgsSchema>>,
              inferStatic<TOutputSchema>,
              TContext
            >
          : never,
        TDescription
      >
    : ErrorMessage<`Query cannot be used without output schema.`> {
    if (this._schemaOutput === undefined) throw new TypeError();

    return new Query({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
    }) as TOutputSchema extends TSchema
      ? Query<
          TArgsSchema,
          TOutputSchema,
          TOutputSchema extends TSchema
            ? ResolveFunction<
                Simplify<inferStatic<TArgsSchema>>,
                inferStatic<TOutputSchema>,
                TContext
              >
            : never,
          TDescription
        >
      : ErrorMessage<`Query cannot be used without output schema.`>;
  }

  static createRoot<TContext extends Context>() {
    return new Resolver<undefined, undefined, TContext, undefined>({
      schemaArgs: undefined,
      schemaOutput: undefined,
      transformations: [],
      outputTransformations: [],
      middlewares: [],
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
