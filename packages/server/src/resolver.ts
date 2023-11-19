import type { MergeDeep } from 'type-fest';
import type { z, ZodVoid } from 'zod';
import type { Context } from './context';
import type { HTTPError } from './httpError';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type {
  SerializableInputZodSchema,
  SerializableOutputZodSchema,
} from './serializable';
import type { TransformationCallback } from './transformation';
import type { MaybePromise } from './types';

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
  ? TResolverArgs extends ZodVoid
    ? undefined
    : z.output<TResolverArgs>
  : TResolverArgs;

export type inferResolverOutput<TResolverOutput> =
  TResolverOutput extends z.Schema ? z.input<TResolverOutput> : TResolverOutput;

export class Resolver<
  TArgs,
  TSchemaArgs extends ResolverArgs | ZodVoid = ResolverArgs | ZodVoid,
  TContext extends Context = Context,
> {
  _middlewares: Middleware<any, any>[];
  _transformations: TransformationCallback<any, any, any>[];
  _schemaArgs: TSchemaArgs;

  constructor({
    schemaArgs,
    middlewares,
    transformations,
  }: {
    schemaArgs: TSchemaArgs;
    middlewares: Middleware<any, any>[];
    transformations: TransformationCallback<any, any, any>[];
  }) {
    this._schemaArgs = schemaArgs;
    this._middlewares = middlewares;
    this._transformations = transformations;
  }

  use<TNextContext extends Context>(
    middleware: MiddlewareCallback<TArgs, TContext, TNextContext>,
  ) {
    return new Resolver<TArgs, TSchemaArgs, TNextContext>({
      schemaArgs: this._schemaArgs,
      transformations: [...this._transformations],
      middlewares: [
        ...this._middlewares,
        new Middleware({
          schemaArgs: this._schemaArgs as any,
          transformations: [...this._transformations],
          middlewareCallback: middleware,
        }),
      ],
    });
  }

  transformation<TNextArgs>(
    transformation: TransformationCallback<TArgs, TContext, TNextArgs>,
  ) {
    return new Resolver<
      MergeDeep<inferResolverArgs<TSchemaArgs>, TNextArgs>,
      TSchemaArgs,
      TContext
    >({
      schemaArgs: this._schemaArgs,
      transformations: [...this._transformations, transformation],
      middlewares: [...this._middlewares],
    });
  }

  args<
    TNextSchemaArgs extends TSchemaArgs extends ZodVoid
      ? ResolverArgs
      : TSchemaArgs,
  >(nextSchemaArgs: TNextSchemaArgs) {
    return new Resolver<
      TArgs extends ZodVoid
        ? TNextSchemaArgs
        : MergeDeep<inferResolverArgs<TNextSchemaArgs>, TArgs>,
      TNextSchemaArgs,
      TContext
    >({
      schemaArgs: nextSchemaArgs,
      transformations: [...this._transformations],
      middlewares: [...this._middlewares],
    });
  }

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
      args: this._schemaArgs,
      output: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
    });
  }

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
      args: this._schemaArgs,
      output: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
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
