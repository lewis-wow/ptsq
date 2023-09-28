import { expectTypeOf, test } from 'vitest';
import { router } from './router';
import { Route } from './types';
import { query } from './query';
import { mutation } from './mutation';
import { z } from 'zod';
import { Expect, Equal } from 'typetest';

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
  expectTypeOf(baseRouter.routes.user.routes.get).toMatchTypeOf<Route<'query'>>();
  expectTypeOf(baseRouter.routes.user.routes.create).toMatchTypeOf<Route<'mutation'>>();

  type InferedInput = z.infer<typeof baseRouter.routes.user.routes.get.input>;
  type InferedOutput = typeof baseRouter.routes.user.routes.get.output;

  const typetestInferedInput: Expect<Equal<InferedInput, { id: string }>> = true;
  expectTypeOf(typetestInferedInput).toMatchTypeOf<true>();

  const typetestInferedOutput: Expect<Equal<InferedOutput, undefined>> = true;
  expectTypeOf(typetestInferedOutput).toMatchTypeOf<true>();
});
