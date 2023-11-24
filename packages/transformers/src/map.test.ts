import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { map } from './map';

test('Should parse primitive value with map transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = [
    ['A', 1],
    ['B', 2],
    ['C', 3],
  ];

  const schema = z.array(z.tuple([z.string(), z.number()]));

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation((i) => map(i))
    .use(({ input, ctx, next }) => {
      expect(input).toBeInstanceOf(Map);
      expect([...input.keys()]).toStrictEqual(['A', 'B', 'C']);
      expect([...input.values()]).toStrictEqual([1, 2, 3]);
      expect([...input.entries()]).toStrictEqual(data);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
test('Should parse map value deeply in object with map transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = {
    map: [
      ['A', 1],
      ['B', 2],
      ['C', 3],
    ],
  };

  const schema = z.object({ map: z.array(z.tuple([z.string(), z.number()])) });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      map: (i) => map(i),
    })
    .use(({ input, ctx, next }) => {
      expect(input.map).toBeInstanceOf(Map);
      expect([...input.map.keys()]).toStrictEqual(['A', 'B', 'C']);
      expect([...input.map.values()]).toStrictEqual([1, 2, 3]);
      expect([...input.map.entries()]).toStrictEqual(data.map);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
