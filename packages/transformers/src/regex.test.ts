import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { regex } from './regex';

test('Should parse primitive value with regex transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = '(A|B)';

  const schema = z.string();

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(regex)
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual(/(A|B)/);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse regex value deeply in object with regex transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { regex: '(A|B)' };

  const schema = z.object({ regex: z.string() });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      regex: regex,
    })
    .use(({ input, ctx, next }) => {
      expect(input.regex).toStrictEqual(/(A|B)/);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
