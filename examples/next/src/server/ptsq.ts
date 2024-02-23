import { createServer } from '@ptsq/server';

export const { resolver, router, serve } = createServer({
  root: '/api',
}).create();
