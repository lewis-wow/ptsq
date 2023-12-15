import { createHTTPTest } from './__test__/createHTTPTest';
import axios from 'axios';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { createServer } from './createServer';
import { HTTPError } from './httpError';

test('Should create server with error formatter and return empty object on error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (_error) => ({}),
  });

  const baseRouter = router({
    test: resolver.output(z.null()).query(() => {
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  await createHTTPTest({
    serve: serve(baseRouter),
    client: async (address) => {
      await axios
        .post(address, {
          route: 'test',
          type: 'query',
        })
        .catch((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.response.data).toStrictEqual({});
        });
    },
  });
});

test('Should create server with error formatter to response with null', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (_error) => null,
  });

  const baseRouter = router({
    test: resolver.output(z.null()).query(() => {
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  await createHTTPTest({
    serve: serve(baseRouter),
    client: async (address) => {
      await axios
        .post(address, {
          route: 'test',
          type: 'query',
        })
        .catch((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.response.data).toBe(null);
        });
    },
  });
});

test('Should create server with error formatter and keep the original error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (error) => error,
  });

  const baseRouter = router({
    test: resolver.output(z.null()).query(() => {
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  await createHTTPTest({
    serve: serve(baseRouter),
    client: async (address) => {
      await axios
        .post(address, {
          route: 'test',
          type: 'query',
        })
        .catch((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.response.data).toStrictEqual({
            code: 'BAD_REQUEST',
            message: 'message...',
            name: '_HTTPError',
          });
        });
    },
  });
});

test('Should create server with error formatter and change the http error', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (_error) =>
      new HTTPError({
        code: 'CONFLICT',
      }),
  });

  const baseRouter = router({
    test: resolver.output(z.null()).query(() => {
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  await createHTTPTest({
    serve: serve(baseRouter),
    client: async (address) => {
      await axios
        .post(address, {
          route: 'test',
          type: 'query',
        })
        .catch((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.response.data).toStrictEqual({
            code: 'CONFLICT',
            message: '',
            name: '_HTTPError',
          });
        });
    },
  });
});

test('Should create server with error formatter and keep the original error with info', async () => {
  const { router, resolver, serve } = createServer({
    ctx: () => ({}),
    errorFormatter: (error) =>
      new HTTPError({
        ...error,
        info: 'my info...',
      }),
  });

  const baseRouter = router({
    test: resolver.output(z.null()).query(() => {
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'message...' });
    }),
  });

  await createHTTPTest({
    serve: serve(baseRouter),
    client: async (address) => {
      await axios
        .post(address, {
          route: 'test',
          type: 'query',
        })
        .catch((error) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.response.data).toStrictEqual({
            code: 'BAD_REQUEST',
            info: 'my info...',
            message: '',
            name: '_HTTPError',
          });
        });
    },
  });
});
