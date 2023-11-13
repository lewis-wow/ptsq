import type { Context, ContextBuilder } from './context';
import type { CORSOptions } from './cors';
import type { Router } from './router';
import { Queue } from './queue';
import { requestBodySchema } from './requestBodySchema';
import { Middleware } from './middleware';
import { HTTPError } from './httpError';

export type ServeOptions<TContext extends Context> = {
  contextBuilder: ContextBuilder<TContext>;
  cors?: CORSOptions;
};

export class Serve<TContext extends Context = Context> {
  contextBuilder: ContextBuilder<TContext>;
  cors?: CORSOptions;
  router?: Router;

  constructor({ contextBuilder, cors }: ServeOptions<TContext>) {
    this.contextBuilder = contextBuilder;
    this.cors = cors;
  }

  adapt({ router }: { router: Router }) {
    this.router = router;
    return this;
  }

  async call<TParams>({ body, params }: { body: unknown; params: TParams }) {
    if (!this.router) throw new Error('Router must be set by Serve.adapt before server call.');

    const ctx = await this.contextBuilder(params);

    const parsedRequestBody = requestBodySchema.safeParse(body);

    if (!parsedRequestBody.success)
      return Middleware.createFailureResponse({
        ctx,
        error: new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Parsing request body failed.',
          info: parsedRequestBody.error,
        }),
      });

    const routeQueue = new Queue(parsedRequestBody.data.route.split('.'));

    try {
      return this.router.call({
        route: routeQueue,
        meta: {
          input: parsedRequestBody.data.input,
          route: parsedRequestBody.data.route,
        },
        ctx,
      });
    } catch (error) {
      if (HTTPError.isHttpError(error))
        return Middleware.createFailureResponse({
          ctx,
          error,
        });

      // rethrow the error
      throw error;
    }
  }
}
