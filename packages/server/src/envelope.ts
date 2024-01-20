import type { ErrorFormatter } from './errorFormatter';
import type { AnyMiddlewareResponse } from './middleware';

export class Envelope {
  _def: {
    middlewareResponse: AnyMiddlewareResponse;
  };

  constructor(options: { middlewareResponse: AnyMiddlewareResponse }) {
    this._def = options;
  }

  async toResponse(errorFormatter?: ErrorFormatter): Promise<Response> {
    if (this._def.middlewareResponse.ok)
      return Response.json(this._def.middlewareResponse.data);

    return this._def.middlewareResponse.error.toResponse(errorFormatter);
  }
}
