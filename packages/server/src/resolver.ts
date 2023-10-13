import { type ZodUndefined, z } from 'zod';
import type { Context } from './context';
import type { Middleware } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableZodSchema } from './serializable';
import type { MaybePromise, inferResolverValidationSchema } from './types';

export class Resolver<TContext extends Context = Context> {
  middlewares: Middleware<TContext, TContext>[];

  constructor({ middlewares }: { middlewares: Middleware<TContext, TContext>[] }) {
    this.middlewares = middlewares;
  }

  use<TNextContext extends Context>(middleware: Middleware<TContext, TNextContext>) {
    return new Resolver<TNextContext>({
      middlewares: [...this.middlewares, middleware] as unknown as Middleware<TNextContext, TNextContext>[],
    });
  }

  mutation<TMutationInput extends SerializableZodSchema, TMutationOutput extends SerializableZodSchema>(options: {
    input: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }): Mutation<TMutationInput, TMutationOutput, ResolveFunction<TMutationInput, TMutationOutput, TContext>>;

  mutation<TMutationOutput extends SerializableZodSchema>(options: {
    output: TMutationOutput;
    resolve: ResolveFunction<ZodUndefined, TMutationOutput, TContext>;
  }): Mutation<ZodUndefined, TMutationOutput, ResolveFunction<ZodUndefined, TMutationOutput, TContext>>;

  mutation<TMutationInput extends SerializableZodSchema, TMutationOutput extends SerializableZodSchema>(options: {
    input?: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }):
    | Mutation<TMutationInput, TMutationOutput, ResolveFunction<TMutationInput, TMutationOutput, TContext>>
    | Mutation<ZodUndefined, TMutationOutput, ResolveFunction<ZodUndefined, TMutationOutput, TContext>> {
    return new Mutation({
      inputValidationSchema: (options.input ?? z.undefined()) as TMutationInput,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this.middlewares as unknown as Middleware[],
    });
  }

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }): Query<TQueryInput, TQueryOutput, ResolveFunction<TQueryInput, TQueryOutput, TContext>>;

  query<TQueryOutput extends SerializableZodSchema>(options: {
    output: TQueryOutput;
    resolve: ResolveFunction<ZodUndefined, TQueryOutput, TContext>;
  }): Query<ZodUndefined, TQueryOutput, ResolveFunction<ZodUndefined, TQueryOutput, TContext>>;

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input?: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }):
    | Query<TQueryInput, TQueryOutput, ResolveFunction<TQueryInput, TQueryOutput, TContext>>
    | Query<ZodUndefined, TQueryOutput, ResolveFunction<ZodUndefined, TQueryOutput, TContext>> {
    return new Query({
      inputValidationSchema: (options.input ?? z.undefined()) as TQueryInput,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this.middlewares as unknown as Middleware[],
    });
  }
}

export type ResolveFunction<
  TInput extends SerializableZodSchema = SerializableZodSchema,
  TOutput extends SerializableZodSchema = SerializableZodSchema,
  TContext extends Context = Context,
> = ({ input, ctx }: { input: inferResolverValidationSchema<TInput>; ctx: TContext }) => ResolverOutput<TOutput>;

export type ResolverOutput<TResolverOutput> = MaybePromise<
  TResolverOutput extends z.Schema ? z.infer<TResolverOutput> : TResolverOutput
>;

export type ResolverInput<TResolverInput extends SerializableZodSchema> = z.infer<TResolverInput>;
