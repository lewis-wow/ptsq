import { expect, test } from 'vitest';
import { Compiler } from './compiler';
import { Parser } from './parser';
import { requestBodySchema } from './requestBodySchema';

test('Should parse valid request body', () => {
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
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
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
    value: {
      route: 'a.b.c.d',
      type: 'query',
    },
  });

  expect(parseResult.ok).toBe(true);
});

test('Should parse invalid request body without route', () => {
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
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
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
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
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
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
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
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
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
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
  const parser = new Parser({
    schema: requestBodySchema,
    compiler: new Compiler(),
  });

  const parseResult = parser.parse({
    mode: 'decode',
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
