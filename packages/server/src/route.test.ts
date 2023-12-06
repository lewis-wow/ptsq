import { expect, test } from 'vitest';
import { z } from 'zod';
import { Route } from './route';

test('Should create query route', async () => {
  const inputSchema = z.object({ name: z.string() });
  const outputSchema = z.string();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `${input.name}`;

  const query = new Route({
    type: 'query',
    schemaArgs: inputSchema,
    schemaOutput: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    transformations: [],
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.schemaArgs).toStrictEqual(inputSchema);
  expect(query.schemaOutput).toBe(outputSchema);
  expect(query.resolveFunction).toBe(resolveFunction);

  expect(
    await query.call({
      meta: { input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'John',
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

test('Should create mutation route', async () => {
  const inputSchema = z.object({ name: z.string() });
  const outputSchema = z.string();
  const resolveFunction = ({
    input,
    ctx: _ctx,
  }: {
    input: { name: string };
    ctx: object;
  }) => `${input.name}`;

  const mutation = new Route({
    type: 'mutation',
    schemaArgs: inputSchema,
    schemaOutput: outputSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
    transformations: [],
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.schemaArgs).toStrictEqual(inputSchema);
  expect(mutation.schemaOutput).toBe(outputSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);

  expect(
    await mutation.call({
      meta: { input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    }),
  ).toStrictEqual({
    data: 'John',
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
