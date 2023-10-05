import { Request, Response, NextFunction } from 'express';
import { Serve } from '../serve';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

export const expressAdapter =
  (serve: Serve<[ExpressAdapterContext]>) => (req: Request, res: Response, next: NextFunction) => {
    const route = req.query.route;
    if (typeof route !== 'string') throw new Error('Route query param must be a string');

    serve({ route: route.split('.'), params: [{ req, res }] });
    next();
  };