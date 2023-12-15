import { expect, test } from 'vitest';
import { z } from 'zod';
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

  const argsSchema = z.object({ name: z.string() });
  const outputValidationSchema = z.string();

  const mutation = resolver
    .args(argsSchema)
    .output(outputValidationSchema)
    .mutation(resolveFunction);

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.schemaArgs).toStrictEqual(argsSchema);
  expect(mutation.schemaOutput).toStrictEqual(outputValidationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: { name: 'John' }, route: 'dummy.route' },
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
      meta: { type: 'mutation', input: 'John', route: 'dummy.route' },
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

  expect(mutation.getJsonSchema('test')).toMatchInlineSnapshot(`
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
            "mutation",
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

  const outputValidationSchema = z.string();

  const mutation = resolver
    .output(outputValidationSchema)
    .mutation(resolveFunction);

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.schemaArgs).toBe(undefined);
  expect(mutation.schemaOutput).toStrictEqual(outputValidationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
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
      meta: { type: 'mutation', input: 'John', route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(mutation.getJsonSchema('test')).toMatchInlineSnapshot(`
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
            "mutation",
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

test('Should create mutation with twice chain', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const validationSchema = z.string();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input: { firstName: string; lastName: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix} ${input.firstName} ${input.lastName}`;

  const firstSchemaInChain = z.object({ firstName: validationSchema });
  const secondSchemaInChain = z.object({
    firstName: validationSchema,
    lastName: validationSchema,
  });

  const mutation = resolver
    .args(firstSchemaInChain)
    .args(secondSchemaInChain)
    .output(validationSchema)
    .mutation(resolveFunction);

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.schemaArgs).toStrictEqual(secondSchemaInChain);
  expect(mutation.schemaOutput).toStrictEqual(validationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
        input: { lastName: 'Doe' },
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

  expect(mutation.getJsonSchema('test')).toMatchInlineSnapshot(`
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
              "$ref": "#/properties/firstName",
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
            "mutation",
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

test('Should create mutation with optional args chain', async () => {
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

  const mutation = resolver
    .args(firstSchemaInArgumentChain)
    .args(secondSchemaInArgumentChain)
    .output(outputSchema)
    .mutation(resolveFunction);

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.schemaArgs).toStrictEqual(secondSchemaInArgumentChain);
  expect(mutation.schemaOutput).toStrictEqual(outputSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
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
    await mutation.call({
      meta: {
        type: 'mutation',
        input: { lastName: 'Doe' },
        route: 'dummy.route',
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
      meta: { type: 'mutation', input: {}, route: 'dummy.route' },
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
      meta: { type: 'mutation', input: undefined, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'Hello UNDEFINED UNDEFINED',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(mutation.getJsonSchema('test')).toMatchInlineSnapshot(`
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
            "mutation",
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
