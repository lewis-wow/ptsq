import type { MaybePromise } from '../dist/types';
import type { Context } from './context';
import type { inferResolverArgs, ResolverRequest } from './resolver';

export type TransformationCallback<
  TArgs,
  TContext extends Context,
  TNextArgs,
> = (options: {
  input: inferResolverArgs<TArgs>;
  meta: ResolverRequest;
  ctx: TContext;
}) => MaybePromise<TNextArgs>;
