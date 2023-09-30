import { expectTypeOf, test } from 'vitest';
import { Expect, Equal } from 'typetest';
import { Client } from './client';
import { z } from 'zod';
import { mutation, query, router, type } from 'api';

test('Should create query route', () => {
  const baseRouter = router({
    test: query({
      input: z.object({ id: z.string() }),
    }),
  });

  type QueryTest = Client<typeof baseRouter>['test'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => any }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create mutation route', () => {
  const baseRouter = router({
    test: mutation({
      input: z.object({ id: z.string() }),
    }),
  });

  type MutationTest = Client<typeof baseRouter>['test'];

  const typetestQuery: Expect<Equal<MutationTest, { mutate: (input: { id: string }) => any }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create mutation route with return type from zod schema', () => {
  const baseRouter = router({
    test: mutation({
      input: z.object({ id: z.string() }),
      output: z.object({ name: z.string() }),
    }),
  });

  type MutationTest = Client<typeof baseRouter>['test'];

  const typetestQuery: Expect<Equal<MutationTest, { mutate: (input: { id: string }) => { name: string } }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create mutation route with return type', () => {
  const baseRouter = router({
    test: mutation({
      input: z.object({ id: z.string() }),
      output: type<{ name: string }>(),
    }),
  });

  type MutationTest = Client<typeof baseRouter>['test'];

  const typetestQuery: Expect<Equal<MutationTest, { mutate: (input: { id: string }) => { name: string } }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create query route with return type from zod schema', () => {
  const baseRouter = router({
    test: query({
      input: z.object({ id: z.string() }),
      output: z.object({ name: z.string() }),
    }),
  });

  type QueryTest = Client<typeof baseRouter>['test'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => { name: string } }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create query route with return type', () => {
  const baseRouter = router({
    test: query({
      input: z.object({ id: z.string() }),
      output: type<{ name: string }>(),
    }),
  });

  type QueryTest = Client<typeof baseRouter>['test'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => { name: string } }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});
