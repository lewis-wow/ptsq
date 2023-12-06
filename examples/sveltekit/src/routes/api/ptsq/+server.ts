import { createServer } from '@ptsq/server';
import { z } from 'zod';

const { router, resolver, serve } = createServer({
  ctx: () => ({}),
});

const baseRouter = router({
  greetings: resolver
    .args(z.object({ name: z.string().min(4) }))
    .output(z.string())
    .query(({ input }) => `Hello, ${input.name}!`),
});

const server = serve(baseRouter);

export type BaseRouter = typeof baseRouter;

export { server as POST };
