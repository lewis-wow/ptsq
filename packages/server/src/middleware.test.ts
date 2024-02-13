import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { middleware } from './middleware';
import { PtsqError } from './ptsqError';
import { PtsqServer } from './ptsqServer';

test('Should create middleware with query and serverSideQuery', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid',
  };

  const { resolver } = PtsqServer.init({
    ctx: () => contextBuilderResult,
  }).create();

  const validResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new PtsqError({ code: 'BAD_REQUEST' });

    return next({
      ctx: {
        state: ctx.state,
      },
    });
  });

  const query = resolver.output(Type.String()).query(({ ctx }) => ctx.state);

  const validOnlyQuery = validResolver
    .output(Type.String())
    .query(({ ctx }) => ctx.state);

  expect(query._def.middlewares.length).toBe(0);

  expect(validOnlyQuery._def.middlewares.length).toBe(1);
  expect(validOnlyQuery._def.middlewares[0]._def.argsSchema).toBe(undefined);

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    error: new PtsqError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    data: 'valid',
    ok: true,
  });
});

test('Should create middleware with mutation and serverSideMutation', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid',
  };

  const { resolver } = PtsqServer.init({
    ctx: () => contextBuilderResult,
  }).create();

  const validResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new PtsqError({ code: 'BAD_REQUEST' });

    return next({
      ctx: {
        state: ctx.state,
      },
    });
  });

  const mutation = resolver
    .output(Type.String())
    .mutation(({ ctx }) => ctx.state);

  const validOnlyMutation = validResolver
    .output(Type.String())
    .mutation(({ ctx }) => ctx.state);

  expect(mutation._def.middlewares.length).toBe(0);

  expect(validOnlyMutation._def.middlewares.length).toBe(1);
  expect(validOnlyMutation._def.middlewares[0]._def.argsSchema).toBe(undefined);

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new PtsqError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
});

test('Should create middleware with measuring time', async () => {
  const { resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  let middlewareWasCalled = false;
  let middlewareMeasuredTime = 0; // ms
  const resolverDelay = 1000; // ms

  const measuredResolver = resolver.use(async ({ ctx, next }) => {
    middlewareWasCalled = true;

    const timeStart = performance.now();
    const result = await next(ctx);
    middlewareMeasuredTime = performance.now() - timeStart;

    return result;
  });

  const query = measuredResolver.output(Type.String()).query(async () => {
    await new Promise((resolve) => {
      // + 100 = small correction
      setTimeout(resolve, resolverDelay + 100);
    });

    return 'Hello';
  });

  expect(query._def.middlewares.length).toBe(1);
  expect(query._def.middlewares[0]._def.argsSchema).toBe(undefined);

  expect(middlewareWasCalled).toBe(false);
  expect(middlewareMeasuredTime).toBe(0);

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: {},
    }),
  ).toStrictEqual({
    ctx: {},
    data: 'Hello',
    ok: true,
  });

  expect(middlewareWasCalled).toBe(true);
  expect(middlewareMeasuredTime).toBeGreaterThanOrEqual(resolverDelay);
});

test('Should create two nested middlewares', async () => {
  const { resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  let outerMiddlewareWasCalled = false;
  let innerMiddlewareWasCalled = false;

  let middlewareMeasuredTime = 0; // ms
  const resolverDelay = 1000; // ms

  const resolverResponse = {
    ctx: {},
    data: 'Hello',
    ok: true,
  };

  const resolver1 = resolver.use(async ({ ctx, next }) => {
    outerMiddlewareWasCalled = true;

    const timeStart = performance.now();
    const result = await next(ctx);
    middlewareMeasuredTime += performance.now() - timeStart;

    expect(result).toStrictEqual(resolverResponse);

    return result;
  });

  const resolver2 = resolver1.use(async ({ ctx, next }) => {
    innerMiddlewareWasCalled = true;

    const timeStart = performance.now();

    await new Promise((resolve) => {
      setTimeout(resolve, resolverDelay);
    });

    const result = await next(ctx);

    middlewareMeasuredTime += performance.now() - timeStart;

    expect(result).toStrictEqual(resolverResponse);

    return result;
  });

  const query = resolver2.output(Type.String()).query(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, resolverDelay);
    });

    return 'Hello';
  });

  expect(query._def.middlewares.length).toBe(2);
  expect(query._def.middlewares[0]._def.argsSchema).toBe(undefined);
  expect(query._def.middlewares[1]._def.argsSchema).toBe(undefined);

  expect(innerMiddlewareWasCalled).toBe(false);
  expect(outerMiddlewareWasCalled).toBe(false);
  expect(middlewareMeasuredTime).toBe(0);

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: {},
    }),
  ).toStrictEqual({
    ctx: {},
    data: 'Hello',
    ok: true,
  });

  expect(innerMiddlewareWasCalled).toBe(true);
  expect(outerMiddlewareWasCalled).toBe(true);
  expect(middlewareMeasuredTime).toBeGreaterThanOrEqual(2 * resolverDelay);
});

