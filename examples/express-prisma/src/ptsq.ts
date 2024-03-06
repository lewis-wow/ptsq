import { ptsq } from '@ptsq/server';
import { createContext } from './context';

export const { router, resolver, serve } = ptsq({
  ctx: createContext,
})
  .use(async ({ next, meta }) => {
    console.log('request: ', meta);

    const response = await next();

    console.log('response: ', response);

    return response;
  })
  .create();
