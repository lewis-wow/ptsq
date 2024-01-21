import type { MaybePromise } from './types';

export type Context = object;

/**
 * @internal
 */
export type ContextBuilder<TContext extends Context> = (
  params: any,
) => MaybePromise<TContext>;

export type AnyContextBuilder = ContextBuilder<Context>;

/**
 * @internal
 */
export type inferContextFromContextBuilder<
  TContextBuilder extends AnyContextBuilder | undefined,
> = TContextBuilder extends AnyContextBuilder
  ? Awaited<ReturnType<TContextBuilder>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {};

/**
 * @internal
 */
export type inferContextParamsFromContextBuilder<
  TContextBuilder extends AnyContextBuilder | undefined,
> = TContextBuilder extends AnyContextBuilder
  ? Parameters<TContextBuilder>[0]
  : undefined;
