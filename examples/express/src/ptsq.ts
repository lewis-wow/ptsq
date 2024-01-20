import { PtsqServer } from '../../../packages/server/src/ptsqServer';

export const { resolver, router, serve } = PtsqServer.init()
  .use(async ({ next, ctx }) => {
    const response = await next({
      a: 1,
    });

    return response;
  })
  .create();
