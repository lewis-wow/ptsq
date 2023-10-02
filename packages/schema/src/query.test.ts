import { expect, expectTypeOf, test } from 'vitest';
import { Expect, Equal } from 'typetest';
import { query } from './queryDefinition';
import { z } from 'zod';
import { type } from './type';

test('Should create query route', () => {
  const route = query({
    input: z.object({ id: z.string() }),
  });

  type InferedInput = z.infer<typeof route.input>;
  type InferedOutput = typeof route.output;

  expect(route.type).toBe('query');
  expect(route.nodeType).toBe('route');

  const typetestInferedInput: Expect<Equal<InferedInput, { id: string }>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, any>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create empty query', () => {
  const route = query();

  type InferedInput = typeof route.input;
  type InferedOutput = typeof route.output;

  expect(route.type).toBe('query');
  expect(route.nodeType).toBe('route');

  const typetestInferedInput: Expect<Equal<InferedInput, undefined>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, any>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create full query', () => {
  const route = query({
    input: z.object({ id: z.string() }),
    output: z.object({ id: z.string() }),
  });

  type InferedInput = z.infer<typeof route.input>;
  type InferedOutput = z.infer<typeof route.output>;

  expect(route.type).toBe('query');

  const typetestInferedInput: Expect<Equal<InferedInput, { id: string }>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, { id: string }>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create query with output type', () => {
  const route = query({
    input: z.object({ id: z.string() }),
    output: type<{ id: string }>(),
  });

  type InferedInput = z.infer<typeof route.input>;
  type InferedOutput = typeof route.output;

  expect(route.type).toBe('query');

  const typetestInferedInput: Expect<Equal<InferedInput, { id: string }>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, { id: string }>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});
