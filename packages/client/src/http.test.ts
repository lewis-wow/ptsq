import { PtsqServer, useCORS } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';

test('Should create simple http server', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
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

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const response = await fetch({
    route: 'test',
    type: 'query',
    input: {
      name: 'John',
    },
  });

  expect(response.data).toBe('John');

  await $disconnect();
});

test('Should create simple http server with context', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({
      number: 42 as const,
    }),
    plugins: [useCORS({ origin: '*' })],
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
          number: Type.Literal(42),
        }),
      )
      .query(({ input, ctx }) => ({
        ...input,
        ...ctx,
      })),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const response = await fetch({
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

  await $disconnect();
});

test('Should create simple http server with middleware', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({
      number: 42 as const,
    }),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
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

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const response = await fetch({
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

  await $disconnect();
});

test('Should create simple http server with 2 nested middlewares', async () => {
  const middlewareState = {
    firstStarted: false,
    firstEnded: false,
    secondStarted: false,
    secondEnded: false,
  };

  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({
      number: 42 as const,
    }),
    plugins: [useCORS({ origin: '*' })],
  }).create();

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
      .output(Type.Null())
      .query(() => null),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const response = await fetch({
    route: 'test',
    type: 'query',
  });

  expect(response.data).toBe(null);

  await $disconnect();
});

test('Should introspectate the server with http adapter', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
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

  const { introspectate, $disconnect } = await createHttpTestServer(
    serve(baseRouter),
  );

  const response = await introspectate();

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

  await $disconnect();
});

test('Should create simple http server and return BAD_REQUEST response', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
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

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      input: 'John',
      type: 'query',
    }),
  ).rejects.toMatchInlineSnapshot(
    '[AxiosError: Request failed with status code 400]',
  );

  await $disconnect();
});

test('Should create simple http server and return BAD_REQUEST response with bad resolver type', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => null),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      input: 'John',
      type: 'mutation',
    }),
  ).rejects.toMatchInlineSnapshot(
    '[AxiosError: Request failed with status code 400]',
  );

  await $disconnect();
});

test('Should create simple http server and return INTERNAL_SERVER_ERROR response', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
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

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(() =>
    fetch({
      route: 'test',
      input: { name: 'John' },
      type: 'query',
    }),
  ).rejects.toMatchInlineSnapshot(
    '[AxiosError: Request failed with status code 500]',
  );

  await $disconnect();
});
