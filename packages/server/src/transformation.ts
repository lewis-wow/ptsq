import type { Context } from './context';
import type { inferResolverArgs, ResolverRequest } from './resolver';
import type { MaybePromise } from './types';

export type ArgsTransformationFunction<
  TArgs = unknown,
  TContext extends Context = Context,
  TNextArgs = MaybePromise<unknown>,
> = (options: {
  input: inferResolverArgs<TArgs>;
  meta: ResolverRequest;
  ctx: TContext;
}) => MaybePromise<TNextArgs>;
