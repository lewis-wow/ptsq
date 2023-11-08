import express, { type Request, type Response, type Router } from 'express';
import { HTTPError, HTTPErrorCode } from '../httpError';
import { json, urlencoded } from 'body-parser';
import { Adapter } from '../adapter';
import cors from 'cors';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

/**
 * create express routes for serve the server in the express app
 * /introspection path is also created if introspection query is turn on
 *
 * /root is POST method only route
 * /root/introspection is GET method only route
 */
export const expressAdapter = Adapter<ExpressAdapterContext, Router>(({ handler, options: { cors: corsOptions } }) => {
  const expressRouter = express.Router();

  expressRouter.post(
    '/',
    cors({
      origin: corsOptions?.origin,
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
        .then((response) =>
          response.ok
            ? res.json(response.data)
            : res
                .status(HTTPErrorCode[response.error.code])
                .json({ message: response.error.message, info: response.error.info })
        )
        .catch((error) => {
          if (HTTPError.isHttpError(error)) {
            res.status(HTTPErrorCode[error.code]).json({ message: error.message, info: error.info });
            return;
          }

          throw error;
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

  return expressRouter;
});
