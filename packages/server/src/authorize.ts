import type { Context } from './context';
import type { MaybePromise } from './types';

export type AuthorizeFunction<TInput, TContext extends Context = Context> = ({
  input,
  ctx,
}: {
  input: TInput;
  ctx: TContext;
}) => MaybePromise<boolean>;
