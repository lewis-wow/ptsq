import { z } from 'zod';
import { expect, test } from 'vitest';
import axios from 'axios';
import { createTestExpressServer } from '../__test__/createTestExpressServer';
import { expressAdapter } from './express';

test('Should create simple http server', async () => {
  await createTestExpressServer({
    ctx: {},
    server: ({ resolver, router, serve }) => {
      const baseRouter = router({
        test: resolver
          .args(
            z.object({
              name: z.string(),
            })
          )
          .query({
            output: z.string(),
            resolve: ({ input }) => input.name,
          }),
      });

      return expressAdapter(serve({ router: baseRouter }));
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        input: {
          name: 'John',
        },
      });

      expect(response.data).toBe('John');
    },
  });
});

test('Should create simple http server with context', async () => {
  await createTestExpressServer({
    ctx: {
      number: 42 as const,
    },
    server: ({ resolver, router, serve }) => {
      const baseRouter = router({
        test: resolver
          .args(
            z.object({
              name: z.string(),
            })
          )
          .query({
            output: z.object({
              name: z.string(),
              number: z.literal(42),
            }),
            resolve: ({ input, ctx }) => ({
              ...input,
              ...ctx,
            }),
          }),
      });

      return expressAdapter(serve({ router: baseRouter }));
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        input: {
          name: 'John',
        },
      });

      expect(response.data).toStrictEqual({
        name: 'John',
        number: 42,
      });
    },
  });
});

test('Should create simple http server with middleware', async () => {
  await createTestExpressServer({
    ctx: {
      number: 42 as const,
    },
    server: ({ resolver, router, serve }) => {
      const baseRouter = router({
        test: resolver
          .args(
            z.object({
              name: z.string(),
            })
          )
          .use(({ input, ctx, next }) => next({ ...ctx, ...input }))
          .query({
            output: z.object({
              name: z.string(),
              number: z.literal(42),
            }),
            resolve: ({ ctx }) => ctx,
          }),
      });

      return expressAdapter(serve({ router: baseRouter }));
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        input: {
          name: 'John',
        },
      });

      expect(response.data).toStrictEqual({
        name: 'John',
        number: 42,
      });
    },
  });
});

test('Should create simple http server with 2 nested middlewares', async () => {
  const middlewareState = {
    firstStarted: false,
    firstEnded: false,
    secondStarted: false,
    secondEnded: false,
  };

  await createTestExpressServer({
    ctx: {
      number: 42 as const,
    },
    server: ({ resolver, router, serve }) => {
      const baseRouter = router({
        test: resolver
          .use(async ({ ctx, next }) => {
            expect(middlewareState).toStrictEqual({
              firstStarted: false,
              firstEnded: false,
              secondStarted: false,
              secondEnded: false,
            });

            middlewareState.firstStarted = true;
            const result = await next(ctx);
            middlewareState.firstEnded = true;

            expect(middlewareState).toStrictEqual({
              firstStarted: true,
              firstEnded: true,
              secondStarted: true,
              secondEnded: true,
            });

            return result;
          })
          .use(async ({ ctx, next }) => {
            expect(middlewareState).toStrictEqual({
              firstStarted: true,
              firstEnded: false,
              secondStarted: false,
              secondEnded: false,
            });

            middlewareState.secondStarted = true;
            const result = await next(ctx);
            middlewareState.secondEnded = true;

            expect(middlewareState).toStrictEqual({
              firstStarted: true,
              firstEnded: false,
              secondStarted: true,
              secondEnded: true,
            });

            return result;
          })
          .query({
            output: z.null(),
            resolve: () => null,
          }),
      });

      return expressAdapter(serve({ router: baseRouter }));
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
      });

      expect(response.data).toBe(null);
    },
  });
});
