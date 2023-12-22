import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { Resolver } from './resolver';

test('Should merge resolvers and do no edit the context', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      a: {
        b: 1,
      },
    }),
  });

  const resolverA = Resolver.createRoot<{ a: { b: number } }>().use(
    ({ ctx: _ctx, next }) => {
      return next();
    },
  );

  const resolverB = resolver.merge(resolverA);

  const query = resolverB.output(Type.Null()).query(({ ctx }) => {
    expect(ctx).toStrictEqual({
      a: {
        b: 1,
      },
    });

    return null;
  });

  await query.call({
    ctx: { a: { b: 1 } },
    meta: { input: undefined, route: '', type: 'query' },
  });
});

test('Should merge resolvers and do deep edit context', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      a: {
        b: 1,
      },
    }),
  });

  const resolverA = Resolver.createRoot<{ a: { b: number } }>().use(
    ({ ctx: _ctx, next }) => {
      return next({
        a: {
          c: 1,
        },
      });
    },
  );

  const resolverB = resolver.merge(resolverA);

  const query = resolverB.output(Type.Null()).query(({ ctx }) => {
    expect(ctx).toStrictEqual({
      a: {
        c: 1,
      },
    });

    return null;
  });

  await query.call({
    ctx: { a: { b: 1 } },
    meta: { input: undefined, route: '', type: 'query' },
  });
});

test('Should merge resolvers and do deep edit with deep copy context', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      a: {
        b: 1,
      },
    }),
  });

  const resolverA = Resolver.createRoot<{ a: { b: number } }>().use(
    ({ ctx, next }) => {
      return next({
        a: {
          ...ctx.a,
          c: 1,
        },
      });
    },
  );

  const resolverB = resolver.merge(resolverA);

  const query = resolverB.output(Type.Null()).query(({ ctx }) => {
    expect(ctx).toStrictEqual({
      a: {
        b: 1,
        c: 1,
      },
    });

    return null;
  });

  await query.call({
    ctx: { a: { b: 1 } },
    meta: { input: undefined, route: '', type: 'query' },
  });
});

test('Should merge resolvers and do shallow edit context', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      a: {
        b: 1,
      },
    }),
  });

  const resolverA = Resolver.createRoot<{ a: { b: number } }>().use(
    ({ ctx: _ctx, next }) => {
      return next({
        c: 1,
      });
    },
  );

  const resolverB = resolver.merge(resolverA);

  const query = resolverB.output(Type.Null()).query(({ ctx }) => {
    expect(ctx).toStrictEqual({
      a: {
        b: 1,
      },
      c: 1,
    });

    return null;
  });

  await query.call({
    ctx: { a: { b: 1 } },
    meta: { input: undefined, route: '', type: 'query' },
  });
});
