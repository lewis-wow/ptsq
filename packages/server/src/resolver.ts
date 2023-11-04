import { z, type ZodVoid } from 'zod';
import type { Context } from './context';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { MaybePromise } from './types';
import type { HTTPError } from './httpError';

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

export class Resolver<TContext extends Context = Context> {
  constructor(public middlewares: Middleware<any>[] = []) {}

  use<TNextContext extends Context>(middleware: MiddlewareCallback<TContext, TNextContext>) {
    return new Resolver<TNextContext>([...this.middlewares, new Middleware(middleware)]);
  }

  mutation<
    TMutationInput extends SerializableInputZodSchema,
    TMutationOutput extends SerializableOutputZodSchema,
  >(options: {
    input: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>;
  }): Mutation<
    TMutationInput,
    TMutationOutput,
    ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>
  >;

  mutation<TMutationOutput extends SerializableInputZodSchema>(options: {
    output: TMutationOutput;
    resolve: ResolveFunction<undefined, z.input<TMutationOutput>, TContext>;
  }): Mutation<ZodVoid, TMutationOutput, ResolveFunction<undefined, z.input<TMutationOutput>, TContext>>;

  mutation<
    TMutationInput extends SerializableInputZodSchema,
    TMutationOutput extends SerializableOutputZodSchema,
  >(options: {
    input?: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>;
  }): Mutation<
    TMutationInput,
    TMutationOutput,
    ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>
  > {
    return new Mutation({
      inputValidationSchema: (options.input ?? z.void()) as TMutationInput,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this.middlewares,
    });
  }

  query<TQueryInput extends SerializableInputZodSchema, TQueryOutput extends SerializableOutputZodSchema>(options: {
    input: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>;
  }): Query<TQueryInput, TQueryOutput, ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>>;

  query<TQueryOutput extends SerializableOutputZodSchema>(options: {
    output: TQueryOutput;
    resolve: ResolveFunction<undefined, z.input<TQueryOutput>, TContext>;
  }): Query<ZodVoid, TQueryOutput, ResolveFunction<undefined, z.input<TQueryOutput>, TContext>>;

  query<TQueryInput extends SerializableInputZodSchema, TQueryOutput extends SerializableOutputZodSchema>(options: {
    input?: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>;
  }): Query<TQueryInput, TQueryOutput, ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>> {
    return new Query({
      inputValidationSchema: (options.input ?? z.void()) as TQueryInput,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this.middlewares,
    });
  }
}

export type ResolveFunction<TInput, TOutput, TContext extends Context = Context> = (options: {
  input: TInput;
  ctx: TContext;
  meta: ResolverRequest;
}) => MaybePromise<TOutput>;
