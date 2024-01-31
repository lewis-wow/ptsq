import { PtsqServer } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as React from 'react';
import { expect, test } from 'vitest';
import { createReactClient } from './createReactClient';

test('Should create simple http server with proxy client', async () => {
  const { resolver, router, serve } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(Type.String())
      .query(({ input }) => input.name),
  });

  const { url, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const client = createReactClient<typeof baseRouter>({
    url,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(
    () =>
      client.test.useQuery({
        name: 'John',
      }),
    { wrapper },
  );

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);

    expect(result.current.data).toBe('John');
  });

  await $disconnect();
});
