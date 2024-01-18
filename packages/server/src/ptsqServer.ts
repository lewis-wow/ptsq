import type { Compiler } from './compiler';
import type { ContextBuilder } from './context';
import { MiddlewareResponse } from './middleware';
import { PtsqError } from './ptsqError';
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

      const ctx = await this._def.contextBuilder({
        request: request,
        ...contextParams,
      });

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
          error: new PtsqError({
            code: 'BAD_REQUEST',
            message: 'Parsing request body failed.',
            info: parsedRequestBody.errors,
          }),
        });

      const rawResponse = await this._def.router.call({
        route: parsedRequestBody.data.route.split('.'),
        index: 0,
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
