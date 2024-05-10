import type { Context } from './context';
import { EndpointIntrospectionSchema, EndpointType } from './endpoint';
import { type AnyMiddlewareResponse, type MiddlewareMeta } from './middleware';
import { Mutation } from './mutation';
import { Node } from './node';
import { PtsqError } from './ptsqError';
import { Query } from './query';
import { AnyResolveFunction } from './resolver';
import { ServerSideCallerBuilder } from './serverSideCallerBuilder';
import type { ErrorMessage, ShallowMerge, Simplify } from './types';

export type RouterRoutes<TContext extends Context> = {
  [Key: string]:
    | Query<any, any, TContext, AnyResolveFunction, string | undefined>
    | Mutation<any, any, TContext, AnyResolveFunction, string | undefined>
    | Router<TContext, any>;
};

/**
 * @internal
 *
 * Creates a router that can be nested.
 */
export class Router<
  TContext extends Context,
  TRoutes extends RouterRoutes<TContext>,
> extends Node {
  routes: TRoutes;

  constructor({ routes }: { routes: TRoutes }) {
    super();

    this.routes = routes;
  }

  /**
   * @internal
   *
   * Gets the json schema of the whole router recursivelly
   */
  getSchema() {
    return {
      nodeType: 'router',
      routes: Object.entries(this.routes).reduce<
        Record<string, EndpointIntrospectionSchema | RouterIntrospectionSchema>
      >((acc, [key, node]) => {
        acc[key] = node.getSchema();
        return acc;
      }, {}),
    } satisfies RouterIntrospectionSchema;
  }

  /**
   * @internal
   *
   * Call the router and shift a route path
   */
  async call(options: {
    route: string[];
    index: number;
    ctx: Context;
    type: EndpointType;
    meta: MiddlewareMeta;
  }): Promise<AnyMiddlewareResponse> {
    const currentRoute = options.route[options.index];

    if (!currentRoute)
      throw new PtsqError({
        code: 'NOT_FOUND',
        message:
          'The route was terminated by query or mutate but should continue.',
      });

    if (!(currentRoute in this.routes))
      throw new PtsqError({
        code: 'NOT_FOUND',
        message: 'The route was invalid.',
      });

    const nextNode = this.routes[currentRoute];

    if (nextNode instanceof Router)
      return nextNode.call({ ...options, index: options.index + 1 });

    if (options.index !== options.route.length - 1)
      throw new PtsqError({
        code: 'NOT_FOUND',
        message:
          'The route continues, but should be terminated by query or mutate.',
      });

    if (
      (options.type === 'query' && nextNode instanceof Mutation) ||
      (options.type === 'mutation' && nextNode instanceof Query)
    ) {
      throw new PtsqError({
        code: 'PTSQ_BAD_ROUTE_TYPE',
        message: `The endpointy type is invalid (${options.type}).`,
      });
    }

    return nextNode.call(options);
  }

  /**
   * Creates server side caller to call the request right from the server
   *
   * It can be used for testing
   */
  static serverSideCaller<TRouter extends AnyRouter>(router: TRouter) {
    return new ServerSideCallerBuilder(router);
  }

  /**
   * Merges two routers into one
   */
  static merge<TRouterA extends AnyRouter, TRouterB extends AnyRouter>(
    routerA: TRouterA,
    routerB: inferContextFromRouter<TRouterB> extends inferContextFromRouter<TRouterA>
      ? TRouterB
      : ErrorMessage<`Router B cannot be merged with router A, because the context of router B does not extends context of router A.`>,
  ) {
    return new Router<
      Simplify<
        inferContextFromRouter<TRouterA> & inferContextFromRouter<TRouterB>
      >,
      Simplify<ShallowMerge<TRouterA['routes'], TRouterB['routes']>>
    >({
      routes: {
        ...routerA.routes,
        ...(routerB as TRouterB).routes,
      } as Simplify<ShallowMerge<TRouterA['routes'], TRouterB['routes']>>,
    });
  }
}

export type RouterIntrospectionSchema = {
  nodeType: 'router';
  routes: Record<
    string,
    RouterIntrospectionSchema | EndpointIntrospectionSchema
  >;
};

export type AnyRouter = Router<Context, RouterRoutes<Context>>;

/**
 * @internal
 */
export type inferContextFromRouter<TRouter> =
  TRouter extends Router<infer TContext, RouterRoutes<Context>>
    ? TContext
    : never;
