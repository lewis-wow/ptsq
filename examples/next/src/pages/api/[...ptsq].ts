import { serve } from '@/server/ptsq';
import { baseRouter } from '@/server/routes/root';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default serve(baseRouter);
