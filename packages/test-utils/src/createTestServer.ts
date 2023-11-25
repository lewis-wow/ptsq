import type { RequestListener, Server } from 'http';
import {
  createServer as createPtsqServer,
  type AnyRouter,
  type Context,
  type MaybePromise,
} from '@ptsq/server';

/**
 * @internal
 */
export type CreateTestServerArgs<
  TContext extends Context,
  TRouter extends AnyRouter,
> = {
  ctx: (params: any) => TContext;
  server: (
    ptsq: ReturnType<typeof createPtsqServer<(params: any) => TContext>>,
  ) => MaybePromise<TRouter>;
  client: (serverUrl: string, baseRouter: TRouter) => MaybePromise<void>;
};

/**
 * @internal
 */
export const createTestServer = <
  TContext extends Context,
  TRouter extends AnyRouter,
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

    const serverProviderResult = serverProvider((req, res) => {
      ptsq.createHTTPNodeHandler({
        router: baseRouter,
        ctx: { req, res } as any,
      })(req, res);
    });

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
