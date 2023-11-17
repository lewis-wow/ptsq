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
  TContext extends Context = Context,
> {
  _middlewares: Middleware<any, any>[];
  _args: TArgs;

  constructor({
    args,
    middlewares = [],
  }: {
    args: unknown;
    middlewares: Middleware<any, any>[];
  }) {
    this._args = args as TArgs;
    this._middlewares = middlewares;
  }

  use<TNextContext extends Context>(
    middleware: MiddlewareCallback<TArgs, TContext, TNextContext>,
  ) {
    return new Resolver<TArgs, TNextContext>({
      args: this._args,
      middlewares: [
        ...this._middlewares,
        new Middleware({
          args: this._args as any,
          middlewareCallback: middleware,
        }),
      ],
    });
  }

  args<TNextArgs extends TArgs extends ZodVoid ? ResolverArgs : TArgs>(
    nextArgs: TNextArgs,
  ) {
    return new Resolver<TNextArgs, TContext>({
      args: nextArgs,
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
