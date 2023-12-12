import type { z } from 'zod';
import type { Context } from './context';
import {
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
  type MiddlewareMeta,
} from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { Serializable } from './serializable';
import {
  createRecursiveTransformation,
  type AnyTransformation,
  type ArgsTransformationObject,
  type inferArgsTransformationNextArgs,
} from './transformation';
import type { DeepMerge, ErrorMessage, MaybePromise, Simplify } from './types';

export type ResolverSchemaArgs = z.Schema<Serializable>;
export type ResolverSchemaOutput = z.Schema<Serializable, z.ZodTypeDef, any>;

export type inferResolverArgs<TResolverArgs> = TResolverArgs extends z.Schema
  ? TResolverArgs extends z.ZodVoid
    ? undefined
    : z.output<TResolverArgs>
  : TResolverArgs;

export type inferResolverOutput<TResolverOutput> =
  TResolverOutput extends z.Schema ? z.input<TResolverOutput> : TResolverOutput;

/**
 * Resolver allows you to create queries, mutations and middlewares
 */
export class Resolver<
  TArgs,
  TSchemaArgs extends ResolverSchemaArgs | undefined,
  TOutput,
  TSchemaOutput extends ResolverSchemaOutput | undefined,
  TContext extends Context,
  TDescription extends string | undefined,
> {
  _middlewares: AnyMiddleware[];
  _transformations: AnyTransformation[];
  _schemaArgs: TSchemaArgs;
  _schemaOutput: TSchemaOutput;
  _description: TDescription;

  constructor(resolverOptions: {
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
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
    return new Resolver<
      TArgs,
      TSchemaArgs,
      TOutput,
      TSchemaOutput,
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
      TSchemaArgs,
      TOutput,
      TSchemaOutput,
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
      TSchemaArgs,
      TOutput,
      TSchemaOutput,
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
  args<
    TNextSchemaArgs extends TSchemaArgs extends undefined
      ? ResolverSchemaArgs
      : TSchemaArgs,
  >(nextSchemaArgs: TNextSchemaArgs) {
    return new Resolver<
      TSchemaArgs extends undefined
        ? inferResolverArgs<TNextSchemaArgs>
        : Simplify<DeepMerge<inferResolverArgs<TNextSchemaArgs>, TArgs>>,
      TNextSchemaArgs,
      TOutput,
      TSchemaOutput,
      TContext,
      TDescription
    >({
      schemaArgs: nextSchemaArgs,
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
  output<
    TNextSchemaOutput extends TSchemaOutput extends undefined
      ? z.Schema
      : TSchemaOutput,
  >(nextSchemaOutput: TNextSchemaOutput) {
    return new Resolver<
      TArgs,
      TSchemaArgs,
      z.output<TNextSchemaOutput>,
      TNextSchemaOutput,
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
      inferResolverOutput<TSchemaOutput>,
      TContext
    >,
  ): TSchemaOutput extends undefined
    ? ErrorMessage<'Output schema cannot be undefined when creating mutation.'>
    : Mutation<
        TSchemaArgs,
        TSchemaOutput extends undefined ? never : TSchemaOutput,
        ResolveFunction<TArgs, inferResolverOutput<TSchemaOutput>, TContext>,
        TDescription
      > {
    if (this._schemaOutput === undefined)
      throw new TypeError(
        'Output schema cannot be undefined when creating mutation.',
      );

    return new Mutation({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
    }) as TSchemaOutput extends undefined
      ? ErrorMessage<'Output schema cannot be undefined when creating mutation.'>
      : Mutation<
          TSchemaArgs,
          TSchemaOutput extends undefined ? never : TSchemaOutput,
          ResolveFunction<TArgs, inferResolverOutput<TSchemaOutput>, TContext>,
          TDescription
        >;
  }

  /**
   * Creates a query endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using query
   */
  query(
    resolve: ResolveFunction<
      TArgs,
      inferResolverOutput<TSchemaOutput>,
      TContext
    >,
  ): TSchemaOutput extends undefined
    ? ErrorMessage<'Output schema cannot be undefined when creating query.'>
    : Query<
        TSchemaArgs,
        TSchemaOutput extends undefined ? never : TSchemaOutput,
        ResolveFunction<TArgs, inferResolverOutput<TSchemaOutput>, TContext>,
        TDescription
      > {
    if (this._schemaOutput === undefined)
      throw new TypeError(
        'Output schema cannot be undefined when creating query.',
      );

    return new Query({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      resolveFunction: resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
      description: this._description,
    }) as TSchemaOutput extends undefined
      ? ErrorMessage<'Output schema cannot be undefined when creating query.'>
      : Query<
          TSchemaArgs,
          TSchemaOutput extends undefined ? never : TSchemaOutput,
          ResolveFunction<TArgs, inferResolverOutput<TSchemaOutput>, TContext>,
          TDescription
        >;
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
