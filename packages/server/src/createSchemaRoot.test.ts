import { expect, test } from 'vitest';
import { createSchemaRoot } from './createSchemaRoot';

test('Should create json schema root node', () => {
  const jsonSchemaRoot = createSchemaRoot({
    title: 'test title',
    properties: {
      test: {
        type: 'string',
      },
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
    title: 'TestTitle',
    type: 'object',
  });
});

test('Should create empty json schema root node', () => {
  const jsonSchemaRoot = createSchemaRoot({
    title: 'test title',
    properties: {},
  });

  expect(jsonSchemaRoot).toStrictEqual({
    additionalProperties: false,
    properties: {},
    required: [],
    title: 'TestTitle',
    type: 'object',
  });
});

test('Should create json schema root node without $schema tag', () => {
  const jsonSchemaRoot = createSchemaRoot({
    title: 'test title',
    properties: {
      test: {
        type: 'string',
      },
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
    title: 'TestTitle',
    type: 'object',
  });
});
