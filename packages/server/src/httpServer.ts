import type { Compiler } from './compiler';
import type { ContextBuilder } from './context';
import { Middleware } from './middleware';
import { parseRequest } from './parseRequest';
import { PtsqError } from './ptsqError';
import type { AnyRouter } from './router';

export class HttpServer {
  _def: {
    router: AnyRouter;
    contextBuilder: ContextBuilder | undefined;
    compiler: Compiler;
  };

  constructor(options: {
    router: AnyRouter;
    contextBuilder: ContextBuilder | undefined;
    compiler: Compiler;
  }) {
    this._def = options;
  }

  async serve(request: Request, contextParams: object) {
    try {
      const ctx = this._def.contextBuilder
        ? await this._def.contextBuilder({
            request: request,
            ...contextParams,
          })
        : {};

      const parsedRequestBody = await parseRequest({
        request,
        compiler: this._def.compiler,
      });

      const response = await this._def.router.call({
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

      return response;
    } catch (error) {
      return Middleware.createResponse({
        ok: false,
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
    return Middleware.createResponse({
      ctx: {},
      ok: true,
      data: {
        title: 'BaseRouter',
        $schema: 'https://json-schema.org/draft/2019-09/schema#',
        ...this._def.router.getJsonSchema(),
      },
    });
  }
}
