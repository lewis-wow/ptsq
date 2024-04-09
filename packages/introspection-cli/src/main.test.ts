import { ptsq, Type, useCORS } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { expect, test } from 'vitest';

test('Should instropectate simple http server', async () => {
  const { resolver, router, serve } = ptsq({
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
      "nodeType": "router",
      "routes": {
        "test": {
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
          "nodeType": "route",
          "outputSchema": {
            "type": "string",
          },
          "type": "query",
        },
      },
    }
  `);

  await $disconnect();
});

test('Should instropectate simple http server with empty query', async () => {
  const { resolver, router, serve } = ptsq({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => null),
  });

  const { introspectate, $disconnect } = await createHttpTestServer(
    serve(baseRouter),
  );

  const response = await introspectate();

  expect(response.data).toMatchInlineSnapshot(`
    {
      "nodeType": "router",
      "routes": {
        "test": {
          "nodeType": "route",
          "outputSchema": {
            "type": "null",
          },
          "type": "query",
        },
      },
    }
  `);

  await $disconnect();
});

test('Should instropectate simple http server with nested routers', async () => {
  const { resolver, router, serve } = ptsq({
    ctx: () => ({}),
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: router({
      test: router({
        test: router({
          test: router({
            test: router({
              test: router({
                test: resolver.output(Type.Null()).query(() => null),
              }),
            }),
          }),
        }),
      }),
    }),
  });

  const { introspectate, $disconnect } = await createHttpTestServer(
    serve(baseRouter),
  );

  const response = await introspectate();

  expect(response.data).toMatchInlineSnapshot(`
    {
      "nodeType": "router",
      "routes": {
        "test": {
          "nodeType": "router",
          "routes": {
            "test": {
              "nodeType": "router",
              "routes": {
                "test": {
                  "nodeType": "router",
                  "routes": {
                    "test": {
                      "nodeType": "router",
                      "routes": {
                        "test": {
                          "nodeType": "router",
                          "routes": {
                            "test": {
                              "nodeType": "router",
                              "routes": {
                                "test": {
                                  "nodeType": "route",
                                  "outputSchema": {
                                    "type": "null",
                                  },
                                  "type": "query",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  `);

  await $disconnect();
});
