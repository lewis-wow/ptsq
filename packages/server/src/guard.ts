import type { Context } from './context';
import { GuardRule, GuardRuleCallback } from './guardRule';

export class Guard<TContext extends Context> {
  or(...rules: GuardRule<TContext>[]) {
    return new GuardRule<TContext>(async ({ ctx }) => {
      const rulesResults = await Promise.all(rules.map((rule) => rule.call({ ctx })));

      return rulesResults.some((ruleResult) => ruleResult);
    });
  }

  and(...rules: GuardRule<TContext>[]) {
    return new GuardRule<TContext>(async ({ ctx }) => {
      const rulesResults = await Promise.all(rules.map((rule) => rule.call({ ctx })));

      return rulesResults.every((ruleResult) => ruleResult);
    });
  }

  not(rule: GuardRule<TContext>) {
    return new GuardRule<TContext>(async ({ ctx }) => {
      return !(await rule.call({ ctx }));
    });
  }

  rule(ruleCallback: GuardRuleCallback<TContext>) {
    return new GuardRule(ruleCallback);
  }

  async verify({ rule, ctx }: { rule: GuardRule<TContext>; ctx: TContext }) {
    return await rule.call({ ctx });
  }
}
