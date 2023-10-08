import express, { Request, Response } from 'express';
import { ServeFunction } from '../createServeFactory';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

export const expressAdapter = (serve: ServeFunction<[ExpressAdapterContext]>) => {
  const router = express.Router();

  router.all('/', async (req, res) => {
    const rawRoute = req.query.route;
    if (typeof rawRoute !== 'string') {
      res.status(400).json({ message: 'Route query param must be a string' });
      return;
    }

    const { ctx, router, route, params } = await serve({ route: rawRoute, params: [{ req, res }] });
    console.log({ ctx, router, route, params });
  });

  router.get('/introspection', async (req, res) => {
    const { router } = await serve({ params: [{ req, res }] });
    res.json(router.getJsonSchema());
  });

  return router;
};
