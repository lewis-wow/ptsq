import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { set } from './set';

test('Should parse primitive value with set transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = [1, 2, 2, 3];

  const schema = z.array(z.number());

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation((i) => set(i))
    .use(({ input, ctx, next }) => {
      expect(input).toBeInstanceOf(Set);
      expect([...input]).toStrictEqual([1, 2, 3]);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
test('Should parse set value deeply in object with set transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { set: [1, 2, 2, 3] };

  const schema = z.object({ set: z.array(z.number()) });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      set: (i) => set(i),
    })
    .use(({ input, ctx, next }) => {
      expect(input.set).toBeInstanceOf(Set);
      expect([...input.set]).toStrictEqual([1, 2, 3]);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
