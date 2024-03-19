import { TSchema, Type } from '@sinclair/typebox';
import type { Context } from './context';
import { type MiddlewareMeta } from './middleware';
import type { AnyMutation } from './mutation';
import { buildInPtsqErrorShape } from './ptsqError';
import { AnyMiddlewareResponse, PtsqResponse } from './ptsqResponse';
import type { AnyQuery } from './query';
import { ServerSideCallerBuilder } from './serverSideCallerBuilder';
import type {
  ErrorMessage,
  ResolverType,
  ShallowMerge,
  Simplify,
} from './types';

export type RouterRoutes = {
  [Key: string]: AnyQuery | AnyMutation | AnyRouter;
};

/**
 * @internal
 *
 * Creates a router that can be nested.
 */
export class Router<TRoutes extends RouterRoutes, _TContext extends Context> {
  _def: {
    routes: TRoutes;
    nodeType: 'router';
  };

  constructor(routerOptions: { routes: TRoutes }) {
    this._def = {
      ...routerOptions,
      nodeType: 'router',
    };
  }

  /**
   * @internal
   *
   * Gets the json schema of the whole router recursivelly
   */
  getJsonSchema() {
    return Type.Object({
      _def: Type.Object({
        nodeType: Type.Literal(this._def.nodeType),
        routes: Type.Object(
          Object.entries(this._def.routes).reduce<Record<string, TSchema>>(
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
  async call(options: {
    route: string[];
    index: number;
    ctx: Context;
    type: ResolverType;
    meta: MiddlewareMeta;
  }): Promise<AnyMiddlewareResponse> {
    const currentRoute = options.route[options.index];

    if (!currentRoute)
      return new PtsqResponse({ errorShape: buildInPtsqErrorShape }).error({
        code: 'NOT_FOUND',
        message:
          'The route was terminated by query or mutate but should continue.',
      });

    if (!(currentRoute in this._def.routes))
      return new PtsqResponse({ errorShape: buildInPtsqErrorShape }).error({
        code: 'NOT_FOUND',
        message: 'The route was invalid.',
      });

    const nextNode = this._def.routes[currentRoute];

    if (nextNode._def.nodeType === 'router')
      return nextNode.call({ ...options, index: options.index + 1 });

    if (options.index !== options.route.length - 1)
      return new PtsqResponse({ errorShape: buildInPtsqErrorShape }).error({
        code: 'NOT_FOUND',
        message:
          'The route continues, but should be terminated by query or mutate.',
      });

    if (nextNode._def.type !== options.type)
      return new PtsqResponse({ errorShape: buildInPtsqErrorShape }).error({
        code: 'BAD_ROUTE_TYPE',
        message: `The route type is invalid, it should be ${nextNode._def.type} and it is ${options.type}.`,
      });

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
      ShallowMerge<TRouterA['_def']['routes'], TRouterB['_def']['routes']>,
      Simplify<
        inferContextFromRouter<TRouterA> & inferContextFromRouter<TRouterB>
      >
    >({
      routes: {
        ...routerA._def.routes,
        ...(routerB as TRouterB)._def.routes,
      } as ShallowMerge<TRouterA['_def']['routes'], TRouterB['_def']['routes']>,
    });
  }
}

export type AnyRouter = Router<RouterRoutes, any>;

/**
 * @internal
 */
export type inferContextFromRouter<TRouter> =
  TRouter extends Router<RouterRoutes, infer TContext> ? TContext : never;
