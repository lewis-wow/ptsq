import { baseRouter } from './baseRouter';
import { serve } from './ptsq';

const server = serve(baseRouter);

export { server as GET, server as POST };
