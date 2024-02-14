import { PtsqClientError } from './ptsqClientError';
import { PtsqLink, type LinkMeta } from './ptsqLink';

export type HttpFetchArgs = {
  url: RequestInfo | URL;
  meta: LinkMeta;
  links?: PtsqLink[];
  fetch?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>;
};

export const httpFetch = async ({
  url,
  meta,
  links = [],
  fetch = globalThis.fetch,
}: HttpFetchArgs): Promise<unknown> => {
  const linkResponse = await PtsqLink.recursiveCall({
    meta,
    index: 0,
    links: [
      ...links,
      new PtsqLink(async ({ meta: finalMeta }) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalMeta),
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

          return {
            ok: false,
            error: new PtsqClientError({
              code: response.status,
              message: json.message,
              info: json.info,
            }),
          };
        }

        const json = (await response.json()) as unknown;

        return {
          ok: true,
          data: json,
        };
      }),
    ],
  });

  if (!linkResponse.ok) throw linkResponse.error;

  return linkResponse.data;
};
