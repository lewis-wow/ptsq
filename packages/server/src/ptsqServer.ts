import type { Compiler } from './compiler';
import type { ContextBuilder } from './context';
import { MiddlewareResponse } from './middleware';
import { parseRequest } from './parseRequest';
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
    const ctx = await this._def.contextBuilder({
      request: request,
      ...contextParams,
    });

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
  }

  introspection() {
    return new MiddlewareResponse({
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
