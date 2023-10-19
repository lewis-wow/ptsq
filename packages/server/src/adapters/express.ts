import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { requestBodySchema } from '../requestBodySchema';
import { HTTPError, HTTPErrorCode } from '../httpError';
import { json, urlencoded } from 'body-parser';
import type { Serve } from '../serve';

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
export const expressAdapter = (serve: Serve) => {
  const expressRouter = express.Router();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  expressRouter.post('/', cors(serve.cors), urlencoded({ extended: false }), json(), async (req: Request, res) => {
    try {
      const parsedRequestBody = requestBodySchema.safeParse(req.body);

      if (!parsedRequestBody.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Route query param must be a string separated by dots (a.b.c)',
          info: parsedRequestBody.error,
        });

      const input = parsedRequestBody.data.input;

      const { ctx, route } = await serve.serve({
        route: parsedRequestBody.data.route,
        params: [{ req, res }],
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dataResult = serve.router!.call({
        route,
        input,
        ctx,
      });

      res.json(dataResult);
    } catch (error) {
      if (HTTPError.isHttpError(error)) {
        res.status(HTTPErrorCode[error.code]).json({ message: error.message, info: error.info });
        return;
      }

      throw error;
    }
  });

  expressRouter.get(
    '/introspection',
    cors({
      origin: serve.introspection,
    }),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (_req, res) => res.json(serve.router!.getJsonSchema())
  );

  return expressRouter;
};
