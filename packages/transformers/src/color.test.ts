import { createServer } from '@ptsq/server';
import parseColor from 'parse-color';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { color } from './color';

test('Should parse primitive value with color transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = '#aabbcc';

  const schema = z.string().regex(/^#[0-9A-F]{6}$/i);

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(color)
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual(parseColor(data));

      return next(ctx);
    });

  const query = testResolver.output(z.null()).query(() => null);

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse color value deeply in object with color transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { color: '#aabbcc' };

  const schema = z.object({ color: z.string().regex(/^#[0-9A-F]{6}$/i) });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      color: color,
    })
    .use(({ input, ctx, next }) => {
      expect(input.color).toStrictEqual(parseColor(data.color));

      return next(ctx);
    });

  const query = testResolver.output(z.null()).query(() => null);

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
