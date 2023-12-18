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
import type {
  inferOutputTransformationNextOutput,
  OutputTransformationObject,
} from './outputTransformation';
import { Query } from './query';
import type { SerializableSchema } from './serializable';
import {
  createRecursiveTransformation,
  type AnyTransformation,
  type ArgsTransformationObject,
  type inferArgsTransformationNextArgs,
} from './transformation';
import type { DeepMerge, ErrorMessage, MaybePromise, Simplify } from './types';

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
  TOutput,
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
    return new Resolver<
      TArgs,
      TArgsSchema,
      TOutput,
      TOutputSchema,
      TContext,
      TNextDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: this._schemaOutput,
      transformations: [...this._transformations],
      outputTransformations: [...this._outputTransformations],
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
      TOutput,
      TOutputSchema,
      TNextContext,
      TDescription
    >({
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
  ): Resolver<
    TArgs extends undefined
      ? Static<
          TArgsSchema extends TSchema
            ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
            : TNextSchemaArgs
        >
      : DeepMerge<
          Static<
            TArgsSchema extends TSchema
              ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
              : TNextSchemaArgs
          >,
          TArgs
        >,
    TArgsSchema extends TSchema
      ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
      : TNextSchemaArgs,
    TOutput,
    TOutputSchema,
    TContext,
    TDescription
  >;

  args<
    TNextSchemaArgs extends ResolverSchema,
    TArgsTransformationObject extends ArgsTransformationObject<
      Static<TNextSchemaArgs>
    >,
    NextSchema = TArgsSchema extends TSchema
      ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
      : TNextSchemaArgs,
    NextArgs = TArgs extends undefined
      ? NextSchema extends TSchema
        ? Static<NextSchema>
        : never
      : NextSchema extends TSchema
      ? DeepMerge<Static<NextSchema>, TArgs>
      : never,
  >(
    nextSchemaArgs: SerializableSchema<TNextSchemaArgs>,
    argsTransformationObject: TArgsTransformationObject,
  ): Resolver<
    TArgsTransformationObject extends ArgsTransformationObject<
      Static<TNextSchemaArgs>
    >
      ? inferArgsTransformationNextArgs<NextArgs, TArgsTransformationObject>
      : NextArgs,
    TArgsSchema extends TSchema
      ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
      : TNextSchemaArgs,
    TOutput,
    TOutputSchema,
    TContext,
    TDescription
  >;

  args<
    TNextSchemaArgs extends ResolverSchema,
    TArgsTransformationObject extends ArgsTransformationObject<
      Static<TNextSchemaArgs>
    >,
  >(
    nextSchemaArgs: SerializableSchema<TNextSchemaArgs>,
    argsTransformationObject?: TArgsTransformationObject,
  ) {
    if (typeof nextSchemaArgs === 'string')
      throw new TypeError(
        `The args schema cannot be string and must be serializable.`,
      );

    const transformationFunction = argsTransformationObject
      ? (input: unknown) =>
          createRecursiveTransformation({
            input,
            argsTransformationObject,
          })
      : undefined;

    type NextSchema = TArgsSchema extends TSchema
      ? TIntersect<[TArgsSchema, TNextSchemaArgs]>
      : TNextSchemaArgs;

    const nextArgsSchema =
      this._schemaArgs === undefined
        ? nextSchemaArgs
        : Type.Intersect([this._schemaArgs, nextSchemaArgs]);

    type NextArgs = TArgs extends undefined
      ? Static<NextSchema>
      : DeepMerge<Static<NextSchema>, TArgs>;

    type NextArgsWithTransformation =
      TArgsTransformationObject extends ArgsTransformationObject<
        Static<TNextSchemaArgs>
      >
        ? inferArgsTransformationNextArgs<NextArgs, TArgsTransformationObject>
        : NextArgs;

    return new Resolver<
      NextArgsWithTransformation,
      NextSchema,
      TOutput,
      TOutputSchema,
      TContext,
      TDescription
    >({
      schemaArgs: nextArgsSchema as NextSchema,
      schemaOutput: this._schemaOutput,
      transformations:
        transformationFunction === undefined
          ? [...this._transformations]
          : [...this._transformations, transformationFunction],
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
  output<
    TNextSchemaOutput extends ResolverSchema,
    TOutputTransformationObject extends
      | OutputTransformationObject<Static<TNextSchemaOutput>>
      | undefined = undefined,
  >(
    nextSchemaOutput: SerializableSchema<TNextSchemaOutput>,
    outputTransformationObject?: TOutputTransformationObject,
  ) {
    if (typeof nextSchemaOutput === 'string')
      throw new TypeError(
        `The output schema cannot be string and must be serializable.`,
      );

    const transformationFunction = outputTransformationObject
      ? (input: unknown) =>
          createRecursiveTransformation({
            input,
            argsTransformationObject: outputTransformationObject,
          })
      : undefined;

    type NextSchemaOutput = TOutputSchema extends TSchema
      ? TIntersect<[TOutputSchema, TNextSchemaOutput]>
      : TNextSchemaOutput;

    const nextOutputSchema =
      this._schemaOutput === undefined
        ? nextSchemaOutput
        : Type.Intersect([this._schemaOutput, nextSchemaOutput]);

    type NextOutput = TOutput extends undefined
      ? Static<NextSchemaOutput>
      : DeepMerge<Static<NextSchemaOutput>, TOutput>;

    type NextOutputWithTransformation =
      TOutputTransformationObject extends OutputTransformationObject<
        Static<NextSchemaOutput>
      >
        ? inferOutputTransformationNextOutput<
            NextOutput,
            TOutputTransformationObject
          >
        : NextOutput;

    return new Resolver<
      TArgs,
      TArgsSchema,
      NextOutputWithTransformation,
      NextSchemaOutput,
      TContext,
      TDescription
    >({
      schemaArgs: this._schemaArgs,
      schemaOutput: nextOutputSchema as NextSchemaOutput,
      middlewares: this._middlewares,
      transformations: [...this._transformations],
      outputTransformations:
        transformationFunction === undefined
          ? [...this._outputTransformations]
          : [...this._outputTransformations, transformationFunction],
    });
  }

  /**
   * Creates a mutation endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using mutation
   */
  mutation(
    resolve: ResolveFunction<Simplify<TArgs>, TOutput, TContext>,
  ): TOutputSchema extends TSchema
    ? Mutation<
        TArgsSchema,
        TOutputSchema,
        ResolveFunction<Simplify<TArgs>, TOutput, TContext>,
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
          ResolveFunction<Simplify<TArgs>, TOutput, TContext>,
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
    resolve: ResolveFunction<Simplify<TArgs>, TOutput, TContext>,
  ): TOutputSchema extends TSchema
    ? Query<
        TArgsSchema,
        TOutputSchema,
        TOutputSchema extends TSchema
          ? ResolveFunction<Simplify<TArgs>, TOutput, TContext>
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
            ? ResolveFunction<Simplify<TArgs>, TOutput, TContext>
            : never,
          TDescription
        >
      : ErrorMessage<`Query cannot be used without output schema.`>;
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
