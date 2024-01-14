import { IncomingMessage, ServerResponse } from 'http';
import { createHttpTestServer } from './__test__/createHttpTestServer';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createServer } from './createServer';

test('Should create context with Request object that should be injected', async () => {
  const createContext = ({ request }: { request: Request }) => {
    expect(request).toBeInstanceOf(Request);

    return {
      request,
    };
  };

  const { router, serve, resolver } = createServer({
    ctx: createContext,
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch } = await createHttpTestServer((req, res) => {
    server(req, res);
  });

  fetch({
    route: 'test',
  });
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

  const { router, serve, resolver } = createServer({
    ctx: createContext,
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch } = await createHttpTestServer((req, res) => {
    server(req, res);
  });

  fetch({
    route: 'test',
  });
});

test('Should create context with custom param that should not be injected', async () => {
  const createContext = ({ custom }: { custom: undefined }) => {
    expect(custom).toBe(undefined);

    return {
      custom,
    };
  };

  const { router, serve, resolver } = createServer({
    ctx: createContext,
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch } = await createHttpTestServer((req, res) => {
    server(req, res);
  });

  fetch({
    route: 'test',
  });
});

test('Should create context with custom param that should not be injected but passed in', async () => {
  const createContext = ({ custom }: { custom: number }) => {
    expect(custom).toBe(1);

    return {
      custom,
    };
  };

  const { router, serve, resolver } = createServer({
    ctx: createContext,
  });

  const server = serve(
    router({
      test: resolver.output(Type.Null()).query(() => null),
    }),
  );

  const { fetch } = await createHttpTestServer((req, res) => {
    server(req, res, {
      custom: 1,
    });
  });

  fetch({
    route: 'test',
  });
});
