import { PtsqClientError, PtsqErrorCode } from './ptsqClientError';

export type HttpFetchArgs = {
  url: RequestInfo | URL;
  body?: unknown;
  fetch?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>;
  signal?: AbortSignal;
};

export const httpFetch = async ({
  url,
  body,
  signal,
  fetch = globalThis.fetch,
}: HttpFetchArgs): Promise<unknown> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const json = (await response.json()) as {
      name: string;
      info?: unknown;
      message?: string;
    };

    if (!('name' in json) || json.name !== 'PtsqError') {
      console.error(json);
      throw new TypeError('The response error is not from PTSQ server.');
    }

    throw new PtsqClientError({
      code: PtsqErrorCode[response.status as keyof typeof PtsqErrorCode],
      message: json.message,
      info: json.info,
    });
  }

  const json = (await response.json()) as unknown;

  return json;
};
