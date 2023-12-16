import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { safeParseArgs } from './args';
import { createServer } from './createServer';

test('Should parse primitive value with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = 'primitive value';

  const schema = Type.String();

  expect(safeParseArgs({ schema, value: data })).toMatchObject({ ok: true });

  const testResolver = resolver
    .args(schema)
    .transformation((input) => input.length)
    .use(({ input, ctx, next }) => {
      expect(input).toBeTypeOf('number');
      expect(input).toBe(data.length);

      return next(ctx);
    });

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
});

test('Should parse no args with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const testResolver = resolver
    .transformation((_input) => 'string')
    .use(({ input, ctx, next }) => {
      expect(input).toBeTypeOf('string');
      expect(input).toBe('string');

      return next(ctx);
    });

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: undefined, route: 'dummy.route' },
  });
});

test('Should parse no args with transformation function as object', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const testResolver = resolver
    .transformation((_input) => ({
      a: 1,
      b: 'string' as const,
    }))
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual({
        a: 1,
        b: 'string',
      });

      return next(ctx);
    });

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: undefined, route: 'dummy.route' },
  });
});

test('Should parse Date with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = {
    state: {
      createdAt: new Date(1).toISOString(),
    },
  };

  const schema = Type.Object({
    state: Type.Object({
      createdAt: Type.String({
        format: 'date-time',
      }),
    }),
  });

  expect(safeParseArgs({ schema, value: data })).toMatchObject({ ok: true });

  const testResolver = resolver
    .args(schema)
    .transformation((input) => ({
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

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
});

test('Should parse coordinates with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = {
    coords: [1, 2] as const,
  };

  const schema = Type.Object({
    coords: Type.Tuple([Type.Number(), Type.Number()]),
  });

  expect(safeParseArgs({ schema, value: data })).toMatchObject({ ok: true });

  const testResolver = resolver
    .args(schema)
    .transformation((input) => ({
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

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
});

test('Should parse arrays with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = ['a', 'bb', 'c', 'ddd', 'eeeee'];

  const schema = Type.Array(Type.String());
  const resultSchema = Type.Array(Type.Number());

  expect(safeParseArgs({ schema, value: data })).toMatchObject({ ok: true });

  const testResolver = resolver
    .args(schema)
    .transformation((input) => input.map((value) => value.length))
    .use(({ input, ctx, next }) => {
      expect(
        safeParseArgs({ schema: resultSchema, value: input }),
      ).toMatchObject({ ok: true });
      expect(input).toStrictEqual([1, 2, 1, 3, 5]);

      return next(ctx);
    });

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
});

test('Should parse arrays with transformation function chain', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = ['a', 'bb', 'c', 'ddd', 'eeeee'];

  const schema = Type.Array(Type.String());
  const resultSchema = Type.Array(Type.Number());

  expect(safeParseArgs({ schema, value: data })).toMatchObject({ ok: true });

  const testResolver = resolver
    .args(schema)
    .transformation((input) => input.map((value) => value.length))
    .transformation((input) => input.map((value) => value - 10))
    .use(({ input, ctx, next }) => {
      expect(
        safeParseArgs({ schema: resultSchema, value: input }),
      ).toMatchObject({ ok: true });
      expect(input).toStrictEqual([1, 2, 1, 3, 5].map((value) => value - 10));

      return next(ctx);
    });

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
});

test('Should parse tuples with transformation function', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = [1, [5, 6, 7, []], 'string', [{}, { a: 1 }]] as const;

  const schema = Type.Tuple([
    Type.Number(),
    Type.Tuple([Type.Number(), Type.Number(), Type.Number(), Type.Tuple([])]),
    Type.String(),
    Type.Tuple([Type.Object({}), Type.Object({ a: Type.Number() })]),
  ]);

  expect(safeParseArgs({ schema, value: data })).toMatchObject({ ok: true });

  const testResolver = resolver
    .args(schema)
    .transformation(
      (input) =>
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

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
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

  const schema = Type.Object({
    a: Type.Object({
      b: Type.Object({
        c: Type.String(),
      }),
    }),
    d: Type.Number(),
    e: Type.Tuple([
      Type.String(),
      Type.Number(),
      Type.Object({ f: Type.Object({ g: Type.String() }) }),
      Type.Array(Type.String()),
    ]),
    h: Type.Array(Type.Union([Type.String(), Type.Number()])),
  });

  expect(safeParseArgs({ schema, value: data })).toMatchObject({ ok: true });

  const testResolver = resolver
    .args(schema)
    .transformation((input) => ({
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

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
});

test('Should parse primitive value inside object with spawning the transformation function deep inside', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { primitive: 'primitive value' };

  const schema = Type.Object({ primitive: Type.String() });

  expect(safeParseArgs({ schema, value: data })).toMatchObject({
    ok: true,
  });

  const testResolver = resolver
    .args(schema)
    .transformation({
      primitive: (input) => input.length,
    })
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual({
        primitive: data.primitive.length,
      });

      return next(ctx);
    });

  const query = testResolver.output(Type.Null()).query(() => null);

  await query.call({
    ctx: {},
    meta: { type: 'query', input: data, route: 'dummy.route' },
  });
});
