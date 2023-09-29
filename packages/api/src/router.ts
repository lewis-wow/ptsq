import { Router, RouterNode } from './types';

export const router = <TRoutes extends { [key: string]: RouterNode }>(routes: TRoutes): Router<TRoutes> => ({
  routes,
  nodeType: 'router',
});
