import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import type { Mutation } from './mutation';
import type { Query } from './query';
import type { Queue } from './queue';
import type { ResolverRequest, ResolverResponse } from './resolver';

export type Routes = {
  [Key: string]: Query | Mutation | Router;
};

export class Router<TRoutes extends Routes = Routes> {
  routes: TRoutes;
  nodeType: 'router' = 'router' as const;

  constructor({ routes }: { routes: TRoutes }) {
    this.routes = routes;
  }

  getJsonSchema(title = 'base') {
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
            // TODO: fix the acc type!
            acc[key] = node.getJsonSchema(`${title} ${key}`);
            return acc;
          }, {}),
        }),
      },
    });
  }

  createServerSideProxyCaller<TContext extends Context>(ctx: TContext): RouterProxyCaller<TRoutes, TContext> {
    return this._createServerSideProxyCallerInternal({ ctx, route: [] });
  }

  _createServerSideProxyCallerInternal<TContext extends Context>({
    ctx,
    route,
  }: {
    ctx: TContext;
    route: string[];
  }): RouterProxyCaller<TRoutes, TContext> {
    const proxyHandler: ProxyHandler<TRoutes> = {
      get: (target, key: string) => {
        const node = target[key];

        if (node.nodeType === 'router')
          return node._createServerSideProxyCallerInternal({ ctx, route: [...route, key] });

        return node.type === 'mutation'
          ? node.createServerSideMutation({ ctx, route })
          : node.createServerSideQuery({ ctx, route });
      },
    };

    return new Proxy(this.routes, proxyHandler) as unknown as RouterProxyCaller<TRoutes, TContext>;
  }

  call({
    route,
    ctx,
    meta,
  }: {
    route: Queue<string>;
    ctx: Context;
    meta: ResolverRequest;
  }): Promise<ResolverResponse<Context>> {
    const currentRoute = route.dequeue();

    if (!currentRoute || !(currentRoute in this.routes))
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'The route is invalid.' });

    const nextNode = this.routes[currentRoute];

    if (nextNode.nodeType === 'router') return nextNode.call({ route, ctx, meta });

    if (route.size !== 0) throw new HTTPError({ code: 'BAD_REQUEST', message: 'The route is invalid.' });

    return nextNode.call({ meta, ctx });
  }
}

type RouterProxyCaller<TRoutes extends Routes, TContext extends Context> = {
  [K in keyof TRoutes]: TRoutes[K] extends Router
    ? RouterProxyCaller<TRoutes[K]['routes'], TContext>
    : TRoutes[K] extends Mutation
    ? ReturnType<TRoutes[K]['createServerSideMutation']>
    : TRoutes[K] extends Query
    ? ReturnType<TRoutes[K]['createServerSideQuery']>
    : never;
};
