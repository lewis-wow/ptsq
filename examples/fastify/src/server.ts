import fastifyExpress from '@fastify/express';
import { createServer, FastifyAdapterContext } from '@ptsq/server';
import Fastify from 'fastify';
import { z } from 'zod';

const app = Fastify();

const { router, resolver, createHTTPNodeHandler } = createServer({
  ctx: async ({ req, res }: FastifyAdapterContext) => ({
    req,
    res,
  }),
});

const baseRouter = router({
  greetings: resolver.args(z.object({ name: z.string().min(4) })).query({
    output: z.string(),
    resolve: ({ input }) => `Hello, ${input.name}!`,
  }),
});

app.register(fastifyExpress).then(() => {
  app.use((req, res) =>
    createHTTPNodeHandler(req, res, {
      router: baseRouter,
      ctx: {
        req,
        res,
      },
    }),
  );

  app.listen({ port: 4000 }, () => {
    console.log('Listening on: http://localhost:4000/ptsq');
  });
});

export type BaseRouter = typeof baseRouter;
