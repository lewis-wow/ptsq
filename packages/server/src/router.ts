import type { Context } from './context';
import { createSchemaRoot, type SchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import {
  type AnyRawMiddlewareReponse,
  type MiddlewareMeta,
} from './middleware';
import { Mutation, type AnyMutation } from './mutation';
import { Query, type AnyQuery } from './query';
import type { Queue } from './queue';
import type { ResolverType } from './types';

export type AnyNode = AnyQuery | AnyMutation | AnyRouter;

export type Routes = {
  [Key: string]: AnyNode;
};

/**
 * @internal
 *
 * Creates a router that can be nested.
 */
export class Router<TRoutes extends Routes, TContext extends Context> {
  _def: {
    routes: TRoutes;
    nodeType: 'router';
  };

  constructor(routerOptions: { routes: TRoutes }) {
    this._def = { ...routerOptions, nodeType: 'router' };
  }

  /**
   * @internal
   *
   * Gets the json schema of the whole router recursivelly
   */
  getJsonSchema() {
    return createSchemaRoot({
      _def: createSchemaRoot({
        nodeType: {
          type: 'string',
          enum: [this._def.nodeType],
        },
        routes: createSchemaRoot(
          Object.entries(this._def.routes).reduce<Record<string, SchemaRoot>>(
            (acc, [key, node]) => {
              acc[key] = node.getJsonSchema();
              return acc;
            },
            {},
          ),
        ),
      }),
    });
  }

  /**
   * @internal
   *
   * Call the router and shift a route path
   */
  call(options: {
    route: Queue<string>;
    ctx: Context;
    type: ResolverType;
    meta: MiddlewareMeta;
  }): Promise<AnyRawMiddlewareReponse> {
    const currentRoute = options.route.dequeue();

    if (!currentRoute)
      throw new HTTPError({
        code: 'BAD_REQUEST',
        message:
          'The route was terminated by query or mutate but should continue.',
      });

    if (!(currentRoute in this._def.routes))
      throw new HTTPError({
        code: 'NOT_FOUND',
        message: 'The route was invalid.',
      });

    const nextNode = this._def.routes[currentRoute];

    if (nextNode._def.nodeType === 'router') return nextNode.call(options);

    if (options.route.size !== 0)
      throw new HTTPError({
        code: 'BAD_REQUEST',
        message:
          'The route continues, but should be terminated by query or mutate.',
      });

    if (nextNode._def.type !== options.type)
      throw new HTTPError({
        code: 'BAD_REQUEST',
        message: `The route type is invalid, it should be ${nextNode._def.type} and it is ${options.type}.`,
      });

    return nextNode.call(options);
  }

  static isRouterNode(node: AnyNode): node is AnyRouter {
    return node._def.nodeType === 'router';
  }

  _createServerSideProxyCaller({
    ctx,
    route,
  }: {
    ctx: TContext;
    route: string[];
  }): ServerSideProxyCaller<TRoutes> {
    const proxy = new Proxy(this._def.routes, {
      get: (target, property: string) => {
        const nextNode = target[property];

        switch (true) {
          case Router.isRouterNode(nextNode):
            return nextNode._createServerSideProxyCaller({
              ctx,
              route: [...route, property],
            });
          case Query.isQueryNode(nextNode):
            return nextNode.createServerSideQuery({
              ctx,
              route: route.join('.'),
            });
          case Mutation.isMutationNode(nextNode):
            return nextNode.createServerSideMutation({
              ctx,
              route: route.join('.'),
            });
          default:
            throw new Error('');
        }
      },
    });

    return proxy as ServerSideProxyCaller<TRoutes>;
  }

  createServerSideProxyCaller(ctx: TContext) {
    this._createServerSideProxyCaller({ ctx, route: [] });
  }
}

type ServerSideProxyCaller<TRoutes extends Routes> = {
  [K in keyof TRoutes]: TRoutes[K] extends AnyRouter
    ? ServerSideProxyCaller<TRoutes[K]['_def']['routes']>
    : TRoutes[K] extends AnyQuery
    ? ReturnType<TRoutes[K]['createServerSideQuery']>
    : TRoutes[K] extends AnyMutation
    ? ReturnType<TRoutes[K]['createServerSideMutation']>
    : never;
};

export type AnyRouter = Router<Routes, Context>;
