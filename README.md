# ptsq

Public type-safe query

[![codecov](https://codecov.io/gh/lewis-wow/ptsq/graph/badge.svg?token=18BSO2G62X)](https://codecov.io/gh/lewis-wow/ptsq)

## Installation

```bash
npm i @ptsq/server
```

```bash
npm i @ptsq/client
```

```bash
npm i -D @ptsq/introspection-cli
```

```ts title="server.ts"
import { ptsq, Type } from '@ptsq/server';
import express, { Request, Response } from 'express';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => ({
  req,
  res,
});

const { resolver, router, serve } = ptsq({
  ctx: createContext,
}).create();

const testQuery = resolver
  .args(Type.Object({ name: Type.String() }))
  .output(Type.String())
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
