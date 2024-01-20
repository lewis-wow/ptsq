import {
  createServerAdapter,
  type FetchAPI,
  type ServerAdapterPlugin,
} from '@whatwg-node/server';
import { Compiler } from './compiler';
import type {
  Context,
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import { Envelope } from './envelope';
import type { ErrorFormatter } from './errorFormatter';
import {
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
} from './middleware';
import { parseRequest } from './parseRequest';
import { PtsqError } from './ptsqError';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';
import type { ShallowMerge, Simplify } from './types';

/**
 * @internal
 */
export type CreateServerOptions<
  TContextBuilder extends ContextBuilder | undefined = undefined,
> = {
  ctx?: TContextBuilder;
  fetchAPI?: FetchAPI;
  root?: string;
  endpoint?: string;
  errorFormatter?: ErrorFormatter;
  compiler?: Compiler;
  plugins?: ServerAdapterPlugin<any>[];
  middlewares?: AnyMiddleware[];
};

export class PtsqServer<
  TContextBuilder extends ContextBuilder | undefined,
  TServerRootContext extends Context,
> {
  _def: {
    ctx: TContextBuilder;
    fetchAPI?: FetchAPI;
    root: string;
    endpoint: string;
    errorFormatter?: ErrorFormatter;
    compiler: Compiler;
    plugins: ServerAdapterPlugin<any>[];
    middlewares: AnyMiddleware[];
  };

  constructor({
    ctx,
    fetchAPI,
    root = '',
    endpoint = '/ptsq',
    errorFormatter = (error) => error,
    compiler = new Compiler(),
    plugins = [],
    middlewares = [],
  }: CreateServerOptions<TContextBuilder>) {
    this._def = {
      ctx: ctx as TContextBuilder,
      fetchAPI,
      root,
      endpoint,
      errorFormatter,
      compiler,
      plugins,
      middlewares,
    };
  }

  use<
    TMiddlewareFunction extends MiddlewareFunction<unknown, TServerRootContext>,
  >(middleware: TMiddlewareFunction) {
    return new PtsqServer<
      TContextBuilder,
      Simplify<
        ShallowMerge<
          TServerRootContext,
          Awaited<ReturnType<TMiddlewareFunction>>['ctx']
        >
      >
    >({
      ...this._def,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: undefined,
          middlewareFunction: middleware,
          compiler: this._def.compiler,
        }),
      ] as AnyMiddleware[],
    });
  }

  create() {
    const def = { ...this._def };

    const path = `${def.root.replace(/\/$/, '')}/${def.endpoint.replace(
      /^\/|\/$/g,
      '',
    )}`;

    /**
     * Creates a queries or mutations
     *
     * resolvers can use middlewares to create like protected resolver
     *
     * @example
     * ```ts
     * resolver.query(({ input, ctx }) => `Hello, ${input.name}!`);
     * ```
     */
    const resolver = Resolver.createRoot<TServerRootContext>({
      compiler: def.compiler,
    });

    /**
     * Creates a fully typed router
     * routers can be merged as you want, they creates sdk-like structure
     *
     * @example
     * ```ts
     * router({
     *   user: router({
     *     create: resolver.mutation({
     *       // ...
     *     })
     *   })
     * })
     * ```
     */
    const router = <TRoutes extends Routes>(routes: TRoutes) =>
      new Router({ routes });

    const serve = (baseRouter: AnyRouter) => {
      const ptsqServer = new PtsqServer_({
        router: baseRouter,
        contextBuilder: def.ctx,
        compiler: def.compiler,
      });

      return createServerAdapter<
        inferContextParamsFromContextBuilder<TContextBuilder>
      >(
        async (request, contextParams) => {
          const url = new URL(request.url);
          const method = request.method;

          if (url.pathname === path && method === 'POST') {
            const middlewareResponse = await ptsqServer.serve(
              request,
              contextParams,
            );

            const envelopedResponse = new Envelope({ middlewareResponse });

            return envelopedResponse.toResponse(def.errorFormatter);
          }

          if (url.pathname === `${path}/introspection` && method === 'GET') {
            const introspectionResponse = ptsqServer.introspection();
            const envelopedResponse = new Envelope({
              middlewareResponse: introspectionResponse,
            });
            return envelopedResponse.toResponse(def.errorFormatter);
          }

          if (
            !['GET', 'POST'].includes(method) ||
            (url.pathname === `${path}/introspection` && method !== 'GET') ||
            (url.pathname === path && method !== 'POST')
          )
            return new PtsqError({
              code: 'METHOD_NOT_SUPPORTED',
              message: `Method ${method} is not supported by Ptsq server.`,
            }).toResponse(def.errorFormatter);

          return new PtsqError({
            code: 'NOT_FOUND',
            message: `Http pathname ${path} is not supported by Ptsq server, supported are POST ${path} and GET ${path}/introspection.`,
          }).toResponse(def.errorFormatter);
        },
        {
          plugins: def.plugins,
          fetchAPI: def.fetchAPI,
        },
      );
    };

    return {
      resolver,
      router,
      serve,
    };
  }

  static init<TContextBuilder extends ContextBuilder | undefined = undefined>(
    options?: CreateServerOptions<TContextBuilder>,
  ) {
    return new PtsqServer<
      TContextBuilder,
      inferContextFromContextBuilder<TContextBuilder>
    >(options ?? {});
  }
}

export class PtsqServer_ {
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
