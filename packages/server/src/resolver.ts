import { Type, type Static, type TAnySchema } from '@sinclair/typebox';
import type { Context } from './context';
import {
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
  type MiddlewareMeta,
} from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import {
  createRecursiveTransformation,
  type AnyTransformation,
  type ArgsTransformationObject,
  type inferArgsTransformationNextArgs,
} from './transformation';
import type { ErrorMessage, MaybePromise } from './types';

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
  TOutput,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _middlewares: AnyMiddleware[];
  _transformations: AnyTransformation[];
  _schemaArgs: ResolverSchemaArgs | undefined;
  _schemaOutput: ResolverSchemaOutput | undefined;
  _description: TDescription;

  constructor(resolverOptions: {
    schemaArgs: ResolverSchemaArgs | undefined;
    schemaOutput: ResolverSchemaOutput | undefined;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description?: TDescription;
  }) {
    this._schemaArgs = resolverOptions.schemaArgs;
    this._middlewares = resolverOptions.middlewares;
    this._transformations = resolverOptions.transformations;
    this._schemaOutput = resolverOptions.schemaOutput;
    this._description =
      resolverOptions.description ?? (undefined as TDescription);
  }

  description<TNextDescription extends string>(description: TNextDescription) {
    return new Resolver<TArgs, TOutput, TContext, TNextDescription>({
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
    return new Resolver<TArgs, TOutput, TNextContext, TDescription>({
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
      TOutput,
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
  args<TNextSchemaArgs extends ResolverSchemaArgs>(
    nextSchemaArgs: TNextSchemaArgs,
  ) {
    const nextSchema =
      this._schemaArgs === undefined
        ? nextSchemaArgs
        : Type.Intersect([this._schemaArgs, nextSchemaArgs]);

    type NextArgs = TArgs extends undefined
      ? Static<TNextSchemaArgs>
      : TArgs & Static<TNextSchemaArgs>;

    return new Resolver<NextArgs, TOutput, TContext, TDescription>({
      schemaArgs: nextSchema,
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
  output<TNextSchemaOutput extends ResolverSchemaOutput>(
    nextSchemaOutput: TNextSchemaOutput,
  ) {
    const nextSchema =
      this._schemaOutput === undefined
        ? nextSchemaOutput
        : Type.Intersect([this._schemaOutput, nextSchemaOutput]);

    type NextOutput = TOutput extends undefined
      ? Static<TNextSchemaOutput>
      : TOutput & Static<TNextSchemaOutput>;

    return new Resolver<TArgs, NextOutput, TContext, TDescription>({
      schemaArgs: this._schemaArgs,
      schemaOutput: nextSchema,
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
    resolve: ResolveFunction<TArgs, inferResolverOutput<TOutput>, TContext>,
  ): TOutput extends undefined
    ? ErrorMessage<'Output schema cannot be undefined when creating mutation.'>
    : Mutation<ResolveFunction<TArgs, TOutput, TContext>, TDescription> {
    if (this._schemaOutput === undefined)
      throw new TypeError(
        `Output schema cannot be undefined when creating mutation.`,
      );

    return new Mutation({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
    }) as TOutput extends undefined
      ? ErrorMessage<'Output schema cannot be undefined when creating mutation.'>
      : Mutation<ResolveFunction<TArgs, TOutput, TContext>, TDescription>;
  }

  /**
   * Creates a query endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using query
   */
  query(
    resolve: ResolveFunction<TArgs, TOutput, TContext>,
  ): TOutput extends undefined
    ? ErrorMessage<'Output schema cannot be undefined when creating query.'>
    : Query<ResolveFunction<TArgs, TOutput, TContext>, TDescription> {
    if (this._schemaOutput === undefined)
      throw new TypeError(
        `Output schema cannot be undefined when creating query.`,
      );

    return new Query({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
    }) as TOutput extends undefined
      ? ErrorMessage<'Output schema cannot be undefined when creating query.'>
      : Query<ResolveFunction<TArgs, TOutput, TContext>, TDescription>;
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
