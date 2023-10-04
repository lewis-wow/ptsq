import { RoutesSchema, createProxyRouterSchema } from './createProxyRouterSchema';
import { AnyRoute } from './route';
import { DataTransformer } from './transformer';

export type RouterRoutes<TDataTransformer extends DataTransformer = DataTransformer> = {
  [Key: string]: AnyRoute | Router<TDataTransformer>;
};

export type Router<
  TDataTransformer extends DataTransformer = DataTransformer,
  TRoutes extends RouterRoutes<TDataTransformer> = RouterRoutes<TDataTransformer>,
> = {
  nodeType: 'router';
  routes: TRoutes;
  dataTransformer: TDataTransformer;
  schema: RoutesSchema<TRoutes>;
};

export type CreateRouter<TDataTransformer extends DataTransformer> = {
  <
    TRoutes extends {
      [key: string]: AnyRoute | Router<TDataTransformer>;
    },
  >(
    routes: TRoutes
  ): Router<TDataTransformer, TRoutes>;
};

type RouterDefinitionArgs<TDataTransformer extends DataTransformer> = {
  dataTransformer: TDataTransformer;
};

export const routerDefinition = <TDataTransformer extends DataTransformer>({
  dataTransformer,
}: RouterDefinitionArgs<TDataTransformer>): CreateRouter<TDataTransformer> => {
  return (routes) => ({
    nodeType: 'router' as 'router',
    routes,
    dataTransformer,
    schema: createProxyRouterSchema(routes),
  });
};
