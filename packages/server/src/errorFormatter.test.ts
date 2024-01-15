import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { PtsqError } from './ptsqError';

test('Should create server without error formatter and return the error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        message: 'message...',
        name: '_PtsqError',
      },
    },
  });
});

test('Should create server without error formatter and return null as error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (_error) => null,
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: null,
    },
  });
});

test('Should create server without error formatter and return custom object as error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (_error) => ({
      a: 1,
      b: 2,
    }),
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        a: 1,
        b: 2,
      },
    },
  });
});

test('Should create server with error formatter and return empty object on error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (_error) => ({}),
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch } = await createHttpTestServer(serve(baseRouter));

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
});

test('Should create server with error formatter and keep the original error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (error) => error,
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        message: 'message...',
        name: '_PtsqError',
      },
    },
  });
});

test('Should create server with error formatter and change the http error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (_error) =>
      new PtsqError({
        code: 'CONFLICT',
        message: 'Hello',
      }),
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        message: 'Hello',
        name: '_PtsqError',
      },
    },
  });
});

test('Should create server with error formatter and keep the original error with info', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (error) =>
      new PtsqError({
        ...error,
        info: 'my info...',
      }),
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => {
      throw new PtsqError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  const { fetch } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        info: 'my info...',
        name: '_PtsqError',
      },
    },
  });
});
