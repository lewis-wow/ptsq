import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import { Middleware } from './middleware';
import { HTTPError } from './httpError';

export class Mutation<
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema | undefined = undefined,
  TResolveFunction extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> extends Route<'mutation', TInput, TOutput, TResolveFunction, TDataTransformer> {
  middlewares: Middleware[];

  constructor(options: {
    input?: TInput;
    output?: TOutput;
    resolveFunction: TResolveFunction;
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
    return new ServerSideMutation({ ctx, resolveFunction: this.resolveFunction });
  }

  call({ input, ctx }: { input: any; ctx: Context }) {
    let finalCtx = ctx;
    for (const middleware of this.middlewares) {
      finalCtx = middleware.call(ctx);
    }

    if (!this.input) return this.resolveFunction({ input, ctx: finalCtx });

    const parsedInput = this.input.safeParse(input);
    if (!parsedInput.success)
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'Input validation error', info: parsedInput.error });

    const resolverResult = this.resolveFunction({ input: parsedInput.data, ctx: finalCtx });

    if (!this.output) return resolverResult;

    const parsedOutput = this.output.safeParse(resolverResult);

    if (!parsedOutput.success)
      throw new HTTPError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Output validation error',
        info: parsedOutput.error,
      });

    return parsedOutput.data;
  }
}

export type AnyMutation = Mutation;
