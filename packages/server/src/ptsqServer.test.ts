import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { PtsqError } from './ptsqError';
import { PtsqServer } from './ptsqServer';

test('Should create server with 2 nested middlewares that runs before and after call', async () => {
  const serverMiddlewareState = {
    firstRequest: false,
    firstReponse: false,
    secondRequest: false,
    secondResponse: false,
  };

  const { resolver, router, serve } = PtsqServer.init()
    .use(async ({ next }) => {
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: false,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      serverMiddlewareState.firstRequest = true;
      const response = await next();
      serverMiddlewareState.firstReponse = true;
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: true,
        secondRequest: true,
        secondResponse: true,
      });

      return response;
    })
    .use(async ({ next }) => {
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      serverMiddlewareState.secondRequest = true;
      const response = await next();
      serverMiddlewareState.secondResponse = true;
      expect(serverMiddlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: true,
        secondResponse: true,
      });

      return response;
    })
    .create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  const response = await fetch({
    type: 'query',
    route: 'test',
  });

  expect(response.data).toBe('Hello');

  expect(serverMiddlewareState).toStrictEqual({
    firstRequest: true,
    firstReponse: true,
    secondRequest: true,
    secondResponse: true,
  });

  await $disconnect();
});

test('Should create server with middleware that runs before and after invalid route call, where the error is thrown by a router', async () => {
  let wasCheckedByMiddelware = false;

  const { resolver, router, serve } = PtsqServer.init()
    .use(async ({ next }) => {
      const response = await next();

      expect(response).toStrictEqual({
        ok: false,
        error: new PtsqError({
          code: 'NOT_FOUND',
          message: 'The route was invalid.',
        }),
        ctx: {},
      });

      wasCheckedByMiddelware = true;

      return response;
    })
    .create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(
    fetch({
      route: 'dummy.route',
      type: 'query',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: 'The route was invalid.',
      },
    },
  });

  expect(wasCheckedByMiddelware).toBe(true);

  await $disconnect();
});

test('Should create server with middleware that runs before and after invalid type call, where the error is thrown by a router', async () => {
  let wasCheckedByMiddelware = false;

  const { resolver, router, serve } = PtsqServer.init()
    .use(async ({ next }) => {
      const response = await next();

      console.log(response);

      expect(response).toStrictEqual({
        ok: false,
        error: new PtsqError({
          code: 'BAD_REQUEST',
          message: `The route type is invalid, it should be query and it is mutation.`,
        }),
        ctx: {},
      });

      wasCheckedByMiddelware = true;

      return response;
    })
    .create();

  const baseRouter = router({
    test: resolver.output(Type.String()).query(() => 'Hello'),
  });

  const { fetch, $disconnect } = await createHttpTestServer(serve(baseRouter));

  await expect(
    fetch({
      route: 'test',
      type: 'mutation',
    }),
  ).rejects.toMatchObject({
    response: {
      data: {
        name: 'PtsqError',
        message: `The route type is invalid, it should be query and it is mutation.`,
      },
    },
  });

  expect(wasCheckedByMiddelware).toBe(true);

  await $disconnect();
});
