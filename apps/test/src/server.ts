import { baseRouter } from './schema';
import { createServer } from '@schema-rpc/server';

const { middleware } = createServer({
  router: baseRouter,
  ctx: {},
});

middleware(({ next }) => {
  const r = next({
    ctx: {
      id: 1,
    },
  });

  return r;
});
