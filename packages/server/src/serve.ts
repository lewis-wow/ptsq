import type { Context } from 'vitest';
import type { ContextBuilder } from './context';
import { HTTPError } from './httpError';
import { MiddlewareResponse, type AnyMiddlewareResponse } from './middleware';
import { Queue } from './queue';
import { requestBodySchema } from './requestBodySchema';
import type { AnyRouter } from './router';

/**
 * @internal
 *
 * Validates an input and start calling the routes in root router
 */
export const serve = async (options: {
  router: AnyRouter;
  body: unknown;
  params: Context;
  contextBuilder: ContextBuilder;
}): Promise<AnyMiddlewareResponse> => {
  try {
    const ctx = await options.contextBuilder(options.params);

    const parsedRequestBody = requestBodySchema.safeParse(options.body);

    if (!parsedRequestBody.success)
      return new MiddlewareResponse({
        ok: false,
        ctx,
        error: new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Parsing request body failed.',
          info: parsedRequestBody.error,
        }),
      });

    const routeQueue = new Queue(parsedRequestBody.data.route.split('.'));

    const rawResponse = await options.router.call({
      route: routeQueue,
      meta: {
        input: parsedRequestBody.data.input,
        route: parsedRequestBody.data.route,
      },
      ctx,
    });

    return new MiddlewareResponse(rawResponse);
  } catch (error) {
    return new MiddlewareResponse({
      ok: false,
      ctx: {},
      error: HTTPError.isHttpError(error)
        ? error
        : new HTTPError({
            code: 'INTERNAL_SERVER_ERROR',
            info: error,
          }),
    });
  }
};
