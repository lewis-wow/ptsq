import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import type { Mutation } from './mutation';
import type { Query } from './query';
import type { ServerSideMutation } from './serverSideMutation';
import type { ServerSideQuery } from './serverSideQuery';

export type Routes = {
  [Key: string]: Query | Mutation | Router;
};

export class Router<TRoutes extends Routes = Routes> {
  routes: TRoutes;
  nodeType: 'router' = 'router' as const;

  constructor({ routes }: { routes: TRoutes }) {
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
            //@ts-expect-error acc don't have type right now
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

  call({ route, input, ctx }: { route: string[]; input: unknown; ctx: Context }): unknown {
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
