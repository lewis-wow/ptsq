import { createCachedJsonSchemaParser } from '@ptsq/cached-json-schema-parser';
import { createProxyClient } from '@ptsq/client';
import { ptsq, Type } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import benny from 'benny';
import { expressBenchmarkTestCase } from './express';

const { resolver, router, serve } = ptsq({
  parser: createCachedJsonSchemaParser().parser,
}).create();

const baseRouter = router({
  user: router({
    create: resolver
      .args(
        Type.Object({
          firstName: Type.String({ minLength: 4 }),
        }),
      )
      .args(
        Type.Object({
          lastName: Type.String(),
        }),
      )
      .output(
        Type.Object({
          name: Type.String(),
        }),
      )
      .mutation(({ input }) => {
        return {
          name: `${input.firstName} ${input.lastName}`,
        };
      }),
  }),
});

createHttpTestServer(serve(baseRouter)).then(async ({ url, $disconnect }) => {
  const client = createProxyClient<typeof baseRouter>({
    url,
  });

  await benny.suite(
    'Proxy client',

    benny.add('Create user', async () => {
      await client.user.create.mutate({
        firstName: 'John',
        lastName: 'Doe',
      });
    }),

    expressBenchmarkTestCase,

    benny.cycle(),
    benny.complete(),
    benny.save({ file: 'reduce', version: '1.0.0' }),
    benny.save({ file: 'reduce', format: 'chart.html' }),
  );

  await $disconnect();
});
