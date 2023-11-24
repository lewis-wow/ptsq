import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { bigInt } from './bigInt';

test('Should parse primitive value with bigInt transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = '100000000000000000000000000000000000000';

  const schema = z.string();

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(bigInt)
    .use(({ input, ctx, next }) => {
      expect(input).toBe(BigInt(data));

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse bigInt value deeply in object with bigInt transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { bigInt: '100000000000000000000000000000000000000' };

  const schema = z.object({ bigInt: z.string() });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      bigInt: bigInt,
    })
    .use(({ input, ctx, next }) => {
      expect(input.bigInt).toBe(BigInt(data.bigInt));

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
