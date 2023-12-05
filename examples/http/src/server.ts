import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse,
} from 'http';
import { createServer } from '@ptsq/server';
import { z } from 'zod';

const { router, resolver, serve } = createServer({
  ctx: ({ req, res }: { req: IncomingMessage; res: ServerResponse }) => {
    console.log(req, res);
    return {
      req,
      res,
    };
  },
});

const baseRouter = router({
  greetings: resolver.args(z.object({ name: z.string().min(4) })).query({
    output: z.string(),
    resolve: ({ input }) => `Hello, ${input.name}!`,
  }),
});

const app = createHttpServer((req, res) =>
  serve(baseRouter)(req, res, {
    req,
    res,
  }),
);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
