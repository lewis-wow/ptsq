import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { date } from './date';

test('Should parse primitive value with date transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = new Date().toISOString();

  const schema = z.string().datetime();

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(date)
    .use(({ input, ctx, next }) => {
      expect(input).toBeInstanceOf(Date);
      expect(input.toISOString()).toBe(data);

      return next(ctx);
    });

  const query = testResolver.output(z.null()).query(() => null);

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse date value deeply in object with date transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { date: new Date().toISOString() };

  const schema = z.object({ date: z.string().datetime() });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      date: date,
    })
    .use(({ input, ctx, next }) => {
      expect(input.date).toBeInstanceOf(Date);
      expect(input.date.toISOString()).toBe(data.date);

      return next(ctx);
    });

  const query = testResolver.output(z.null()).query(() => null);

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
