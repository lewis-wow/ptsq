import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { removeKey } from './removeKey';

test('Should parse primitive value with removeKey transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const object = { a: 1, b: 2 };

  const data = {
    object: object,
    key: 'a',
  };

  const schema = z.object({
    object: z.object({ a: z.number(), b: z.number() }),
    key: z.enum(['a', 'b']),
  });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(removeKey)
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual({
        b: 2,
      });

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse removeKey value deeply in object with removeKey transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { removeKey: { object: { a: 1, b: 2 }, key: 'a' } };

  const schema = z.object({
    removeKey: z
      .object({
        object: z.object({ a: z.number(), b: z.number() }),
        key: z.enum(['a', 'b']),
      })
      .refine((arg) => arg.key in arg.object),
  });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      removeKey: removeKey,
    })
    .use(({ input, ctx, next }) => {
      expect(input.removeKey).toStrictEqual({
        b: 2,
      });

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
