import { z } from 'zod';
import { Route } from './route';
import { Expect, Equal } from 'typetest';
import { test, expectTypeOf } from 'vitest';

test('Should create query route', () => {
  type Test = Route<'query'>;

  const typetest: Expect<
    Equal<
      Test,
      {
        type: 'query';
        input: z.ZodType<any, z.ZodTypeDef, any> | undefined;
        output: any;
        nodeType: 'route';
      }
    >
  > = true;
  expectTypeOf(typetest).toMatchTypeOf<true>();
});

test('Should create mutation route', () => {
  type Test = Route<'mutation'>;

  const typetest: Expect<
    Equal<
      Test,
      {
        type: 'mutation';
        input: z.ZodType<any, z.ZodTypeDef, any> | undefined;
        output: any;
        nodeType: 'route';
      }
    >
  > = true;
  expectTypeOf(typetest).toMatchTypeOf<true>();
});
