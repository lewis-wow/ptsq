import {
  type IncomingMessage,
  type RequestListener,
  type ServerResponse,
} from 'http';
import corsMiddleware from 'cors';
import express, { json, urlencoded } from 'express';
import type { Context } from '../context';
import type { CORSOptions } from '../cors';
import { HTTPErrorCode } from '../httpError';
import type { AnyRouter } from '../router';
import type { Serve } from '../serve';

/**
 * node:http adapter context type
 *
 * @see https://nodejs.org/api/http.html
 *
 * This type enforce that the node:http request and response objects are passed to the server handler.
 *
 * You can extends this type by using the `&` or use it as it is.
 *
 * @example
 * ```ts
 * const { resolver, router } = createServer({
 *   ctx: ({ req: res }: HttpAdapterContext) => ({
 *     req,
 *     res
 *   }),
 * });
 * ```
 */
export type HttpAdapterContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

export type HTTPRequestListenerHandlerOptions = {
  cors?: CORSOptions;
  serve: Serve;
  router: AnyRouter;
  ctx: Context;
};

export const HTTPRequestListener = {
  createRequestListenerHandler({
    cors,
    serve,
    router,
    ctx,
  }: HTTPRequestListenerHandlerOptions): RequestListener {
    const app = express();

    app.post(
      `/ptsq`,
      corsMiddleware({
        origin: Array.isArray(cors?.origin)
          ? cors?.origin.join(',')
          : cors?.origin,
        allowedHeaders: cors?.allowedHeaders,
        methods: cors?.methods,
        maxAge: cors?.maxAge,
        credentials: cors?.credentials,
      }),
      urlencoded({ extended: false }),
      json(),
      (req, res) => {
        serve.call({ router, body: req.body, params: ctx }).then((response) => {
          if (!response.ok)
            return res.status(HTTPErrorCode[response.error.code]).json({
              message: response.error.message,
              info: response.error.info,
            });
          return res.json(response.data);
        });
      },
    );

    app.get(
      `/ptsq/introspection`,
      corsMiddleware({
        origin: cors?.introspection,
      }),
      (_req, res) => {
        res.json({
          $schema: 'http://json-schema.org/draft-07/schema#',
          ...router.getJsonSchema(),
        });
      },
    );

    return (req: IncomingMessage, res: ServerResponse) => {
      app(req, res);
    };
  },
};
