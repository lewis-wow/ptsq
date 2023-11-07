import { z } from 'zod';
import type { Context } from './context';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { MaybePromise } from './types';
import type { HTTPError } from './httpError';
import { ZodObject } from 'zod';

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

export type inferResolverArgs<TResolverArgs extends ResolverArgs> = TResolverArgs extends Record<
  string,
  SerializableInputZodSchema
>
  ? {
      [K in keyof TResolverArgs]: z.output<TResolverArgs[K]>;
    }
  : undefined;

export class Resolver<TArgs extends ResolverArgs = ResolverArgs, TContext extends Context = Context> {
  _middlewares: Middleware<any, any>[];
  _args: ZodObject<TArgs>;

  constructor({ args, middlewares = [] }: { args: TArgs[]; middlewares: Middleware<any, any>[] }) {
    this._args = z.object(args);
    this._middlewares = middlewares;
  }

  use<TNextContext extends Context>(middleware: MiddlewareCallback<TArgs, TContext, TNextContext>) {
    return new Resolver<TArgs, TNextContext>({
      args: this._args,
      middlewares: [
        ...this._middlewares,
        new Middleware({
          middlewareCallback: middleware,
          argsValidationSchema: this._args,
        }),
      ],
    });
  }

  args<TNextArgs extends ResolverArgs>(args: TNextArgs) {
    return new Resolver<[...TArgs, TNextArgs], TContext>({
      args: [...this._args, args],
      middlewares: [...this._middlewares],
    });
  }

  mutation<TMutationOutput extends SerializableOutputZodSchema>(options: {
    output: TMutationOutput;
    resolve: ResolveFunction<inferResolverArgs<TArgs>, z.input<TMutationOutput>, TContext>;
  }): Mutation<TArgs, TMutationOutput, ResolveFunction<inferResolverArgs<TArgs>, z.input<TMutationOutput>, TContext>> {
    return new Mutation({
      args: this._args,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
    });
  }

  query<TQueryOutput extends SerializableOutputZodSchema>(options: {
    output: TQueryOutput;
    resolve: ResolveFunction<inferResolverArgs<TArgs>, z.input<TQueryOutput>, TContext>;
  }): Query<TArgs, TQueryOutput, ResolveFunction<inferResolverArgs<TArgs>, z.input<TQueryOutput>, TContext>> {
    return new Query({
      args: this._args,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
    });
  }
}

export type ResolveFunction<TInput, TOutput, TContext extends Context = Context> = (options: {
  input: TInput;
  ctx: TContext;
  meta: ResolverRequest;
}) => MaybePromise<TOutput>;
