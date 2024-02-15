import { expect, test } from 'vitest';
import { Envelope } from './envelope';
import { PtsqError, PtsqErrorCode } from './ptsqError';

test('Should create simple envelope of success response', async () => {
  const envelope = new Envelope((response) => {
    if (!response.ok) return response;

    return {
      ...response,
      data: {
        version: '2.1.23',
        enveloped: true,
        data: response.data,
      },
    };
  });

  const envelopedData = await envelope.createResponse({
    ok: true,
    data: {
      greetings: 'Hello, Dave!',
    },
  });

  const responseBody = await envelopedData.json();

  expect(responseBody).toStrictEqual({
    version: '2.1.23',
    enveloped: true,
    data: {
      greetings: 'Hello, Dave!',
    },
  });

  const envelopedFailureData = await envelope.createResponse({
    ok: false,
    error: new PtsqError({
      code: PtsqErrorCode.BAD_REQUEST_400,
      message: 'Message...',
    }),
  });

  const failureResponseBody = await envelopedFailureData.json();

  expect(failureResponseBody).toStrictEqual({
    name: 'PtsqError',
    message: 'Message...',
  });
});

test('Should create simple envelope of failure response', async () => {
  const envelope = new Envelope((response) => {
    if (response.ok) return response;

    return {
      ...response,
      error: new PtsqError({
        code: response.error.code,
        message: response.error.message,
        info: {
          version: '2.1.23',
          enveloped: true,
          data: response.error.info,
        },
      }),
    };
  });

  const envelopedData = await envelope.createResponse({
    ok: false,
    error: new PtsqError({
      code: PtsqErrorCode.BAD_REQUEST_400,
      message: 'Random message...',
      info: {
        description: 'ORM error description...',
      },
    }),
  });

  const responseBody = await envelopedData.json();

  expect(responseBody).toStrictEqual({
    message: 'Random message...',
    name: 'PtsqError',
    info: {
      version: '2.1.23',
      enveloped: true,
      data: {
        description: 'ORM error description...',
      },
    },
  });

  const envelopedSuccessData = await envelope.createResponse({
    ok: true,
    data: {
      greetings: 'Hello, Dave!',
    },
  });

  const successResponseBody = await envelopedSuccessData.json();

  expect(successResponseBody).toStrictEqual({
    greetings: 'Hello, Dave!',
  });
});
