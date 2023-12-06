import { serve } from '@/server/ptsq';
import { baseRouter } from '@/server/routes/root';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return serve(baseRouter)(req, res, {
    req,
    res,
  });
}
