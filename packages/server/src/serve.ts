import type { Context, ContextBuilder } from './context';
import type { CORSOptions } from './cors';
import { HTTPError } from './httpError';
import { Middleware } from './middleware';
import { Queue } from './queue';
import { requestBodySchema } from './requestBodySchema';
import type { Router } from './router';

export type ServeOptions<TContext extends Context> = {
  contextBuilder: ContextBuilder<TContext>;
  cors?: CORSOptions;
  rootPath?: string;
};

export class Serve<TContext extends Context = Context> {
  _contextBuilder: ContextBuilder<TContext>;

  constructor({ contextBuilder }: ServeOptions<TContext>) {
    this._contextBuilder = contextBuilder;
  }

  async call<TParams>({
    router,
    body,
    params,
  }: {
    router: Router;
    body: unknown;
    params: TParams;
  }) {
    const ctx = await this._contextBuilder(params);

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
      return router.call({
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
