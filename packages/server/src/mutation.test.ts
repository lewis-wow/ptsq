import { Type } from '@sinclair/typebox';
import { v4 as uuidv4 } from 'uuid';
import { expect, test } from 'vitest';
import { defaultJsonSchemaParser } from './jsonSchemaParser';
import { PtsqError } from './ptsqError';
import { ptsq } from './ptsqServerBuilder';

test('Should create mutation', async () => {
  const { resolver } = ptsq({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  }).create();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input: { name: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix} ${input.name}`;

  const argsSchema = Type.Object({ name: Type.String() });
  const outputValidationSchema = Type.String();

  const mutation = resolver
    .args(argsSchema)
    .output(outputValidationSchema)
    .mutation(resolveFunction);

  expect(mutation).toMatchObject({
    nodeType: 'route',
    type: 'mutation',
    argsSchema: argsSchema,
    outputSchema: outputValidationSchema,
    description: undefined,
    _def: {
      middlewares: [],
      resolveFunction: resolveFunction,
      parser: defaultJsonSchemaParser,
    },
  });

  expect(
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
        input: 'John',
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    error: new PtsqError({
      code: 'PTSQ_VALIDATION_FAILED',
      message: 'Args validation error.',
    }),
    ok: false,
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
      "description": undefined,
      "nodeType": "route",
      "outputSchema": {
        "type": "string",
      },
      "type": "mutation",
    }
  `);
});

test('Should create mutation without args', async () => {
  const { resolver } = ptsq({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  }).create();

  const resolveFunction = ({
    ctx,
  }: {
    input: undefined;
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix}`;

  const outputValidationSchema = Type.String();

  const mutation = resolver
    .output(outputValidationSchema)
    .mutation(resolveFunction);

  expect(mutation).toMatchObject({
    nodeType: 'route',
    type: 'mutation',
    argsSchema: undefined,
    outputSchema: outputValidationSchema,
    description: undefined,
    _def: {
      middlewares: [],
      resolveFunction: resolveFunction,
      parser: defaultJsonSchemaParser,
    },
  });

  expect(
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
        input: 'John',
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello',
    ok: true,
  });

  expect(mutation.getSchema()).toMatchInlineSnapshot(`
    {
      "argsSchema": undefined,
      "description": undefined,
      "nodeType": "route",
      "outputSchema": {
        "type": "string",
      },
      "type": "mutation",
    }
  `);
});

test('Should create mutation with twice chain', async () => {
  const { resolver } = ptsq({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  }).create();

  const validationSchema = Type.String();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input: { firstName: string; lastName: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix} ${input.firstName} ${input.lastName}`;

  const firstSchemaInChain = Type.Object({ firstName: validationSchema });
  const secondSchemaInChain = Type.Object({ lastName: validationSchema });

  const mutation = resolver
    .args(firstSchemaInChain)
    .args(secondSchemaInChain)
    .output(validationSchema)
    .mutation(resolveFunction);

  expect(mutation).toMatchObject({
    nodeType: 'route',
    type: 'mutation',
    argsSchema: Type.Intersect([firstSchemaInChain, secondSchemaInChain]),
    outputSchema: validationSchema,
    description: undefined,
    _def: {
      middlewares: [],
      resolveFunction: resolveFunction,
      parser: defaultJsonSchemaParser,
    },
  });

  expect(
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
        input: { firstName: 'John' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    error: new PtsqError({
      code: 'PTSQ_VALIDATION_FAILED',
      message: 'Args validation error.',
    }),
    ok: false,
  });

  expect(
    await mutation.call({
      meta: {
        type: 'mutation',
        input: { lastName: 'Doe' },
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    error: new PtsqError({
      code: 'PTSQ_VALIDATION_FAILED',
      message: 'Args validation error.',
    }),
    ok: false,
  });

  expect(mutation.getSchema()).toMatchInlineSnapshot(`
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
      "type": "mutation",
    }
  `);
});

test('Should create mutation with optional args chain', async () => {
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

  const mutation = resolver
    .args(firstSchemaInArgumentChain)
    .args(secondSchemaInArgumentChain)
    .output(outputSchema)
    .mutation(resolveFunction);

  expect(mutation).toMatchObject({
    nodeType: 'route',
    type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: { type: 'mutation', input: {}, route: `dummy.route.${uuidv4()}` },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED UNDEFINED',
    ok: true,
  });

  expect(
    await mutation.call({
      meta: {
        type: 'mutation',
        input: undefined,
        route: `dummy.route.${uuidv4()}`,
      },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED UNDEFINED',
    ok: true,
  });

  expect(mutation.getSchema()).toMatchInlineSnapshot(`
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
      "type": "mutation",
    }
  `);
});
