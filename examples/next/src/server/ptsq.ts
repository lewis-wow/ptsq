import { PtsqServer } from '@ptsq/server';

export const { resolver, router, serve } = PtsqServer.init({
  root: '/api',
}).create();
