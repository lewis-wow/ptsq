import { createHTTPNodeHandler } from '@/server/ptsq';
import { baseRouter } from '@/server/routes/root';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return createHTTPNodeHandler(req, res, {
    router: baseRouter,
    ctx: {
      req,
      res,
    },
  });
}
