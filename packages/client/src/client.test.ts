import { expectTypeOf, test } from 'vitest';
import { Expect, Equal } from 'typetest';
import { Client } from './client';
import { z } from 'zod';
import { app, router, query, mutation, type, DataTransformer } from 'schema';
import superjson from 'superjson';

test('Should create query route without input', () => {
  const base = app({
    router: router({
      test: query(),
    }),
  });

  type QueryTest = Client<typeof base>['router']['test'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => Promise<any> }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create query route', () => {
  const base = app({
    router: router({
      test: query({
        input: z.object({ id: z.string() }),
      }),
    }),
  });

  type QueryTest = Client<typeof base>['router']['test'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => Promise<any> }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create mutation route', () => {
  const base = app({
    router: router({
      test: mutation({
        input: z.object({ id: z.string() }),
      }),
    }),
  });

  type MutationTest = Client<typeof base>['router']['test'];

  const typetestQuery: Expect<Equal<MutationTest, { mutate: (input: { id: string }) => Promise<any> }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create mutation route with return type from zod schema', () => {
  const base = app({
    router: router({
      test: mutation({
        input: z.object({ id: z.string() }),
        output: z.object({ name: z.string() }),
      }),
    }),
  });

  type MutationTest = Client<typeof base>['router']['test'];

  const typetestQuery: Expect<Equal<MutationTest, { mutate: (input: { id: string }) => Promise<{ name: string }> }>> =
    true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create mutation route with return type', () => {
  const base = app({
    router: router({
      test: mutation({
        input: z.object({ id: z.string() }),
        output: type<{ name: string }>(),
      }),
    }),
  });

  type MutationTest = Client<typeof base>['router']['test'];

  const typetestQuery: Expect<Equal<MutationTest, { mutate: (input: { id: string }) => Promise<{ name: string }> }>> =
    true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create query route with return type from zod schema', () => {
  const base = app({
    router: router({
      test: query({
        input: z.object({ id: z.string() }),
        output: z.object({ name: z.string() }),
      }),
    }),
  });

  type QueryTest = Client<typeof base>['router']['test'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => Promise<{ name: string }> }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create query route with return type', () => {
  const base = app({
    router: router({
      test: query({
        input: z.object({ id: z.string() }),
        output: type<{ name: string }>(),
      }),
    }),
  });

  type QueryTest = Client<typeof base>['router']['test'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => Promise<{ name: string }> }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();
});

test('Should create query route with return type with superjson data transfromer', () => {
  const base = app({
    transformer: superjson,
    router: router({
      test: query({
        input: z.object({ id: z.string() }),
        output: type<{ name: string }>(),
      }),
    }),
  });

  type QueryTest = Client<typeof base>['router']['test'];
  type TransformerTest = Client<typeof base>['transformer'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => Promise<{ name: string }> }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();

  const typetestTransformer: Expect<Equal<TransformerTest, typeof superjson>> = true;
  expectTypeOf(typetestTransformer).toMatchTypeOf<true>();
});

test('Should create query route with return type with default data transfromer', () => {
  const base = app({
    router: router({
      test: query({
        input: z.object({ id: z.string() }),
        output: type<{ name: string }>(),
      }),
    }),
  });

  type QueryTest = Client<typeof base>['router']['test'];
  type TransformerTest = Client<typeof base>['transformer'];

  const typetestQuery: Expect<Equal<QueryTest, { query: (input: { id: string }) => Promise<{ name: string }> }>> = true;
  expectTypeOf(typetestQuery).toMatchTypeOf<true>();

  const typetestTransformer: Expect<Equal<TransformerTest, DataTransformer>> = true;
  expectTypeOf(typetestTransformer).toMatchTypeOf<true>();
});
