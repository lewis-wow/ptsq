import { createServer, PtsqErrorCode } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createProxyClient } from './createProxyClient';
import { PtsqClientError } from './ptsqClientError';
import { PtsqLink } from './ptsqLink';

test('Should create simple http server with proxy client', async () => {
  let wasLinkCalled = false;

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

  const link = new PtsqLink(async ({ meta, forward }) => {
    expect(meta).toStrictEqual({
      route: 'test',
      type: 'query',
      input: { name: 'John' },
    });

    const response = await forward();

    expect(response).toStrictEqual({
      ok: true,
      data: 'John',
    });

    wasLinkCalled = true;

    return response;
  });

  const client = createProxyClient<typeof baseRouter>({
    url,
    links: [link],
  });

  const response = await client.test.query({
    name: 'John',
  });

  expect(response).toBe('John');

  expect(wasLinkCalled).toBe(true);

  await $disconnect();
});

test('Should create simple http server with proxy client and link that edits the input', async () => {
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

  const link = new PtsqLink(({ meta, forward }) => {
    return forward({
      ...meta,
      input: { name: 'Eva' },
    });
  });

  const client = createProxyClient<typeof baseRouter>({
    url,
    links: [link],
  });

  const response = await client.test.query({
    name: 'John',
  });

  expect(response).toBe('Eva');

  await $disconnect();
});

test('Should catch error inside link', async () => {
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

  const link = new PtsqLink(({ forward }) => {
    throw new Error('error');
    return forward();
  });

  const client = createProxyClient<typeof baseRouter>({
    url,
    links: [link],
  });

  await expect(
    client.test.query({
      name: 'John',
    }),
  ).rejects.toThrow(new Error('error'));

  await $disconnect();
});

test('Should catch PtsqClientError inside link', async () => {
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

  const link = new PtsqLink(({ forward }) => {
    throw new PtsqClientError({ code: PtsqErrorCode.GONE_410 });
    return forward();
  });

  const client = createProxyClient<typeof baseRouter>({
    url,
    links: [link],
  });

  await expect(
    client.test.query({
      name: 'John',
    }),
  ).rejects.toThrow(new PtsqClientError({ code: PtsqErrorCode.GONE_410 }));

  await $disconnect();
});
