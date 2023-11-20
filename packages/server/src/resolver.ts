import type { z } from 'zod';
import type { Context } from './context';
import type { HTTPError } from './httpError';
import {
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
} from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type {
  SerializableInputZodSchema,
  SerializableOutputZodSchema,
} from './serializable';
import type { ArgsTransformationFunction } from './transformation';
import type { DeepMerge, MaybePromise, Simplify } from './types';

export type ResolverResponse<TContext extends Context> =
  | {
      ok: true;
      data: unknown;
      ctx: TContext;
    }
  | {
      ok: false;
      error: HTTPError;
      ctx: TContext;
    };

export type ResolverRequest = {
  input: unknown;
  route: string;
};

export type ResolverArgs = SerializableInputZodSchema;
export type ResolverOutput = SerializableOutputZodSchema;

export type inferResolverArgs<TResolverArgs> = TResolverArgs extends z.Schema
  ? TResolverArgs extends z.ZodVoid
    ? undefined
    : z.output<TResolverArgs>
  : TResolverArgs;

export type inferResolverOutput<TResolverOutput> =
  TResolverOutput extends z.Schema ? z.input<TResolverOutput> : TResolverOutput;

export class Resolver<
  TArgs,
  TSchemaArgs extends ResolverArgs | z.ZodVoid = ResolverArgs | z.ZodVoid,
  TContext extends Context = Context,
> {
  _middlewares: AnyMiddleware[];
  _transformations: ArgsTransformationFunction<any, any, any>[];
  _schemaArgs: TSchemaArgs;

  constructor(resolverOptions: {
    schemaArgs: TSchemaArgs;
    middlewares: AnyMiddleware[];
    transformations: ArgsTransformationFunction<any, any, any>[];
  }) {
    this._schemaArgs = resolverOptions.schemaArgs;
    this._middlewares = resolverOptions.middlewares;
    this._transformations = resolverOptions.transformations;
  }

  /**
   * Add a middleware to the resolver
   */
  use<TNextContext extends Context>(
    middleware: MiddlewareFunction<TArgs, TContext, TNextContext>,
  ) {
    return new Resolver<TArgs, TSchemaArgs, TNextContext>({
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
   */
  transformation<TNextArgs>(
    transformation: ArgsTransformationFunction<TArgs, TContext, TNextArgs>,
  ) {
    return new Resolver<
      Simplify<DeepMerge<inferResolverArgs<TSchemaArgs>, TNextArgs>>,
      TSchemaArgs,
      TContext
    >({
      schemaArgs: this._schemaArgs,
      transformations: [...this._transformations, transformation],
      middlewares: [...this._middlewares],
    });
  }

  /**
   * Add additional arguments by the validation schema to the resolver
   *
   * The next validation schema must extends the previous one
   */
  args<
    TNextSchemaArgs extends TSchemaArgs extends z.ZodVoid
      ? ResolverArgs
      : TSchemaArgs,
  >(nextSchemaArgs: TNextSchemaArgs) {
    return new Resolver<
      TSchemaArgs extends z.ZodVoid
        ? inferResolverArgs<TNextSchemaArgs>
        : Simplify<DeepMerge<inferResolverArgs<TNextSchemaArgs>, TArgs>>,
      TNextSchemaArgs,
      TContext
    >({
      schemaArgs: nextSchemaArgs,
      transformations: [...this._transformations],
      middlewares: [...this._middlewares],
    });
  }

  /**
   * Creates a mutation endpoint with resolver middlewares, transformation and arguments validations
   */
  mutation<TResolverOutput extends ResolverOutput>(options: {
    output: TResolverOutput;
    resolve: ResolveFunction<
      TArgs,
      inferResolverOutput<TResolverOutput>,
      TContext
    >;
  }): Mutation<
    TSchemaArgs,
    TResolverOutput,
    ResolveFunction<TArgs, inferResolverOutput<TResolverOutput>, TContext>
  > {
    return new Mutation({
      schemaArgs: this._schemaArgs,
      schemaOutput: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
    });
  }

  /**
   * Creates a query endpoint with resolver middlewares, transformation and arguments validations
   */
  query<TResolverOutput extends ResolverOutput>(options: {
    output: TResolverOutput;
    resolve: ResolveFunction<
      TArgs,
      inferResolverOutput<TResolverOutput>,
      TContext
    >;
  }): Query<
    TSchemaArgs,
    TResolverOutput,
    ResolveFunction<TArgs, inferResolverOutput<TResolverOutput>, TContext>
  > {
    return new Query({
      schemaArgs: this._schemaArgs,
      schemaOutput: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
      transformations: this._transformations,
    });
  }
}

export type ResolveFunction<
  TInput,
  TOutput,
  TContext extends Context = Context,
> = (options: {
  input: TInput;
  ctx: TContext;
  meta: ResolverRequest;
}) => MaybePromise<TOutput>;
