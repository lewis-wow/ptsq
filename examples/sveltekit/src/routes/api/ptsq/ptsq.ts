import { ptsq } from '@ptsq/server';

export const { resolver, router, serve } = ptsq({
  endpoint: '/api/ptsq',
}).create();
