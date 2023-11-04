import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';
import { HTTPError } from './httpError';

test('Should create middleware with query', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid',
  };

  const { resolver } = createServer({
    ctx: () => contextBuilderResult,
  });

  const validResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const query = resolver.query({
    output: z.string(),
    resolve: ({ ctx }) => ctx.state,
  });

  const validOnlyQuery = validResolver.query({
    output: z.string(),
    resolve: ({ ctx }) => ctx.state,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);

  expect(validOnlyQuery.nodeType).toBe('route');
  expect(validOnlyQuery.type).toBe('query');
  expect(validOnlyQuery.middlewares).toMatchInlineSnapshot(`
    [
      Middleware {
        "middlewareCallback": [Function],
      },
    ]
  `);

  expect(
    await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });
  //expect(await query.createServerSideQuery(contextBuilderResult).query()).toBe('invalid');

  expect(
    await validOnlyQuery.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  /*await expect(validOnlyQuery.createServerSideQuery(contextBuilderResult).query()).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );*/

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  //expect(await query.createServerSideQuery(contextBuilderResult).query()).toBe('valid');

  expect(
    await validOnlyQuery.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  // expect(await validOnlyQuery.createServerSideQuery(contextBuilderResult).query()).toBe('valid');
});

test('Should create middleware with mutation', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid',
  };

  const { resolver } = createServer({
    ctx: () => contextBuilderResult,
  });

  const validResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const mutation = resolver.mutation({
    output: z.string(),
    resolve: ({ ctx }) => ctx.state,
  });

  const validOnlyMutation = validResolver.mutation({
    output: z.string(),
    resolve: ({ ctx }) => ctx.state,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);

  expect(validOnlyMutation.nodeType).toBe('route');
  expect(validOnlyMutation.type).toBe('mutation');
  expect(validOnlyMutation.middlewares).toMatchInlineSnapshot(`
    [
      Middleware {
        "middlewareCallback": [Function],
      },
    ]
  `);

  expect(
    await mutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });
  //expect(await mutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('invalid');

  expect(
    await validOnlyMutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });
  /*await expect(validOnlyMutation.createServerSideMutation(contextBuilderResult).mutate()).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );*/

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await mutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
  //expect(await mutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('valid');

  expect(
    await validOnlyMutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
  //expect(await validOnlyMutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('valid');
});

test('Should create middleware with measuring time', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

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

  const query = measuredResolver.query({
    output: z.string(),
    resolve: async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, resolverDelay);
      });

      return 'Hello';
    },
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toMatchInlineSnapshot(`
    [
      Middleware {
        "middlewareCallback": [Function],
      },
    ]
  `);

  expect(middlewareWasCalled).toBe(false);
  expect(middlewareMeasuredTime).toBe(0);

  expect(await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: {} })).toStrictEqual({
    ctx: {},
    data: 'Hello',
    ok: true,
  });

  expect(middlewareWasCalled).toBe(true);
  expect(middlewareMeasuredTime).toBeGreaterThanOrEqual(resolverDelay);
});

test('Should create two nested middlewares', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

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

  const query = resolver2.query({
    output: z.string(),
    resolve: async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, resolverDelay);
      });

      return 'Hello';
    },
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toMatchInlineSnapshot(`
    [
      Middleware {
        "middlewareCallback": [Function],
      },
      Middleware {
        "middlewareCallback": [Function],
      },
    ]
  `);

  expect(innerMiddlewareWasCalled).toBe(false);
  expect(outerMiddlewareWasCalled).toBe(false);
  expect(middlewareMeasuredTime).toBe(0);

  expect(await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: {} })).toStrictEqual({
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
    state: 'invalid' as 'valid' | 'invalid' | undefined,
  };

  const { resolver } = createServer({
    ctx: () => contextBuilderResult,
  });

  const dummyResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === undefined) throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const validResolver = dummyResolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const query = resolver.query({
    output: z.union([z.string(), z.undefined()]),
    resolve: ({ ctx }) => ctx.state,
  });

  const validOnlyQuery = validResolver.query({
    output: z.string(),
    resolve: ({ ctx }) => ctx.state,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);

  expect(validOnlyQuery.nodeType).toBe('route');
  expect(validOnlyQuery.type).toBe('query');
  expect(validOnlyQuery.middlewares).toMatchInlineSnapshot(`
    [
      Middleware {
        "middlewareCallback": [Function],
      },
      Middleware {
        "middlewareCallback": [Function],
      },
    ]
  `);

  expect(
    await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });
  //expect(await query.createServerSideQuery(contextBuilderResult).query()).toBe('invalid');

  expect(
    await validOnlyQuery.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  /*await expect(validOnlyQuery.createServerSideQuery(contextBuilderResult).query()).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );*/

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  //expect(await query.createServerSideQuery(contextBuilderResult).query()).toBe('valid');

  expect(
    await validOnlyQuery.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  // expect(await validOnlyQuery.createServerSideQuery(contextBuilderResult).query()).toBe('valid');
});

test('Should create nested middlewares with mutation', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid' | undefined,
  };

  const { resolver } = createServer({
    ctx: () => contextBuilderResult,
  });

  const dummyResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === undefined) throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const validResolver = dummyResolver.use(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const mutation = resolver.mutation({
    output: z.union([z.string(), z.undefined()]),
    resolve: ({ ctx }) => ctx.state,
  });

  const validOnlyMutation = validResolver.mutation({
    output: z.string(),
    resolve: ({ ctx }) => ctx.state,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);

  expect(validOnlyMutation.nodeType).toBe('route');
  expect(validOnlyMutation.type).toBe('mutation');
  expect(validOnlyMutation.middlewares).toMatchInlineSnapshot(`
    [
      Middleware {
        "middlewareCallback": [Function],
      },
      Middleware {
        "middlewareCallback": [Function],
      },
    ]
  `);

  expect(
    await mutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });
  //expect(await mutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('invalid');

  expect(
    await validOnlyMutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });
  /*await expect(validOnlyMutation.createServerSideMutation(contextBuilderResult).mutate()).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );*/

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(
    await mutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
  //expect(await mutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('valid');

  expect(
    await validOnlyMutation.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
  //expect(await validOnlyMutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('valid');
});
