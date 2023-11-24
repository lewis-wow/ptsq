import { createServer } from '@ptsq/server';
import lookup from 'country-code-lookup';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { countryCode } from './countryCode';

test('Should parse primitive value with countryCode transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = 'UK';

  const schema = z.union([z.string(), z.number()]);

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(countryCode)
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual(lookup.byIso(data));

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse countryCode value deeply in object with countryCode transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { countryCode: 'UK' };

  const schema = z.object({ countryCode: z.union([z.string(), z.number()]) });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      countryCode: countryCode,
    })
    .use(({ input, ctx, next }) => {
      expect(input.countryCode).toStrictEqual(lookup.byIso(data.countryCode));

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
