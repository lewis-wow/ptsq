import { createServer, HTTPError } from '@ptsq/server';
import { middleware } from '@ptsq/server/src/middleware';
import express, { Request, Response } from 'express';
import { z } from 'zod';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => {
  const user = 'user' as 'user' | 'admin' | undefined;

  return {
    req,
    res,
    user,
  };
};

const f = middleware()(({ next }) => {
  return next({
    a: 1,
  });
});

const isDev = true;

const { router, resolver, serve } = createServer({
  ctx: createContext,
  errorFormatter: (error) => (isDev ? error.toJSON() : null),
});

resolver.use(f);

const authedResolver = resolver.use(({ ctx, next }) => {
  if (!ctx.user) throw new HTTPError({ code: 'UNAUTHORIZED' });

  return next({
    ...ctx,
    user: ctx.user,
  });
});

const adminResolver = authedResolver.use(({ ctx, next }) => {
  if (ctx.user !== 'admin') throw new HTTPError({ code: 'UNAUTHORIZED' });

  return next({
    ...ctx,
    user: ctx.user,
  });
});

const greetingsQuery = adminResolver
  .description('Uploads a file to CDN.')
  .output(z.string())
  .attachment({
    fileSize: 1000000,
    files: 10,
    fieldSize: 1000000,
    resolve: () => '',
  });

const baseRouter = router({
  greetings: greetingsQuery,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
