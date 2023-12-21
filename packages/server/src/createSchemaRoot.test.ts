import { expect, test } from 'vitest';
import { createSchemaRoot } from './createSchemaRoot';

test('Should create json schema root node', () => {
  const jsonSchemaRoot = createSchemaRoot({
    test: {
      type: 'string',
    },
  });

  expect(jsonSchemaRoot).toStrictEqual({
    additionalProperties: false,
    properties: {
      test: {
        type: 'string',
      },
    },
    required: ['test'],
    type: 'object',
  });
});

test('Should create empty json schema root node', () => {
  const jsonSchemaRoot = createSchemaRoot({});

  expect(jsonSchemaRoot).toStrictEqual({
    additionalProperties: false,
    properties: {},
    required: [],
    type: 'object',
  });
});

test('Should create json schema root node without $schema tag', () => {
  const jsonSchemaRoot = createSchemaRoot({
    test: {
      type: 'string',
    },
  });

  expect(jsonSchemaRoot).toStrictEqual({
    additionalProperties: false,
    properties: {
      test: {
        type: 'string',
      },
    },
    required: ['test'],
    type: 'object',
  });
});
