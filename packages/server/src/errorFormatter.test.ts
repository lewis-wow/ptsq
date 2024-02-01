import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { useCORS } from '@whatwg-node/server';
import { expect, test } from 'vitest';
import { PtsqError } from './ptsqError';
import { PtsqServer } from './ptsqServer';

test('Should create server without error formatter and return the error', async () => {
  const { router, resolver, serve } = PtsqServer.init({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        message: 'message...',
        name: 'PtsqError',
      },
    },
  });

  await $disconnect();
});

test('Should create server without error formatter and return null as error', async () => {
  const { router, resolver, serve } = PtsqServer.init({
    ctx: () => ({}),
    errorFormatter: (_error) => new PtsqError({ code: 'BAD_REQUEST' }),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {},
    },
  });

  await $disconnect();
});

test('Should create server without error formatter and return custom object as error', async () => {
  const { router, resolver, serve } = PtsqServer.init({
    ctx: () => ({}),
    errorFormatter: (_error) =>
      new PtsqError({
        code: 'BAD_REQUEST',
        info: {
          a: 1,
          b: 2,
        },
      }),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        info: {
          a: 1,
          b: 2,
        },
      },
    },
  });

  await $disconnect();
});

test('Should create server with error formatter and return empty object on error', async () => {
  const { router, resolver, serve } = PtsqServer.init({
    ctx: () => ({}),
    errorFormatter: (_error) => new PtsqError({ code: 'BAD_REQUEST' }),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
      },
    },
  });

  await $disconnect();
});

test('Should create server with error formatter and keep the original error', async () => {
  const { router, resolver, serve } = PtsqServer.init({
    ctx: () => ({}),
    errorFormatter: (error) => error,
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        message: 'message...',
        name: 'PtsqError',
      },
    },
  });

  await $disconnect();
});

test('Should create server with error formatter and change the http error', async () => {
  const { router, resolver, serve } = PtsqServer.init({
    ctx: () => ({}),
    errorFormatter: (_error) =>
      new PtsqError({
        code: 'CONFLICT',
        message: 'Hello',
      }),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        message: 'Hello',
        name: 'PtsqError',
      },
    },
  });

  await $disconnect();
});

test('Should create server with error formatter and keep the original error with info', async () => {
  const { router, resolver, serve } = PtsqServer.init({
    ctx: () => ({}),
    errorFormatter: (error) =>
      new PtsqError({
        code: error.code,
        message: error.message,
        info: 'my info...',
      }),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        info: 'my info...',
        message: 'message...',
        name: 'PtsqError',
      },
    },
  });

  await $disconnect();
});
