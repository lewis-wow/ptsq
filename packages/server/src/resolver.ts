import { type ZodUndefined, z, type ZodVoid } from 'zod';
import type { Context } from './context';
import type { Middleware } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';

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

  mutation<
    TMutationInput extends SerializableInputZodSchema,
    TMutationOutput extends SerializableOutputZodSchema,
  >(options: {
    input: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }): Mutation<TMutationInput, TMutationOutput, ResolveFunction<TMutationInput, TMutationOutput, TContext>>;

  mutation<TMutationOutput extends SerializableInputZodSchema>(options: {
    output: TMutationOutput;
    resolve: ResolveFunction<ZodUndefined, TMutationOutput, TContext>;
  }): Mutation<ZodVoid, TMutationOutput, ResolveFunction<ZodUndefined, TMutationOutput, TContext>>;

  mutation<
    TMutationInput extends SerializableInputZodSchema,
    TMutationOutput extends SerializableOutputZodSchema,
  >(options: {
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
