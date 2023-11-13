import { z } from 'zod';
import { expect, test } from 'vitest';
import { createTestHttpServer } from '@ptsq/test-utils';
import { createProxyClient } from './createProxyClient';

test('Should create simple http server with proxy client', async () => {
  await createTestHttpServer({
    ctx: {},
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            z.object({
              name: z.string(),
            })
          )
          .query({
            output: z.string(),
            resolve: ({ input }) => input.name,
          }),
      });
    },
    client: async (serverUrl, router) => {
      const client = createProxyClient<typeof router>({
        url: serverUrl,
      });

      const response = await client.test.query({
        name: 'John',
      });

      expect(response).toBe('John');
    },
  });
});
