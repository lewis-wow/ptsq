export type { Server } from './types';

export { createServer } from './server';

/**
 * @module adapters/express
 */
export { expressAdapter } from './adapters/express';
export type { ExpressAdapterContext } from './adapters/express';

import { createServer as cs } from './server';

const { resolver, middleware } = cs({
  ctx: () => ({
    test: 1 as number | null | undefined,
  }),
});

const test = middleware(({ ctx, next }) => {
  if (ctx.test === undefined) throw new Error();

  return next({
    ctx: {
      test: ctx.test,
    },
  });
});

const piped = test.pipe(({ ctx, next }) => {
  if (ctx.test === null) throw new Error();

  return next({
    ctx: {
      test: ctx.test,
    },
  });
});

const nonUndef = resolver.use(piped);
