import { Type } from '@sinclair/typebox';
import { v4 as uuidv4 } from 'uuid';
import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { HTTPError } from './httpError';

test('Should create mutation', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

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

  expect(mutation._def).toStrictEqual({
    nodeType: 'route',
    type: 'mutation',
    middlewares: [],
    argsSchema: argsSchema,
    outputSchema: outputValidationSchema,
    resolveFunction: resolveFunction,
    description: undefined,
    compiler: resolver._def.compiler,
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
    ctx: {
      greetingsPrefix: 'Hello',
    },
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
    error: new HTTPError({
      code: 'BAD_REQUEST',
      message: 'Args validation error.',
    }),
    ok: false,
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

test('Should create mutation without args', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

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

  expect(mutation._def).toStrictEqual({
    nodeType: 'route',
    type: 'mutation',
    middlewares: [],
    argsSchema: undefined,
    outputSchema: outputValidationSchema,
    resolveFunction: resolveFunction,
    description: undefined,
    compiler: resolver._def.compiler,
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
    ctx: {
      greetingsPrefix: 'Hello',
    },
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
            "argsSchema": undefined,
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

test('Should create mutation with twice chain', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

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

  expect(mutation._def).toStrictEqual({
    nodeType: 'route',
    type: 'mutation',
    middlewares: [],
    argsSchema: Type.Intersect([firstSchemaInChain, secondSchemaInChain]),
    outputSchema: validationSchema,
    resolveFunction: resolveFunction,
    description: undefined,
    compiler: resolver._def.compiler,
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
    ctx: {
      greetingsPrefix: 'Hello',
    },
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
    error: new HTTPError({
      code: 'BAD_REQUEST',
      message: 'Args validation error.',
    }),
    ok: false,
    ctx: {
      greetingsPrefix: 'Hello',
    },
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
    error: new HTTPError({
      code: 'BAD_REQUEST',
      message: 'Args validation error.',
    }),
    ok: false,
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

test('Should create mutation with optional args chain', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

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

  expect(mutation._def).toStrictEqual({
    nodeType: 'route',
    type: 'mutation',
    middlewares: [],
    argsSchema: Type.Intersect([
      firstSchemaInArgumentChain,
      secondSchemaInArgumentChain,
    ]),
    outputSchema: outputSchema,
    resolveFunction: resolveFunction,
    description: undefined,
    compiler: resolver._def.compiler,
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
    ctx: {
      greetingsPrefix: 'Hello',
    },
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
    ctx: {
      greetingsPrefix: 'Hello',
    },
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
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: {}, route: `dummy.route.${uuidv4()}` },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED UNDEFINED',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
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
    data: 'Hello UNDEFINED UNDEFINED',
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
