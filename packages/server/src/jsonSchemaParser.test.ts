import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { defaultJsonSchemaParser } from './jsonSchemaParser';

test('Should parse value by simple Typebox schema', async () => {
  const schema = Type.Object({
    a: Type.String(),
    b: Type.Number(),
  });

  const resultDecode = await defaultJsonSchemaParser.decode({
    value: {
      a: 'a',
      b: 1,
    },
    schema,
  });

  expect(resultDecode).toStrictEqual({
    ok: true,
    data: {
      a: 'a',
      b: 1,
    },
  });

  const resultEncode = await defaultJsonSchemaParser.encode({
    value: {
      a: 'a',
      b: 1,
    },
    schema,
  });

  expect(resultEncode).toStrictEqual({
    ok: true,
    data: {
      a: 'a',
      b: 1,
    },
  });
});

test('Should parse value by Typebox schema with transformations', async () => {
  const schema = Type.Transform(Type.String())
    .Decode((arg) => new URL(arg))
    .Encode((arg) => arg.toString());

  const resultDecodeRaw = await defaultJsonSchemaParser.decode({
    value: 'http://localhost:4000/pathname',
    schema,
  });

  expect(resultDecodeRaw).toStrictEqual({
    ok: true,
    data: new URL('http://localhost:4000/pathname'),
  });

  const resultEncodeRaw = await defaultJsonSchemaParser.encode({
    value: 'http://localhost:4000/pathname',
    schema,
  });

  expect(resultEncodeRaw).toStrictEqual({
    ok: true,
    data: 'http://localhost:4000/pathname',
  });

  const resultEncodeParsed = defaultJsonSchemaParser.encode({
    value: new URL('http://localhost:4000/pathname'),
    schema,
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

  const resultDecodeParsed = defaultJsonSchemaParser.decode({
    value: new URL('http://localhost:4000/pathname'),
    schema,
  });

  expect(resultDecodeParsed).toMatchObject({
    ok: false,
  });
});
