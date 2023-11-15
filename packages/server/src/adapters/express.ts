import type { Request, Response } from 'express';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};
