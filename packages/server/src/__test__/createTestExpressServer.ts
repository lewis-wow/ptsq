import { type RequestListener } from 'http';
import { createServer as createPtsqServer } from '../createServer';
import type { Context } from '../context';
import type { MaybePromise } from '../types';
import express from 'express';

export const createTestExpressServer = <TContext extends Context>({
  ctx,
  server,
  client,
}: {
  ctx: TContext;
  server: (ptsq: ReturnType<typeof createPtsqServer<() => TContext>>) => MaybePromise<RequestListener>;
  client: (serverUrl: string) => MaybePromise<void>;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    const app = express();

    const ptsq = createPtsqServer({
      ctx: () => ctx,
    });

    app.use(await server(ptsq));

    const httpServer = app.listen(4000);

    const address = httpServer.address();

    if (!address) throw new Error('Bad address in http test server.');

    const serverRootUrl =
      typeof address === 'string'
        ? address
        : `http://${address.address === '::' ? 'localhost' : address.address}:${address.port}`;

    await client(`${serverRootUrl}/ptsq`);

    httpServer.on('close', resolve);

    httpServer.close();
  });
};
