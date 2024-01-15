import {
  createServer,
  type IncomingMessage,
  type RequestListener,
  type ServerResponse,
} from 'http';
import axios from 'axios';

export const createHttpTestServer = (
  listener:
    | RequestListener
    | ((req: IncomingMessage, res: ServerResponse) => Promise<void>),
) => {
  const createFetcher = (serverURL: string) => ({
    fetch: (data: unknown) => axios.post(`${serverURL}/ptsq`, data),
    introspectate: () => axios.get(`${serverURL}/ptsq/introspection`),
    url: `${serverURL}/ptsq`,
  });

  return new Promise<ReturnType<typeof createFetcher>>((resolve) => {
    const server = createServer((req, res) => {
      listener(req, res);
    });

    server.listen(0, () => {
      const address = server.address();

      if (!address) throw new Error('Bad address in http test server.');

      const serverURL =
        typeof address === 'string'
          ? address
          : `http://${
              address.address === '::' ? 'localhost' : address.address
            }:${address.port}`;

      resolve(createFetcher(serverURL));
    });
  });
};
