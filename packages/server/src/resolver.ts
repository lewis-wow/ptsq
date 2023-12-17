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
import type { ForceSerializableSchema } from './serializable';
import {
  createRecursiveTransformation,
  type AnyTransformation,
  type ArgsTransformationObject,
  type inferArgsTransformationNextArgs,
} from './transformation';
import type { DeepMerge, MaybePromise, Simplify } from './types';

export type ResolverSchema = TSchema;

export type inferResolverArgs<TResolverArgs> = TResolverArgs extends TAnySchema
  ? Static<TResolverArgs>
  : TResolverArgs;

export type inferResolverOutput<TResolverOutput> =
  TResolverOutput extends TAnySchema
    ? Static<TResolverOutput>
    : TResolverOutput;

/**
 * Resolver allows you to create queries, mutations and middlewares
 */
export class Resolver<
  TArgs,
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema | undefined,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _middlewares: AnyMiddleware[];
  _transformations: AnyTransformation[];
  _schemaArgs: TArgsSchema;
  _schemaOutput: TOutputSchema;
  _description: TDescription;

  constructor(resolverOptions: {
    schemaArgs: TArgsSchema;
    schemaOutput: TOutputSchema;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description?: TDescription;
  }) {
    this._schemaArgs = resolverOptions.schemaArgs;
    this._schemaOutput = resolverOptions.schemaOutput;
    this._middlewares = resolverOptions.middlewares;
    this._transformations = resolverOptions.transformations;
    this._description =
      resolverOptions.description ?? (undefined as TDescription);
  }

  description<TNextDescription extends string>(description: TNextDescription) {
    return new Resolver<
      TArgs,
      TArgsSchema,
      TOutputSchema,
      TContext,
      TNextDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      transformations: [...this._transformations],
      middlewares: [...this._middlewares],
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
  use<TNextContext extends Context>(
    middleware: MiddlewareFunction<TArgs, TContext, TNextContext>,
  ) {
    return new Resolver<
      TArgs,
      TArgsSchema,
      TOutputSchema,
      TNextContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      transformations: [...this._transformations],
      middlewares: [
        ...this._middlewares,
        new Middleware({
          schemaArgs: this._schemaArgs,
          transformations: [...this._transformations],
          middlewareFunction: middleware,
        }),
      ] as AnyMiddleware[],
    });
  }

  /**
   * Add a transformation for the resolver arguments
   *
   * Allows you to access parsed value of serialized arguments
   *
   * @example
   * ```ts
   * .args(z.object({ url: z.string().url() }))
   * .transformation({
   *    url: (input) => new URL(input)
   * })
   * .output(...)
   * .query(...)
   * ```
   */
  transformation<
    TArgsTransformationObject extends ArgsTransformationObject<TArgs>,
  >(argsTransformationObject: TArgsTransformationObject) {
    const transformationFunction = (input: TArgs) =>
      createRecursiveTransformation({
        input,
        argsTransformationObject,
      });

    return new Resolver<
      inferArgsTransformationNextArgs<TArgs, TArgsTransformationObject>,
      TArgsSchema,
      TOutputSchema,
      TContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      transformations: [...this._transformations, transformationFunction],
      middlewares: [...this._middlewares],
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
    nextSchemaArgs: ForceSerializableSchema<TNextSchemaArgs>,
  ) {
    type NextSchema = TArgsSchema extends TSchema
      ? TIntersect<[TArgsSchema, ForceSerializableSchema<TNextSchemaArgs>]>
      : ForceSerializableSchema<TNextSchemaArgs>;

    const nextArgsSchema =
      this._schemaArgs === undefined
        ? nextSchemaArgs
        : Type.Intersect([this._schemaArgs, nextSchemaArgs]);

    return new Resolver<
      TArgs extends undefined
        ? Static<NextSchema>
        : DeepMerge<Static<NextSchema>, TArgs>,
      NextSchema,
      TOutputSchema,
      TContext,
      TDescription
    >({
      schemaArgs: nextArgsSchema as NextSchema,
      schemaOutput: this._schemaOutput,
      transformations: [...this._transformations],
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
    nextSchemaOutput: ForceSerializableSchema<TNextSchemaOutput>,
  ) {
    type NextSchemaOutput = TOutputSchema extends TSchema
      ? TIntersect<[TOutputSchema, ForceSerializableSchema<TNextSchemaOutput>]>
      : ForceSerializableSchema<TNextSchemaOutput>;

    const nextOutputSchema =
      this._schemaOutput === undefined
        ? nextSchemaOutput
        : Type.Intersect([this._schemaOutput, nextSchemaOutput]);

    return new Resolver<
      TArgs,
      TArgsSchema,
      NextSchemaOutput,
      TContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: nextOutputSchema as NextSchemaOutput,
      middlewares: this._middlewares,
      transformations: [...this._transformations],
    });
  }

  /**
   * Creates a mutation endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using mutation
   */
  mutation(
    resolve: TOutputSchema extends TSchema
      ? ResolveFunction<
          Simplify<TArgs>,
          Simplify<Static<TOutputSchema>> extends Record<string, never>
            ? Record<string, never>
            : Simplify<Static<TOutputSchema>>,
          TContext
        >
      : never,
  ): Mutation<
    TArgsSchema,
    TOutputSchema,
    TOutputSchema extends TSchema
      ? ResolveFunction<
          Simplify<TArgs>,
          Simplify<Static<TOutputSchema>> extends Record<string, never>
            ? Record<string, never>
            : Simplify<Static<TOutputSchema>>,
          TContext
        >
      : never,
    TDescription
  > {
    if (this._schemaOutput === undefined) throw new TypeError();

    return new Mutation({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
    });
  }

  /**
   * Creates a query endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using query
   */
  query(
    resolve: TOutputSchema extends TSchema
      ? ResolveFunction<
          Simplify<TArgs>,
          Simplify<Static<TOutputSchema>> extends Record<string, never>
            ? Record<string, never>
            : Simplify<Static<TOutputSchema>>,
          TContext
        >
      : never,
  ): Query<
    TArgsSchema,
    TOutputSchema,
    TOutputSchema extends TSchema
      ? ResolveFunction<
          Simplify<TArgs>,
          Simplify<Static<TOutputSchema>> extends Record<string, never>
            ? Record<string, never>
            : Simplify<Static<TOutputSchema>>,
          TContext
        >
      : never,
    TDescription
  > {
    if (this._schemaOutput === undefined) throw new TypeError();

    return new Query({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
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
