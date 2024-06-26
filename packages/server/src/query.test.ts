import { Type } from '@sinclair/typebox';
import { v4 as uuidv4 } from 'uuid';
import { expect, test } from 'vitest';
import { defaultJsonSchemaParser } from './jsonSchemaParser';
import { PtsqError } from './ptsqError';
import { ptsq } from './ptsqServerBuilder';

test('Should create query', async () => {
  const { resolver } = ptsq({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  }).create();

  const argsSchema = Type.Object({ name: Type.String() });
  const outputValidationSchema = Type.String();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input: { name: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix} ${input.name}`;

  const query = resolver
    .args(argsSchema)
    .output(outputValidationSchema)
    .query(resolveFunction);

  expect(query).toMatchObject({
    nodeType: 'route',
    type: 'query',
    argsSchema: argsSchema,
    outputSchema: outputValidationSchema,
    description: undefined,
    _def: {
      middlewares: [],
      parser: defaultJsonSchemaParser,
      resolveFunction: resolveFunction,
    },
  });

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { name: 'John' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello John',
    ok: true,
  });

  expect(
    await query.call({
      meta: { type: 'query', input: 'John', route: `dummy.route.${uuidv4()}` },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    error: new PtsqError({
      code: 'BAD_REQUEST',
      message: 'Args validation error.',
    }),
    ok: false,
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

test('Should create query without args', async () => {
  const { resolver } = ptsq({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  }).create();

  const validationSchema = Type.String();

  const resolveFunction = ({
    ctx,
  }: {
    input: unknown;
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix}`;

  const query = resolver.output(validationSchema).query(resolveFunction);

  expect(query).toMatchObject({
    nodeType: 'route',
    type: 'query',
    argsSchema: undefined,
    outputSchema: validationSchema,
    description: undefined,
    _def: {
      middlewares: [],
      resolveFunction: resolveFunction,
      parser: defaultJsonSchemaParser,
    },
  });

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: undefined,
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello',
    ok: true,
  });

  expect(
    await query.call({
      meta: { type: 'query', input: 'John', route: `dummy.route.${uuidv4()}` },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello',
    ok: true,
  });

  expect(query.getSchema()).toMatchInlineSnapshot(`
    {
      "argsSchema": undefined,
      "description": undefined,
      "nodeType": "route",
      "outputSchema": {
        "type": "string",
      },
      "type": "query",
    }
  `);
});

test('Should create query with twice chain', async () => {
  const { resolver } = ptsq({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  }).create();

  const firstSchemaInArgumentChain = Type.Object({ firstName: Type.String() });
  const secondSchemaInArgumentChain = Type.Object({ lastName: Type.String() });

  const outputSchema = Type.String();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input: { firstName: string; lastName: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix} ${input.firstName} ${input.lastName}`;

  const query = resolver
    .args(firstSchemaInArgumentChain)
    .args(secondSchemaInArgumentChain)
    .output(outputSchema)
    .query(resolveFunction);

  expect(query).toMatchObject({
    nodeType: 'route',
    type: 'query',
    argsSchema: Type.Intersect([
      firstSchemaInArgumentChain,
      secondSchemaInArgumentChain,
    ]),
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
      meta: {
        type: 'query',
        input: { firstName: 'John', lastName: 'Doe' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello John Doe',
    ok: true,
  });

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { firstName: 'John' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    error: new PtsqError({
      code: 'BAD_REQUEST',
      message: 'Args validation error.',
    }),
    ok: false,
  });

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { lastName: 'Doe' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    error: new PtsqError({
      code: 'BAD_REQUEST',
      message: 'Args validation error.',
    }),
    ok: false,
  });

  expect(query.getSchema()).toMatchInlineSnapshot(`
    {
      "argsSchema": {
        "allOf": [
          {
            "properties": {
              "firstName": {
                "type": "string",
              },
            },
            "required": [
              "firstName",
            ],
            "type": "object",
          },
          {
            "properties": {
              "lastName": {
                "type": "string",
              },
            },
            "required": [
              "lastName",
            ],
            "type": "object",
          },
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

test('Should create query with optional args chain', async () => {
  const { resolver } = ptsq({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  }).create();

  const firstSchemaInArgumentChain = Type.Union([
    Type.Object({
      firstName: Type.Optional(Type.String()),
    }),
    Type.Undefined(),
  ]);

  const secondSchemaInArgumentChain = Type.Union([
    Type.Object({
      lastName: Type.Optional(Type.String()),
    }),
    Type.Undefined(),
  ]);

  const outputSchema = Type.String();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input?: { firstName?: string; lastName?: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) =>
    `${ctx.greetingsPrefix} ${input?.firstName ?? 'UNDEFINED'} ${
      input?.lastName ?? 'UNDEFINED'
    }`;

  const query = resolver
    .args(firstSchemaInArgumentChain)
    .args(secondSchemaInArgumentChain)
    .output(outputSchema)
    .query(resolveFunction);

  expect(query).toMatchObject({
    nodeType: 'route',
    type: 'query',
    argsSchema: Type.Intersect([
      firstSchemaInArgumentChain,
      secondSchemaInArgumentChain,
    ]),
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
      meta: {
        type: 'query',
        input: { firstName: 'John', lastName: 'Doe' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello John Doe',
    ok: true,
  });

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { firstName: 'John' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello John UNDEFINED',
    ok: true,
  });

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { lastName: 'Doe' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED Doe',
    ok: true,
  });

  expect(
    await query.call({
      meta: { type: 'query', input: {}, route: `dummy.route.${uuidv4()}` },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED UNDEFINED',
    ok: true,
  });

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: undefined,
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED UNDEFINED',
    ok: true,
  });

  expect(query.getSchema()).toMatchInlineSnapshot(`
    {
      "argsSchema": {
        "allOf": [
          {
            "anyOf": [
              {
                "properties": {
                  "firstName": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              {
                "type": "undefined",
              },
            ],
          },
          {
            "anyOf": [
              {
                "properties": {
                  "lastName": {
                    "type": "string",
                  },
                },
                "type": "object",
              },
              {
                "type": "undefined",
              },
            ],
          },
        ],
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
