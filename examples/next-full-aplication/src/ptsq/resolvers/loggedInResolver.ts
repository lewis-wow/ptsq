import { PtsqError } from '@ptsq/server';
import { publicResolver } from './publicResolver';

export const loggedInResolver = publicResolver.use(({ ctx, next }) => {
  if (!ctx.session) throw new PtsqError({ code: 'UNAUTHORIZED' });

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
