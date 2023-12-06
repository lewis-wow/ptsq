import { createServer } from '@ptsq/server';
import express, { Request, Response } from 'express';
import { z } from 'zod';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => ({
  req,
  res,
});

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const serializableResolver = resolver.serialization(
  z.date().transform((arg) => arg.toISOString()),
);

const q = serializableResolver.output(z.date()).query((_) => new Date());

const baseRouter = router({
  greetings: q,
});

app.use((req, res) => serve(baseRouter).handleNodeRequest(req, { req, res }));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
