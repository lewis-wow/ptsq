import { type CreateHttpTestServerPayload } from '@ptsq/test-utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import { server } from './tests/test1Server.js';
import Test1Wrapper from './tests/Test1Wrapper.svelte';
import Test2Wrapper from './tests/Test2Wrapper.svelte';

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
