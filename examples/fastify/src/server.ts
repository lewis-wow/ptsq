import type { IncomingMessage, ServerResponse } from 'http';
import fastifyExpress from '@fastify/express';
import { createServer } from '@ptsq/server';
import Fastify from 'fastify';
import { z } from 'zod';

const app = Fastify();

const createContext = ({
  req,
  res,
}: {
  req: IncomingMessage;
  res: ServerResponse;
}) => ({
  req,
  res,
});

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const baseRouter = router({
  greetings: resolver.args(z.object({ name: z.string().min(4) })).query({
    output: z.string(),
    resolve: ({ input }) => `Hello, ${input.name}!`,
  }),
});

app.register(fastifyExpress).then(() => {
  app.use((req, res) => serve(baseRouter).handleNodeRequest(req, { req, res }));

  app.listen({ port: 4000 }, () => {
    console.log('Listening on: http://localhost:4000/ptsq');
  });
});

export type BaseRouter = typeof baseRouter;
