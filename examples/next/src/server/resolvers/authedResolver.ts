import { PtsqError, PtsqErrorCode } from '@ptsq/server';
import { publicResolver } from './publicResolver';

export const authedResolver = publicResolver.use(({ ctx, next }) => {
  if (ctx.session === null) {
    throw new PtsqError({
      code: PtsqErrorCode.UNAUTHORIZED_401,
      message: 'Requires authenticated user.',
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
