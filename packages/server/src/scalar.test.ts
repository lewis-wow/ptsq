import { expect, expectTypeOf, test } from 'vitest';
import { z } from 'zod';
import { HTTPError } from './httpError';
import { scalar } from './scalar';

test('Should create URL scalar', () => {
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

  expect(URLScalar.input.parse('https://example.com/')).toStrictEqual(
    new URL('https://example.com/'),
  );

  expect(URLScalar.output.parse(new URL('https://example.com/'))).toBe(
    'https://example.com/',
  );

  expect(() => URLScalar.output.parse('https://example.com/')).toThrowError(
    new HTTPError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Scalar output type is invalid',
    }),
  );

  const urlScalarInputParseMock = z.string().url().safeParse('not_valid_url');
  const urlScalarInputParse = URLScalar.input.safeParse('not_valid_url');

  expect(
    urlScalarInputParse.success ? null : urlScalarInputParse.error,
  ).toStrictEqual(
    urlScalarInputParseMock.success ? null : urlScalarInputParseMock.error,
  );

  /**
   * Test if description is really const generic values that can be seen in IDE
   */
  expectTypeOf(URLScalar.description).toMatchTypeOf<'String format of url'>(
    'String format of url',
  );
  expectTypeOf(URLScalar.description).toMatchTypeOf<'String format of url'>(
    'String format of url',
  );
});

test('Should create Date scalar', () => {
  const DateScalar = scalar({
    parse: {
      schema: z.instanceof(Date),
      value: (arg) => new Date(arg),
    },
    serialize: {
      schema: z.string().datetime(),
      value: (arg) => arg.toISOString(),
    },
    description: 'ISO string format of date',
  });

  const dateMock = new Date();
  expect(DateScalar.input.parse(dateMock.toISOString())).toStrictEqual(
    dateMock,
  );

  expect(DateScalar.output.parse(dateMock)).toBe(dateMock.toISOString());

  expect(() => DateScalar.output.parse(dateMock.toISOString())).toThrowError(
    new HTTPError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Scalar output type is invalid',
    }),
  );

  const dateScalarInputParseMock = z
    .string()
    .datetime()
    .safeParse('not_valid_url');
  const dateScalarInputParse = DateScalar.input.safeParse('not_valid_url');

  expect(
    dateScalarInputParse.success ? null : dateScalarInputParse.error,
  ).toStrictEqual(
    dateScalarInputParseMock.success ? null : dateScalarInputParseMock.error,
  );

  /**
   * Test if description is really const generic values that can be seen in IDE
   */
  expectTypeOf(
    DateScalar.description,
  ).toMatchTypeOf<'ISO string format of date'>('ISO string format of date');
  expectTypeOf(
    DateScalar.description,
  ).toMatchTypeOf<'ISO string format of date'>('ISO string format of date');
});
