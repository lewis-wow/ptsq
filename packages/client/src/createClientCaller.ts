import axios from 'axios';
import { CreateProxyClientArgs } from './createProxyClient';

export type CreateClientCallerArgs = {
  options: CreateProxyClientArgs;
  route: string[];
};

export const createClientCaller =
  ({ route, options }: CreateClientCallerArgs) =>
  async (input = {}) => {
    console.log(route, options, input);

    const result = await axios.post(options.url);
    return result;
  };
