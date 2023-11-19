import type { MaybePromise } from '../dist/types';
import type { inferResolverArgs, ResolverRequest } from './resolver';

export type TransformationCallback<TArgs, TNextArgs> = (options: {
  input: inferResolverArgs<TArgs>;
  meta: ResolverRequest;
}) => MaybePromise<TNextArgs>;
