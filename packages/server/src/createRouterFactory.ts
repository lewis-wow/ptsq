import { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import { Mutation } from './mutation';
import { Query } from './query';
import { ServerSideMutation } from './serverSideMutation';
import { ServerSideQuery } from './serverSideQuery';
import { DataTransformer } from './transformer';

export type Routes<TDataTransformer extends DataTransformer = DataTransformer> = {
  [Key: string]: Query | Mutation | Router<TDataTransformer>;
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

  createServerSideProxyCaller<TContext extends Context>(ctx: TContext): RouterProxyCaller<TRoutes, TContext> {
    const proxyHandler: ProxyHandler<TRoutes> = {
      get: (target, key: string) => {
        const node = target[key];

        if (node.nodeType === 'router') return node.createServerSideProxyCaller(ctx);

        return node.type === 'mutation' ? node.createServerSideMutation(ctx) : node.createServerSideQuery(ctx);
      },
    };

    return new Proxy(this.routes, proxyHandler) as unknown as RouterProxyCaller<TRoutes, TContext>;
  }

  call({ route, input, ctx }: { route: string[]; input: any; ctx: Context }): any {
    const currentRoute = route.shift();

    if (!currentRoute || !(currentRoute in this.routes))
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'The route is invalid.' });

    const nextNode = this.routes[currentRoute];

    if (nextNode.nodeType === 'router') return nextNode.call({ route, input, ctx });

    return nextNode.call({ input, ctx });
  }
}

type RouterProxyCaller<TRoutes extends Routes, TContext extends Context> = {
  [K in keyof TRoutes]: TRoutes[K] extends Router
    ? RouterProxyCaller<TRoutes[K]['routes'], TContext>
    : TRoutes[K] extends Mutation
    ? ServerSideQuery<TRoutes[K]['inputValidationSchema'], TRoutes[K]['outputValidationSchema'], TContext>
    : TRoutes[K] extends Query
    ? ServerSideMutation<TRoutes[K]['inputValidationSchema'], TRoutes[K]['outputValidationSchema'], TContext>
    : never;
};

export const createRouterFactory =
  <TDataTransformer extends DataTransformer>({ transformer }: { transformer: TDataTransformer }) =>
  <
    TRoutes extends {
      [key: string]: Query | Mutation | Router<TDataTransformer>;
    },
  >(
    routes: TRoutes
  ): Router<TDataTransformer, TRoutes> =>
    new Router({
      routes,
      transformer,
    });

export type AnyRouter = Router;
