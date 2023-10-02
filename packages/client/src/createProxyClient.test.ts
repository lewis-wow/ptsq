import { expectTypeOf, test } from 'vitest';
import { app, router, query } from 'schema';
import { z } from 'zod';
import { Expect, Equal } from 'typetest';
import { createProxyClient } from './createProxyClient';
import superjson from 'superjson';

test('Should create query route', () => {
  const base = app({
    router: router({
      test: query({
        input: z.object({ id: z.string() }),
      }),
    }),
  });

  const client = createProxyClient(base);

  type InferedQuery = typeof client.test.query;

  const typetestInferedInput: Expect<Equal<InferedQuery, (input: { id: string }) => Promise<any>>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});

test('Should create query route with date response without transformer', async () => {
  const base = app({
    transformer: superjson,
    router: router({
      test: query({
        input: z.object({ id: z.string() }),
        output: z.object({ createdAt: z.date() }),
      }),
    }),
  });

  const client = createProxyClient(base);

  const response = await client.test.query({ id: 'test' });
  type T = Simplify<typeof response>;
});

type Simplify<T> = {
  [K in keyof T]: T[K];
} & {};
