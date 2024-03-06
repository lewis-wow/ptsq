import { expect, test } from 'vitest';
import { defaultJsonSchemaParser } from './jsonSchemaParser';
import { requestBodySchema } from './requestBodySchema';

test('Should parse valid request body', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
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
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(true);
});

test('Should parse valid request body without input', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
    value: {
      route: 'a.b.c.d',
      type: 'query',
    },
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(true);
});

test('Should parse invalid request body without route', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
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
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(false);
});

test('Should parse invalid request body with bad formated route', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
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
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(false);
});

test('Should parse invalid request body with bad formated route', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
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
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(false);
});

test('Should parse valid request body with only one route without dot', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
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
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(true);
});

test('Should not parse invalid request body without route type', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
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
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(false);
});

test('Should not parse invalid request body with additional property', async () => {
  const parseResult = await defaultJsonSchemaParser.decode({
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
    schema: requestBodySchema,
  });

  expect(parseResult.ok).toBe(false);
});
