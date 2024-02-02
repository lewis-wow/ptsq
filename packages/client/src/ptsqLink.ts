import type { MaybePromise, ResolverType } from '@ptsq/server';
import { PtsqClientError } from './ptsqClientError';

export type LinkMeta = {
  type: ResolverType;
  input: unknown;
  route: string;
};

export type PtsqLinkResponse =
  | {
      ok: true;
      data: unknown;
    }
  | {
      ok: false;
      error: PtsqClientError;
    };

export type ForwardFunction = (
  nextMeta?: Partial<LinkMeta>,
) => Promise<PtsqLinkResponse>;

export type LinkFunction = (options: {
  meta: LinkMeta;
  forward: ForwardFunction;
}) => MaybePromise<PtsqLinkResponse>;

export class PtsqLink {
  _def: {
    linkFunction: LinkFunction;
  };

  constructor(linkFunction: LinkFunction) {
    this._def = { linkFunction };
  }

  static async recursiveCall({
    meta,
    index,
    links,
  }: {
    meta: LinkMeta;
    index: number;
    links: PtsqLink[];
  }): Promise<PtsqLinkResponse> {
    try {
      const response = await links[index]._def.linkFunction({
        meta: meta,
        forward: ((forwardedMeta) =>
          PtsqLink.recursiveCall({
            meta: { ...meta, ...forwardedMeta },
            index: index + 1,
            links: links,
          })) as ForwardFunction,
      });

      return response;
    } catch (error) {
      if (PtsqClientError.isPtsqClientError(error)) {
        return {
          ok: false,
          error: error,
        };
      }

      throw error;
    }
  }

  static createSuccessResponse(data: unknown): PtsqLinkResponse {
    return {
      ok: true,
      data,
    };
  }

  static createFailureResponse(error: PtsqClientError): PtsqLinkResponse {
    return {
      ok: false,
      error,
    };
  }
}
