import { expect, test } from 'vitest';
import { Compiler } from './compiler';
import { parseRequest } from './parseRequest';
import { PtsqError, PtsqErrorCode } from './ptsqError';

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
      compiler: new Compiler(),
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
      compiler: new Compiler(),
    }),
  ).rejects.toThrowError(
    new PtsqError({
      code: PtsqErrorCode.BAD_REQUEST_400,
      message: 'Parsing request body failed.',
    }),
  );
});
