import { Context } from './context';
import { Middleware } from './middleware';
import { Route } from './route';
import { DataTransformer } from './transformer';
import { ParseResolverInput, ParseResolverOutput, MaybePromise } from './types';
import { z } from 'zod';

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

  mutation<TMutationInput extends z.Schema | undefined, TMutationOutput extends z.Schema | any = any>(options: {
    input?: TMutationInput;
    output?: TMutationOutput;
    resolve: ResolveFunction<TMutationInput, TMutationOutput, TContext>;
  }): Route<
    'mutation',
    TMutationInput,
    TMutationOutput,
    ResolveFunction<TMutationInput, TMutationOutput, TContext>,
    TDataTransformer
  > {
    return new Route({
      type: 'mutation',
      input: options.input as TMutationInput,
      output: options.output as TMutationOutput,
      resolver: options.resolve,
      nodeType: 'route',
      transformer: this.transformer,
    });
  }

  query<TQueryInput extends z.Schema | undefined, TQueryOutput extends z.Schema | any>(options: {
    input?: TQueryInput;
    output?: TQueryOutput;
    resolve: ResolveFunction<TQueryInput, TQueryOutput, TContext>;
  }): Route<
    'query',
    TQueryInput,
    TQueryOutput,
    ResolveFunction<TQueryInput, TQueryOutput, TContext>,
    TDataTransformer
  > {
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
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | any = z.Schema | any,
  TContext extends Context = Context,
> = ({
  input,
  ctx,
}: {
  input: ParseResolverInput<TInput>;
  ctx: TContext;
}) => MaybePromise<ParseResolverOutput<TOutput>>;

export type AnyResolveFunction = ResolveFunction<any, any, any>;
