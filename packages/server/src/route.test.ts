import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { Compiler } from './compiler';
import { Middleware } from './middleware';
import { PtsqError } from './ptsqError';
import { Route } from './route';

test('Should create query route', async () => {
  const inputSchema = Type.Object({ name: Type.String() });
  const outputSchema = Type.String();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `${input.name}`;

  const compiler = new Compiler();

  const query = new Route({
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: undefined,
    compiler: compiler,
  });

  expect(query._def).toStrictEqual({
    nodeType: 'route',
    type: 'query',
    middlewares: [],
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    description: undefined,
    compiler: compiler,
  });

  expect(
    await query.call({
      meta: { type: 'query', input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(query.getJsonSchema()).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "_def": {
          "additionalProperties": false,
          "properties": {
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
            "nodeType": {
              "enum": [
                "route",
              ],
              "type": "string",
            },
            "outputSchema": {
              "type": "string",
            },
            "type": {
              "enum": [
                "query",
              ],
              "type": "string",
            },
          },
          "required": [
            "type",
            "nodeType",
            "argsSchema",
            "outputSchema",
            "description",
          ],
          "type": "object",
        },
      },
      "required": [
        "_def",
      ],
      "type": "object",
    }
  `);
});

test('Should create mutation route', async () => {
  const inputSchema = Type.Object({ name: Type.String() });
  const outputSchema = Type.String();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `${input.name}`;

  const compiler = new Compiler();

  const mutation = new Route({
    type: 'mutation',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: undefined,
    compiler: compiler,
  });

  expect(mutation._def).toStrictEqual({
    nodeType: 'route',
    type: 'mutation',
    middlewares: [],
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    description: undefined,
    compiler: compiler,
  });

  expect(
    await mutation.call({
      meta: { type: 'query', input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(mutation.getJsonSchema()).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "_def": {
          "additionalProperties": false,
          "properties": {
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
            "nodeType": {
              "enum": [
                "route",
              ],
              "type": "string",
            },
            "outputSchema": {
              "type": "string",
            },
            "type": {
              "enum": [
                "mutation",
              ],
              "type": "string",
            },
          },
          "required": [
            "type",
            "nodeType",
            "argsSchema",
            "outputSchema",
            "description",
          ],
          "type": "object",
        },
      },
      "required": [
        "_def",
      ],
      "type": "object",
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
    compiler: new Compiler(),
  });

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: { test: true },
    }),
  ).toStrictEqual({
    ok: false,
    ctx: {
      test: true,
    },
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
    compiler: new Compiler(),
  });

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: { test: true },
    }),
  ).toStrictEqual({
    ok: false,
    ctx: {
      test: true,
    },
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

  const compiler = new Compiler();

  const query = new Route({
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: undefined,
    compiler: compiler,
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
    ctx: {
      greetingsPrefix: 'Hello',
    },
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

  const compiler = new Compiler();

  const query = new Route({
    type: 'query',
    argsSchema: inputSchema,
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    description: undefined,
    compiler: compiler,
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

  const compiler = new Compiler();

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
        compiler,
      }),
    ],
    description: undefined,
    compiler: compiler,
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
