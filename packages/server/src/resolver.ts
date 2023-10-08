import { Context } from './context';
import { Middleware } from './middleware';
import { Route } from './route';
import { SerializableZodSchema } from './serializable';
import { DataTransformer } from './transformer';
import { ParseResolverInput, ParseResolverOutput, MaybePromise } from './types';

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
  }): Route<
    'mutation',
    TMutationInput,
    TMutationOutput,
    ResolveFunction<TMutationInput, TMutationOutput, TContext>,
    TDataTransformer
  >;

  mutation<TMutationOutput extends SerializableZodSchema>(options: {
    output: TMutationOutput;
    resolve: ResolveFunction<undefined, TMutationOutput, TContext>;
  }): Route<'mutation', void, TMutationOutput, ResolveFunction<undefined, TMutationOutput, TContext>, TDataTransformer>;

  mutation(options: {
    resolve: ResolveFunction<undefined, unknown, TContext>;
  }): Route<'mutation', void, unknown, ResolveFunction<undefined, unknown, TContext>, TDataTransformer>;

  mutation<TMutationInput extends SerializableZodSchema, TMutationOutput extends SerializableZodSchema>(options: {
    input?: TMutationInput;
    output?: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }):
    | Route<
        'mutation',
        TMutationInput,
        TMutationOutput,
        ResolveFunction<TMutationInput, TMutationOutput, TContext>,
        TDataTransformer
      >
    | Route<'mutation', void, TMutationOutput, ResolveFunction<undefined, TMutationOutput, TContext>, TDataTransformer>
    | Route<'mutation', void, unknown, ResolveFunction<undefined, unknown, TContext>, TDataTransformer> {
    return new Route({
      type: 'mutation',
      input: options.input as TMutationInput,
      output: options.output as TMutationOutput,
      resolver: options.resolve,
      nodeType: 'route',
      transformer: this.transformer,
    });
  }

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input: TQueryInput;
    output: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }): Route<'query', TQueryInput, TQueryOutput, ResolveFunction<TQueryInput, TQueryOutput, TContext>, TDataTransformer>;

  query<TQueryOutput extends SerializableZodSchema>(options: {
    output: TQueryOutput;
    resolve: ResolveFunction<undefined, TQueryOutput, TContext>;
  }): Route<'query', void, TQueryOutput, ResolveFunction<undefined, TQueryOutput, TContext>, TDataTransformer>;

  query(options: {
    resolve: ResolveFunction<undefined, unknown, TContext>;
  }): Route<'query', void, unknown, ResolveFunction<undefined, unknown, TContext>, TDataTransformer>;

  query<TQueryInput extends SerializableZodSchema, TQueryOutput extends SerializableZodSchema>(options: {
    input?: TQueryInput;
    output?: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }):
    | Route<'query', TQueryInput, TQueryOutput, ResolveFunction<TQueryInput, TQueryOutput, TContext>, TDataTransformer>
    | Route<'query', void, TQueryOutput, ResolveFunction<undefined, TQueryOutput, TContext>, TDataTransformer>
    | Route<'query', void, unknown, ResolveFunction<undefined, unknown, TContext>, TDataTransformer> {
    return new Route({
      type: 'query',
      input: options.input as TQueryInput,
      output: options.output as TQueryOutput,
      resolver: options.resolve,
      nodeType: 'route',
      transformer: this.transformer,
    });
  }
}

export type ResolveFunction<
  TInput extends SerializableZodSchema | undefined = SerializableZodSchema | undefined,
  TOutput extends SerializableZodSchema | unknown = SerializableZodSchema | unknown,
  TContext extends Context = Context,
> = ({
  input,
  ctx,
}: {
  input: ParseResolverInput<TInput>;
  ctx: TContext;
}) => MaybePromise<ParseResolverOutput<TOutput>>;

export type AnyResolveFunction = ResolveFunction<any, any, any>;
