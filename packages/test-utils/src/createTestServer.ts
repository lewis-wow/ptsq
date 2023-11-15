import type { RequestListener, Server } from 'http';
import {
  createServer as createPtsqServer,
  type Context,
  type MaybePromise,
  type Router,
} from '@ptsq/server';

export type CreateTestServerArgs<
  TContext extends Context,
  TRouter extends Router,
> = {
  ctx: (...params: any[]) => TContext;
  server: (
    ptsq: ReturnType<typeof createPtsqServer<() => TContext>>,
  ) => MaybePromise<TRouter>;
  client: (serverUrl: string, baseRouter: TRouter) => MaybePromise<void>;
};

export const createTestServer = <
  TContext extends Context,
  TRouter extends Router,
>({
  ctx,
  server,
  client,
  serverProvider,
}: CreateTestServerArgs<TContext, TRouter> & {
  serverProvider: (requestListener: RequestListener) => {
    listen: (port: number, ..._args: any[]) => Server;
  };
}) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    const ptsq = createPtsqServer({
      ctx: ctx,
    });

    const baseRouter = await server(ptsq);

    const serverProviderResult = serverProvider(
      ptsq.createHTTPNodeHandler({ router: baseRouter }),
    );

    const httpServer = serverProviderResult.listen(0);

    const address = httpServer.address();

    if (!address) throw new Error('Bad address in http test server.');

    const serverRootUrl =
      typeof address === 'string'
        ? address
        : `http://${address.address === '::' ? 'localhost' : address.address}:${
            address.port
          }`;

    await client(`${serverRootUrl}/ptsq`, baseRouter);

    httpServer.on('close', resolve);

    httpServer.close();
  });
};
