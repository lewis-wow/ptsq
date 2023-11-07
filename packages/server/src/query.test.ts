import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';
import { HTTPError } from './httpError';

test('Should create query', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const argsSchema = { name: z.string() };
  const outputValidationSchema = z.string();

  const resolveFunction = ({ input, ctx }: { input: { name: string }; ctx: { greetingsPrefix: 'Hello' } }) =>
    `${ctx.greetingsPrefix} ${input.name}`;

  const query = resolver.args(argsSchema).query({
    output: outputValidationSchema,
    resolve: resolveFunction,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.args).toStrictEqual(argsSchema);
  expect(query.output).toStrictEqual(outputValidationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    })
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
    })
  ).toStrictEqual({
    error: new HTTPError({ code: 'BAD_REQUEST', message: 'Args validation error.' }),
    ok: false,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(
    await query
      .createServerSideQuery({ ctx: { greetingsPrefix: 'Hello' as const }, route: ['dummy', 'route'] })
      .query({ name: 'John' })
  ).toStrictEqual({
    data: 'Hello John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "args": {
          "$schema": "http://json-schema.org/draft-07/schema#",
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
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "output": {
          "$schema": "http://json-schema.org/draft-07/schema#",
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
        "args",
        "output",
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

  const resolveFunction = ({ ctx }: { input: Record<string, never>; ctx: { greetingsPrefix: 'Hello' } }) =>
    `${ctx.greetingsPrefix}`;

  const query = resolver.query({
    output: validationSchema,
    resolve: resolveFunction,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.args).toStrictEqual({});
  expect(query.output).toStrictEqual(validationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { input: {}, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    })
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
    })
  ).toStrictEqual({
    error: new HTTPError({ code: 'BAD_REQUEST', message: 'Args validation error.' }),
    ok: false,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(
    await query.createServerSideQuery({ ctx: { greetingsPrefix: 'Hello' as const }, route: ['dummy', 'route'] }).query()
  ).toStrictEqual({
    data: 'Hello',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "args": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": false,
          "properties": {},
          "type": "object",
        },
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "output": {
          "$schema": "http://json-schema.org/draft-07/schema#",
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
        "args",
        "output",
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

  const validationSchema = z.string();

  const resolveFunction = ({
    input,
    ctx,
  }: {
    input: { firstName: string; lastName: string };
    ctx: { greetingsPrefix: 'Hello' };
  }) => `${ctx.greetingsPrefix} ${input.firstName} ${input.lastName}`;

  const query = resolver.args({ firstName: validationSchema }).args({ lastName: validationSchema }).query({
    output: validationSchema,
    resolve: resolveFunction,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.args).toStrictEqual({
    firstName: validationSchema,
    lastName: validationSchema,
  });
  expect(query.output).toStrictEqual(validationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { input: { firstName: 'John', lastName: 'Doe' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    })
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
    })
  ).toStrictEqual({
    error: new HTTPError({ code: 'BAD_REQUEST', message: 'Args validation error.' }),
    ok: false,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(
    await query.call({
      meta: { input: { lastName: 'Doe' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    })
  ).toStrictEqual({
    error: new HTTPError({ code: 'BAD_REQUEST', message: 'Args validation error.' }),
    ok: false,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(
    await query
      .createServerSideQuery({ ctx: { greetingsPrefix: 'Hello' as const }, route: ['dummy', 'route'] })
      .query({ firstName: 'John', lastName: 'Doe' })
  ).toStrictEqual({
    data: 'Hello John Doe',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "args": {
          "$schema": "http://json-schema.org/draft-07/schema#",
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
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "output": {
          "$schema": "http://json-schema.org/draft-07/schema#",
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
        "args",
        "output",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});
