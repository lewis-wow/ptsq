import { expect, test } from 'vitest';
import { z } from 'zod';
import { Route } from './route';

test('Should create query route', async () => {
  const validationSchema = z.string();
  const resolveFunction = ({ input, ctx: _ctx }: { input: { name: string }; ctx: object }) => `${input.name}`;

  const query = new Route({
    type: 'query',
    args: { name: validationSchema },
    output: validationSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.args).toStrictEqual({ name: validationSchema });
  expect(query.output).toBe(validationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);
  expect(
    await query.call({
      meta: { input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    })
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

test('Should create mutation route', async () => {
  const validationSchema = z.string();
  const resolveFunction = ({ input, ctx: _ctx }: { input: { name: string }; ctx: object }) => `${input.name}`;

  const mutation = new Route({
    type: 'mutation',
    args: { name: validationSchema },
    output: validationSchema,
    resolveFunction: resolveFunction,
    middlewares: [],
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.args).toStrictEqual({ name: validationSchema });
  expect(mutation.output).toBe(validationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);
  expect(
    await mutation.call({
      meta: { input: { name: 'John' }, route: 'dummy.route' },
      ctx: { greetingsPrefix: 'Hello' as const },
    })
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
