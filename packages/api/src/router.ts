import { Route } from './route';

export type Router<
  TRoutes extends { [Key: string]: Route | Router } = {
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
