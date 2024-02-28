export {
  createProxyClient,
  type CreateProxyClientArgs,
} from './createProxyClient';

export {
  createProxyUntypedClient,
  type Fetcher,
} from './createProxyUntypedClient';

export { httpFetch, type HttpFetchArgs } from './httpFetch';

export { PtsqClientError } from './ptsqClientError';

export { UndefinedAction } from './undefinedAction';

export { omit } from './omit';

export type {
  ClientRoute as Route,
  ClientRouter as Router,
  AnyClientRoute as AnyRoute,
} from './types';

export type { Query } from './query';
export type { Mutation } from './mutation';

export type {
  inferClientResolverArgs,
  inferClientResolverOutput,
} from '@ptsq/server';
