import { expectTypeOf, test } from 'vitest';
import { app, router, query, type } from 'schema';
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

test('Should create query route in inner router', () => {
  const base = app({
    router: router({
      a: router({
        b: query({
          input: z.object({ id: z.string() }),
        }),
      }),
    }),
  });

  const client = createProxyClient(base);

  type InferedQuery = typeof client.a.b.query;

  const typetestInferedInput: Expect<Equal<InferedQuery, (input: { id: string }) => Promise<any>>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});

test('Should create query route with output zod schema', () => {
  const base = app({
    router: router({
      a: router({
        b: query({
          input: z.object({ id: z.string() }),
          output: z.object({ string: z.string().email(), tel: z.number() }),
        }),
      }),
    }),
  });

  const client = createProxyClient(base);

  type InferedQuery = typeof client.a.b.query;

  const typetestInferedInput: Expect<
    Equal<
      InferedQuery,
      (input: { id: string }) => Promise<{
        string: string;
        tel: number;
      }>
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});

test('Should create query route with output type', () => {
  const base = app({
    router: router({
      a: router({
        b: query({
          input: z.object({ id: z.string() }),
          output: type<{
            string: string;
            tel: number;
          }>(),
        }),
      }),
    }),
  });

  const client = createProxyClient(base);

  type InferedQuery = typeof client.a.b.query;

  const typetestInferedInput: Expect<
    Equal<
      InferedQuery,
      (input: { id: string }) => Promise<{
        string: string;
        tel: number;
      }>
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});

test('Should create query route with output type with superjson data transformer', () => {
  const base = app({
    transformer: superjson,
    router: router({
      a: router({
        b: query({
          input: z.object({ id: z.string() }),
          output: type<{
            string: string;
            tel: number;
          }>(),
        }),
      }),
    }),
  });

  const client = createProxyClient(base);

  type InferedQuery = typeof client.a.b.query;

  const typetestInferedInput: Expect<
    Equal<
      InferedQuery,
      (input: { id: string }) => Promise<{
        string: string;
        tel: number;
      }>
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();
});
