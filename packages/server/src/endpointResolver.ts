import { Type, type Static, type TAnySchema } from '@sinclair/typebox';
import type { Context } from './context';
import {
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
} from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { ResolveFunction } from './resolver';
import {
  createRecursiveTransformation,
  type AnyTransformation,
  type ArgsTransformationObject,
  type inferArgsTransformationNextArgs,
} from './transformation';

export type ResolverSchemaArgs = TAnySchema;
export type ResolverSchemaOutput = TAnySchema;

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
  TArgsSchema extends ResolverSchemaArgs,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _middlewares: AnyMiddleware[];
  _transformations: AnyTransformation[];
  _schemaArgs: TArgsSchema;
  _description: TDescription;

  constructor(resolverOptions: {
    schemaArgs: TArgsSchema;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description?: TDescription;
  }) {
    this._schemaArgs = resolverOptions.schemaArgs;
    this._middlewares = resolverOptions.middlewares;
    this._transformations = resolverOptions.transformations;
    this._description =
      resolverOptions.description ?? (undefined as TDescription);
  }

  description<TNextDescription extends string>(description: TNextDescription) {
    return new Resolver<TArgs, TArgsSchema, TContext, TNextDescription>({
      schemaArgs: this._schemaArgs,
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
    return new Resolver<TArgs, TArgsSchema, TNextContext, TDescription>({
      schemaArgs: this._schemaArgs,
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
      TContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
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
  args<TNextSchemaArgs extends ResolverSchemaArgs>(
    nextSchemaArgs: TNextSchemaArgs,
  ) {
    const nextSchema = Type.Intersect([this._schemaArgs, nextSchemaArgs]);

    return new Resolver<
      Static<typeof nextSchema>,
      typeof nextSchema,
      TContext,
      TDescription
    >({
      schemaArgs: nextSchema,
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
  output<TNextSchemaOutput extends ResolverSchemaOutput>(
    nextSchemaOutput: TNextSchemaOutput,
  ) {
    return new EndpointResolver<
      TArgs,
      TArgsSchema,
      typeof nextSchemaOutput,
      TContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: nextSchemaOutput,
      middlewares: this._middlewares,
      transformations: [...this._transformations],
    });
  }
}

export class EndpointResolver<
  TArgs,
  TArgsSchema extends ResolverSchemaArgs,
  TOutputSchema extends ResolverSchemaOutput,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _schemaOutput: TOutputSchema;
  _middlewares: AnyMiddleware[];
  _transformations: AnyTransformation[];
  _schemaArgs: TArgsSchema;
  _description: TDescription;

  constructor(resolverOptions: {
    schemaArgs: TArgsSchema;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description?: TDescription;
    schemaOutput: TOutputSchema;
  }) {
    this._schemaArgs = resolverOptions.schemaArgs;
    this._middlewares = resolverOptions.middlewares;
    this._transformations = resolverOptions.transformations;
    this._description =
      resolverOptions.description ?? (undefined as TDescription);
    this._schemaOutput = resolverOptions.schemaOutput;
  }

  description<TNextDescription extends string>(description: TNextDescription) {
    return new EndpointResolver<
      TArgs,
      TArgsSchema,
      TOutputSchema,
      TContext,
      TNextDescription
    >({
      schemaArgs: this._schemaArgs,
      transformations: [...this._transformations],
      middlewares: [...this._middlewares],
      description: description,
      schemaOutput: this._schemaOutput,
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
    return new EndpointResolver<
      TArgs,
      TArgsSchema,
      TOutputSchema,
      TNextContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      transformations: [...this._transformations],
      schemaOutput: this._schemaOutput,
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

    return new EndpointResolver<
      inferArgsTransformationNextArgs<TArgs, TArgsTransformationObject>,
      TArgsSchema,
      TOutputSchema,
      TContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      transformations: [...this._transformations, transformationFunction],
      middlewares: [...this._middlewares],
      schemaOutput: this._schemaOutput,
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
  args<TNextSchemaArgs extends ResolverSchemaArgs>(
    nextSchemaArgs: TNextSchemaArgs,
  ) {
    const nextSchema = Type.Intersect([this._schemaArgs, nextSchemaArgs]);

    return new EndpointResolver<
      Static<typeof nextSchema>,
      typeof nextSchema,
      TOutputSchema,
      TContext,
      TDescription
    >({
      schemaArgs: nextSchema,
      transformations: [...this._transformations],
      middlewares: [...this._middlewares],
      schemaOutput: this._schemaOutput,
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
  output<TNextSchemaOutput extends ResolverSchemaOutput>(
    nextSchemaOutput: TNextSchemaOutput,
  ) {
    return new EndpointResolver<
      TArgs,
      TArgsSchema,
      typeof nextSchemaOutput,
      TContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: nextSchemaOutput,
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
    resolve: ResolveFunction<
      TArgs,
      inferResolverOutput<TOutputSchema>,
      TContext
    >,
  ): Mutation<
    TArgsSchema,
    TOutputSchema,
    ResolveFunction<TArgs, inferResolverOutput<TOutputSchema>, TContext>,
    TDescription
  > {
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
    resolve: ResolveFunction<
      TArgs,
      inferResolverOutput<TOutputSchema>,
      TContext
    >,
  ): Query<
    TArgsSchema,
    TOutputSchema,
    ResolveFunction<TArgs, inferResolverOutput<TOutputSchema>, TContext>,
    TDescription
  > {
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
