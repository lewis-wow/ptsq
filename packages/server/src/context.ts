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
  TContextBuilder extends ContextBuilder | undefined,
> = TContextBuilder extends ContextBuilder
  ? Awaited<ReturnType<TContextBuilder>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {};

/**
 * @internal
 */
export type inferContextParamsFromContextBuilder<
  TContextBuilder extends ContextBuilder | undefined,
> = TContextBuilder extends ContextBuilder
  ? Parameters<TContextBuilder>[0]
  : undefined;
