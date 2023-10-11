import express, { Request, Response } from 'express';
import cors from 'cors';
import { requestBodySchema } from '../requestBodySchema';
import { HTTPError, HTTPErrorCode } from '../httpError';
import { json, urlencoded } from 'body-parser';
import { Serve } from '../serve';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

export const expressAdapter = (serve: Serve) => {
  const expressRouter = express.Router();

  expressRouter.post(
    '/',
    cors(serve.cors),
    urlencoded({ extended: false }),
    json(),
    async (req: Request<{ route: string }>, res) => {
      try {
        const parsedRequestBody = requestBodySchema.safeParse(req.body);

        if (!parsedRequestBody.success)
          throw new HTTPError({
            code: 'BAD_REQUEST',
            message: 'Route query param must be a string separated by dots (a.b.c)',
            info: parsedRequestBody.error,
          });

        const { ctx, route } = await serve.serve({
          route: parsedRequestBody.data.route,
          params: [{ req, res }],
        });

        const dataResult = serve.router!.call({ route, input: parsedRequestBody.data.input, ctx });

        res.json(dataResult);
      } catch (error) {
        if (HTTPError.isHttpError(error)) {
          res.status(HTTPErrorCode[error.code]).json({ message: error.message, info: error.info });
          return;
        }

        throw error;
      }
    }
  );

  expressRouter.get(
    '/introspection',
    cors({
      origin: serve.introspection,
    }),
    (_req, res) => res.json(serve.router!.getJsonSchema())
  );

  return expressRouter;
};
