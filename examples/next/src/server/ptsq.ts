import { env } from '@/env';
import { ptsq } from '@ptsq/server';
import { createContext } from './context';

export const { resolver, router, serve } = ptsq({
  ctx: createContext,
  root: '/api',
})
  .use(async ({ next }) => {
    const response = await next();

    if (env.NODE_ENV === 'development' && !response.ok)
      console.error(response.error);

    return response;
  })
  .create();
