# ptsq

Public type-safe query

```ts title="server.ts"
import { createServer, expressAdapter, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const createContext = ({ req, res }: ExpressAdapterContext) => ({
  req,
  res,
});

const { middleware, resolver, router, serve } = createServer({
  ctx: createContext,
});

const testQuery = resolver.query({
  input: z.object({ name: z.string() }),
  resolve: async ({ ctx /* { req: express.Request, res: express.Response } */, input /* { name: string } */ }) => {
    return `Hello, ${input.name}`;
  },
});

const baseRouter = router({
  test: testQuery,
});

app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

app.listen(4000);
```

```ts title="client.ts"
import { createProxyClient } from '@ptsq/client';
import type { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq/',
});

const result = await client.test.query({
  name: /* string */ 'John',
});
```
