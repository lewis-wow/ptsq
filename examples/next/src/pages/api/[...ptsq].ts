import { serve } from '@/server/ptsq';
import { baseRouter } from '@/server/routes/root';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default serve(baseRouter);
