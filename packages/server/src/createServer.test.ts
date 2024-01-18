import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import axios from 'axios';
import { expect, test } from 'vitest';
import { createServer } from './createServer';

test('Should create server and request bad http route', async () => {
  const { router, serve, resolver } = createServer({
    ctx: () => ({}),
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { url, $disconnect } = await createHttpTestServer(server);

  await expect(
    axios.post(`${url}/wrong-path`, {
      type: 'query',
      route: 'test',
    }),
  ).rejects.toMatchInlineSnapshot(
    '[AxiosError: Request failed with status code 404]',
  );

  await $disconnect();
});

test('Should create server and request with bad http method', async () => {
  const { router, serve, resolver } = createServer({
    ctx: () => ({}),
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { url, $disconnect } = await createHttpTestServer(server);

  await expect(
    axios.put(url, {
      type: 'query',
      route: 'test',
    }),
  ).rejects.toMatchInlineSnapshot(
    '[AxiosError: Request failed with status code 405]',
  );

  await $disconnect();
});

test('Should create server and request with bad http method', async () => {
  const { router, serve, resolver } = createServer({
    ctx: () => ({}),
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { url, $disconnect } = await createHttpTestServer(server);

  await expect(axios.get(url)).rejects.toMatchInlineSnapshot(
    '[AxiosError: Request failed with status code 405]',
  );

  await $disconnect();
});

test('Should create server and request introspection with bad http method', async () => {
  const { router, serve, resolver } = createServer({
    ctx: () => ({}),
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { url, $disconnect } = await createHttpTestServer(server);

  await expect(
    axios.post(`${url}/introspection`),
  ).rejects.toMatchInlineSnapshot(
    '[AxiosError: Request failed with status code 405]',
  );

  await $disconnect();
});
