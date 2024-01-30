import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { PtsqError } from './ptsqError';
import { PtsqServer } from './ptsqServer';
import { Router } from './router';

test('Should merge two routers', async () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);

  const routerA = router({
    a: query,
  });

  const routerB = router({
    b: query,
  });

  const mergedRouter = Router.merge(routerA, routerB);

  expect(
    await mergedRouter.call({
      route: ['a'],
      index: 0,
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'a',
        type: 'query',
      },
    }),
  ).toStrictEqual({
    ctx: {},
    data: null,
    ok: true,
  });

  expect(
    await mergedRouter.call({
      route: ['b'],
      index: 0,
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'b',
        type: 'query',
      },
    }),
  ).toStrictEqual({
    ctx: {},
    data: null,
    ok: true,
  });
});

test('Should merge two routers deeply', async () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);

  const routerA = router({
    a: router({
      b: query,
    }),
  });

  const routerB = router({
    c: router({
      d: query,
    }),
  });

  const mergedRouter = Router.merge(routerA, routerB);

  expect(
    await mergedRouter.call({
      route: ['a', 'b'],
      index: 0,
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'a.b',
        type: 'query',
      },
    }),
  ).toStrictEqual({
    ctx: {},
    data: null,
    ok: true,
  });

  expect(
    await mergedRouter.call({
      route: ['c', 'd'],
      index: 0,
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'c.d',
        type: 'query',
      },
    }),
  ).toStrictEqual({
    ctx: {},
    data: null,
    ok: true,
  });
});

test('Should merge two routers with overwrite', async () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);
  const mutation = resolver.output(Type.Null()).mutation(() => null);

  const routerA = router({
    a: query,
  });

  const routerB = router({
    a: mutation,
  });

  const mergedRouter = Router.merge(routerA, routerB);

  expect(
    await mergedRouter.call({
      route: ['a'],
      index: 0,
      ctx: {},
      type: 'mutation',
      meta: {
        input: undefined,
        route: 'a',
        type: 'mutation',
      },
    }),
  ).toStrictEqual({
    ctx: {},
    data: null,
    ok: true,
  });
});

test('Should not call wrong route', async () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);

  const baseRouter = router({
    a: query,
  });

  await expect(
    baseRouter.call({
      route: ['wrong', 'route'],
      index: 0,
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'wrong.route',
        type: 'query',
      },
    }),
  ).rejects.toThrowError(
    new PtsqError({ code: 'NOT_FOUND', message: 'The route was invalid.' }),
  );
});

test('Should not call wrong method', async () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);

  const baseRouter = router({
    a: query,
  });

  await expect(
    baseRouter.call({
      route: ['a'],
      index: 0,
      ctx: {},
      type: 'mutation',
      meta: {
        input: undefined,
        route: 'a',
        type: 'mutation',
      },
    }),
  ).rejects.toThrowError(
    new PtsqError({
      code: 'BAD_REQUEST',
      message:
        'The route type is invalid, it should be query and it is mutation.',
    }),
  );
});

test('Should not call if route excess correct route path', async () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);

  const baseRouter = router({
    a: query,
  });

  await expect(
    baseRouter.call({
      route: ['a', 'b'],
      index: 0,
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'a.b',
        type: 'query',
      },
    }),
  ).rejects.toThrowError(
    new PtsqError({
      code: 'NOT_FOUND',
      message:
        'The route continues, but should be terminated by query or mutate.',
    }),
  );
});

test('Should not call if route not fit correct route path', async () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);

  const baseRouter = router({
    a: router({
      b: query,
    }),
  });

  await expect(
    baseRouter.call({
      route: ['a'],
      index: 0,
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'a',
        type: 'query',
      },
    }),
  ).rejects.toThrowError(
    new PtsqError({
      code: 'NOT_FOUND',
      message:
        'The route was terminated by query or mutate but should continue.',
    }),
  );
});

test('Should merge two routers and get json schema', () => {
  const { router, resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const query = resolver.output(Type.Null()).query(() => null);

  const routerA = router({
    a: query,
  });

  const routerB = router({
    b: query,
  });

  const mergedRouter = Router.merge(routerA, routerB);

  expect(mergedRouter.getJsonSchema()).toMatchInlineSnapshot(`
    {
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
                        "argsSchema": undefined,
                        "description": undefined,
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
                "b": {
                  "additionalProperties": false,
                  "properties": {
                    "_def": {
                      "additionalProperties": false,
                      "properties": {
                        "argsSchema": undefined,
                        "description": undefined,
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
                "b",
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
      "type": "object",
    }
  `);
});
