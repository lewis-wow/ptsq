import { z, type ZodVoid } from 'zod';
import type { Context } from './context';
import type { Middleware } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { AuthorizeFunction } from './authorize';

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
    authorize?: AuthorizeFunction<z.output<TMutationInput>, TContext>;
    resolve: ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>;
  }): Mutation<
    TMutationInput,
    TMutationOutput,
    ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>,
    AuthorizeFunction<z.output<TMutationInput>, TContext>
  >;

  mutation<TMutationOutput extends SerializableInputZodSchema>(options: {
    output: TMutationOutput;
    authorize?: AuthorizeFunction<undefined, TContext>;
    resolve: ResolveFunction<undefined, z.input<TMutationOutput>, TContext>;
  }): Mutation<
    ZodVoid,
    TMutationOutput,
    ResolveFunction<undefined, z.input<TMutationOutput>, TContext>,
    AuthorizeFunction<undefined, TContext>
  >;

  mutation<
    TMutationInput extends SerializableInputZodSchema,
    TMutationOutput extends SerializableOutputZodSchema,
  >(options: {
    input?: TMutationInput;
    output: TMutationOutput;
    authorize?: AuthorizeFunction<z.output<TMutationInput>, TContext>;
    resolve: ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>;
  }): Mutation<
    TMutationInput,
    TMutationOutput,
    ResolveFunction<z.output<TMutationInput>, z.input<TMutationOutput>, TContext>,
    AuthorizeFunction<z.output<TMutationInput>, TContext>
  > {
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
    authorize?: AuthorizeFunction<z.output<TQueryInput>, TContext>;
    resolve: ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>;
  }): Query<
    TQueryInput,
    TQueryOutput,
    ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>,
    AuthorizeFunction<z.output<TQueryInput>, TContext>
  >;

  query<TQueryOutput extends SerializableOutputZodSchema>(options: {
    output: TQueryOutput;
    authorize?: AuthorizeFunction<undefined, TContext>;
    resolve: ResolveFunction<undefined, z.input<TQueryOutput>, TContext>;
  }): Query<
    ZodVoid,
    TQueryOutput,
    ResolveFunction<undefined, z.input<TQueryOutput>, TContext>,
    AuthorizeFunction<undefined, TContext>
  >;

  query<TQueryInput extends SerializableInputZodSchema, TQueryOutput extends SerializableOutputZodSchema>(options: {
    input?: TQueryInput;
    output: TQueryOutput;
    authorize?: AuthorizeFunction<z.output<TQueryInput>, TContext>;
    resolve: ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>;
  }): Query<
    TQueryInput,
    TQueryOutput,
    ResolveFunction<z.output<TQueryInput>, z.input<TQueryOutput>, TContext>,
    AuthorizeFunction<z.output<TQueryInput>, TContext>
  > {
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
