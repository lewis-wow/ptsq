import { test, expect } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';
import { zodToJsonSchema } from '@ptsq/zod-parser';

test('Should create scalar  json schema', () => {
  const { scalar } = createServer({
    ctx: () => ({}),
  });

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
    .args({
      firstName: z.string(),
    })
    .args({
      lastName: z.string(),
    });

  expect(zodToJsonSchema(z.object(argsResolver._args))).toStrictEqual({
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
    .args({
      person: z.object({
        firstName: z.string(),
      }),
    })
    .args({
      person: z.object({
        lastName: z.string(),
      }),
    });

  expect(zodToJsonSchema(z.object(argsResolver._args))).toStrictEqual({
    type: 'object',
    additionalProperties: false,
    properties: {
      person: {
        additionalProperties: false,
        allOf: [
          {
            properties: {
              firstName: {
                type: 'string',
              },
            },
            required: ['firstName'],
            type: 'object',
          },
          {
            properties: {
              lastName: {
                type: 'string',
              },
            },
            required: ['lastName'],
            type: 'object',
          },
        ],
      },
    },
    required: ['person'],
  });
});
