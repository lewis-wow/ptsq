import express, { Request, Response } from 'express';
import { ServePayload } from '../createServeFactory';
import cors from 'cors';
import { expressExpectedRequestBodySchema } from '../expectedRequestBodySchema';
import { HTTPError, HTTPErrorCode } from '../httpError';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

export const expressAdapter = (serve: ServePayload<[ExpressAdapterContext]>) => {
  const expressRouter = express.Router();

  const { serveCaller, introspection, cors: corsOptions } = serve;

  expressRouter.post('/', cors(corsOptions), async (req, res) => {
    try {
      const parsedRequestBody = expressExpectedRequestBodySchema.safeParse(req.body);

      if (!parsedRequestBody.success)
        throw new HTTPError({ code: 'BAD_REQUEST', message: 'Route query param must be a string' });

      const { route: requestRoute, input } = parsedRequestBody.data;

      const { ctx, router, route, params } = await serveCaller({ route: requestRoute, params: [{ req, res }] });
      console.log({ ctx, router, route, params, input });
    } catch (error) {
      if (error instanceof Error && HTTPError.isHttpError(error)) {
        res.status(HTTPErrorCode[error.code]).json({ message: error.message });
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
