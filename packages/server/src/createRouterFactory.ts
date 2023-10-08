import { createSchemaRoot } from './createSchemaRoot';
import { AnyRoute } from './route';
import { DataTransformer } from './transformer';

export type Routes<TDataTransformer extends DataTransformer = DataTransformer> = {
  [Key: string]: AnyRoute | Router<TDataTransformer>;
};

type RouterOptions<TDataTransformer extends DataTransformer, TRoutes extends Routes<TDataTransformer>> = {
  transformer: TDataTransformer;
  routes: TRoutes;
};

export class Router<
  TDataTransformer extends DataTransformer = DataTransformer,
  TRoutes extends Routes<TDataTransformer> = Routes<TDataTransformer>,
> {
  transformer: TDataTransformer;
  routes: TRoutes;
  nodeType: 'router' = 'router';

  constructor({ transformer, routes }: RouterOptions<TDataTransformer, TRoutes>) {
    this.transformer = transformer;
    this.routes = routes;
  }

  getJsonSchema(title = 'root') {
    return createSchemaRoot({
      title: `${title} router`,
      properties: {
        nodeType: {
          type: 'string',
          enum: [this.nodeType],
        },
        routes: createSchemaRoot({
          properties: Object.entries(this.routes).reduce((acc, [key, node]) => {
            if (node.nodeType === 'router') {
              //@ts-expect-error
              acc[key] = node.getJsonSchema(`${title} ${key}`);
              return acc;
            }

            //@ts-expect-error
            acc[key] = node.getJsonSchema(`${title} ${key}`);
            return acc;
          }, {}),
        }),
      },
    });
  }

  createProxyCaller() {}
}

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

export type AnyRouter = Router;
