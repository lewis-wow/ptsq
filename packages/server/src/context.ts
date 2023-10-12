import type { MaybePromise } from './types';

export type Context = object;

export type ContextBuilder<TContext extends Context = Context> = (...params: unknown[]) => MaybePromise<TContext>;

export type inferContextFromContextBuilder<TContextBuilder extends ContextBuilder> = Awaited<
  ReturnType<TContextBuilder>
>;

export type inferContextParamsFromContextBuilder<TContextBuilder extends ContextBuilder> = Parameters<TContextBuilder>;
