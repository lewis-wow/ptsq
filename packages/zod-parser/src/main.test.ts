import { expect, test } from 'vitest';
import { z } from 'zod';
import { zodToJsonSchema } from './main';

test('Should create string json schema', () => {
  const schema = z.string();

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'string',
  });
});

test('Should create number json schema', () => {
  const schema = z.number();

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'number',
  });
});

test('Should create null json schema', () => {
  const schema = z.null();

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'null',
  });
});

test('Should create boolean json schema', () => {
  const schema = z.boolean();

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'boolean',
  });
});

test('Should create literal json schema', () => {
  const schema = z.literal('Test');

  expect(zodToJsonSchema(schema)).toStrictEqual({
    const: 'Test',
    type: 'string',
  });
});

test('Should create enum json schema', () => {
  const schema = z.enum(['A', 'b']);

  expect(zodToJsonSchema(schema)).toStrictEqual({
    enum: ['A', 'b'],
    type: 'string',
  });
});

test('Should create native enum json schema', () => {
  enum Test {
    A = 'A',
    b = 'b',
  }

  const schema = z.nativeEnum(Test);

  expect(zodToJsonSchema(schema)).toStrictEqual({
    enum: ['A', 'b'],
    type: 'string',
  });
});

test('Should create union json schema', () => {
  const schema = z.union([z.string(), z.number()]);

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: ['string', 'number'],
  });
});

test('Should create intersection json schema', () => {
  const schema = z.intersection(z.string(), z.number());

  expect(zodToJsonSchema(schema)).toStrictEqual({
    additionalProperties: false,
    allOf: [
      {
        type: 'string',
      },
      {
        type: 'number',
      },
    ],
  });
});

test('Should create tuple json schema', () => {
  const schema = z.tuple([z.string(), z.number()]);

  expect(zodToJsonSchema(schema)).toStrictEqual({
    items: [
      {
        type: 'string',
      },
      {
        type: 'number',
      },
    ],
    maxItems: 2,
    minItems: 2,
    type: 'array',
  });
});

test('Should create  json schema', () => {
  const schema = z.object({
    name: z.string(),
  });

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'object',
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  });
});

test('Should create record json schema', () => {
  const schema = z.record(z.string(), z.number());

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'object',
    additionalProperties: {
      type: 'number',
    },
  });
});

test('Should create string json schema with transform', () => {
  const schema = z.string().transform((arg) => arg.length);

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'string',
  });
});

test('Should create string json schema with preprocess', () => {
  const schema = z.preprocess((arg) => String(arg).length.toString(), z.string());

  expect(zodToJsonSchema(schema)).toStrictEqual({
    type: 'string',
  });
});

test('Should create string and email intersection json schema', () => {
  const schema = z.intersection(z.string(), z.string().email());

  expect(zodToJsonSchema(schema)).toStrictEqual({
    additionalProperties: false,
    allOf: [
      {
        type: 'string',
      },
      {
        type: 'string',
      },
    ],
  });
});

test('Should create nested json schema', () => {
  const schema = z.object({
    nested: z.object({
      nested: z.object({
        nested: z.object({
          nested: z.object({
            nested: z.object({
              nested: z.object({
                test: z.string(),
              }),
            }),
          }),
        }),
      }),
    }),
  });

  expect(zodToJsonSchema(schema)).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "nested": {
          "additionalProperties": false,
          "properties": {
            "nested": {
              "additionalProperties": false,
              "properties": {
                "nested": {
                  "additionalProperties": false,
                  "properties": {
                    "nested": {
                      "additionalProperties": false,
                      "properties": {
                        "nested": {
                          "additionalProperties": false,
                          "properties": {
                            "nested": {
                              "additionalProperties": false,
                              "properties": {
                                "test": {
                                  "type": "string",
                                },
                              },
                              "required": [
                                "test",
                              ],
                              "type": "object",
                            },
                          },
                          "required": [
                            "nested",
                          ],
                          "type": "object",
                        },
                      },
                      "required": [
                        "nested",
                      ],
                      "type": "object",
                    },
                  },
                  "required": [
                    "nested",
                  ],
                  "type": "object",
                },
              },
              "required": [
                "nested",
              ],
              "type": "object",
            },
          },
          "required": [
            "nested",
          ],
          "type": "object",
        },
      },
      "required": [
        "nested",
      ],
      "type": "object",
    }
  `);
});
