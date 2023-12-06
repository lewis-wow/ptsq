import { createServer } from '@ptsq/server';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { phoneNumber } from './phoneNumber';

test('Should parse primitive value with phoneNumber transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = '+420111222333';

  const schema = z.string();

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation(phoneNumber)
    .use(({ input, ctx, next }) => {
      expect(input).toStrictEqual(parsePhoneNumber(data));

      return next(ctx);
    });

  const query = testResolver.output(z.null()).query(() => null);

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});

test('Should parse phoneNumber value deeply in object with phoneNumber transformer', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const data = { phoneNumber: '+420123456789' };

  const schema = z.object({ phoneNumber: z.string() });

  expect(schema.safeParse(data)).toMatchObject({ success: true });

  const testResolver = resolver
    .args(schema)
    .transformation({
      phoneNumber: phoneNumber,
    })
    .use(({ input, ctx, next }) => {
      expect(input.phoneNumber).toStrictEqual(
        parsePhoneNumber(data.phoneNumber),
      );

      return next(ctx);
    });

  const query = testResolver.output(z.null()).query(() => null);

  await query.call({ ctx: {}, meta: { input: data, route: 'dummy.route' } });
});
