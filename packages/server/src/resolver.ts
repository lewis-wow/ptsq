import { Type, type TIntersect, type TSchema } from '@sinclair/typebox';
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
    context: TContext;
    rootContext: TRootContext;
  };

  constructor(resolverOptions: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    middlewares: AnyMiddleware[];
    description?: TDescription;
  }) {
    this._def = {
      ...resolverOptions,
      description: resolverOptions.description as TDescription,
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
    });
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
      Simplify<
        ShallowMerge<TContext, Awaited<ReturnType<TMiddlewareFunction>>['ctx']>
      >,
      TDescription
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: this._def.argsSchema,
          middlewareFunction: middleware,
        }),
      ] as AnyMiddleware[],
      description: this._def.description,
    });
  }

  merge<TResolver extends AnyResolver>(
    resolver: TContext extends TResolver['_def']['rootContext']
      ? TResolver
      : ErrorMessage<`Current resolver context have to extend the root context of the merging resolver.`>,
  ) {
    if (typeof resolver === 'string') throw new TypeError();

    const nextArgsSchema =
      this._def.argsSchema === undefined &&
      resolver._def.argsSchema === undefined
        ? undefined
        : this._def.argsSchema === undefined
        ? resolver._def.argsSchema
        : resolver._def.argsSchema === undefined
        ? this._def.argsSchema
        : Type.Intersect([this._def.argsSchema, resolver._def.argsSchema]);

    type NextArgsSchema = TArgsSchema extends TSchema
      ? TResolver['_def']['argsSchema'] extends TSchema
        ? TIntersect<[TArgsSchema, TResolver['_def']['argsSchema']]>
        : TArgsSchema
      : TResolver['_def']['argsSchema'];

    const nextOutputSchema =
      this._def.outputSchema === undefined &&
      resolver._def.outputSchema === undefined
        ? undefined
        : this._def.outputSchema === undefined
        ? resolver._def.outputSchema
        : resolver._def.outputSchema === undefined
        ? this._def.outputSchema
        : Type.Intersect([this._def.outputSchema, resolver._def.outputSchema]);

    type NextOutputSchema = TArgsSchema extends TSchema
      ? TResolver['_def']['outputSchema'] extends TSchema
        ? TIntersect<[TArgsSchema, TResolver['_def']['outputSchema']]>
        : TArgsSchema
      : TResolver['_def']['outputSchema'];

    return new Resolver<
      NextArgsSchema,
      NextOutputSchema,
      TRootContext,
      Simplify<ShallowMerge<TContext, TResolver['_def']['context']>>,
      TResolver['_def']['description']
    >({
      argsSchema: nextArgsSchema as NextArgsSchema,
      outputSchema: nextOutputSchema as NextOutputSchema,
      middlewares: [...this._def.middlewares, ...resolver._def.middlewares],
      description: resolver._def.description,
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
      this._def.argsSchema === undefined
        ? nextSchemaArgs
        : Type.Intersect([this._def.argsSchema, nextSchemaArgs]);

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
      this._def.outputSchema === undefined
        ? nextSchemaOutput
        : Type.Intersect([this._def.outputSchema, nextSchemaOutput]);

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

  static createRoot<TContext extends Context>() {
    return new Resolver<undefined, undefined, TContext, TContext, undefined>({
      argsSchema: undefined,
      outputSchema: undefined,
      middlewares: [],
      description: undefined,
    });
  }
}

export type AnyResolver = Resolver<any, any, any, any, string | undefined>;

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
