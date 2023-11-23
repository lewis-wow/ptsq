import { expect, test } from 'vitest';
import { z } from 'zod';
import { createServer } from './createServer';

test('Should parse Date with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = {
    state: {
      createdAt: new Date(1).toISOString(),
    },
  };

  const schema = z.object({
    state: z.object({
      createdAt: z.string().datetime(),
    }),
  });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(({ input }) => ({
      ...input,
      state: {
        ...input.state,
        createdAt: new Date(input.state.createdAt),
      },
    }))
    .use(({ input, ctx, next }) => {
      expect(input.state.createdAt).toBeInstanceOf(Date);
      expect(input.state.createdAt.toISOString()).toBe(data.state.createdAt);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse coordinates with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = {
    coords: [1, 2] as const,
  };

  const schema = z.object({
    coords: z.tuple([z.number(), z.number()]),
  });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(({ input }) => ({
      coords: {
        lat: input.coords[0],
        lng: input.coords[1],
      },
    }))
    .use(({ input, ctx, next }) => {
      expect(input.coords).toStrictEqual({
        lat: 1,
        lng: 2,
      });

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

/*
test('Should parse arrays with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = {
    a: {
      b: 1,
      c: 'string',
      d: [1, 2],
      e: {
        f: 1,
      },
    },
  };

  const schema = z.tuple([
    z.number(),
    z.tuple([z.number(), z.number(), z.number(), z.tuple([])]),
    z.string(),
    z.tuple([z.object({}), z.object({ a: z.number() })]),
  ]);

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(
      ({ input }) =>
        [input[0].toFixed(), input[1].length, input[2], input[3][1]] as const,
    )
    .use(({ input, ctx, next }) => {
      expect(input[0]).toBeTypeOf('string');
      expect(input[1]).toBeTypeOf('number');
      expect(input[2]).toBeTypeOf('string');
      expect(input[2]).toStrictEqual({
        a: 1,
      });

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});*/

test('Should parse tuples with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = [1, [5, 6, 7, []], 'string', [{}, { a: 1 }]] as const;

  const schema = z.tuple([
    z.number(),
    z.tuple([z.number(), z.number(), z.number(), z.tuple([])]),
    z.string(),
    z.tuple([z.object({}), z.object({ a: z.number() })]),
  ]);

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(
      ({ input }) =>
        [input[0].toFixed(), input[1].length, input[2], input[3][1]] as const,
    )
    .use(({ input, ctx, next }) => {
      expect(input[0]).toBeTypeOf('string');
      expect(input[1]).toBeTypeOf('number');
      expect(input[2]).toBeTypeOf('string');
      expect(input[3]).toStrictEqual({
        a: 1,
      });

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse object into entries and then back with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = {
    a: {
      b: {
        c: 'test deep',
      },
    },
    d: 666,
    e: ['some other types', 1234, { f: { g: 'g' } }, ['a', 'b', 'c']],
    h: ['s', 't', 'r', 'i', 'n', 'g', 1, 2, 3, 4, 5],
  };

  const schema = z.object({
    a: z.object({
      b: z.object({
        c: z.string(),
      }),
    }),
    d: z.number(),
    e: z.tuple([
      z.string(),
      z.number(),
      z.object({ f: z.object({ g: z.string() }) }),
      z.array(z.string()),
    ]),
    h: z.array(z.union([z.string(), z.number()])),
  });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(({ input }) => ({
      ...input,
      // additional key
      aKeys: Object.keys(input.a),
      a: {
        b: {
          // change the type number
          c: input.a.b.c.length,
        },
      },
      // change the type to string
      d: input.d.toFixed(),
      // keep old e

      // map h
      h: input.h.map((value) =>
        typeof value === 'string' ? true : 'NON_STRING',
      ),
    }))
    .use(({ input, ctx, next }) => {
      expect(input.a.b.c).toBe(data.a.b.c.length);
      expect(input.d).toBe(data.d.toFixed());
      expect(input.h).toStrictEqual(
        data.h.map((value) =>
          typeof value === 'string' ? true : 'NON_STRING',
        ),
      );

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
