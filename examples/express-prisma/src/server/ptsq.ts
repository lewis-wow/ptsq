import { createServer } from '@ptsq/server';
import { Request, Response } from 'express';
import { prisma } from './prisma';

const createContext = ({ req, res }: { req: Request; res: Response }) => ({
  req,
  res,
  prisma,
});

export const { router, resolver, serve } = createServer({
  ctx: createContext,
});
