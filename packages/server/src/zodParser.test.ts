import { zodToJsonSchema } from '@ptsq/zod-parser';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { createServer } from './createServer';
import { scalar } from './scalar';

test('Should create scalar  json schema', () => {
  const URLScalar = scalar({
    parse: {
      schema: z.instanceof(URL),
      value: (arg) => new URL(arg),
    },
    serialize: {
      schema: z.string().url(),
      value: (arg) => arg.toString(),
    },
    description: 'String format of url',
  });

  expect(zodToJsonSchema(URLScalar.input)).toStrictEqual({
    type: 'string',
  });

  expect(zodToJsonSchema(URLScalar.output)).toStrictEqual({
    type: 'string',
  });
});

test('Should create arguments chain json schema', () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const argsResolver = resolver
    .args(
      z.object({
        firstName: z.string(),
      }),
    )
    .args(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
      }),
    );

  expect(zodToJsonSchema(argsResolver._args)).toStrictEqual({
    type: 'object',
    additionalProperties: false,
    properties: {
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
    },
    required: ['firstName', 'lastName'],
  });
});

test('Should create complex arguments chain json schema', () => {
  const { resolver } = createServer({
    ctx: () => ({}),
  });

  const argsResolver = resolver
    .args(
      z.object({
        person: z.object({
          firstName: z.string(),
        }),
      }),
    )
    .args(
      z.object({
        person: z.object({
          firstName: z.string(),
          lastName: z.string(),
        }),
      }),
    );

  expect(zodToJsonSchema(argsResolver._args)).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "person": {
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
      },
      "required": [
        "person",
      ],
      "type": "object",
    }
  `);
});
