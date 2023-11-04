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

  const measuredResolver = resolver.use(async ({ ctx, next }) => {
    console.log('measuredResolver middleware start');

    console.time('time');
    console.log('measuredResolver middleware next');
    const result = await next(ctx);
    console.log('result was: ', result);
    console.timeEnd('time');

    console.log('measuredResolver middleware end');
    return result;
  });

  const query = measuredResolver.query({
    output: z.string(),
    resolve: async () => {
      console.log('Resolver run');
      return Promise.resolve('Hello');
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

  expect(await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: {} })).toStrictEqual({
    ctx: {},
    data: 'Hello',
    ok: true,
  });
});

test('Should create two nested middlewares', async () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const resolver1 = resolver.use(async ({ ctx, next }) => {
    console.log('resolver1 middleware start');

    console.time('time1');
    const result = await next(ctx);
    console.log('result of resolver1 middleware was: ', result);
    console.timeEnd('time1');

    console.log('resolver1 middleware end');
    return result;
  });

  const resolver2 = resolver1.use(async ({ ctx, next }) => {
    console.log('resolver2 middleware start');

    console.time('time2');
    const result = await next(ctx);
    console.log('result of resolver2 middleware was: ', result);
    console.timeEnd('time2');

    console.log('resolver2 middleware end');
    return result;
  });

  const query = resolver2.query({
    output: z.string(),
    resolve: async () => {
      console.log('Resolver run');
      return Promise.resolve('Hello');
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

  expect(await query.call({ meta: { input: undefined, route: 'dummy.route' }, ctx: {} })).toStrictEqual({
    ctx: {},
    data: 'Hello',
    ok: true,
  });
});
