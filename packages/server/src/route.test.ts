import { expect, test } from 'vitest';
import { z } from 'zod';
import { Route } from './route';

test('Should create query route', async () => {
  const validationSchema = z.string();
  const resolveFunction = ({ input, ctx: _ctx }: { input: string; ctx: object }) => `${input}`;

  const query = new Route({
    type: 'query',
    inputValidationSchema: validationSchema,
    outputValidationSchema: validationSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.inputValidationSchema).toBe(validationSchema);
  expect(query.outputValidationSchema).toBe(validationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);
  expect(
    await query.call({ meta: { input: 'John', route: 'dummy.route' }, ctx: { greetingsPrefix: 'Hello' as const } })
  ).toStrictEqual({
    data: 'John',
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
        "inputValidationSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "string",
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
            "query",
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

test('Should create mutation route', async () => {
  const validationSchema = z.string();
  const resolveFunction = ({ input, ctx: _ctx }: { input: string; ctx: object }) => `${input}`;

  const mutation = new Route({
    type: 'mutation',
    inputValidationSchema: validationSchema,
    outputValidationSchema: validationSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.inputValidationSchema).toBe(validationSchema);
  expect(mutation.outputValidationSchema).toBe(validationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);
  expect(
    await mutation.call({ meta: { input: 'John', route: 'dummy.route' }, ctx: { greetingsPrefix: 'Hello' as const } })
  ).toStrictEqual({
    data: 'John',
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
          "type": "string",
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
