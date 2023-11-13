import { z } from 'zod';
import { expect, test } from 'vitest';
import { httpAdapter } from './http';
import { createTestHttpServer } from '../__test__/createTestHttpServer';
import axios from 'axios';

test('Should create simple http server', async () => {
  await createTestHttpServer({
    ctx: {},
    server: ({ resolver, router, serve }) => {
      const baseRouter = router({
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

      return httpAdapter(serve({ router: baseRouter }));
    },
    client: async (serverUrl) => {
      const response = await axios.post(serverUrl, {
        route: 'test',
        input: {
          name: 'John',
        },
      });

      expect(response.data).toBe('John');
    },
  });
});
