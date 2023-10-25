import { HTTPError, HTTPErrorCode } from '../httpError';
import { Adapter } from '../adapter';
import cors from '@koa/cors';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { type Request, type Response } from 'koa';
import type { IncomingMessage, ServerResponse } from 'http';

export type KoaAdapterContext = {
  req: Request;
  res: Response;
  raw: {
    request: IncomingMessage;
    response: ServerResponse;
  };
};

/**
 * create koa routes for serve the server in the koa app
 * /introspection path is also created if introspection query is turn on
 *
 * /root is POST method only route
 * /root/introspection is GET method only route
 */
export const koaAdapter = Adapter<KoaAdapterContext, Router>(({ handler, options: { cors: corsOptions } }) => {
  const koaRouter = new Router();

  koaRouter.post(
    '/',
    cors({
      origin: Array.isArray(corsOptions?.origin) ? corsOptions.origin.join(',') : corsOptions?.origin,
      allowHeaders: corsOptions?.allowedHeaders,
      allowMethods: corsOptions?.methods,
      maxAge: corsOptions?.maxAge,
      credentials: corsOptions?.credentials,
    }),
    bodyParser(),
    ({ req, res, request: koaRequest, response: koaResponse }) => {
      handler
        .server({
          body: koaRequest.body,
          params: { req: koaRequest, res: koaResponse, raw: { request: req, response: res } },
        })
        .then((data) => (koaResponse.body = data))
        .catch((error) => {
          if (HTTPError.isHttpError(error)) {
            koaResponse.status = HTTPErrorCode[error.code];
            koaResponse.body = { message: error.message, info: error.info };
          }
        });
    }
  );

  koaRouter.get(
    '/introspection',
    cors({
      origin: Array.isArray(corsOptions?.introspection)
        ? corsOptions.introspection.join(',')
        : corsOptions?.introspection,
    }),
    ({ response }) => (response.body = handler.introspection())
  );

  return koaRouter;
});
