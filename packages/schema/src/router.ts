import { z } from 'zod';
import { Route } from './route';
import { ResolverType } from './types';

export type Router<
  TRoutes extends { [Key: string]: Route | Route<ResolverType, z.Schema> | Router } = {
    [Key: string]: Route | Router;
  },
> = {
  nodeType: 'router';
  routes: TRoutes;
};

export const router = <TRoutes extends { [key: string]: Route | Router }>(routes: TRoutes): Router<TRoutes> => ({
  routes,
  nodeType: 'router',
});
