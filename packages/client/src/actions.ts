import type { ResolverType } from '@ptsq/server';

const actions = ['query', 'mutate'] as const;

export type Action = (typeof actions)[number];

export const actionsMapper: Record<Action, ResolverType> = {
  query: 'query',
  mutate: 'mutation',
};

export const isAction = (action?: string): action is Action =>
  actions.includes(action as Action);
