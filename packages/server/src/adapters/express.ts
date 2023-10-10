import express, { Request, Response } from 'express';
import { ServePayload } from '../createServeFactory';
import cors from 'cors';
import { expressExpectedRequestBodySchema } from '../expectedRequestBodySchema';
import { HTTPError, HTTPErrorCode } from '../httpError';
import { json } from 'body-parser';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

export const expressAdapter = (serve: ServePayload<[ExpressAdapterContext]>) => {
  const expressRouter = express.Router();

  const { serveCaller, introspection, cors: corsOptions } = serve;

  expressRouter.post('/', cors(corsOptions), json(), async (req, res) => {
    try {
      const parsedRequestBody = expressExpectedRequestBodySchema.safeParse(req.body);

      if (!parsedRequestBody.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Route query param must be a string separated by dots (a.b.c)',
          info: parsedRequestBody.error,
        });

      const { route: requestRoute, input } = parsedRequestBody.data;

      const { ctx, router, route } = await serveCaller({ route: requestRoute, params: [{ req, res }] });
      if (!route)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Route query param must be a string separated by dots (a.b.c)',
        });

      const dataResult = router.call({ route, input, ctx });

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
      origin: introspection,
    }),
    async (req, res) => {
      const { router } = await serveCaller({ params: [{ req, res }] });

      res.json(router.getJsonSchema());
    }
  );

  return expressRouter;
};
