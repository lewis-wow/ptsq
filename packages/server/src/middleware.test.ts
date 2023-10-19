import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';
import { HTTPError } from './httpError';

test('Should create middleware with query', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid',
  };

  const { resolver, middleware } = createServer({
    ctx: () => contextBuilderResult,
  });

  const isValidMiddleware = middleware(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const validResolver = resolver.use(isValidMiddleware);

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
  expect(validOnlyQuery.middlewares).toStrictEqual([isValidMiddleware]);

  expect(await query.call({ input: undefined, ctx: contextBuilderResult })).toBe('invalid');
  expect(await query.createServerSideQuery(contextBuilderResult).query()).toBe('invalid');

  await expect(validOnlyQuery.call({ input: undefined, ctx: contextBuilderResult })).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );
  await expect(validOnlyQuery.createServerSideQuery(contextBuilderResult).query()).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(await query.call({ input: undefined, ctx: contextBuilderResult })).toBe('valid');
  expect(await query.createServerSideQuery(contextBuilderResult).query()).toBe('valid');

  expect(await validOnlyQuery.call({ input: undefined, ctx: contextBuilderResult })).toBe('valid');
  expect(await validOnlyQuery.createServerSideQuery(contextBuilderResult).query()).toBe('valid');
});

test('Should create middleware with mutation', async () => {
  let contextBuilderResult = {
    state: 'invalid' as 'valid' | 'invalid',
  };

  const { resolver, middleware } = createServer({
    ctx: () => contextBuilderResult,
  });

  const isValidMiddleware = middleware(({ ctx, next }) => {
    if (ctx.state === 'invalid') throw new HTTPError({ code: 'BAD_REQUEST' });

    return next({
      ...ctx,
      state: ctx.state,
    });
  });

  const validResolver = resolver.use(isValidMiddleware);

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
  expect(validOnlyMutation.middlewares).toStrictEqual([isValidMiddleware]);

  expect(await mutation.call({ input: undefined, ctx: contextBuilderResult })).toBe('invalid');
  expect(await mutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('invalid');

  await expect(validOnlyMutation.call({ input: undefined, ctx: contextBuilderResult })).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );
  await expect(validOnlyMutation.createServerSideMutation(contextBuilderResult).mutate()).rejects.toThrow(
    new HTTPError({ code: 'BAD_REQUEST' })
  );

  contextBuilderResult = {
    state: 'valid' as 'valid' | 'invalid',
  };

  expect(await mutation.call({ input: undefined, ctx: contextBuilderResult })).toBe('valid');
  expect(await mutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('valid');

  expect(await validOnlyMutation.call({ input: undefined, ctx: contextBuilderResult })).toBe('valid');
  expect(await validOnlyMutation.createServerSideMutation(contextBuilderResult).mutate()).toBe('valid');
});
