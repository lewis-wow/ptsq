import type { z } from 'zod';
import type { Context } from './context';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { MaybePromise } from './types';
import type { HTTPError } from './httpError';
import { zipResolverArgs } from './zipResolverArgs';

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

export type ResolverArgs = Record<string, SerializableInputZodSchema>;
export type ResolverOutput = SerializableOutputZodSchema;

export type inferResolverArgs<TResolverArgs extends Record<string, any>> = {
  [K in keyof TResolverArgs]: TResolverArgs[K] extends z.Schema ? z.output<TResolverArgs[K]> : TResolverArgs[K];
};

export type inferResolverArgsInput<TResolverArgs extends Record<string, any>> = TResolverArgs extends
  | Record<string, never>
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void
  ? // make it voidable, so the input is not required
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    undefined | void | Record<string, never>
  : inferResolverArgs<TResolverArgs>;

export type inferResolverOutput<TResolverOutput> = TResolverOutput extends z.Schema
  ? z.input<TResolverOutput>
  : TResolverOutput;

export class Resolver<TArgs extends ResolverArgs = ResolverArgs, TContext extends Context = Context> {
  _middlewares: Middleware<any, any>[];
  _args: TArgs;

  constructor({ args, middlewares = [] }: { args: TArgs; middlewares: Middleware<any, any>[] }) {
    this._args = args;
    this._middlewares = middlewares;
  }

  use<TNextContext extends Context>(middleware: MiddlewareCallback<TArgs, TContext, TNextContext>) {
    return new Resolver<TArgs, TNextContext>({
      args: this._args,
      middlewares: [
        ...this._middlewares,
        new Middleware({
          middlewareCallback: middleware,
          args: this._args,
        }),
      ],
    });
  }

  args<TNextArgs extends ResolverArgs>(args: TNextArgs) {
    return new Resolver<TArgs & TNextArgs, TContext>({
      args: this.mergeResolverArguments(args),
      middlewares: [...this._middlewares],
    });
  }

  mutation<TResolverOutput extends ResolverOutput>(options: {
    output: TResolverOutput;
    resolve: ResolveFunction<inferResolverArgs<TArgs>, inferResolverOutput<TResolverOutput>, TContext>;
  }): Mutation<
    TArgs,
    TResolverOutput,
    ResolveFunction<inferResolverArgs<TArgs>, inferResolverOutput<TResolverOutput>, TContext>
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
    resolve: ResolveFunction<inferResolverArgs<TArgs>, inferResolverOutput<TResolverOutput>, TContext>;
  }): Query<
    TArgs,
    TResolverOutput,
    ResolveFunction<inferResolverArgs<TArgs>, inferResolverOutput<TResolverOutput>, TContext>
  > {
    return new Query({
      args: this._args,
      output: options.output,
      resolveFunction: options.resolve,
      middlewares: this._middlewares,
    });
  }

  private mergeResolverArguments<TNextResolverArgs extends ResolverArgs>(
    nextArgs: TNextResolverArgs
  ): TArgs & TNextResolverArgs {
    return zipResolverArgs(this._args, nextArgs).reduce(
      (acc, { key, value: [argsValue, nextArgsValue] }) => ({
        ...acc,
        [key]: argsValue && nextArgsValue ? argsValue.and(nextArgsValue) : argsValue ?? nextArgsValue,
      }),
      {}
    ) as TArgs & TNextResolverArgs;
  }
}

export type ResolveFunction<TInput, TOutput, TContext extends Context = Context> = (options: {
  input: TInput;
  ctx: TContext;
  meta: ResolverRequest;
}) => MaybePromise<TOutput>;
