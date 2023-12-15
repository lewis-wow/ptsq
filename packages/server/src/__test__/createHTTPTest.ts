import { createServer } from 'http';
import type { MaybePromise } from '../types';

export const createHTTPTest = (options: {
  serve: any;
  client: (address: string) => MaybePromise<void>;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise(async (resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const serverProviderResult = createServer(options.serve);

    const httpServer = serverProviderResult.listen(0);

    const address = httpServer.address();

    if (!address) throw new Error('Bad address in http test server.');

    const serverRootUrl =
      typeof address === 'string'
        ? address
        : `http://${address.address === '::' ? 'localhost' : address.address}:${
            address.port
          }`;

    await options.client(`${serverRootUrl}/ptsq`);

    httpServer.on('close', resolve);

    httpServer.close();
  });
};
