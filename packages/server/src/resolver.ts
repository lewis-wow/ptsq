import type { z, ZodVoid } from 'zod';
import type { Context } from './context';
import type { HTTPError } from './httpError';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type {
  Serializable,
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
  TArgs extends ResolverArgs | ZodVoid = ResolverArgs | ZodVoid,
  TChainArgs extends ResolverArgs | ZodVoid = ResolverArgs | ZodVoid,
  TContext extends Context = Context,
> {
  _middlewares: Middleware<any, any>[];
  _transformations: TransformationCallback<any, any>[];
  _args: TArgs;

  constructor({
    args,
    middlewares,
    transformations,
  }: {
    args: unknown;
    middlewares: Middleware<any, any>[];
    transformations: TransformationCallback<any, any>[];
  }) {
    this._args = args as TArgs;
    this._middlewares = middlewares;
    this._transformations = transformations;
  }

  use<TNextContext extends Context>(
    middleware: MiddlewareCallback<TArgs, TContext, TNextContext>,
  ) {
    return new Resolver<TArgs, TChainArgs, TNextContext>({
      args: this._args,
      transformations: [...this._transformations],
      middlewares: [
        ...this._middlewares,
        new Middleware({
          args: this._args as any,
          middlewareCallback: middleware,
        }),
      ],
    });
  }

  transformation<TTransformation extends Parameters<TArgs['transform']>[0]>(
    transformation: TTransformation,
  ) {
    const nextArgs = this._args.transform(transformation);

    return new Resolver<
      z.ZodEffects<
        SerializableInputZodSchema,
        ReturnType<TTransformation>,
        Serializable
      >,
      TChainArgs,
      TContext
    >({
      args: nextArgs,
      transformations: [...this._transformations],
      middlewares: [...this._middlewares],
    });
  }

  args<
    TNextChainArgs extends TChainArgs extends ZodVoid
      ? ResolverArgs
      : TChainArgs,
  >(nextArgs: TNextChainArgs) {
    return new Resolver<
      TArgs extends ZodVoid ? TNextChainArgs : TArgs,
      TNextChainArgs,
      TContext
    >({
      args: nextArgs,
      transformations: [...this._transformations],
      middlewares: [...this._middlewares],
    });
  }

  mutation<TResolverOutput extends ResolverOutput>(options: {
    output: TResolverOutput;
    resolve: ResolveFunction<
      inferResolverArgs<TArgs>,
      inferResolverOutput<TResolverOutput>,
      TContext
    >;
  }): Mutation<
    TArgs,
    TResolverOutput,
    ResolveFunction<
      inferResolverArgs<TArgs>,
      inferResolverOutput<TResolverOutput>,
      TContext
    >
  > {
    return new Mutation({
      args: this._args,
      output: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
    });
  }

  query<TResolverOutput extends ResolverOutput>(options: {
    output: TResolverOutput;
    resolve: ResolveFunction<
      inferResolverArgs<TArgs>,
      inferResolverOutput<TResolverOutput>,
      TContext
    >;
  }): Query<
    TArgs,
    TResolverOutput,
    ResolveFunction<
      inferResolverArgs<TArgs>,
      inferResolverOutput<TResolverOutput>,
      TContext
    >
  > {
    return new Query({
      args: this._args,
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
