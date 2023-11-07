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

  const arg = { name: z.string() };
  const outputValidationSchema = z.string();

  const mutation = resolver.args(arg).mutation({
    output: outputValidationSchema,
    resolve: resolveFunction,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.inputValidationSchema._def.shape()).toStrictEqual(arg);
  expect(mutation.outputValidationSchema).toStrictEqual(outputValidationSchema);
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
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "inputValidationSchema": {
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
        "outputValidationSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
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
        "inputValidationSchema",
        "outputValidationSchema",
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

  const resolveFunction = ({ ctx }: { input: Record<string, never>; ctx: { greetingsPrefix: 'Hello' } }) =>
    `${ctx.greetingsPrefix}`;

  const outputValidationSchema = z.string();

  const mutation = resolver.mutation({
    output: outputValidationSchema,
    resolve: resolveFunction,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.inputValidationSchema._def.shape()).toStrictEqual({});
  expect(mutation.outputValidationSchema).toStrictEqual(outputValidationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
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
    await mutation.call({
      meta: { input: { name: 'John' }, route: 'dummy.route' },
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
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "inputValidationSchema": {
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
        "outputValidationSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
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
        "inputValidationSchema",
        "outputValidationSchema",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});
