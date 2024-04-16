import { ptsq } from '@ptsq/server';

export const { resolver, router, serve } = ptsq({
  root: '/api',
}).create();
