import { z } from 'zod';
import { expect, test } from 'vitest';
import { httpAdapter } from './http';
import { createTestHttpServer } from '../__test__/createTestHttpServer';
import axios from 'axios';

test('Should create simple http server', async () => {
  await createTestHttpServer({
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

      return httpAdapter(serve({ router: baseRouter }));
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
  await createTestHttpServer({
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

      return httpAdapter(serve({ router: baseRouter }));
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
  await createTestHttpServer({
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

      return httpAdapter(serve({ router: baseRouter }));
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

  await createTestHttpServer({
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

      return httpAdapter(serve({ router: baseRouter }));
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
      });

      expect(response.data).toBe(null);
    },
  });
});

test('Should introspectate the server with http adapter', async () => {
  await createTestHttpServer({
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

      return httpAdapter(serve({ router: baseRouter }));
    },
    client: async (serverUrl) => {
      const response = await axios.get(`${serverUrl}/introspection`);

      expect(response.data).toMatchInlineSnapshot(`
        {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": false,
          "properties": {
            "nodeType": {
              "enum": [
                "router",
              ],
              "type": "string",
            },
            "routes": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "test": {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "additionalProperties": false,
                  "properties": {
                    "args": {
                      "additionalProperties": false,
                      "properties": {
                        "name": {
                          "type": "string",
                        },
                      },
                      "required": [
                        "name",
                      ],
                      "type": "object",
                    },
                    "nodeType": {
                      "enum": [
                        "route",
                      ],
                      "type": "string",
                    },
                    "output": {
                      "type": "string",
                    },
                    "type": {
                      "enum": [
                        "query",
                      ],
                      "type": "string",
                    },
                  },
                  "required": [
                    "type",
                    "nodeType",
                    "args",
                    "output",
                  ],
                  "title": "BaseTestRoute",
                  "type": "object",
                },
              },
              "required": [
                "test",
              ],
              "type": "object",
            },
          },
          "required": [
            "nodeType",
            "routes",
          ],
          "title": "BaseRouter",
          "type": "object",
        }
      `);
    },
  });
});
