import { expectTypeOf, test } from 'vitest';
import { router } from './router';
import { Route } from './route';
import { query } from './query';
import { mutation } from './mutation';
import { z } from 'zod';
import { Expect, Equal } from 'typetest';
import { type } from './type';

test('Should create mutation route in router', () => {
  const baseRouter = router({
    test: query(),
    user: router({
      get: query({
        input: z.object({ id: z.string() }),
      }),
      create: mutation({
        input: z.object({ email: z.string().email(), password: z.string() }),
      }),
    }),
  });

  expectTypeOf(baseRouter.routes.test).toMatchTypeOf<Route<'query'>>();
  expectTypeOf(baseRouter.routes.user.routes.get).toMatchTypeOf<
    Route<
      'query',
      z.ZodObject<
        {
          id: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
        },
        {
          id: string;
        }
      >,
      any
    >
  >();
  expectTypeOf(baseRouter.routes.user.routes.create).toMatchTypeOf<
    Route<
      'mutation',
      z.ZodObject<
        {
          email: z.ZodString;
          password: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          email: string;
          password: string;
        },
        {
          email: string;
          password: string;
        }
      >,
      undefined
    >
  >();

  type InferedInput = z.infer<typeof baseRouter.routes.user.routes.get.input>;
  type InferedOutput = typeof baseRouter.routes.user.routes.get.output;

  const typetestInferedInput: Expect<Equal<InferedInput, { id: string }>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, any>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create mutation route in router with output type', () => {
  const baseRouter = router({
    user: router({
      create: mutation({
        input: z.object({ email: z.string().email(), password: z.string() }),
        output: type<{ id: string }>(),
      }),
    }),
  });

  expectTypeOf(baseRouter.routes.user.routes.create).toMatchTypeOf<Route<'mutation'>>();

  type InferedInput = z.infer<typeof baseRouter.routes.user.routes.create.input>;
  type InferedOutput = typeof baseRouter.routes.user.routes.create.output;

  const typetestInferedInput: Expect<
    Equal<
      InferedInput,
      {
        email: string;
        password: string;
      }
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, { id: string }>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create mutation route in router with output zod schema', () => {
  const baseRouter = router({
    user: router({
      create: mutation({
        input: z.object({ email: z.string().email(), password: z.string() }),
        output: z.object({ id: z.string() }),
      }),
    }),
  });

  expectTypeOf(baseRouter.routes.user.routes.create).toMatchTypeOf<Route<'mutation'>>();

  type InferedInput = z.infer<typeof baseRouter.routes.user.routes.create.input>;
  type InferedOutput = z.infer<typeof baseRouter.routes.user.routes.create.output>;

  const typetestInferedInput: Expect<
    Equal<
      InferedInput,
      {
        email: string;
        password: string;
      }
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, { id: string }>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create query route in router with output type', () => {
  const baseRouter = router({
    user: router({
      create: query({
        input: z.object({ email: z.string().email(), password: z.string() }),
        output: type<{ id: string }>(),
      }),
    }),
  });

  expectTypeOf(baseRouter.routes.user.routes.create).toMatchTypeOf<Route<'query'>>();

  type InferedInput = z.infer<typeof baseRouter.routes.user.routes.create.input>;
  type InferedOutput = typeof baseRouter.routes.user.routes.create.output;

  const typetestInferedInput: Expect<
    Equal<
      InferedInput,
      {
        email: string;
        password: string;
      }
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, { id: string }>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});

test('Should create query route in router with output zod schema', () => {
  const baseRouter = router({
    user: router({
      create: query({
        input: z.object({ email: z.string().email(), password: z.string() }),
        output: z.object({ id: z.string() }),
      }),
    }),
  });

  expectTypeOf(baseRouter.routes.user.routes.create).toMatchTypeOf<Route<'query'>>();

  type InferedInput = z.infer<typeof baseRouter.routes.user.routes.create.input>;
  type InferedOutput = z.infer<typeof baseRouter.routes.user.routes.create.output>;

  const typetestInferedInput: Expect<
    Equal<
      InferedInput,
      {
        email: string;
        password: string;
      }
    >
  > = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, { id: string }>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});
