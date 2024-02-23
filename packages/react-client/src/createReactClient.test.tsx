import { PtsqClientError, UndefinedAction } from '@ptsq/client';
import { createServer, PtsqErrorCode } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as React from 'react';
import { expect, test } from 'vitest';
import { createReactClient } from './createReactClient';

test('Should create simple http server with react client query', async () => {
  const { resolver, router, serve } = createServer({
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
  const { resolver, router, serve } = createServer({
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
  const { resolver, router, serve } = createServer({
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
  const { resolver, router, serve } = createServer({
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

test('Should create simple http server with react client infinite query', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  }).create();

  const data = Object.keys(Array.from({ length: 100 }));
  const pageSize = 5;

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          pageParam: Type.Integer(),
        }),
      )
      .output(
        Type.Object({
          data: Type.Array(Type.String()),
          nextCursor: Type.Number(),
        }),
      )
      .query(({ input }) => {
        return {
          data: data.slice(
            input.pageParam * pageSize,
            (input.pageParam + 1) * pageSize,
          ),
          nextCursor: input.pageParam + 1,
        };
      }),
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
      client.test.useInfiniteQuery(
        {},
        {
          initialPageParam: 0,
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    {
      wrapper,
    },
  );

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data).toStrictEqual({
    pageParams: [0],
    pages: [
      {
        data: ['0', '1', '2', '3', '4'],
        nextCursor: 1,
      },
    ],
  });

  result.current.fetchNextPage();

  await waitFor(() => {
    expect(result.current.data).toStrictEqual({
      pageParams: [0, 1],
      pages: [
        {
          data: ['0', '1', '2', '3', '4'],
          nextCursor: 1,
        },
        {
          data: ['5', '6', '7', '8', '9'],
          nextCursor: 2,
        },
      ],
    });
  });

  result.current.fetchNextPage();

  await waitFor(() => {
    expect(result.current.data).toStrictEqual({
      pageParams: [0, 1, 2],
      pages: [
        {
          data: ['0', '1', '2', '3', '4'],
          nextCursor: 1,
        },
        {
          data: ['5', '6', '7', '8', '9'],
          nextCursor: 2,
        },
        {
          data: ['10', '11', '12', '13', '14'],
          nextCursor: 3,
        },
      ],
    });
  });

  await $disconnect();
});

test('Should create simple http server with react client query and query with wrong request', async () => {
  const { resolver, router, serve } = createServer({
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
        code: PtsqErrorCode.BAD_REQUEST_400,
        message: 'Args validation error.',
      }),
    );
  });

  await $disconnect();
});

test('Should not call undefined action', async () => {
  const { resolver, router, serve } = createServer({
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

  expect(() =>
    // @ts-expect-error - test purposes
    client.test.useWrongMethod({
      name: 'John',
    }),
  ).toThrow(new UndefinedAction());

  await $disconnect();
});
