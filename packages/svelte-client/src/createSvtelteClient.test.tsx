import { PtsqClientError } from '@ptsq/client';
import { PtsqServer } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as React from 'react';
import { expect, test } from 'vitest';
import { createReactClient } from './createSvelteClient';

test('Should create simple http server with react client query', async () => {
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

test('Should create simple http server with react client mutation', async () => {
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
      .mutation(({ input }) => input.name),
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

  const { result } = renderHook(() => client.test.useMutation(), { wrapper });

  await waitFor(() => {
    result.current.mutate({
      name: 'John',
    });

    expect(result.current.isSuccess).toBe(true);

    expect(result.current.data).toBe('John');
  });

  await $disconnect();
});

test('Should create simple http server with react client query and enabled false', async () => {
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
      client.test.useQuery(
        {
          name: 'John',
        },
        {
          enabled: false,
        },
      ),
    { wrapper },
  );

  await waitFor(() => {
    result.current.refetch();

    expect(result.current.isSuccess).toBe(true);

    expect(result.current.data).toBe('John');
  });

  await $disconnect();
});

test('Should create simple http server with react client suspense query', async () => {
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
      client.test.useSuspenseQuery({
        name: 'John',
      }),
    { wrapper },
  );

  await waitFor(() => {
    result.current.refetch();

    expect(result.current.isSuccess).toBe(true);

    expect(result.current.data).toBe('John');
  });

  await $disconnect();
});

test('Should create simple http server with react client query and query with wrong request', async () => {
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
        // @ts-expect-error - test purposes
        name: 11,
      }),
    { wrapper },
  );

  await waitFor(() => {
    expect(result.current.isFetching).toBe(false);

    expect(result.current.isSuccess).toBe(false);

    expect(result.current.error).toStrictEqual(
      new PtsqClientError({
        code: 'BAD_REQUEST',
        message: 'Args validation error.',
      }),
    );
  });

  await $disconnect();
});
