import type { Context } from 'vitest';
import type { Compiler } from './compiler';
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
  compiler: Compiler;
}): Promise<AnyMiddlewareResponse> => {
  try {
    const ctx = await options.contextBuilder(options.params);

    const requestBodySchemaParser =
      options.compiler.getParser(requestBodySchema);

    const parsedRequestBody = requestBodySchemaParser.parse({
      value: options.body,
      mode: 'decode',
    });

    if (!parsedRequestBody.ok)
      return new MiddlewareResponse({
        ok: false,
        ctx,
        error: new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Parsing request body failed.',
          info: parsedRequestBody.errors,
        }),
      });

    const routeQueue = new Queue(parsedRequestBody.data.route.split('.'));

    const rawResponse = await options.router.call({
      route: routeQueue,
      type: parsedRequestBody.data.type,
      meta: {
        input: parsedRequestBody.data.input,
        route: parsedRequestBody.data.route,
        type: parsedRequestBody.data.type,
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
