import { expectTypeOf, test } from 'vitest';
import { z } from 'zod';
import { mutation } from 'schema';
import { createMutationClient } from './createMutationClient';

test('Should create query client', async () => {
  const route = mutation({
    input: z.object({ id: z.string() }),
    output: z.object({ name: z.string(), email: z.string().email() }),
  });

  const mutationClient = createMutationClient(route);

  const result = mutationClient.mutate({ id: 'test' });

  expectTypeOf(result).toMatchTypeOf<Promise<any>>();
  expectTypeOf(result).toMatchTypeOf<Promise<{ name: string; email: string }>>();

  const awaitedResult = await result;

  expectTypeOf(awaitedResult).toMatchTypeOf<{ name: string; email: string }>();
});
