import { IncomingMessage, ServerResponse } from 'http';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { useCORS } from '@whatwg-node/server';
import { expect, test } from 'vitest';
import { PtsqServer } from './ptsqServer';

test('Should create context with Request object that should be injected', async () => {
  const createContext = ({ request }: { request: Request }) => {
    expect(request.method).toBe('POST');

    return {
      request,
    };
  };

  const { router, serve, resolver } = PtsqServer.init({
    ctx: createContext,
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch, $disconnect } = await createHttpTestServer(server);

  await fetch({
    route: 'test',
    type: 'query',
  });

  await $disconnect();
});

test('Should create context with req and res object that should be injected', async () => {
  const createContext = ({
    req,
    res,
  }: {
    req: IncomingMessage;
    res: ServerResponse;
  }) => {
    expect(req).toBeInstanceOf(IncomingMessage);
    expect(res).toBeInstanceOf(ServerResponse);

    return {
      req,
      res,
    };
  };

  const { router, serve, resolver } = PtsqServer.init({
    ctx: createContext,
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch, $disconnect } = await createHttpTestServer(server);

  await fetch({
    route: 'test',
    type: 'query',
  });

  await $disconnect();
});

test('Should create context with custom param that should not be injected', async () => {
  const createContext = ({ custom }: { custom: undefined }) => {
    expect(custom).toBe(undefined);

    return {
      custom,
    };
  };

  const { router, serve, resolver } = PtsqServer.init({
    ctx: createContext,
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch, $disconnect } = await createHttpTestServer(server);

  await fetch({
    route: 'test',
    type: 'query',
  });

  await $disconnect();
});

test('Should create context with custom param that should not be injected but passed in', async () => {
  const createContext = ({ custom }: { custom: number }) => {
    expect(custom).toBe(1);

    return {
      custom,
    };
  };

  const { router, serve, resolver } = PtsqServer.init({
    ctx: createContext,
    plugins: [useCORS({ origin: '*' })],
  }).create();

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch, $disconnect } = await createHttpTestServer(
    (req: IncomingMessage, res: ServerResponse) =>
      server(req, res, {
        custom: 1,
      }),
  );

  await fetch({
    route: 'test',
    type: 'query',
  });

  await $disconnect();
});
