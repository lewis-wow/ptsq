import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { Compiler } from './compiler';
import { Parser } from './parser';

test('Should parse value by simple Typebox schema', () => {
  const schema = Type.Object({
    a: Type.String(),
    b: Type.Number(),
  });

  const parser = new Parser({
    compiler: new Compiler(),
    schema,
  });

  const resultDecode = parser.parse({
    mode: 'decode',
    value: {
      a: 'a',
      b: 1,
    },
  });

  expect(resultDecode).toStrictEqual({
    ok: true,
    data: {
      a: 'a',
      b: 1,
    },
  });

  const resultEncode = parser.parse({
    mode: 'encode',
    value: {
      a: 'a',
      b: 1,
    },
  });

  expect(resultEncode).toStrictEqual({
    ok: true,
    data: {
      a: 'a',
      b: 1,
    },
  });
});

test('Should parse value by Typebox schema with transformations', () => {
  const schema = Type.Transform(Type.String())
    .Decode((arg) => new URL(arg))
    .Encode((arg) => arg.toString());

  const parser = new Parser({
    compiler: new Compiler(),
    schema,
  });

  const resultDecodeRaw = parser.parse({
    mode: 'decode',
    value: 'http://localhost:4000/pathname',
  });

  expect(resultDecodeRaw).toStrictEqual({
    ok: true,
    data: new URL('http://localhost:4000/pathname'),
  });

  const resultEncodeRaw = parser.parse({
    mode: 'encode',
    value: 'http://localhost:4000/pathname',
  });

  expect(resultEncodeRaw).toStrictEqual({
    ok: true,
    data: 'http://localhost:4000/pathname',
  });

  const resultEncodeParsed = parser.parse({
    mode: 'encode',
    value: new URL('http://localhost:4000/pathname'),
  });

  expect(resultEncodeParsed).toStrictEqual({
    ok: true,
    data: 'http://localhost:4000/pathname',
  });
});

test('Should not parse value by Typebox schema with transformations', () => {
  const schema = Type.Transform(Type.String())
    .Decode((arg) => new URL(arg))
    .Encode((arg) => arg.toString());

  const parser = new Parser({
    compiler: new Compiler(),
    schema,
  });

  const resultDecodeParsed = parser.parse({
    mode: 'decode',
    value: new URL('http://localhost:4000/pathname'),
  });

  expect(resultDecodeParsed).toMatchObject({
    ok: false,
  });
});
