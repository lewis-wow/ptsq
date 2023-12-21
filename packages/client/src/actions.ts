const actionsMap = {
  query: 'query' as const,
  mutate: 'mutation' as const,
} as const;

export const actions = {
  map: actionsMap,
  isActions: (action?: string): action is keyof typeof actionsMap =>
    !!(action && Object.keys(actions.map).includes(action)),
};
