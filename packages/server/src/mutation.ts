import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import { Middleware } from './middleware';

export class Mutation<
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema | unknown = unknown,
  TResolver extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> extends Route<'mutation', TInput, TOutput, TResolver, TDataTransformer> {
  middlewares: Middleware[];

  constructor(options: {
    input?: TInput;
    output: TOutput;
    resolver: TResolver;
    transformer: TDataTransformer;
    middlewares: Middleware[];
  }) {
    super({
      type: 'mutation',
      ...options,
    });

    this.middlewares = options.middlewares;
  }

  createServerSideMutation<TContext extends Context>(ctx: TContext) {
    return new ServerSideMutation({ ctx, resolveFunction: this.resolver });
  }

  call({ input, ctx }: { input: any; ctx: Context }) {
    let finalCtx = ctx;
    for (const middleware of this.middlewares) {
      finalCtx = middleware.call(ctx);
    }

    return this.resolver({ input, ctx: finalCtx });
  }
}

export type AnyMutation = Mutation;
