import { AnyRoute } from './route';
import { DataTransformer } from './transformer';

export type RouterRoutes<TDataTransformer extends DataTransformer = DataTransformer> = {
  [Key: string]: AnyRoute | Router<TDataTransformer>;
};

type RouterOptions<TDataTransformer extends DataTransformer, TRoutes extends RouterRoutes<TDataTransformer>> = {
  transformer: TDataTransformer;
  routes: TRoutes;
};

export class Router<
  TDataTransformer extends DataTransformer = DataTransformer,
  TRoutes extends RouterRoutes<TDataTransformer> = RouterRoutes<TDataTransformer>,
> {
  transformer: TDataTransformer;
  routes: TRoutes;
  nodeType: 'router' = 'router';

  constructor({ transformer, routes }: RouterOptions<TDataTransformer, TRoutes>) {
    this.transformer = transformer;
    this.routes = routes;
  }

  getSchema() {}

  createCaller() {}
}

export type AnyRouter = Router;

export const createRouterFactory =
  <TDataTransformer extends DataTransformer>({ transformer }: { transformer: TDataTransformer }) =>
  <
    TRoutes extends {
      [key: string]: AnyRoute | Router<TDataTransformer>;
    },
  >(
    routes: TRoutes
  ): Router<TDataTransformer, TRoutes> =>
    new Router({
      routes,
      transformer,
    });
