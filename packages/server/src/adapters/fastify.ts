import type { IncomingMessage, ServerResponse } from 'http';

export type FastifyAdapterContext = {
  req: IncomingMessage;
  res: ServerResponse;
};
