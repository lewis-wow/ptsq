import type { Context, ContextBuilder } from './context';
import type { CORSOptions } from './cors';
import { HTTPError } from './httpError';
import { Middleware } from './middleware';
import { Queue } from './queue';
import { requestBodySchema } from './requestBodySchema';
import type { AnyRouter } from './router';

export type ServeOptions<TContext extends Context> = {
  contextBuilder: ContextBuilder<TContext>;
  cors?: CORSOptions;
  rootPath?: string;
};

/**
 * @internal
 *
 * Creates a caller for a whole application
 *
 * This is the first point of the request
 */
export class Serve<TContext extends Context = Context> {
  _contextBuilder: ContextBuilder<TContext>;

  constructor({ contextBuilder }: ServeOptions<TContext>) {
    this._contextBuilder = contextBuilder;
  }

  /**
   * @internal
   *
   * Validates an input and calls the route in the router.
   */
  async call<TParams>(options: {
    router: AnyRouter;
    body: unknown;
    params: TParams;
  }) {
    try {
      const ctx = await this._contextBuilder(options.params);

      const parsedRequestBody = requestBodySchema.safeParse(options.body);

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

      return options.router.call({
        route: routeQueue,
        meta: {
          input: parsedRequestBody.data.input,
          route: parsedRequestBody.data.route,
        },
        ctx,
      });
    } catch (error) {
      return Middleware.createFailureResponse({
        ctx: {},
        error: HTTPError.isHttpError(error)
          ? error
          : new HTTPError({
              code: 'INTERNAL_SERVER_ERROR',
              info: error,
            }),
      });
    }
  }
}
