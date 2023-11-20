import { zodToJsonSchema } from '@ptsq/zod-parser';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { createServer } from './createServer';

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

  expect(zodToJsonSchema(argsResolver._schemaArgs)).toStrictEqual({
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

  expect(zodToJsonSchema(argsResolver._schemaArgs)).toMatchInlineSnapshot(`
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
