import { server } from './__test__/test1Server.js';
import Test1Wrapper from './__test__/Test1Wrapper.svelte';
import Test2Wrapper from './__test__/Test2Wrapper.svelte';
import Test3Wrapper from './__test__/Test3Wrapper.svelte';
import Test4Wrapper from './__test__/Test4Wrapper.svelte';
import { UndefinedAction } from '@ptsq/client';
import { type CreateHttpTestServerPayload } from '@ptsq/test-utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { expect, test } from 'vitest';

test('Should create simple http server with svelte client query', async () => {
  const { $disconnect } = await new Promise<CreateHttpTestServerPayload>(
    (resolve) => server.subscribe(resolve),
  );

  render(Test1Wrapper);

  const isFetching = screen.getByTestId('isFetching');
  const data = screen.getByTestId('data');

  expect(isFetching.innerHTML).toBe('true');

  await waitFor(() => {
    expect(isFetching.innerHTML).toBe('false');
  });

  expect(data.innerHTML).toBe('John');

  await $disconnect();
});

test('Should create simple http server with svelte client mutation', async () => {
  const { $disconnect } = await new Promise<CreateHttpTestServerPayload>(
    (resolve) => server.subscribe(resolve),
  );

  render(Test2Wrapper);

  const data = screen.getByTestId('data');
  const isPending = screen.getByTestId('isPending');
  const mutateButton = screen.getByTestId('mutate');

  expect(isPending.innerHTML).toBe('false');

  await fireEvent.click(mutateButton);

  await waitFor(() => {
    expect(isPending.innerHTML).toBe('true');
  });

  await waitFor(() => {
    expect(isPending.innerHTML).toBe('false');
  });

  expect(data.innerHTML).toBe('John');

  await $disconnect();
});

test('Should create simple http server with svelte client and call undefined action', async () => {
  const { $disconnect } = await new Promise<CreateHttpTestServerPayload>(
    (resolve) => server.subscribe(resolve),
  );

  expect(() => render(Test3Wrapper)).toThrow(new UndefinedAction());

  await $disconnect();
});

test('Should create simple http server with svelte client query', async () => {
  const { $disconnect } = await new Promise<CreateHttpTestServerPayload>(
    (resolve) => server.subscribe(resolve),
  );

  render(Test4Wrapper);

  const isFetching = screen.getByTestId('isFetching');
  const data = screen.getByTestId('data');
  const fetchNextPage = screen.getByTestId('fetchNextPage');

  expect(isFetching.innerHTML).toBe('true');

  await waitFor(() => {
    expect(isFetching.innerHTML).toBe('false');
  });

  expect(JSON.parse(data.innerHTML)).toStrictEqual({
    pageParams: [0],
    pages: [
      {
        data: ['0', '1', '2', '3', '4'],
        nextCursor: 1,
      },
    ],
  });

  await fireEvent.click(fetchNextPage);

  await waitFor(() => {
    expect(JSON.parse(data.innerHTML)).toStrictEqual({
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

  await fireEvent.click(fetchNextPage);

  await waitFor(() => {
    expect(JSON.parse(data.innerHTML)).toStrictEqual({
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
