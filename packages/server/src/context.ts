import type { MaybePromise } from './types';

export type Context = object;

/**
 * @internal
 */
export type ContextBuilder<TContext extends Context = Context> = (
  params: any,
) => MaybePromise<TContext>;

/**
 * @internal
 */
export type inferContextFromContextBuilder<
  TContextBuilder extends ContextBuilder,
> = Awaited<ReturnType<TContextBuilder>>;

/**
 * @internal
 */
export type inferContextParamsFromContextBuilder<
  TContextBuilder extends ContextBuilder,
> = Parameters<TContextBuilder>[0];
