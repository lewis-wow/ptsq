import { Type, type TIntersect, type TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { inferDecodedArgsFromTypeboxArgsSchema } from './inferArgs';
import { inferDecodedOutputFromTypeboxOutputSchema } from './inferOutput';
import { defaultJsonSchemaParser, JsonSchemaParser } from './jsonSchemaParser';
import {
  inferContextFromMiddlewareResponse,
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
  type MiddlewareMeta,
} from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type {
  ErrorMessage,
  MaybePromise,
  ShallowMerge,
  Simplify,
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
> {
  _def: {
    middlewares: AnyMiddleware[];
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    description: TDescription;
    parser: JsonSchemaParser;
  };

  constructor(resolverOptions: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
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
      TNextDescription
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: description,
      parser: this._def.parser,
    });
  }

  /**
   * Add a middleware to the resolver
   *
   * Middlewares can update a context, transform output or input, or throw an error if something is wrong
   */
  use<
    TMiddlewareFunction extends MiddlewareFunction<
      inferDecodedArgsFromTypeboxArgsSchema<TArgsSchema>,
      TContext
    >,
  >(middleware: TMiddlewareFunction) {
    type NextContext = inferContextFromMiddlewareResponse<
      Awaited<ReturnType<TMiddlewareFunction>>
    >;

    return new Resolver<
      TArgsSchema,
      TOutputSchema,
      TRootContext,
      NextContext,
      TDescription
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: this._def.argsSchema,
          middlewareFunction: middleware,
          parser: this._def.parser,
        }),
      ] as AnyMiddleware[],
      description: this._def.description,
      parser: this._def.parser,
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
      TDescription
    >({
      argsSchema: nextArgsSchema as NextArgsSchema,
      outputSchema: this._def.outputSchema,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      parser: this._def.parser,
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
      TDescription
    >({
      argsSchema: this._def.argsSchema,
      outputSchema: nextOutputSchema as NextSchemaOutput,
      middlewares: [...this._def.middlewares],
      description: this._def.description,
      parser: this._def.parser,
    });
  }

  /**
   * Creates a mutation endpoint with resolver middlewares, transformation and arguments validations
   *
   * The output must be specified before using mutation
   */
  mutation(
    resolve: ResolveFunction<
      Simplify<inferDecodedArgsFromTypeboxArgsSchema<TArgsSchema>>,
      Simplify<inferDecodedOutputFromTypeboxOutputSchema<TOutputSchema>>,
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Mutation<
        TArgsSchema,
        TOutputSchema,
        TContext,
        ResolveFunction<
          Simplify<inferDecodedArgsFromTypeboxArgsSchema<TArgsSchema>>,
          Simplify<inferDecodedOutputFromTypeboxOutputSchema<TOutputSchema>>,
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
            Simplify<inferDecodedArgsFromTypeboxArgsSchema<TArgsSchema>>,
            Simplify<inferDecodedOutputFromTypeboxOutputSchema<TOutputSchema>>,
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
      Simplify<inferDecodedArgsFromTypeboxArgsSchema<TArgsSchema>>,
      Simplify<inferDecodedOutputFromTypeboxOutputSchema<TOutputSchema>>,
      TContext
    >,
  ): TOutputSchema extends TSchema
    ? Query<
        TArgsSchema,
        TOutputSchema,
        TContext,
        TOutputSchema extends TSchema
          ? ResolveFunction<
              Simplify<inferDecodedArgsFromTypeboxArgsSchema<TArgsSchema>>,
              Simplify<
                inferDecodedOutputFromTypeboxOutputSchema<TOutputSchema>
              >,
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
                Simplify<inferDecodedArgsFromTypeboxArgsSchema<TArgsSchema>>,
                Simplify<
                  inferDecodedOutputFromTypeboxOutputSchema<TOutputSchema>
                >,
                TContext
              >
            : never,
          TDescription
        >
      : ErrorMessage<`Query cannot be used without output schema.`>;
  }

  /**
   * Continues in the second resolver
   */
  pipe<
    TPipedResolver extends Resolver<
      any,
      any,
      TContext,
      any,
      string | undefined
    >,
  >(
    pipedResolver: TContext extends inferResolverRootContextType<TPipedResolver>
      ? TPipedResolver
      : never,
  ) {
    const nextArgsSchema = this._def.argsSchema;
    this._def.argsSchema === undefined &&
    pipedResolver._def.argsSchema === undefined
      ? undefined
      : this._def.argsSchema === undefined
        ? pipedResolver._def.argsSchema
        : pipedResolver._def.argsSchema === undefined
          ? this._def.argsSchema
          : Type.Intersect([
              this._def.argsSchema,
              pipedResolver._def.argsSchema,
            ]);

    type NextArgsSchema = TArgsSchema extends TSchema
      ? TPipedResolver['_def']['argsSchema'] extends TSchema
        ? TIntersect<[TArgsSchema, TPipedResolver['_def']['argsSchema']]>
        : TArgsSchema
      : TPipedResolver['_def']['argsSchema'];

    const nextOutputSchema =
      this._def.outputSchema === undefined &&
      pipedResolver._def.outputSchema === undefined
        ? undefined
        : this._def.outputSchema === undefined
          ? pipedResolver._def.outputSchema
          : pipedResolver._def.outputSchema === undefined
            ? this._def.outputSchema
            : Type.Intersect([
                this._def.outputSchema,
                pipedResolver._def.outputSchema,
              ]);

    type NextOutputSchema = TOutputSchema extends TSchema
      ? TPipedResolver['_def']['outputSchema'] extends TSchema
        ? TIntersect<[TOutputSchema, TPipedResolver['_def']['outputSchema']]>
        : TOutputSchema
      : TPipedResolver['_def']['outputSchema'];

    return new Resolver<
      NextArgsSchema,
      NextOutputSchema,
      TRootContext,
      Simplify<
        ShallowMerge<TContext, inferResolverContextType<TPipedResolver>>
      >,
      undefined
    >({
      argsSchema: nextArgsSchema as NextArgsSchema,
      outputSchema: nextOutputSchema as NextOutputSchema,
      middlewares: [
        ...this._def.middlewares,
        ...pipedResolver._def.middlewares,
      ],
      description: undefined,
      parser: this._def.parser,
    });
  }

  /**
   * Creates a blank resolver
   */
  static createRoot<TContext extends Context>(rootResolverOptions?: {
    parser?: JsonSchemaParser;
  }) {
    return new Resolver<undefined, undefined, TContext, TContext, undefined>({
      argsSchema: undefined,
      outputSchema: undefined,
      middlewares: [],
      description: undefined,
      parser: rootResolverOptions?.parser ?? defaultJsonSchemaParser,
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
    string | undefined
  >
    ? RootContext
    : never;

/**
 * @internal
 */
export type inferResolverContextType<TResolver> =
  TResolver extends Resolver<any, any, any, infer Context, string | undefined>
    ? Context
    : never;
