import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { HTTPError } from './httpError';

test('Should create query', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

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

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toStrictEqual(argsSchema);
  expect(query.schemaOutput).toStrictEqual(outputValidationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { type: 'query', input: { name: 'John' }, route: 'dummy.route' },
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
    await query.call({
      meta: { type: 'query', input: 'John', route: 'dummy.route' },
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

  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "schemaArgs": {
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
        "schemaOutput": {
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
        "schemaArgs",
        "schemaOutput",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});

test('Should create query without args', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const validationSchema = Type.String();

  const resolveFunction = ({
    ctx,
  }: {
    input: unknown;
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix}`;

  const query = resolver.output(validationSchema).query(resolveFunction);

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toBe(undefined);
  expect(query.schemaOutput).toStrictEqual(validationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
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
    await query.call({
      meta: { type: 'query', input: 'John', route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "schemaArgs": undefined,
        "schemaOutput": {
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
        "schemaArgs",
        "schemaOutput",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});

test('Should create query with twice chain', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

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

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toStrictEqual(
    Type.Intersect([firstSchemaInArgumentChain, secondSchemaInArgumentChain]),
  );
  expect(query.schemaOutput).toStrictEqual(outputSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { firstName: 'John', lastName: 'Doe' },
        route: 'dummy.route',
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
    await query.call({
      meta: {
        type: 'query',
        input: { firstName: 'John' },
        route: 'dummy.route',
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
    await query.call({
      meta: { type: 'query', input: { lastName: 'Doe' }, route: 'dummy.route' },
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

  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "schemaArgs": {
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
        "schemaOutput": {
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
        "schemaArgs",
        "schemaOutput",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});

test('Should create query with optional args chain', async () => {
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

  const query = resolver
    .args(firstSchemaInArgumentChain)
    .args(secondSchemaInArgumentChain)
    .output(outputSchema)
    .query(resolveFunction);

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toStrictEqual(
    Type.Intersect([firstSchemaInArgumentChain, secondSchemaInArgumentChain]),
  );
  expect(query.schemaOutput).toStrictEqual(outputSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: {
        type: 'query',
        input: { firstName: 'John', lastName: 'Doe' },
        route: 'dummy.route',
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
    await query.call({
      meta: {
        type: 'query',
        input: { firstName: 'John' },
        route: 'dummy.route',
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
    await query.call({
      meta: { type: 'query', input: { lastName: 'Doe' }, route: 'dummy.route' },
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
    await query.call({
      meta: { type: 'query', input: {}, route: 'dummy.route' },
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
    await query.call({
      meta: { type: 'query', input: undefined, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED UNDEFINED',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "schemaArgs": {
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
        "schemaOutput": {
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
        "schemaArgs",
        "schemaOutput",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});