test('Should create nested middlewares with query', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid' | null,
  };

  const { resolver } = PtsqServer.init({
    ctx: () => contextBuilderResult,
  }).create();

  const dummyResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === null) throw new PtsqError({ code: 'BAD_REQUEST' });

    return next({
      ctx: {
        state: ctx.state,
      },
    });
  });

  const validResolver = dummyResolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new PtsqError({ code: 'BAD_REQUEST' });

    return next({
      ctx: {
        state: ctx.state,
      },
    });
  });

  const query = resolver
    .output(Type.Union([Type.String(), Type.Null()]))
    .query(({ ctx }) => ctx.state);

  const validOnlyQuery = validResolver
    .output(Type.String())
    .query(({ ctx }) => ctx.state);

  expect(query._def.middlewares.length).toBe(0);

  expect(validOnlyQuery._def.middlewares.length).toBe(2);
  expect(validOnlyQuery._def.middlewares[0]._def.argsSchema).toBe(undefined);
  expect(validOnlyQuery._def.middlewares[1]._def.argsSchema).toBe(undefined);

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new PtsqError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
});

test('Should create nested middlewares with mutation', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid' | null,
  };

  const { resolver } = PtsqServer.init({
    ctx: () => contextBuilderResult,
  }).create();

  const dummyResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === null) throw new PtsqError({ code: 'BAD_REQUEST' });

    return next({
      ctx: {
        state: ctx.state,
      },
    });
  });

  const validResolver = dummyResolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new PtsqError({ code: 'BAD_REQUEST' });

    return next({
      ctx: {
        state: ctx.state,
      },
    });
  });

  const mutation = resolver
    .output(Type.Union([Type.String(), Type.Null()]))
    .mutation(({ ctx }) => ctx.state);

  const validOnlyMutation = validResolver
    .output(Type.String())
    .mutation(({ ctx }) => ctx.state);

  expect(mutation._def.middlewares.length).toBe(0);

  expect(validOnlyMutation._def.middlewares.length).toBe(2);
  expect(validOnlyMutation._def.middlewares[0]._def.argsSchema).toBe(undefined);
  expect(validOnlyMutation._def.middlewares[1]._def.argsSchema).toBe(undefined);

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new PtsqError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
});

test('Should create nested middlewares with query with args chaining', async () => {
  const { resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const stringSchema = Type.String();

  const firstSchemaInChain = Type.Object({
    name: stringSchema,
  });

  const secondSchemaInChain = Type.Object({
    name: stringSchema,
    lastName: stringSchema,
  });

  const resolverWithName = resolver.args(firstSchemaInChain);

  const resolverWithNameWithMiddleware = resolverWithName.use(
    ({ input, next }) => {
      // can log the input for example!
      return next({
        ctx: {
          name: input.name,
        },
      });
    },
  );

  const resolverWithNameChainAndLastName =
    resolverWithNameWithMiddleware.args(secondSchemaInChain);

  const resolverWithNameChainAndLastNameWithMiddleware =
    resolverWithNameChainAndLastName.use(({ input, next }) => {
      // can log the input for example!
      return next({
        ctx: {
          name: input.name,
          lastName: input.lastName,
        },
      });
    });

  const query = resolverWithNameChainAndLastNameWithMiddleware
    .output(Type.String())
    .query(({ ctx }) => `${ctx.name} ${ctx.lastName}`);

  expect(query._def.middlewares.length).toBe(2);
  expect(query._def.middlewares[0]._def.argsSchema).toBe(firstSchemaInChain);
  expect(query._def.middlewares[1]._def.argsSchema).toStrictEqual(
    Type.Intersect([firstSchemaInChain, secondSchemaInChain]),
  );

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { name: 'John', lastName: 'Doe' },
        route: 'dummy.route',
      },
      ctx: {},
    }),
  ).toStrictEqual({
    ctx: { name: 'John', lastName: 'Doe' },
    data: 'John Doe',
    ok: true,
  });
});

