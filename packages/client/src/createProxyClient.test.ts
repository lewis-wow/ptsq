import { expectTypeOf, test } from 'vitest';
import { query, router, type } from 'api';
import { z } from 'zod';
import { Expect, Equal } from 'typetest';
import { createProxyClient } from './createProxyClient';

test('Should create query route', () => {
  const baseRouter = router({
    test: query({
      input: z.object({ id: z.string() }),
    }),
  });

  const client = createProxyClient(baseRouter);

  type InferedQuery = typeof client.test.query;

  const typetestInferedInput: Expect<Equal<InferedQuery, (input: { id: string }) => any>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});

test('Should create query route in inner router', () => {
  const baseRouter = router({
    a: router({
      b: query({
        input: z.object({ id: z.string() }),
      }),
    }),
  });

  const client = createProxyClient(baseRouter);

  type InferedQuery = typeof client.a.b.query;

  const typetestInferedInput: Expect<Equal<InferedQuery, (input: { id: string }) => any>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});

test('Should create query route with output zod schema', () => {
  const baseRouter = router({
    a: router({
      b: query({
        input: z.object({ id: z.string() }),
        output: z.object({ string: z.string().email(), tel: z.number() }),
      }),
    }),
  });

  const client = createProxyClient(baseRouter);

  type InferedQuery = typeof client.a.b.query;

  const typetestInferedInput: Expect<
    Equal<
      InferedQuery,
      (input: { id: string }) => {
        string: string;
        tel: number;
      }
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});

test('Should create query route with output type', () => {
  const baseRouter = router({
    a: router({
      b: query({
        input: z.object({ id: z.string() }),
        output: type<{
          string: string;
          tel: number;
        }>(),
      }),
    }),
  });

  const client = createProxyClient(baseRouter);

  type InferedQuery = typeof client.a.b.query;

  const typetestInferedInput: Expect<
    Equal<
      InferedQuery,
      (input: { id: string }) => {
        string: string;
        tel: number;
      }
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});
