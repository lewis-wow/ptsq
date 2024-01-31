import { Middleware } from './middleware';
import { parseRequest } from './parseRequest';
import { PtsqError } from './ptsqError';
import type { AnyPtsqServer } from './ptsqServer';
import type { AnyRouter } from './router';

/**
 * @internal
 *
 * Serves the server and introspection endpoints
 */
export class HttpServer {
  _def: {
    router: AnyRouter;
    ptsqServer: AnyPtsqServer;
  };

  constructor(httpServerOptions: {
    router: AnyRouter;
    ptsqServer: AnyPtsqServer;
  }) {
    this._def = httpServerOptions;
  }

  async serve(request: Request, contextParams: object) {
    try {
      const ctx = this._def.ptsqServer._def.ctx
        ? await this._def.ptsqServer._def.ctx({
            request: request,
            ...contextParams,
          })
        : {};

      const parsedRequestBody = await parseRequest({
        request,
        compiler: this._def.ptsqServer._def.compiler,
      });

      const middlewareMeta = {
        input: parsedRequestBody.input,
        route: parsedRequestBody.route,
        type: parsedRequestBody.type,
      };

      const response = await Middleware.recursiveCall({
        ctx: ctx,
        meta: middlewareMeta,
        index: 0,
        middlewares: [
          ...this._def.ptsqServer._def.middlewares,
          new Middleware({
            argsSchema: undefined,
            compiler: this._def.ptsqServer._def.compiler,
            middlewareFunction: () => {
              return this._def.router.call({
                route: parsedRequestBody.route.split('.'),
                index: 0,
                type: parsedRequestBody.type,
                meta: {
                  input: parsedRequestBody.input,
                  route: parsedRequestBody.route,
                  type: parsedRequestBody.type,
                },
                ctx,
              });
            },
          }),
        ],
      });

      return response;
    } catch (error) {
      console.error(error);

      return Middleware.createFailureResponse({
        ctx: {},
        error: PtsqError.isPtsqError(error)
          ? error
          : new PtsqError({
              code: 'INTERNAL_SERVER_ERROR',
              info: error,
            }),
      });
    }
  }

  introspection() {
    return Middleware.createSuccessResponse({
      ctx: {},
      data: {
        title: 'BaseRouter',
        $schema: 'https://json-schema.org/draft/2019-09/schema#',
        ...this._def.router.getJsonSchema(),
      },
    });
  }
}
