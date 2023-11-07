import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';
import { HTTPError } from './httpError';

test('Should create middleware with query and serverSideQuery', async () => {
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
  expect(validOnlyQuery.middlewares.length).toBe(1);
  expect(validOnlyQuery.middlewares[0]._args).toStrictEqual({});

  expect(await query.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await query.createServerSideQuery({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).query()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  expect(
    await validOnlyQuery.createServerSideQuery({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).query()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(await query.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await query.createServerSideQuery({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).query()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyQuery.createServerSideQuery({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).query()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
});

test('Should create middleware with mutation and serverSideMutation', async () => {
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
  expect(validOnlyMutation.middlewares.length).toBe(1);
  expect(validOnlyMutation.middlewares[0]._args).toStrictEqual({});

  expect(await mutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await mutation.createServerSideMutation({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).mutate()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  expect(
    await validOnlyMutation.createServerSideMutation({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).mutate()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(await mutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await mutation.createServerSideMutation({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).mutate()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyMutation.createServerSideMutation({ ctx: contextBuilderResult, route: ['dummy', 'route'] }).mutate()
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
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
  expect(query.middlewares.length).toBe(1);
  expect(query.middlewares[0]._args).toStrictEqual({});

  expect(middlewareWasCalled).toBe(false);
  expect(middlewareMeasuredTime).toBe(0);

  expect(await query.call({ meta: { input: {}, route: 'dummy.route' }, ctx: {} })).toStrictEqual({
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
  expect(query.middlewares.length).toBe(2);
  expect(query.middlewares[0]._args).toStrictEqual({});
  expect(query.middlewares[1]._args).toStrictEqual({});

  expect(innerMiddlewareWasCalled).toBe(false);
  expect(outerMiddlewareWasCalled).toBe(false);
  expect(middlewareMeasuredTime).toBe(0);

  expect(await query.call({ meta: { input: {}, route: 'dummy.route' }, ctx: {} })).toStrictEqual({
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

  const { resolver } = createServer({
    ctx: () => contextBuilderResult,
  });

  const dummyResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === null) throw new HTTPError({ code: 'BAD_REQUEST' });

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
    output: z.union([z.string(), z.null()]),
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
  expect(validOnlyQuery.middlewares.length).toBe(2);
  expect(validOnlyQuery.middlewares[0]._args).toStrictEqual({});
  expect(validOnlyQuery.middlewares[1]._args).toStrictEqual({});

  expect(await query.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(await query.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyQuery.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
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

  const { resolver } = createServer({
    ctx: () => contextBuilderResult,
  });

  const dummyResolver = resolver.use(({ ctx, next }) => {
    if (ctx.state === null) throw new HTTPError({ code: 'BAD_REQUEST' });

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
    output: z.union([z.string(), z.null()]),
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
  expect(validOnlyMutation.middlewares.length).toBe(2);
  expect(validOnlyMutation.middlewares[0]._args).toStrictEqual({});
  expect(validOnlyMutation.middlewares[1]._args).toStrictEqual({});

  expect(await mutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'invalid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    error: new HTTPError({ code: 'BAD_REQUEST' }),
    ok: false,
  });

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(await mutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });

  expect(
    await validOnlyMutation.call({ meta: { input: {}, route: 'dummy.route' }, ctx: contextBuilderResult })
  ).toStrictEqual({
    ctx: contextBuilderResult,
    data: 'valid',
    ok: true,
  });
});

test('Should create nested middlewares with query with args chaining', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const stringSchema = z.string();

  const resolverWithName = resolver.args({
    name: stringSchema,
  });

  const resolverWithNameWithMiddleware = resolverWithName.use(({ ctx, input, next }) => {
    // can log the input for example!

    return next({
      ...ctx,
      name: input.name,
    });
  });

  const resolverWithNameChainAndLastName = resolverWithNameWithMiddleware.args({
    lastName: stringSchema,
  });

  const resolverWithNameChainAndLastNameWithMiddleware = resolverWithNameChainAndLastName.use(
    ({ ctx, input, next }) => {
      // can log the input for example!
      return next({
        ...ctx,
        name: input.name,
        lastName: input.lastName,
      });
    }
  );

  const query = resolverWithNameChainAndLastNameWithMiddleware.query({
    output: z.string(),
    resolve: ({ ctx }) => `${ctx.name} ${ctx.lastName}`,
  });
  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares.length).toBe(2);
  expect(query.middlewares[0]._args).toStrictEqual({ name: stringSchema });
  expect(query.middlewares[1]._args).toStrictEqual({
    name: stringSchema,
    lastName: stringSchema,
  });

  expect(
    await query.call({ meta: { input: { name: 'John', lastName: 'Doe' }, route: 'dummy.route' }, ctx: {} })
  ).toStrictEqual({
    ctx: { name: 'John', lastName: 'Doe' },
    data: 'John Doe',
    ok: true,
  });

  expect(
    await query.createServerSideQuery({ ctx: {}, route: ['dummy', 'route'] }).query({ name: 'John', lastName: 'Doe' })
  ).toStrictEqual({
    ctx: { name: 'John', lastName: 'Doe' },
    data: 'John Doe',
    ok: true,
  });
});
