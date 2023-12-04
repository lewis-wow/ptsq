import { expect, test } from 'vitest';
import { z } from 'zod';
import { createServer } from './createServer';
import { HTTPError } from './httpError';

test('Should create query', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const argsSchema = z.object({ name: z.string() });
  const outputValidationSchema = z.string();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input: { name: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix} ${input.name}`;

  const query = resolver.args(argsSchema).query({
    output: outputValidationSchema,
    resolve: resolveFunction,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toStrictEqual(argsSchema);
  expect(query.schemaOutput).toStrictEqual(outputValidationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { input: { name: 'John' }, route: 'dummy.route' },
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
      meta: { input: 'John', route: 'dummy.route' },
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
          "additionalProperties": false,
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

  const validationSchema = z.string();

  const resolveFunction = ({
    ctx,
  }: {
    input: undefined;
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix}`;

  const query = resolver.query({
    output: validationSchema,
    resolve: resolveFunction,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toBe(undefined);
  expect(query.schemaOutput).toStrictEqual(validationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { input: undefined, route: 'dummy.route' },
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
      meta: { input: 'John', route: 'dummy.route' },
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
        "schemaArgs": {
          "not": {},
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

test('Should create query with twice chain', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const firstSchemaInArgumentChain = z.object({ firstName: z.string() });
  const secondSchemaInArgumentChain = z.object({
    firstName: z.string(),
    lastName: z.string(),
  });
  const outputSchema = z.string();

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
    .query({
      output: outputSchema,
      resolve: resolveFunction,
    });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toStrictEqual(secondSchemaInArgumentChain);
  expect(query.schemaOutput).toStrictEqual(outputSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: {
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
      meta: { input: { firstName: 'John' }, route: 'dummy.route' },
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
      meta: { input: { lastName: 'Doe' }, route: 'dummy.route' },
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
          "additionalProperties": false,
          "properties": {
            "firstName": {
              "type": "string",
            },
            "lastName": {
              "type": "string",
            },
          },
          "required": [
            "firstName",
            "lastName",
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

  const firstSchemaInArgumentChain = z
    .object({ firstName: z.string().optional() })
    .optional();
  const secondSchemaInArgumentChain = z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .optional();

  const outputSchema = z.string();

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
    .query({
      output: outputSchema,
      resolve: resolveFunction,
    });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toStrictEqual(secondSchemaInArgumentChain);
  expect(query.schemaOutput).toStrictEqual(outputSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: {
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
      meta: { input: { firstName: 'John' }, route: 'dummy.route' },
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
      meta: { input: { lastName: 'Doe' }, route: 'dummy.route' },
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
      meta: { input: {}, route: 'dummy.route' },
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
      meta: { input: undefined, route: 'dummy.route' },
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
          "anyOf": [
            {
              "not": {},
            },
            {
              "additionalProperties": false,
              "properties": {
                "firstName": {
                  "type": "string",
                },
                "lastName": {
                  "type": "string",
                },
              },
              "type": "object",
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
