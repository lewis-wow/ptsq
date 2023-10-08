import express, { Request, Response } from 'express';
import { ServePayload } from '../createServeFactory';
import cors from 'cors';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

export const expressAdapter = (serve: ServePayload<[ExpressAdapterContext]>) => {
  const expressRouter = express.Router();

  const { serveCaller, introspection, cors: corsOptions } = serve;

  expressRouter.all('/', cors(corsOptions), async (req, res) => {
    const rawRoute = req.query.route;
    if (typeof rawRoute !== 'string') {
      res.status(400).json({ message: 'Route query param must be a string' });
      return;
    }

    const { ctx, router, route, params } = await serveCaller({ route: rawRoute, params: [{ req, res }] });
    console.log({ ctx, router, route, params });
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
