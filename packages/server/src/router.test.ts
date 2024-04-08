import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { PtsqError } from './ptsqError';
import { ptsq } from './ptsqServerBuilder';
import { Router } from './router';

test('Should merge two routers', async () => {
  const { router, resolver } = ptsq({
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
    data: null,
    ok: true,
  });
});

test('Should merge two routers deeply', async () => {
  const { router, resolver } = ptsq({
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
    data: null,
    ok: true,
  });
});

test('Should merge two routers with overwrite', async () => {
  const { router, resolver } = ptsq({
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

  const t = await mergedRouter.call({
    route: ['a'],
    index: 0,
    ctx: {},
    type: 'mutation',
    meta: {
      input: undefined,
      route: 'a',
      type: 'mutation',
    },
  });

  console.log(t);

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
    data: null,
    ok: true,
  });
});

test('Should not call wrong route', async () => {
  const { router, resolver } = ptsq({
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
    new PtsqError({
      code: 'NOT_FOUND',
      message: 'The route was invalid.',
    }),
  );
});

test('Should not call wrong method', async () => {
  const { router, resolver } = ptsq({
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
  const { router, resolver } = ptsq({
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
  const { router, resolver } = ptsq({
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
  const { router, resolver } = ptsq({
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

test('Should create server side caller with query on router', async () => {
  const { router, resolver } = ptsq({
    ctx: () => ({}),
  }).create();

  const query = resolver
    .args(Type.String())
    .output(Type.String())
    .query(({ input }) => `Hello ${input}`);

  const baseRouter = router({
    a: query,
  });

  const caller = Router.serverSideCaller(baseRouter).create({});

  expect(await caller.a.query('John')).toBe('Hello John');
});

test('Should create server side caller with query on router with transformation', async () => {
  const { router, resolver } = ptsq({
    ctx: () => ({}),
  }).create();

  const URLSchema = Type.Transform(Type.String())
    .Decode((value) => new URL(value))
    .Encode((value) => value.toString());

  const query = resolver
    .args(
      Type.Object({
        url: URLSchema,
      }),
    )
    .output(URLSchema)
    .query(({ input }) => {
      input.url.searchParams.set('test', 'test');

      return input.url;
    });

  const baseRouter = router({
    a: query,
  });

  const caller = Router.serverSideCaller(baseRouter).create({});

  expect(
    await caller.a.query({
      url: 'http://localhost:4000',
    }),
  ).toBe('http://localhost:4000/?test=test');
});

test('Should create server side caller with mutation on router', async () => {
  const { router, resolver } = ptsq({
    ctx: () => ({}),
  }).create();

  const mutation = resolver
    .args(Type.String())
    .output(Type.String())
    .mutation(({ input }) => `Hello ${input}`);

  const baseRouter = router({
    a: mutation,
  });

  const caller = Router.serverSideCaller(baseRouter).create({});

  expect(await caller.a.mutate('John')).toBe('Hello John');
});

test('Should create server side caller with query on router and throw PtsqError', async () => {
  const { router, resolver } = ptsq({
    ctx: () => ({}),
  }).create();

  const query = resolver
    .args(Type.String())
    .output(Type.String())
    .query(({ input }) => {
      throw new PtsqError({ code: 'BAD_REQUEST' });

      return `Hello ${input}`;
    });

  const baseRouter = router({
    a: query,
  });

  const caller = Router.serverSideCaller(baseRouter).create({});

  await expect(caller.a.query('John')).rejects.toThrowError(
    new PtsqError({ code: 'BAD_REQUEST' }),
  );
});

test('Should create server side caller with mutation on router and throw PtsqError', async () => {
  const { router, resolver } = ptsq({
    ctx: () => ({}),
  }).create();

  const mutation = resolver
    .args(Type.String())
    .output(Type.String())
    .mutation(({ input }) => {
      throw new PtsqError({ code: 'BAD_REQUEST' });

      return `Hello ${input}`;
    });

  const baseRouter = router({
    a: mutation,
  });

  const caller = Router.serverSideCaller(baseRouter).create({});

  await expect(caller.a.mutate('John')).rejects.toThrowError(
    new PtsqError({ code: 'BAD_REQUEST' }),
  );
});

test('Should merge two routers and create server side caller on merged router', async () => {
  const { router, resolver } = ptsq({
    ctx: () => ({}),
  }).create();

  const query = resolver
    .args(Type.String())
    .output(Type.String())
    .query(({ input }) => `Hello ${input}`);

  const routerA = router({
    a: query,
  });

  const routerB = router({
    b: query,
  });

  const mergedRouter = Router.merge(routerA, routerB);

  const caller = Router.serverSideCaller(mergedRouter).create({});

  expect(await caller.a.query('John')).toBe('Hello John');

  expect(await caller.b.query('John')).toBe('Hello John');
});

test('Should create server side caller with nested router', async () => {
  const { router, resolver } = ptsq({
    ctx: () => ({}),
  }).create();

  const query = resolver
    .args(Type.String())
    .output(Type.String())
    .query(({ input }) => `Hello ${input}`);

  const baseRouter = router({
    a: router({
      b: router({
        c: query,
      }),
    }),
  });

  const caller = Router.serverSideCaller(baseRouter).create({});

  expect(await caller.a.b.c.query('John')).toBe('Hello John');
});
