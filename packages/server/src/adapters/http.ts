import { HTTPError, HTTPErrorCode } from '../httpError';
import { Adapter } from '../adapter';
import cors from '@koa/cors';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { type RequestListener, type IncomingMessage, type ServerResponse } from 'http';
import Koa from 'koa';

export type HttpAdapterContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

/**
 * create http routes for serve the server in the node:http app
 * /introspection path is also created if introspection query is turn on
 *
 * /root is POST method only route
 * /root/introspection is GET method only route
 */
export const httpAdapter = Adapter<HttpAdapterContext, RequestListener>(
  ({ handler, options: { cors: corsOptions } }) => {
    const koaApp = new Koa();
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
          .server({ body: koaRequest.body, params: { req, res } })
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

    koaApp.use(koaRouter.routes());
    koaApp.use(koaRouter.allowedMethods());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return koaApp.callback();
  }
);
