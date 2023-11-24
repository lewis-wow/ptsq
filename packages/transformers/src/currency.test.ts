import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { currency, CurrencyISO_4217, currencyISO_4217Codes } from './currency';

test('Should parse primitive value with currency transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { value: 100, currency: 'USD' as CurrencyISO_4217 };

  const schema = z.object({
    value: z.number(),
    currency: z.enum(currencyISO_4217Codes),
  });

  expect(schema.safeParse(data)).toMatchObject({
    success: true,
  });

  const testResolver = resolver
    .args(schema)
    .transformation(currency)
    .use(({ input, ctx, next }) => {
      expect(input).toBe('$100.00');

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
  const data = {
    currency: { value: 100, currency: 'USD' as CurrencyISO_4217 },
  };

  const schema = z.object({
    currency: z.object({
      value: z.number(),
      currency: z.enum(currencyISO_4217Codes),
    }),
  });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      currency: currency,
    })
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual({
        currency: '$100.00',
      });

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
