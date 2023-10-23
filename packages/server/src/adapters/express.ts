import express, { type Request, type Response } from 'express';
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
export const expressAdapter = Adapter(({ handler, options: { cors: corsOptions } }) => {
  const expressRouter = express.Router();

  expressRouter.post('/', cors(corsOptions.server), urlencoded({ extended: false }), json(), (req: Request, res) => {
    handler
      .server({ body: req.body, params: { req, res } })
      .then((data) => res.json(data))
      .catch((error) => {
        if (HTTPError.isHttpError(error))
          res.status(HTTPErrorCode[error.code]).json({ message: error.message, info: error.info });
      });
  });

  expressRouter.get(
    '/introspection',
    cors({
      origin: corsOptions.introspection,
    }),
    (_req, res) => res.json(handler.introspection)
  );

  return expressRouter;
});
