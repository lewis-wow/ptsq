import fastify from 'fastify';
import { ptsqEndpoint, serve } from './ptsq';
import { baseRouter } from './routers';

const app = fastify();

/**
 * We pass the incoming HTTP request to our adapter
 * and handle the response using Fastify's `reply` API
 * Learn more about `reply` https://www.fastify.io/docs/latest/Reply/
 **/
app.route({
  url: `/${ptsqEndpoint}`,
  method: ['GET', 'POST', 'OPTIONS'],
  handler: async (req, reply) => {
    const response = await serve(baseRouter).handleNodeRequestAndResponse(
      req,
      reply,
    );

    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    reply.status(response.status);

    // Fastify doesn't accept `null` as a response body
    reply.send(response.body || undefined);

    return reply;
  },
});

app.listen({ port: 4000 }).then(() => {
  console.log(`Listening on: http://localhost:4000/${ptsqEndpoint}`);
});

export type BaseRouter = typeof baseRouter;
