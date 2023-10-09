import axios from 'axios';
import { CreateProxyClientArgs } from './createProxyClient';
import { getHeaders } from './headers';

export type CreateClientCallerArgs = {
  options: CreateProxyClientArgs;
  route: string[];
};

export const createClientCaller =
  ({ route, options }: CreateClientCallerArgs) =>
  async (input = undefined) => {
    const headers = await getHeaders(options.headers);

    const result = await axios.post(
      options.url,
      { route, input },
      {
        withCredentials: options.credentials,
        headers,
      }
    );

    return result.data;
  };
