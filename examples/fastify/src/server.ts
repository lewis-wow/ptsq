import { createServer } from '@ptsq/server';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

const app = fastify();

const createContext = ({
  req,
  reply,
}: {
  req: FastifyRequest;
  reply: FastifyReply;
}) => ({
  req,
  reply,
});

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const baseRouter = router({
  greetings: resolver
    .args(z.object({ name: z.string().min(4) }))
    .output(z.string())
    .query(({ input }) => `Hello, ${input.name}!`),
});

app.route({
  method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  url: '/*',
  async handler(req, reply) {
    const response = await serve(baseRouter).handleNodeRequest(req, {
      req,
      reply,
    });

    if (response === undefined) {
      reply.status(404).send('Not found.');
      return reply;
    }

    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    reply.status(response.status);

    reply.send(response.body);
  },
});

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
