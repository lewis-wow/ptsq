import type { IncomingMessage, ServerResponse } from 'http';
import { createServer } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createProxyClient } from './createProxyClient';
import { UndefinedAction } from './undefinedAction';

type HttpAdapterContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

test('Should create simple http server with proxy client', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();
  
  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(
        Type.Object({
          name: Type.String(),
          age: Type.Number(),
          address: Type.Object({
            street: Type.String(),
            number: Type.Number(),
          }),
        }),
      )
      .query(({ input }) => ({ ...input, age: 17 }) as any),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  const response = await client.test.query({
    __args: {
      name: 'John',
    },
    name: true,
    address: {
      street: true,
    },
    }
  });

  expect(response).toBe('John');

  await $disconnect();
});

test('Should create simple http server with proxy client and request bad route', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(Type.String())
      .query(({ input }) => input.name),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  /* eslint-disable */
  await expect(() =>
    // @ts-expect-error - just for test
    client.test.test.query({
      name: 'John',
    }),
  ).rejects.toMatchInlineSnapshot(
    '[PtsqClientError: The route continues, but should be terminated by query or mutate.]',
  );

  await $disconnect();
});

test('Should create simple http server with proxy client and request bad route', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(Type.String())
      .query(({ input }) => input.name),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  // eslint-disable
  await expect(() =>
    // @ts-expect-error - just for test
    client.badRoute.query({
      name: 'John',
    }),
  ).rejects.toMatchInlineSnapshot('[PtsqClientError: The route was invalid.]');

  await $disconnect();
});

test('Should create simple http server with proxy client and creates request with bad resolver type', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(Type.String())
      .query(({ input }) => input.name),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  await expect(() =>
    // @ts-expect-error - should be query, not mutate (Just for test!)
    client.test.mutate({
      name: 'John',
    }),
  ).rejects.toMatchInlineSnapshot(
    '[PtsqClientError: The route type is invalid, it should be query and it is mutation.]',
  );

  await $disconnect();
});

test('Should create simple http server with proxy client without query input', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello world!'),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  const response = await client.test.query();

  expect(response).toBe('Hello world!');

  await $disconnect();
});

test('Should create simple http server with proxy client without mutation input', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.String()).mutation(() => 'Hello world!'),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  const response = await client.test.mutate();

  expect(response).toBe('Hello world!');

  await $disconnect();
});

test('Should create simple http server with Authorization header', async () => {
  const { resolver, router, serve } = createServer({
    ctx: ({ req }: HttpAdapterContext) => ({
      auth: req.headers.authorization,
    }),
  }).create();

  const baseRouter = router({
    test: resolver
      .output(Type.String())
      .query(({ ctx }) => `Hello ${ctx.auth ?? '!NOPE!'}!`),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url: url,
    fetch: (input, init) => {
      return fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: 'John',
        },
      });
    },
  });

  const response = await client.test.query();

  expect(response).toBe('Hello John!');

  await $disconnect();
});

test('Should create simple http server with proxy client and creates request with bad action type that should be catched on client', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(Type.String())
      .description('Description...')
      .query(({ input }) => input.name),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  expect(() =>
    // @ts-expect-error - should be query or mutate (Just for test!)
    client.test.method({
      name: 'John',
    }),
  ).toThrowError(new TypeError('This action is not defined.'));

  await $disconnect();
});

test('Should not create proxy client without any action', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(Type.String())
      .query(({ input }) => input.name),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  // @ts-expect-error - test purposes
  expect(() => client()).toThrow(new UndefinedAction());

  await $disconnect();
});
