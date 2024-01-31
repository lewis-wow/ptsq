import { PtsqServer } from '@ptsq/server';
import { createContext } from './context';

export const { router, resolver, serve } = PtsqServer.init({
  ctx: createContext,
})
  .use(async ({ next, meta }) => {
    console.log('request: ', meta);

    const response = await next();

    console.log('response: ', response);

    return response;
  })
  .create();
