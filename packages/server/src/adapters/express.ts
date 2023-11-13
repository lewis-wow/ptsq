import type { Request, Response } from 'express';
import { httpAdapter } from './http';

export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};

export const expressAdapter = httpAdapter;
