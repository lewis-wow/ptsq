import { z } from 'zod';
import { Route } from './route';
import { DataTransformer } from './transformer';

export type Router<
  TDataTransformer extends DataTransformer = DataTransformer,
  TRoutes extends {
    [Key: string]:
      | Route<'query', z.Schema | undefined, z.Schema | any, TDataTransformer>
      | Route<'mutation', z.Schema | undefined, z.Schema | any, TDataTransformer>
      | Router<TDataTransformer>;
  } = {
    [Key: string]:
      | Route<'query', z.Schema | undefined, z.Schema | any, TDataTransformer>
      | Route<'mutation', z.Schema | undefined, z.Schema | any, TDataTransformer>
      | Router<TDataTransformer>;
  },
> = {
  nodeType: 'router';
  routes: TRoutes;
  dataTransformer: TDataTransformer;
};

export type CreateRouter<TDataTransformer extends DataTransformer> = {
  <
    TRoutes extends {
      [key: string]:
        | Route<'query', z.Schema | undefined, z.Schema | any, TDataTransformer>
        | Route<'mutation', z.Schema | undefined, z.Schema | any, TDataTransformer>
        | Router<TDataTransformer>;
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
  return (routes: any) => ({
    nodeType: 'router' as 'router',
    routes,
    dataTransformer,
  });
};
