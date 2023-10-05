import { AnyRoute } from './route';
import { DataTransformer } from './transformer';
import { RoutesSchema } from './createRouterSchema';
import { createRouterSchema } from './createRouterSchema';

export type RouterRoutes<TDataTransformer extends DataTransformer = DataTransformer> = {
  [Key: string]: AnyRoute | Router<TDataTransformer>;
};

export type Router<
  TDataTransformer extends DataTransformer = DataTransformer,
  TRoutes extends RouterRoutes<TDataTransformer> = RouterRoutes<TDataTransformer>,
> = {
  nodeType: 'router';
  routes: TRoutes;
  transformer: TDataTransformer;
  schema: RoutesSchema<TRoutes>;
};

export type AnyRouter = Router;

export const createRouterFactory =
  <TDataTransformer extends DataTransformer>({ transformer }: { transformer: TDataTransformer }) =>
  <
    TRoutes extends {
      [key: string]: AnyRoute | Router<TDataTransformer>;
    },
  >(
    routes: TRoutes
  ): Router<TDataTransformer, TRoutes> => ({
    routes,
    nodeType: 'router',
    transformer,
    schema: createRouterSchema(routes),
  });
