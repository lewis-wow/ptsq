import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';
import { HTTPError } from './httpError';

test('Should create mutation', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const resolveFunction = ({ input, ctx }: { input: { name: string }; ctx: { greetingsPrefix: 'Hello' } }) =>
    `${ctx.greetingsPrefix} ${input.name}`;

  const argsSchema = z.object({ name: z.string() });
  const outputValidationSchema = z.string();

  const mutation = resolver.args(argsSchema).mutation({
    output: outputValidationSchema,
    resolve: resolveFunction,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.args).toStrictEqual(argsSchema);
  expect(mutation.output).toStrictEqual(outputValidationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
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
    await mutation.call({
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
    await mutation
      .createServerSideMutation({ ctx: { greetingsPrefix: 'Hello' as const }, route: ['dummy', 'route'] })
      .mutate({ name: 'John' })
  ).toStrictEqual({
    data: 'Hello John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(mutation.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "args": {
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
        "args",
        "output",
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

  const resolveFunction = ({ ctx }: { input: undefined; ctx: { greetingsPrefix: 'Hello' } }) =>
    `${ctx.greetingsPrefix}`;

  const outputValidationSchema = z.string();

  const mutation = resolver.mutation({
    output: outputValidationSchema,
    resolve: resolveFunction,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.args).instanceOf(z.ZodVoid);
  expect(mutation.output).toStrictEqual(outputValidationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
      meta: { input: undefined, route: 'dummy.route' },
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
    await mutation.call({
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
    await mutation
      .createServerSideMutation({ ctx: { greetingsPrefix: 'Hello' as const }, route: ['dummy', 'route'] })
      .mutate()
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
        "args": {},
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "output": {
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
        "args",
        "output",
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
  const secondSchemaInChain = z.object({ firstName: validationSchema, lastName: validationSchema });

  const mutation = resolver.args(firstSchemaInChain).args(secondSchemaInChain).mutation({
    output: validationSchema,
    resolve: resolveFunction,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.args).toStrictEqual(secondSchemaInChain);
  expect(mutation.output).toStrictEqual(validationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
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
    await mutation.call({
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
    await mutation.call({
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
    await mutation
      .createServerSideMutation({ ctx: { greetingsPrefix: 'Hello' as const }, route: ['dummy', 'route'] })
      .mutate({ firstName: 'John', lastName: 'Doe' })
  ).toStrictEqual({
    data: 'Hello John Doe',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });

  expect(mutation.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "args": {
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
        "args",
        "output",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});
