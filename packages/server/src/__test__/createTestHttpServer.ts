import { type RequestListener, createServer } from 'http';
import { createServer as createPtsqServer } from '../createServer';
import type { Context } from '../context';
import type { MaybePromise } from '../types';

export const createTestHttpServer = <TContext extends Context>({
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
    const ptsq = createPtsqServer({
      ctx: () => ctx,
    });

    const httpServer = createServer(await server(ptsq));

    httpServer.listen(0);

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
