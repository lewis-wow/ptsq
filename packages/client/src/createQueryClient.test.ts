import { expectTypeOf, test } from 'vitest';
import { z } from 'zod';
import { query } from 'schema';
import { createQueryClient } from './createQueryClient';

test('Should create query client', async () => {
  const route = query({
    input: z.object({ id: z.string() }),
    output: z.object({ name: z.string(), email: z.string().email() }),
  });

  const queryClient = createQueryClient(route);

  const result = queryClient.query({ id: 'test' });

  expectTypeOf(result).toMatchTypeOf<Promise<any>>();
  expectTypeOf(result).toMatchTypeOf<Promise<{ name: string; email: string }>>();

  const awaitedResult = await result;

  expectTypeOf(awaitedResult).toMatchTypeOf<{ name: string; email: string }>();
});
