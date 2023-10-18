import type { Context } from './context';
import type { MaybePromise } from './types';

export type GuardRuleCallback<TContext extends Context> = ({ ctx }: { ctx: TContext }) => MaybePromise<boolean>;

export class GuardRule<TContext extends Context = Context> {
  constructor(public guardRuleCallback: GuardRuleCallback<TContext>) {}

  call({ ctx }: { ctx: TContext }) {
    return this.guardRuleCallback({ ctx });
  }
}
