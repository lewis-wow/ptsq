export {
  createProxyClient,
  type CreateProxyClientArgs,
} from './createProxyClient';

export {
  createProxyUntypedClient,
  type CreateProxyUntypedClientArgs,
} from './createProxyUntypedClient';

export { httpFetch, type HttpFetchArgs } from './httpFetch';

export { PtsqClientError } from './ptsqClientError';

export type {
  ClientRoute as Route,
  ClientRouter as Router,
  AnyClientRoute as AnyRoute,
} from './types';
export type { Query } from './query';
export type { Mutation } from './mutation';
