import { expectTypeOf, test } from 'vitest';
import { router } from './router';
import { Route } from './route';
import { query } from './query';
import { mutation } from './mutation';
import { z } from 'zod';
import { Expect, Equal } from 'typetest';
import { type } from './type';

test('Should create empty query route in router', () => {
  const baseRouter = router({
    test: query(),
  });

  const queryTest = query();

  expectTypeOf(baseRouter.routes.test).toMatchTypeOf(queryTest);
});

test('Should create mutation query route in router', () => {
  const baseRouter = router({
    test: mutation(),
  });

  const mutationTest = mutation();

  expectTypeOf(baseRouter.routes.test).toMatchTypeOf(mutationTest);
});

test('Should create empty query without input route in router', () => {
  const baseRouter = router({
    test: query({
      output: z.object({ id: z.string() }),
    }),
  });

  const queryTest = query({
    output: z.object({ id: z.string() }),
  });

  expectTypeOf(baseRouter.routes.test).toMatchTypeOf(queryTest);
});

test('Should create mutation without input route in router', () => {
  const baseRouter = router({
    test: mutation({
      output: z.object({ id: z.string() }),
    }),
  });

  const mutationTest = mutation({
    output: z.object({ id: z.string() }),
  });

  expectTypeOf(baseRouter.routes.test).toMatchTypeOf(mutationTest);
});

test('Should create empty query without input route in router', () => {
  const baseRouter = router({
    test: query({
      output: type<{ id: string }>(),
    }),
  });

  const queryTest = query({
    output: type<{ id: string }>(),
  });

  expectTypeOf(baseRouter.routes.test).toMatchTypeOf(queryTest);
});

test('Should create mutation without input route in router', () => {
  const baseRouter = router({
    test: mutation({
      output: type<{ id: string }>(),
    }),
  });

  const mutationTest = mutation({
    output: type<{ id: string }>(),
  });

  expectTypeOf(baseRouter.routes.test).toMatchTypeOf(mutationTest);
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
