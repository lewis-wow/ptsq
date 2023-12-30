import { createTestHttpServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import axios from 'axios';
import { expect, test } from 'vitest';

test('Should create simple http server', async () => {
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
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        type: 'query',
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
    ctx: () => ({
      number: 42 as const,
    }),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            Type.Object({
              name: Type.String(),
            }),
          )
          .output(
            Type.Object({
              name: Type.String(),
              number: Type.Literal(42),
            }),
          )
          .query(({ input, ctx }) => ({
            ...input,
            ...ctx,
          })),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        type: 'query',
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
    ctx: () => ({
      number: 42 as const,
    }),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            Type.Object({
              name: Type.String(),
            }),
          )
          .use(({ input, ctx, next }) => next({ ...ctx, ...input }))
          .output(
            Type.Object({
              name: Type.String(),
              number: Type.Literal(42),
            }),
          )
          .query(({ ctx }) => ctx),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        type: 'query',
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
    ctx: () => ({
      number: 42 as const,
    }),
    server: ({ resolver, router }) => {
      return router({
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
          .output(Type.Null())
          .query(() => null),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        type: 'query',
      });

      expect(response.data).toBe(null);
    },
  });
});

test('Should introspectate the server with http adapter', async () => {
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
    client: async (serverUrl) => {
      const response = await axios.get(`${serverUrl}/introspection`);

      expect(response.data).toMatchInlineSnapshot(`
        {
          "$schema": "https://json-schema.org/draft/2019-09/schema#",
          "additionalProperties": false,
          "properties": {
            "_def": {
              "additionalProperties": false,
              "properties": {
                "nodeType": {
                  "enum": [
                    "router",
                  ],
                  "type": "string",
                },
                "routes": {
                  "additionalProperties": false,
                  "properties": {
                    "test": {
                      "additionalProperties": false,
                      "properties": {
                        "_def": {
                          "additionalProperties": false,
                          "properties": {
                            "argsSchema": {
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
                            "outputSchema": {
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
                            "argsSchema",
                            "outputSchema",
                            "description",
                          ],
                          "type": "object",
                        },
                      },
                      "required": [
                        "_def",
                      ],
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
              "type": "object",
            },
          },
          "required": [
            "_def",
          ],
          "title": "BaseRouter",
          "type": "object",
        }
      `);
    },
  });
});

test('Should create simple http server and return BAD_REQUEST response', async () => {
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
    client: async (serverUrl) => {
      await expect(() =>
        axios.post(serverUrl, {
          route: 'test',
          input: 'John',
          type: 'query',
        }),
      ).rejects.toMatchInlineSnapshot(
        '[AxiosError: Request failed with status code 400]',
      );
    },
  });
});

test('Should create simple http server and return BAD_REQUEST response with bad resolver type', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver.output(Type.Null()).query(() => null),
      });
    },
    client: async (serverUrl) => {
      await expect(() =>
        axios.post(serverUrl, {
          route: 'test',
          input: 'John',
          type: 'mutation',
        }),
      ).rejects.toMatchInlineSnapshot(
        '[AxiosError: Request failed with status code 400]',
      );
    },
  });
});

test('Should create simple http server and return INTERNAL_SERVER_ERROR response', async () => {
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
          .query(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error - just for test!
            ({ input }) => input,
          ),
      });
    },
    client: async (serverUrl) => {
      await expect(() =>
        axios.post(serverUrl, {
          route: 'test',
          input: { name: 'John' },
          type: 'query',
        }),
      ).rejects.toMatchInlineSnapshot(
        '[AxiosError: Request failed with status code 500]',
      );
    },
  });
});
