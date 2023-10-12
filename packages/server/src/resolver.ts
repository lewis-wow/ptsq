import { ZodUndefined, z } from 'zod';
import { Context } from './context';
import { Middleware } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import { SerializableZodSchema } from './serializable';
import { DataTransformer } from './transformer';
import { MaybePromise, inferResolverValidationSchema } from './types';

export class Resolver<TContext extends Context = Context, TDataTransformer extends DataTransformer = DataTransformer> {
  middlewares: Middleware<TContext, TContext>[];
  transformer: TDataTransformer;

  constructor({
    transformer,
    middlewares,
  }: {
    transformer: TDataTransformer;
    middlewares: Middleware<TContext, TContext>[];
  }) {
    this.middlewares = middlewares;
    this.transformer = transformer;
  }

  use<TNextContext extends Context>(middleware: Middleware<TContext, TNextContext>) {
    return new Resolver<TNextContext, TDataTransformer>({
      transformer: this.transformer,
      middlewares: [...this.middlewares, middleware] as unknown as Middleware<TNextContext, TNextContext>[],
    });
  }

  mutation<TMutationInput extends SerializableZodSchema, TMutationOutput extends SerializableZodSchema>(options: {
    input: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }): Mutation<
    TMutationInput,
    TMutationOutput,
    ResolveFunction<TMutationInput, TMutationOutput, TContext>,
    TDataTransformer
  >;

  mutation<TMutationOutput extends SerializableZodSchema>(options: {
    output: TMutationOutput;
    resolve: ResolveFunction<ZodUndefined, TMutationOutput, TContext>;
  }): Mutation<
    ZodUndefined,
    TMutationOutput,
    ResolveFunction<ZodUndefined, TMutationOutput, TContext>,
    TDataTransformer
  >;

  mutation<TMutationInput extends SerializableZodSchema, TMutationOutput extends SerializableZodSchema>(options: {
    input?: TMutationInput;
    output: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }):
    | Mutation<
        TMutationInput,
        TMutationOutput,
        ResolveFunction<TMutationInput, TMutationOutput, TContext>,
        TDataTransformer
      >
    | Mutation<
        ZodUndefined,
        TMutationOutput,
        ResolveFunction<ZodUndefined, TMutationOutput, TContext>,
        TDataTransformer
      > {
    return new Mutation({
      inputValidationSchema: options.input as TMutationInput,
      outputValidationSchema: options.output as TMutationOutput,
      resolveFunction: options.resolve,
      transformer: this.transformer,
      middlewares: this.middlewares as unknown as Middleware[],
    });
  }

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }): Query<TQueryInput, TQueryOutput, ResolveFunction<TQueryInput, TQueryOutput, TContext>, TDataTransformer>;

  query<TQueryOutput extends SerializableZodSchema>(options: {
    output: TQueryOutput;
    resolve: ResolveFunction<ZodUndefined, TQueryOutput, TContext>;
  }): Query<ZodUndefined, TQueryOutput, ResolveFunction<ZodUndefined, TQueryOutput, TContext>, TDataTransformer>;

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input?: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }):
    | Query<TQueryInput, TQueryOutput, ResolveFunction<TQueryInput, TQueryOutput, TContext>, TDataTransformer>
    | Query<ZodUndefined, TQueryOutput, ResolveFunction<ZodUndefined, TQueryOutput, TContext>, TDataTransformer> {
    return new Query({
      inputValidationSchema: options.input as TQueryInput,
      outputValidationSchema: options.output as TQueryOutput,
      resolveFunction: options.resolve,
      transformer: this.transformer,
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

export type ResolverInput<TResolverInput extends SerializableZodSchema | void> = TResolverInput extends z.Schema
  ? z.infer<TResolverInput>
  : void;

export type AnyResolveFunction = ResolveFunction<any, any, any>;
