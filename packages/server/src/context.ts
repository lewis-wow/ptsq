import { MaybePromise } from './types';

export type Context = object;

export type ContextBuilder<TContext extends Context> = (params?: any) => MaybePromise<TContext>;
