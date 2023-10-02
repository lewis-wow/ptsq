import { expectTypeOf, test } from 'vitest';
import { router } from './routerDefinition';
import { query } from './queryDefinition';
import { mutation } from './mutationDefinition';
import { z } from 'zod';
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

test('Should create mutation route in inner router', () => {
  const baseRouter = router({
    user: router({
      create: mutation({
        input: z.object({ email: z.string().email(), password: z.string() }),
        output: type<{ id: string }>(),
      }),
    }),
  });

  const mutationTest = mutation({
    input: z.object({ email: z.string().email(), password: z.string() }),
    output: type<{ id: string }>(),
  });

  expectTypeOf(baseRouter.routes.user.routes.create).toMatchTypeOf(mutationTest);
});

test('Should create query route in inner router', () => {
  const baseRouter = router({
    user: router({
      get: query({
        input: z.object({ email: z.string().email(), password: z.string() }),
        output: type<{ id: string }>(),
      }),
    }),
  });

  const queryTest = query({
    input: z.object({ email: z.string().email(), password: z.string() }),
    output: type<{ id: string }>(),
  });

  expectTypeOf(baseRouter.routes.user.routes.get).toMatchTypeOf(queryTest);
});
