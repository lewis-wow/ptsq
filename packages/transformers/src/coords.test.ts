import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { coords } from './coords';

test('Should parse primitive value with coords transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = [1, 2];

  const schema = z.tuple([z.number(), z.number()]);

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(coords)
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual({
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

test('Should parse coords value deeply in object with coords transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { coords: [1, 2] };

  const schema = z.object({ coords: z.tuple([z.number(), z.number()]) });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      coords: coords,
    })
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
