import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { HTTPErrorCode } from '../httpError';
import { json, urlencoded } from 'body-parser';
import { adapter } from '../adapter';

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
export const expressAdapter = adapter(({ server, introspection, serve }) => {
  const expressRouter = express.Router();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  expressRouter.post('/', cors(serve.cors), urlencoded({ extended: false }), json(), async (req: Request, res) => {
    const { data, error } = await server({ body: req.body, params: [{ req, res }] });

    if (error) {
      res.status(HTTPErrorCode[error.code]).json({ message: error.message, info: error.info });
      return;
    }

    res.json(data);
  });

  expressRouter.get(
    '/introspection',
    cors({
      origin: serve.introspection,
    }),
    (_req, res) => res.json(introspection())
  );

  return expressRouter;
});
