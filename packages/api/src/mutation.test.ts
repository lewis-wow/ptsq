import { expect, expectTypeOf, test } from 'vitest';
import { Expect, Equal } from 'typetest';
import { z } from 'zod';
import { mutation } from './mutation';

test('Should create query route', () => {
  const route = mutation({
    input: z.object({ id: z.string() }),
  });

  type InferedInput = z.infer<typeof route.input>;
  type InferedOutput = typeof route.output;

  expect(route.type).toBe('mutation');

  const typetestInferedInput: Expect<Equal<InferedInput, { id: string }>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, undefined>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create empty query', () => {
  const route = mutation();

  type InferedInput = typeof route.input;
  type InferedOutput = typeof route.output;

  expect(route.type).toBe('mutation');

  const typetestInferedInput: Expect<Equal<InferedInput, undefined>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, undefined>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create full query', () => {
  const route = mutation({
    input: z.object({ id: z.string() }),
    output: {
      SUCCESS: z.object({ id: z.string() }),
    },
  });

  type InferedInput = z.infer<typeof route.input>;
  type InferedOutput = z.infer<(typeof route.output)['SUCCESS']>;

  expect(route.type).toBe('mutation');

  const typetestInferedInput: Expect<Equal<InferedInput, { id: string }>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, { id: string }>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});