import type { Context } from './context';
import type { AnyMutation } from './mutation';
import type { AnyQuery } from './query';
import type { AnyResolver, ResolverRequest } from './resolver';
import type { MaybePromise } from './types';

/**
 * @internal
 */
export type GuardFunction<TArgs, TContext extends Context> = (options: {
  input: TArgs;
  meta: ResolverRequest;
  ctx: TContext;
}) => MaybePromise<boolean>;

/**
 * @internal
 */
export type GuardRouter<TResolver extends AnyResolver> = (
  resolver: TResolver,
) => MaybePromise<AnyResolver | AnyQuery | AnyMutation>;
