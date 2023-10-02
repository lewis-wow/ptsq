import { expectTypeOf, test } from 'vitest';
import { app } from 'schema';
import { z } from 'zod';
import { Expect, Equal } from 'typetest';
import { createProxyClient } from './createProxyClient';

const { router, query } = app();

const baseRouter = router({
  test: query({
    input: z.object({ id: z.string() }),
  }),
});

test('Should create query route', () => {
  const client = createProxyClient(baseRouter);

  type InferedQuery = typeof client.test.query;

  const typetestInferedInput: Expect<Equal<InferedQuery, (input: { id: string }) => Promise<any>>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});
