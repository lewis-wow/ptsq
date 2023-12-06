# ptsq

Public type-safe query

## npm

```bash
npm i @ptsq/server
```

```bash
npm i @ptsq/client
```

```bash
npm i -D @ptsq/introspection-cli
```

## yarn

```bash
yarn add @ptsq/server
```

```bash
yarn add @ptsq/client
```

```bash
yarn add -D @ptsq/introspection-cli
```

```ts title="server.ts"
import { createServer, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const createContext = ({ req, res }: ExpressAdapterContext) => ({
  req,
  res,
});

const { resolver, router, serve } = createServer({
  ctx: createContext,
});

const testQuery = resolver
  .args(z.object({ name: z.string() }))
  .output(z.string())
  .query(
    async ({
      ctx /* { req: express.Request, res: express.Response } */,
      input /* { name: string } */,
    }) => {
      return `Hello, ${input.name}`;
    },
  );

const baseRouter = router({
  test: testQuery,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000);
```

```ts title="client.ts"
import { createProxyClient } from '@ptsq/client';
import type { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq/',
});

const result /* string */ = await client.test.query({
  name: /* string */ 'John',
});
```

```ts title="remote-client.ts"
import { createProxyClient } from '@ptsq/client';
import type { BaseRouter } from './introspected-schema';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq/',
});

const result /* string */ = await client.test.query({
  name: /* string */ 'John',
});
```
