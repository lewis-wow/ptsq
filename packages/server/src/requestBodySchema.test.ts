import { expect, test } from 'vitest';
import { requestBodySchema } from './requestBodySchema';
import { SchemaParser } from './schemaParser';

test('Should parse valid request body', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      route: 'a.b.c.d',
      input: {
        array: [
          1,
          2,
          {
            test: 'test',
          },
        ],
        key: 'value',
      },
      type: 'query',
    },
  });

  expect(parseResult.ok).toBe(true);
});

test('Should parse valid request body without input', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      route: 'a.b.c.d',
      type: 'query',
    },
  });

  expect(parseResult.ok).toBe(true);
});

test('Should parse invalid request body without route', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      input: {
        array: [
          1,
          2,
          {
            test: 'test',
          },
        ],
        key: 'value',
      },
      type: 'query',
    },
  });

  expect(parseResult.ok).toBe(false);
});

test('Should parse invalid request body with bad formated route', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      route: '',
      input: {
        array: [
          1,
          2,
          {
            test: 'test',
          },
        ],
        key: 'value',
      },
      type: 'query',
    },
  });

  expect(parseResult.ok).toBe(false);
});

test('Should parse invalid request body with bad formated route', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      route: 'a,b,c',
      input: {
        array: [
          1,
          2,
          {
            test: 'test',
          },
        ],
        key: 'value',
      },
      type: 'query',
    },
  });

  expect(parseResult.ok).toBe(false);
});

test('Should parse valid request body with only one route without dot', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      route: 'abcdc',
      input: {
        array: [
          1,
          2,
          {
            test: 'test',
          },
        ],
        key: 'value',
      },
      type: 'mutation',
    },
  });

  expect(parseResult.ok).toBe(true);
});

test('Should not parse invalid request body without route type', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      route: 'abcdc',
      input: {
        array: [
          1,
          2,
          {
            test: 'test',
          },
        ],
        key: 'value',
      },
    },
  });

  expect(parseResult.ok).toBe(false);
});

test('Should not parse invalid request body with additional property', () => {
  const parseResult = SchemaParser.safeParse({
    schema: requestBodySchema,
    value: {
      route: 'abcdc',
      input: {
        array: [
          1,
          2,
          {
            test: 'test',
          },
        ],
        key: 'value',
      },
      type: 'query',
      test: 'test',
    },
  });

  expect(parseResult.ok).toBe(false);
});
