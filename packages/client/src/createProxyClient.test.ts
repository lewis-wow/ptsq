import type { IncomingMessage, ServerResponse } from 'http';
import { createTestHttpServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createProxyClient } from './createProxyClient';

type HttpAdapterContext = {
  req: IncomingMessage;
  res: ServerResponse;
};

test('Should create simple http server with proxy client', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            Type.Object({
              name: Type.String(),
            }),
          )
          .output(Type.String())
          .query(({ input }) => input.name),
      });
    },
    client: async (serverUrl, router) => {
      const client = createProxyClient<typeof router>({
        url: serverUrl,
      });

      const response = await client.test.query({
        name: 'John',
      });

      expect(response).toBe('John');
    },
  });
});

test('Should create simple http server with proxy client and request bad route', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            Type.Object({
              name: Type.String(),
            }),
          )
          .output(Type.String())
          .query(({ input }) => input.name),
      });
    },
    client: async (serverUrl, router) => {
      const client = createProxyClient<typeof router>({
        url: serverUrl,
      });

      /* eslint-disable */
      await expect(() =>
        // @ts-expect-error - just for test
        client.test.test.query({
          name: 'John',
        }),
      ).rejects.toMatchInlineSnapshot(
        '[AxiosError: Request failed with status code 400]',
      );
    },
  });
});

test('Should create simple http server with proxy client and request bad route', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            Type.Object({
              name: Type.String(),
            }),
          )
          .output(Type.String())
          .query(({ input }) => input.name),
      });
    },
    client: async (serverUrl, router) => {
      const client = createProxyClient<typeof router>({
        url: serverUrl,
      });

      // eslint-disable
      await expect(() =>
        // @ts-expect-error - just for test
        client.badRoute.query({
          name: 'John',
        }),
      ).rejects.toMatchInlineSnapshot(
        '[AxiosError: Request failed with status code 400]',
      );
    },
  });
});

test('Should create simple http server with proxy client without query input', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver.output(Type.String()).query(() => 'Hello world!'),
      });
    },
    client: async (serverUrl, router) => {
      const client = createProxyClient<typeof router>({
        url: serverUrl,
      });

      const response = await client.test.query();

      expect(response).toBe('Hello world!');
    },
  });
});

test('Should create simple http server with proxy client without mutation input', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver.output(Type.String()).mutation(() => 'Hello world!'),
      });
    },
    client: async (serverUrl, router) => {
      const client = createProxyClient<typeof router>({
        url: serverUrl,
      });

      const response = await client.test.mutate();

      expect(response).toBe('Hello world!');
    },
  });
});

test('Should create simple http server with Authorization header', async () => {
  await createTestHttpServer({
    ctx: ({ req }: HttpAdapterContext) => ({
      auth: req.headers.authorization,
    }),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .output(Type.String())
          .query(({ ctx }) => `Hello ${ctx.auth ?? '!NOPE!'}!`),
      });
    },
    client: async (serverUrl, router) => {
      const client = createProxyClient<typeof router>({
        url: serverUrl,
        headers: () => {
          return {
            Authorization: 'John',
          };
        },
      });

      const response = await client.test.query();

      expect(response).toBe('Hello John!');
    },
  });
});
