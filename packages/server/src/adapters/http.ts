import { HTTPError, HTTPErrorCode } from '../httpError';
import { Adapter } from '../adapter';
import { type RequestListener, type IncomingMessage, type ServerResponse } from 'http';
import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';

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
    const expressApp = express();
    const expressRouter = express.Router();

    expressRouter.post(
      '/',
      cors({
        origin: Array.isArray(corsOptions?.origin) ? corsOptions?.origin.join(',') : corsOptions?.origin,
        allowedHeaders: corsOptions?.allowedHeaders,
        methods: corsOptions?.methods,
        maxAge: corsOptions?.maxAge,
        credentials: corsOptions?.credentials,
      }),
      urlencoded({ extended: false }),
      json(),
      (req, res) => {
        handler
          .server({ body: req.body, params: { req, res } })
          .then((data) => res.json(data))
          .catch((error) => {
            if (HTTPError.isHttpError(error))
              res.status(HTTPErrorCode[error.code]).json({ message: error.message, info: error.info });
          });
      }
    );

    expressRouter.get(
      '/introspection',
      cors({
        origin: corsOptions?.introspection,
      }),
      (_req, res) => res.json(handler.introspection())
    );

    expressApp.use('/ptsq', expressRouter);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (req: IncomingMessage, res: ServerResponse) => expressApp(req, res);
  }
);
