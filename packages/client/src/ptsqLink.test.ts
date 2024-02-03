import { PtsqServer } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createProxyClient } from './createProxyClient';
import { PtsqLink } from './ptsqLink';

test('Should create simple http server with proxy client', async () => {
  let wasLinkCalled = false;

  const { resolver, router, serve } = PtsqServer.init({
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
  const { resolver, router, serve } = PtsqServer.init({
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
