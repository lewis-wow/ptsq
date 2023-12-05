import { createServer } from 'http';
import {
  createServer as createPtsqServer,
  type AnyRouter,
  type Context,
  type CORSOptions,
  type MaybePromise,
} from '@ptsq/server';

/**
 * @internal
 */
export type CreateTestHttpServerArgs<
  TContext extends Context,
  TRouter extends AnyRouter,
> = {
  ctx: (params: any) => TContext;
  cors?: CORSOptions;
  server: (
    ptsq: ReturnType<typeof createPtsqServer<(params: any) => TContext>>,
  ) => MaybePromise<TRouter>;
  client: (serverUrl: string, baseRouter: TRouter) => MaybePromise<void>;
};

/**
 * @internal
 */
export const createTestHttpServer = <
  TContext extends Context,
  TRouter extends AnyRouter,
>({
  ctx,
  cors,
  server,
  client,
}: CreateTestHttpServerArgs<TContext, TRouter>) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    const ptsq = createPtsqServer({
      ctx: ctx,
      cors,
    });

    const baseRouter = await server(ptsq);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const serverProviderResult = createServer(ptsq.serve(baseRouter));

    const httpServer = serverProviderResult.listen(0);

    const address = httpServer.address();

    if (!address) throw new Error('Bad address in http test server.');

    const serverRootUrl =
      typeof address === 'string'
        ? address
        : `http://${address.address === '::' ? 'localhost' : address.address}:${
            address.port
          }`;

    client(`${serverRootUrl}/ptsq`, baseRouter);

    httpServer.on('close', resolve);

    httpServer.close();
  });
};
