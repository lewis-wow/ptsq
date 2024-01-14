import { createServer, type RequestListener } from 'http';
import axios from 'axios';

export const createHttpTestServer = (listener: RequestListener) => {
  const createFetcher = (serverRootUrl: string) => ({
    fetch: (data: unknown) => axios.post(serverRootUrl, data),
    introspectate: () => axios.get(`${serverRootUrl}/introspection`),
  });

  return new Promise<ReturnType<typeof createFetcher>>((resolve) => {
    const server = createServer(listener);

    server.listen(0, () => {
      const address = server.address();

      if (!address) throw new Error('Bad address in http test server.');

      const serverRootUrl =
        typeof address === 'string'
          ? address
          : `http://${
              address.address === '::' ? 'localhost' : address.address
            }:${address.port}`;

      resolve(createFetcher(serverRootUrl));
    });
  });
};
