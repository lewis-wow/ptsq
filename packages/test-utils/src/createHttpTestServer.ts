import {
  createServer,
  type IncomingMessage,
  type RequestListener,
  type ServerResponse,
} from 'http';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { killable } from './killable';

type CreateHttpTestServerPayload = {
  fetch: (data: unknown) => Promise<AxiosResponse>;
  introspectate: () => Promise<AxiosResponse>;
  url: string;
  $disconnect: () => Promise<void>;
};

export const createHttpTestServer = (
  listener:
    | RequestListener
    | ((req: IncomingMessage, res: ServerResponse) => Promise<void>),
) => {
  return new Promise<CreateHttpTestServerPayload>((resolve) => {
    const { server, kill } = killable(
      createServer((req, res) => {
        listener(req, res);
      }),
    );

    server.listen(0, () => {
      const address = server.address();

      if (!address) throw new Error('Bad address in http test server.');

      const serverURL =
        typeof address === 'string'
          ? address
          : `http://${
              address.address === '::' ? 'localhost' : address.address
            }:${address.port}`;

      resolve({
        fetch: (data: unknown) => axios.post(`${serverURL}/ptsq`, data),
        introspectate: () => axios.get(`${serverURL}/ptsq/introspection`),
        url: `${serverURL}/ptsq`,
        $disconnect: () => {
          return new Promise((disconnectResolve) => {
            kill(disconnectResolve);
          });
        },
      });
    });
  });
};
