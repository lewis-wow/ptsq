import type { ClientRoute } from './clientRoute';

export type ClientRouter = {
  nodeType: 'router';
  routes: {
    [key: string]: ClientRouter | ClientRoute;
  };
};
