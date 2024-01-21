import type { AnyMiddlewareResponse } from './middleware';
import type { MaybePromise } from './types';

export class Envelope {
  _def: {
    envelope?: (
      response: AnyMiddlewareResponse,
    ) => MaybePromise<AnyMiddlewareResponse>;
  };

  constructor(
    envelope?: (
      response: AnyMiddlewareResponse,
    ) => MaybePromise<AnyMiddlewareResponse>,
  ) {
    this._def = { envelope };
  }

  async createResponse(
    middlewareResponse: AnyMiddlewareResponse,
  ): Promise<Response> {
    const envelopedMiddlewareResponse = this._def.envelope
      ? await this._def.envelope(middlewareResponse)
      : middlewareResponse;

    if (envelopedMiddlewareResponse.ok)
      return Response.json(envelopedMiddlewareResponse.data);

    return envelopedMiddlewareResponse.error.toResponse();
  }
}
