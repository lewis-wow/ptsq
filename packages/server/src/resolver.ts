import { z } from 'zod';
import { Context } from './context';
import { Middleware } from './middleware';
import { Mutation } from './mutation';
import { Query } from './query';
import { SerializableZodSchema } from './serializable';
import { DataTransformer } from './transformer';
import { MaybePromise, ParseResolverInput } from './types';

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
    resolve: ResolveFunction<void, TMutationOutput, TContext>;
  }): Mutation<void, TMutationOutput, ResolveFunction<void, TMutationOutput, TContext>, TDataTransformer>;

  mutation(options: {
    resolve: ResolveFunction<void, unknown, TContext>;
  }): Mutation<void, undefined, ResolveFunction<void, unknown, TContext>, TDataTransformer>;

  mutation<TMutationInput extends SerializableZodSchema, TMutationOutput extends SerializableZodSchema>(options: {
    input?: TMutationInput;
    output?: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }):
    | Mutation<
        TMutationInput,
        TMutationOutput,
        ResolveFunction<TMutationInput, TMutationOutput, TContext>,
        TDataTransformer
      >
    | Mutation<void, TMutationOutput, ResolveFunction<void, TMutationOutput, TContext>, TDataTransformer>
    | Mutation<void, undefined, ResolveFunction<void, unknown, TContext>, TDataTransformer> {
    return new Mutation({
      input: options.input as TMutationInput,
      output: options.output as TMutationOutput,
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
    resolve: ResolveFunction<void, TQueryOutput, TContext>;
  }): Query<void, TQueryOutput, ResolveFunction<void, TQueryOutput, TContext>, TDataTransformer>;

  query(options: {
    resolve: ResolveFunction<void, unknown, TContext>;
  }): Query<void, undefined, ResolveFunction<void, unknown, TContext>, TDataTransformer>;

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input?: TQueryInput;
    output?: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }):
    | Query<TQueryInput, TQueryOutput, ResolveFunction<TQueryInput, TQueryOutput, TContext>, TDataTransformer>
    | Query<void, TQueryOutput, ResolveFunction<void, TQueryOutput, TContext>, TDataTransformer>
    | Query<void, undefined, ResolveFunction<void, unknown, TContext>, TDataTransformer> {
    return new Query({
      input: options.input as TQueryInput,
      output: options.output as TQueryOutput,
      resolveFunction: options.resolve,
      transformer: this.transformer,
      middlewares: this.middlewares as unknown as Middleware[],
    });
  }
}

export type ResolveFunction<
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema | unknown = SerializableZodSchema | unknown,
  TContext extends Context = Context,
> = ({ input, ctx }: { input: ParseResolverInput<TInput>; ctx: TContext }) => ResolverOutput<TOutput>;

export type ResolverOutput<TResolverOutput> = MaybePromise<
  TResolverOutput extends z.Schema ? z.infer<TResolverOutput> : TResolverOutput
>;

export type ResolverInput<TResolverInput extends SerializableZodSchema | void> = TResolverInput extends z.Schema
  ? z.infer<TResolverInput>
  : void;

export type AnyResolveFunction = ResolveFunction<any, any, any>;
