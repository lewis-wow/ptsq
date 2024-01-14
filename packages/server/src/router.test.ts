import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { Queue } from './queue';

test('Should merge two routers', async () => {
  const { router, resolver } = createServer({
    ctx: () => ({}),
  });

  const query = resolver.output(Type.Null()).query(() => null);

  const routerA = router({
    a: query,
  });

  const routerB = router({
    b: query,
  });

  const mergedRouter = routerA.merge(routerB);

  expect(
    await mergedRouter.call({
      route: new Queue(['a']),
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'a',
        type: 'query',
      },
    }),
  ).toMatchObject({
    ctx: {},
    data: null,
    ok: true,
  });

  expect(
    await mergedRouter.call({
      route: new Queue(['b']),
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'b',
        type: 'query',
      },
    }),
  ).toMatchObject({
    ctx: {},
    data: null,
    ok: true,
  });
});

test('Should merge two routers deeply', async () => {
  const { router, resolver } = createServer({
    ctx: () => ({}),
  });

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

  const mergedRouter = routerA.merge(routerB);

  expect(
    await mergedRouter.call({
      route: new Queue(['a', 'b']),
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'a.b',
        type: 'query',
      },
    }),
  ).toMatchObject({
    ctx: {},
    data: null,
    ok: true,
  });

  expect(
    await mergedRouter.call({
      route: new Queue(['c', 'd']),
      ctx: {},
      type: 'query',
      meta: {
        input: undefined,
        route: 'c.d',
        type: 'query',
      },
    }),
  ).toMatchObject({
    ctx: {},
    data: null,
    ok: true,
  });
});

test('Should merge two routers with overwrite', async () => {
  const { router, resolver } = createServer({
    ctx: () => ({}),
  });

  const query = resolver.output(Type.Null()).query(() => null);
  const mutation = resolver.output(Type.Null()).mutation(() => null);

  const routerA = router({
    a: query,
  });

  const routerB = router({
    a: mutation,
  });

  const mergedRouter = routerA.merge(routerB);

  expect(
    await mergedRouter.call({
      route: new Queue(['a']),
      ctx: {},
      type: 'mutation',
      meta: {
        input: undefined,
        route: 'a',
        type: 'mutation',
      },
    }),
  ).toMatchObject({
    ctx: {},
    data: null,
    ok: true,
  });
});
