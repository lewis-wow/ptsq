import { createServer, ExpressAdapterContext } from '@ptsq/server';
import { prisma } from './prisma';

const createContext = ({ req, res }: ExpressAdapterContext) => {
  return {
    req,
    res,
    prisma,
  };
};

export const { router, resolver, createHTTPNodeHandler } = createServer({
  ctx: createContext,
});