test('Should create nested middlewares with query and returns response recursivelly', async () => {
  const { resolver } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const middlewareState = {
    firstRequest: false,
    firstReponse: false,
    secondRequest: false,
    secondResponse: false,
  };

  const query = resolver
    .use(async ({ next }) => {
      expect(middlewareState).toStrictEqual({
        firstRequest: false,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      middlewareState.firstRequest = true;
      const response = await next();
      middlewareState.firstReponse = true;
      expect(middlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: true,
        secondRequest: true,
        secondResponse: true,
      });

      expect(response).toStrictEqual({
        ok: true,
        data: 'Hello',
        ctx: {},
      });

      return response;
    })
    .use(async ({ next }) => {
      expect(middlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      middlewareState.secondRequest = true;
      const response = await next();
      middlewareState.secondResponse = true;
      expect(middlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: true,
        secondResponse: true,
      });

      expect(response).toStrictEqual({
        ok: true,
        data: 'Hello',
        ctx: {},
      });

      return response;
    })
    .output(Type.String())
    .query(() => 'Hello');

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: undefined,
        route: 'dummy.route',
      },
      ctx: {},
    }),
  ).toStrictEqual({
    ctx: {},
    data: 'Hello',
    ok: true,
  });
});

test('Should create nested middlewares with query and returns response recursivelly but call the router', async () => {
  const { resolver, router } = PtsqServer.init({
    ctx: () => ({}),
  }).create();

  const middlewareState = {
    firstRequest: false,
    firstReponse: false,
    secondRequest: false,
    secondResponse: false,
  };

  const query = resolver
    .use(async ({ next }) => {
      expect(middlewareState).toStrictEqual({
        firstRequest: false,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      middlewareState.firstRequest = true;
      const response = await next();
      middlewareState.firstReponse = true;
      expect(middlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: true,
        secondRequest: true,
        secondResponse: true,
      });

      expect(response).toStrictEqual({
        ok: true,
        data: 'Hello',
        ctx: {},
      });

      return response;
    })
    .use(async ({ next }) => {
      expect(middlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: false,
        secondResponse: false,
      });
      middlewareState.secondRequest = true;
      const response = await next();
      middlewareState.secondResponse = true;
      expect(middlewareState).toStrictEqual({
        firstRequest: true,
        firstReponse: false,
        secondRequest: true,
        secondResponse: true,
      });

      expect(response).toStrictEqual({
        ok: true,
        data: 'Hello',
        ctx: {},
      });

      return response;
    })
    .output(Type.String())
    .query(() => Promise.resolve('Hello'));

  const baseRouter = router({
    test: query,
  });

  expect(
    await baseRouter.call({
      route: ['test'],
      index: 0,
      type: 'query',
      meta: {
        type: 'query',
        input: undefined,
        route: 'dummy.route',
      },
      ctx: {},
    }),
  ).toStrictEqual({
    ctx: {},
    data: 'Hello',
    ok: true,
  });
});

test('Should create standalone middleware with query', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid',
  };

  const { resolver } = PtsqServer.init({
    ctx: () => contextBuilderResult,
  }).create();

  const standaloneMiddleware = middleware<{
    ctx: {
      state: 'valid' | 'invalid';
    };
  }>().create(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new PtsqError({ code: 'BAD_REQUEST' });

    return next({
      ctx: {
        state: ctx.state,
      },
    });
  });

  const validResolver = resolver.use(standaloneMiddleware);

  const query = resolver.output(Type.String()).query(({ ctx }) => ctx.state);

  const validOnlyQuery = validResolver
    .output(Type.String())
    .query(({ ctx }) => ctx.state);

  expect(query._def.middlewares.length).toBe(0);

  expect(validOnlyQuery._def.middlewares.length).toBe(1);
  expect(validOnlyQuery._def.middlewares[0]._def.argsSchema).toBe(undefined);

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new PtsqError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: contextBuilderResult,
    }),
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
});
