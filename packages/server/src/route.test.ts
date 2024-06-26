import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { defaultJsonSchemaParser } from './jsonSchemaParser';
import { Middleware } from './middleware';
import { PtsqError } from './ptsqError';
import { Route } from './route';

test('Should create query route without description', async () => {
  const inputSchema = Type.Object({ name: Type.String() });
  const outputSchema = Type.String();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `${input.name}`;

  const query = new Route({
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: undefined,
    parser: defaultJsonSchemaParser,
  });

  expect(query).toMatchObject({
    nodeType: 'route',
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    description: undefined,
    _def: {
      middlewares: [],
      resolveFunction: resolveFunction,
      parser: defaultJsonSchemaParser,
    },
  });

  expect(
    await query.call({
      meta: { type: 'query', input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'John',
    ok: true,
  });

  expect(query.getSchema()).toMatchInlineSnapshot(`
    {
      "argsSchema": {
        "properties": {
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
        ],
        "type": "object",
      },
      "description": undefined,
      "nodeType": "route",
      "outputSchema": {
        "type": "string",
      },
      "type": "query",
    }
  `);
});

test('Should create mutation route with description', async () => {
  const inputSchema = Type.Object({ name: Type.String() });
  const outputSchema = Type.String();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `${input.name}`;

  const mutation = new Route({
    type: 'mutation',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: 'description',
    parser: defaultJsonSchemaParser,
  });

  expect(mutation).toMatchObject({
    nodeType: 'route',
    type: 'mutation',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    description: 'description',
    _def: {
      middlewares: [],
      resolveFunction: resolveFunction,
      parser: defaultJsonSchemaParser,
    },
  });

  expect(
    await mutation.call({
      meta: { type: 'query', input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'John',
    ok: true,
  });

  expect(mutation.getSchema()).toMatchInlineSnapshot(`
    {
      "argsSchema": {
        "properties": {
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
        ],
        "type": "object",
      },
      "description": "description",
      "nodeType": "route",
      "outputSchema": {
        "type": "string",
      },
      "type": "mutation",
    }
  `);
});

test('Should create query route and throw error inside resolve function', async () => {
  const query = new Route({
    type: 'query',
    argsSchema: undefined,
    outputSchema: Type.String(),
    resolveFunction: ({ ctx }: { ctx: { test: boolean } }) => {
      if (ctx.test) throw new Error('Test error');
      return 'test';
    },
    middlewares: [],
    description: undefined,
    parser: defaultJsonSchemaParser,
  });

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: { test: true },
    }),
  ).toStrictEqual({
    ok: false,
    error: new PtsqError({ code: 'INTERNAL_SERVER_ERROR' }),
  });
});

test('Should create mutation route and throw error inside resolve function', async () => {
  const mutation = new Route({
    type: 'mutation',
    argsSchema: undefined,
    outputSchema: Type.String(),
    resolveFunction: ({ ctx }: { ctx: { test: boolean } }) => {
      if (ctx.test) throw new Error('Test error');
      return 'test';
    },
    middlewares: [],
    description: undefined,
    parser: defaultJsonSchemaParser,
  });

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: { test: true },
    }),
  ).toStrictEqual({
    ok: false,
    error: new PtsqError({ code: 'INTERNAL_SERVER_ERROR' }),
  });
});

test('Should create query route and return wrong type', async () => {
  const inputSchema = Type.Object({ name: Type.String() });
  const outputSchema = Type.String();
  const resolveFunction = ({
    input: _input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => 42;

  const query = new Route({
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: undefined,
    parser: defaultJsonSchemaParser,
  });

  expect(
    await query.call({
      meta: { type: 'query', input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    error: new PtsqError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Output validation error',
    }),
    ok: false,
  });
});

test('Should create query route and call resolve', () => {
  const inputSchema = Type.Object({ name: Type.String() });
  const outputSchema = Type.String();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `Hello ${input.name}`;

  const query = new Route({
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: undefined,
    parser: defaultJsonSchemaParser,
  });

  expect(
    query.resolve({
      input: { name: 'John' },
      ctx: {},
      meta: {
        input: { name: 'John' },
        route: 'dummy.route',
        type: 'query',
      },
    }),
  ).toBe('Hello John');
});

test('Should create query route with middleware and call resolve', () => {
  const inputSchema = Type.Object({ name: Type.String() });
  const outputSchema = Type.String();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `Hello ${input.name}`;

  const query = new Route({
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [
      new Middleware({
        argsSchema: undefined,
        middlewareFunction: ({ next }) => {
          // for test failure! - should not be called
          throw new Error();
          return next();
        },
        parser: defaultJsonSchemaParser,
      }),
    ],
    description: undefined,
    parser: defaultJsonSchemaParser,
  });

  expect(
    query.resolve({
      input: { name: 'John' },
      ctx: {},
      meta: {
        input: { name: 'John' },
        route: 'dummy.route',
        type: 'query',
      },
    }),
  ).toBe('Hello John');
});
