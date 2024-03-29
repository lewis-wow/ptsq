import { expect, test } from 'vitest';
import { defaultJsonSchemaParser } from './jsonSchemaParser';
import { parseRequest } from './parseRequest';
import { PtsqError } from './ptsqError';

test('Should parse request', async () => {
  const request = new Request('http://localhost:4000/pathname', {
    method: 'POST',
    body: JSON.stringify({
      type: 'query',
      route: 'dummy.route',
      input: {
        name: 'John',
      },
    }),
  });

  expect(
    await parseRequest({
      request,
      parser: defaultJsonSchemaParser,
    }),
  ).toStrictEqual({
    type: 'query',
    route: 'dummy.route',
    input: {
      name: 'John',
    },
  });
});

test('Should not parse request', async () => {
  const request = new Request('http://localhost:4000/pathname', {
    method: 'POST',
    body: JSON.stringify({
      route: 'dummy.route',
      input: {
        name: 'John',
      },
    }),
  });

  await expect(
    parseRequest({
      request,
      parser: defaultJsonSchemaParser,
    }),
  ).rejects.toThrowError(
    new PtsqError({
      code: 'PTSQ_BODY_PARSE_FAILED',
      message: 'Parsing request body failed.',
    }),
  );
});
