import type { Compiler } from './compiler';
import type { ContextBuilder } from './context';
import { HTTPError } from './httpError';
import { Introspecion } from './introspection';
import { MiddlewareResponse } from './middleware';
import { Queue } from './queue';
import { requestBodySchema } from './requestBodySchema';
import type { AnyRouter } from './router';

export class PtsqServer {
  _def: {
    router: AnyRouter;
    contextBuilder: ContextBuilder;
    compiler: Compiler;
  };

  constructor(options: {
    router: AnyRouter;
    contextBuilder: ContextBuilder;
    compiler: Compiler;
  }) {
    this._def = options;
  }

  async serve(request: Request, contextParams: object) {
    try {
      const body = await request.json();

      const ctx = await this._def.contextBuilder(contextParams);

      const requestBodySchemaParser =
        this._def.compiler.getParser(requestBodySchema);

      const parsedRequestBody = requestBodySchemaParser.parse({
        value: body,
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

      const rawResponse = await this._def.router.call({
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
  }

  introspection() {
    return new Introspecion(this._def.router);
  }
}
