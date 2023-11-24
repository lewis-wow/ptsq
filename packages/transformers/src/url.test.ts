import { createServer } from '@ptsq/server';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { url } from './url';

test('Should parse primitive value with url transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = 'http://localhost:4000/pathname';

  const schema = z.string().url();

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(url)
    .use(({ input, ctx, next }) => {
      expect(input).toBeInstanceOf(URL);
      expect(input.toString()).toBe(data);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse url value deeply in object with url transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { url: 'http://localhost:4000/pathname' };

  const schema = z.object({ url: z.string().url() });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      url: url,
    })
    .use(({ input, ctx, next }) => {
      expect(input.url).toBeInstanceOf(URL);
      expect(input.url.toString()).toBe(data.url);

      return next(ctx);
    });

  const query = testResolver.query({
    output: z.null(),
    resolve: () => null,
  });

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
