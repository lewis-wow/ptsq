import type { MaybePromise } from './types';

export type Context = object;

export type RootContext = {
  request: Request;
};

/**
 * @internal
 */
export type ContextBuilder<
  TParams extends Context,
  TContext extends Context,
> = (params: TParams) => MaybePromise<TContext>;

export type AnyContextBuilder = ContextBuilder<any, any>;

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
