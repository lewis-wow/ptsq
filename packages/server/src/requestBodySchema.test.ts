import { expect, test } from 'vitest';
import { requestBodySchema } from './requestBodySchema';

test('Should parse valid request body', () => {
  const parseResult = requestBodySchema.safeParse({
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
  });

  expect(parseResult.success).toBe(true);
});

test('Should parse valid request body without input', () => {
  const parseResult = requestBodySchema.safeParse({
    route: 'a.b.c.d',
  });

  expect(parseResult.success).toBe(true);
});

test('Should parse invalid request body without route', () => {
  const parseResult = requestBodySchema.safeParse({
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
  });

  expect(parseResult.success).toBe(false);
});

test('Should parse invalid request body with bad formated route', () => {
  const parseResult = requestBodySchema.safeParse({
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
  });

  expect(parseResult.success).toBe(false);
});

test('Should parse invalid request body with bad formated route', () => {
  const parseResult = requestBodySchema.safeParse({
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
  });

  expect(parseResult.success).toBe(false);
});

test('Should parse valid request body with only one route without dot', () => {
  const parseResult = requestBodySchema.safeParse({
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
  });

  expect(parseResult.success).toBe(true);
});
