import { type ZodUndefined, z, type ZodVoid } from 'zod';
import type { Context } from './context';
import type { Middleware } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableZodSchema } from './serializable';
import type { MaybePromise } from './types';

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
  }): Mutation<ZodVoid, TMutationOutput, ResolveFunction<ZodUndefined, TMutationOutput, TContext>>;

  mutation<TMutationInput extends SerializableZodSchema, TMutationOutput extends SerializableZodSchema>(options: {
    input?: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }):
    | Mutation<TMutationInput, TMutationOutput, ResolveFunction<TMutationInput, TMutationOutput, TContext>>
    | Mutation<ZodVoid, TMutationOutput, ResolveFunction<ZodUndefined, TMutationOutput, TContext>> {
    return new Mutation({
      inputValidationSchema: (options.input ?? z.void()) as TMutationInput,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this.middlewares as unknown as Middleware[],
    });
  }

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>;
  }): Query<TQueryInput, TQueryOutput, ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>>;

  query<TQueryOutput extends SerializableZodSchema>(options: {
    output: TQueryOutput;
    resolve: ResolveFunction<undefined, z.input<TQueryOutput>, TContext>;
  }): Query<ZodVoid, TQueryOutput, ResolveFunction<undefined, z.input<TQueryOutput>, TContext>>;

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input?: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>;
  }): Query<TQueryInput, TQueryOutput, ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>> {
    return new Query({
      inputValidationSchema: (options.input ?? z.void()) as TQueryInput,
      outputValidationSchema: options.output,
      resolveFunction: options.resolve,
      middlewares: this.middlewares as unknown as Middleware[],
    });
  }
}

export type ResolveFunction<TInput, TOutput, TContext extends Context = Context> = ({
  input,
  ctx,
}: {
  input: TInput;
  ctx: TContext;
}) => TOutput;

export type ResolverOutput<TResolverOutput> = MaybePromise<
  TResolverOutput extends z.Schema ? z.infer<TResolverOutput> : TResolverOutput
>;

export type ResolverInput<TResolverInput extends SerializableZodSchema> = z.infer<TResolverInput>;
