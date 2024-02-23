import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { useCORS } from '@whatwg-node/server';
import axios from 'axios';
import { expect, test } from 'vitest';
import { PtsqError, PtsqErrorCode } from './ptsqError';
import { createServer } from './ptsqServerBuilder';

test('Should create server with 2 nested middlewares that runs before and after call', async () => {
  const serverMiddlewareState = {
    firstRequest: false,
    firstReponse: false,
    secondRequest: false,
    secondResponse: false,
  };

  const { resolver, router, serve } = createServer({
    plugins: [useCORS({ origin: '*' })],
  })
    .use(async ({ next }) => {
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: false,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      serverMiddlewareState.firstRequest = true;
      const response = await next();
      serverMiddlewareState.firstReponse = true;
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: true,
        secondRequest: true,
        secondResponse: true,
      });

      return response;
    })
    .use(async ({ next }) => {
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      serverMiddlewareState.secondRequest = true;
      const response = await next();
      serverMiddlewareState.secondResponse = true;
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: true,
        secondResponse: true,
      });

      return response;
    })
    .create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const response = await fetch({
    type: 'query',
    route: 'test',
  });

  expect(response.data).toBe('Hello');

  expect(serverMiddlewareState).toStrictEqual({
    firstRequest: true,
    firstReponse: true,
    secondRequest: true,
    secondResponse: true,
  });

  await $disconnect();
});

test('Should create server with middleware that runs before and after invalid route call, where the error is thrown by a router', async () => {
  let wasCheckedByMiddelware = false;

  const { resolver, router, serve } = createServer({
    plugins: [useCORS({ origin: '*' })],
  })
    .use(async ({ next }) => {
      const response = await next();

      expect(response).toStrictEqual({
        ok: false,
        error: new PtsqError({
          code: PtsqErrorCode.NOT_FOUND_404,
          message: 'The route was invalid.',
        }),
      });

      wasCheckedByMiddelware = true;

      return response;
    })
    .create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(
    fetch({
      route: 'dummy.route',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'The route was invalid.',
      },
    },
  });

  expect(wasCheckedByMiddelware).toBe(true);

  await $disconnect();
});

test('Should create server with middleware that runs before and after invalid type call, where the error is thrown by a router', async () => {
  let wasCheckedByMiddelware = false;

  const { resolver, router, serve } = createServer({
    plugins: [useCORS({ origin: '*' })],
  })
    .use(async ({ next }) => {
      const response = await next();

      expect(response).toStrictEqual({
        ok: false,
        error: new PtsqError({
          code: PtsqErrorCode.NOT_FOUND_404,
          message: `The route type is invalid, it should be query and it is mutation.`,
        }),
      });

      wasCheckedByMiddelware = true;

      return response;
    })
    .create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(
    fetch({
      route: 'test',
      type: 'mutation',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: `The route type is invalid, it should be query and it is mutation.`,
      },
    },
  });

  expect(wasCheckedByMiddelware).toBe(true);

  await $disconnect();
});

test('Should create server introspection', async () => {
  const { resolver, router, serve } = createServer({
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
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

test('Should not fetch server with wrong method', async () => {
  const { resolver, router, serve } = createServer({
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { $disconnect, url } = await createHttpTestServer(serve(baseRouter));

  await expect(axios.get(url)).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'Method GET is not allowed by Ptsq server.',
      },
    },
  });

  await $disconnect();
});

test('Should not fetch server introspection with wrong method', async () => {
  const { resolver, router, serve } = createServer({
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { $disconnect, url } = await createHttpTestServer(serve(baseRouter));

  await expect(axios.post(`${url}/introspection`)).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'Method POST is not allowed by Ptsq server.',
      },
    },
  });

  await $disconnect();
});

test('Should not fetch server introspection with wrong route', async () => {
  const { resolver, router, serve } = createServer({
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { $disconnect, url } = await createHttpTestServer(serve(baseRouter));

  await expect(axios.post(`${url}/wrong-route`)).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: `Http pathname ${
          new URL(url).pathname
        }/wrong-route is not supported by Ptsq server, supported are POST ${
          new URL(url).pathname
        } and GET ${new URL(url).pathname}/introspection.`,
      },
    },
  });

  await $disconnect();
});

test('Should create ptsq server and serve with bad body format', async () => {
  const { router, resolver, serve } = createServer().create();

  const baseRouter = router({
    a: resolver.output(Type.Null()).query(() => null),
  });

  const { $disconnect, fetch } = await createHttpTestServer(serve(baseRouter));

  await expect(fetch({})).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'Parsing request body failed.',
      },
    },
  });

  await expect(
    fetch({
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'Parsing request body failed.',
      },
    },
  });

  await expect(
    fetch({
      route: 'a',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'Parsing request body failed.',
      },
    },
  });

  await expect(
    fetch({
      route: 'a',
      input: {},
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'Parsing request body failed.',
      },
    },
  });

  await $disconnect();
});

test('Should create ptsq server and introspectate', async () => {
  const { router, resolver, serve } = createServer().create();

  const baseRouter = router({
    a: resolver.output(Type.Null()).query(() => null),
  });

  const { $disconnect, introspectate } = await createHttpTestServer(
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
                "a": {
                  "additionalProperties": false,
                  "properties": {
                    "_def": {
                      "additionalProperties": false,
                      "properties": {
                        "nodeType": {
                          "enum": [
                            "route",
                          ],
                          "type": "string",
                        },
                        "outputSchema": {
                          "type": "null",
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
                "a",
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