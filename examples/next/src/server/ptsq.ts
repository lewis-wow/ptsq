import { createServer } from '@ptsq/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from './prisma';

const createContext = ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
    prisma,
  };
};

export const { router, resolver, serve } = createServer({
  ctx: createContext,
});
