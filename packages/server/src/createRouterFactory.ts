import { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { AnyMutation, Mutation } from './mutation';
import { AnyQuery, Query } from './query';
import { DataTransformer } from './transformer';

export type Routes<TDataTransformer extends DataTransformer = DataTransformer> = {
  [Key: string]: AnyQuery | AnyMutation | Router<TDataTransformer>;
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
            //@ts-expect-error
            acc[key] = node.getJsonSchema(`${title} ${key}`);
            return acc;
          }, {}),
        }),
      },
    });
  }

  createProxyCaller<TContext extends Context>(ctx: TContext): RouterProxyCaller<TRoutes, TContext> {
    const proxyHandler: ProxyHandler<TRoutes> = {
      get: (target, key: string) => {
        const node = target[key];

        if (node.nodeType === 'router') return node.createProxyCaller(ctx);

        return node.type === 'mutation' ? node.createMutationCaller(ctx) : node.createQueryCaller(ctx);
      },
    };

    return new Proxy(this.routes, proxyHandler) as unknown as RouterProxyCaller<TRoutes, TContext>;
  }
}

type RouterProxyCaller<TRoutes extends Routes, TContext extends Context> = {
  [K in keyof TRoutes]: TRoutes[K] extends Router
    ? RouterProxyCaller<TRoutes[K]['routes'], TContext>
    : TRoutes[K] extends Mutation
    ? ReturnType<TRoutes[K]['createMutationCaller']>
    : TRoutes[K] extends Query
    ? ReturnType<TRoutes[K]['createQueryCaller']>
    : never;
};

export const createRouterFactory =
  <TDataTransformer extends DataTransformer>({ transformer }: { transformer: TDataTransformer }) =>
  <
    TRoutes extends {
      [key: string]: AnyQuery | AnyMutation | Router<TDataTransformer>;
    },
  >(
    routes: TRoutes
  ): Router<TDataTransformer, TRoutes> =>
    new Router({
      routes,
      transformer,
    });

export type AnyRouter = Router;
