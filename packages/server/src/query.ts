import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { Context } from './context';
import { Route } from './route';
import { ServerSideQuery } from './serverSideQuery';
import { Middleware } from './middleware';

export class Query<
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema | unknown = unknown,
  TResolver extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> extends Route<'query', TInput, TOutput, TResolver, TDataTransformer> {
  middlewares: Middleware[];

  constructor(options: {
    input?: TInput;
    output: TOutput;
    resolver: TResolver;
    transformer: TDataTransformer;
    middlewares: Middleware[];
  }) {
    super({
      type: 'query',
      ...options,
    });

    this.middlewares = options.middlewares;
  }

  createServerSideQuery<TContext extends Context>(ctx: TContext) {
    return new ServerSideQuery({ ctx, resolveFunction: this.resolver });
  }

  call({ input, ctx }: { input: any; ctx: Context }) {
    let finalCtx = ctx;
    for (const middleware of this.middlewares) {
      finalCtx = middleware.call(ctx);
    }

    return this.resolver({ input, ctx: finalCtx });
  }
}

export type AnyQuery = Query;
