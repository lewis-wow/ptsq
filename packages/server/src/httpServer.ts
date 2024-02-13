import { Middleware, MiddlewareMeta } from './middleware';
import { parseRequest } from './parseRequest';
import type { AnyPtsqServer } from './ptsqServer';
import type { AnyRouter } from './router';
import { ResolverType } from './types';

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
    return await Middleware.recursiveCall({
      ctx: {},
      meta: {
        route: undefined as unknown,
        input: undefined,
        type: undefined as unknown as ResolverType,
      } as MiddlewareMeta,
      index: 0,
      middlewares: [
        new Middleware<unknown, {}>({
          argsSchema: undefined,
          compiler: this._def.ptsqServer._def.compiler,
          middlewareFunction: async ({ next }) => {
            const parsedRequestBody = await parseRequest({
              request: request,
              compiler: this._def.ptsqServer._def.compiler,
            });

            const middlewareMeta = {
              input: parsedRequestBody.input,
              route: parsedRequestBody.route,
              type: parsedRequestBody.type,
            };

            const nextCtx = this._def.ptsqServer._def.ctx
              ? await this._def.ptsqServer._def.ctx({
                  request,
                  ...contextParams,
                })
              : {};

            return next({ meta: middlewareMeta, ctx: nextCtx });
          },
        }),
        ...this._def.ptsqServer._def.middlewares,
        new Middleware({
          argsSchema: undefined,
          compiler: this._def.ptsqServer._def.compiler,
          middlewareFunction: ({ meta, ctx }) =>
            this._def.router.call({
              route: meta.route.split('.'),
              index: 0,
              type: meta.type,
              meta,
              ctx,
            }),
        }),
      ],
    });
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
