import type { Context } from './context';
import { createSchemaRoot, type SchemaRoot } from './createSchemaRoot';
import { type AnyMiddlewareResponse, type MiddlewareMeta } from './middleware';
import type { AnyMutation } from './mutation';
import { PtsqError, PtsqErrorCode } from './ptsqError';
import type { AnyQuery } from './query';
import type {
  ErrorMessage,
  ResolverType,
  ShallowMerge,
  Simplify,
} from './types';

export type Routes = {
  [Key: string]: AnyQuery | AnyMutation | AnyRouter;
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
    /**
     * @internal
     * type only - cannot access context while creating resolver
     */
    context: TContext;
  };

  constructor(routerOptions: { routes: TRoutes }) {
    this._def = {
      ...routerOptions,
      nodeType: 'router',
      context: {} as TContext,
    };
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
  async call(options: {
    route: string[];
    index: number;
    ctx: Context;
    type: ResolverType;
    meta: MiddlewareMeta;
  }): Promise<AnyMiddlewareResponse> {
    const currentRoute = options.route[options.index];

    if (!currentRoute)
      throw new PtsqError({
        code: PtsqErrorCode.NOT_FOUND_404,
        message:
          'The route was terminated by query or mutate but should continue.',
      });

    if (!(currentRoute in this._def.routes))
      throw new PtsqError({
        code: PtsqErrorCode.NOT_FOUND_404,
        message: 'The route was invalid.',
      });

    const nextNode = this._def.routes[currentRoute];

    if (nextNode._def.nodeType === 'router')
      return nextNode.call({ ...options, index: options.index + 1 });

    if (options.index !== options.route.length - 1)
      throw new PtsqError({
        code: PtsqErrorCode.NOT_FOUND_404,
        message:
          'The route continues, but should be terminated by query or mutate.',
      });

    if (nextNode._def.type !== options.type)
      throw new PtsqError({
        code: PtsqErrorCode.BAD_REQUEST_400,
        message: `The route type is invalid, it should be ${nextNode._def.type} and it is ${options.type}.`,
      });

    return nextNode.call(options);
  }

  /**
   * Creates server side caller to call the request right from the server
   *
   * It can be used for testing
   */
  createServerSideCaller(ctx: TContext) {
    return this._createServerSideCaller({
      ctx,
      route: [],
    });
  }

  _createServerSideCaller(options: {
    ctx: TContext;
    route: string[];
  }): ServerSideCaller<TRoutes> {
    return new Proxy(this._def.routes, {
      get: (target, prop: string) => {
        const node = target[prop];

        if (node._def.nodeType === 'router')
          return (node as AnyRouter).createServerSideCaller({
            ctx: options.ctx,
            route: [...options.route, prop],
          });

        if (node._def.type === 'query')
          return (node as AnyQuery).createServerSideQuery({
            ctx: options.ctx,
            route: [...options.route, prop].join('.'),
          });

        return (node as AnyMutation).createServerSideMutation({
          ctx: options.ctx,
          route: [...options.route, prop].join('.'),
        });
      },
    }) as ServerSideCaller<TRoutes>;
  }

  static merge<TRouterA extends AnyRouter, TRouterB extends AnyRouter>(
    routerA: TRouterA,
    routerB: TRouterB['_def']['context'] extends TRouterA['_def']['context']
      ? TRouterB
      : ErrorMessage<`Router B cannot be merged with router A, because the context of router B does not extends context of router A.`>,
  ) {
    return new Router<
      ShallowMerge<TRouterA['_def']['routes'], TRouterB['_def']['routes']>,
      Simplify<TRouterA['_def']['context'] & TRouterB['_def']['context']>
    >({
      routes: {
        ...routerA._def.routes,
        ...(routerB as TRouterB)._def.routes,
      } as ShallowMerge<TRouterA['_def']['routes'], TRouterB['_def']['routes']>,
    });
  }
}

export type AnyRouter = Router<Routes, any>;

export type ServerSideCaller<TRoutes extends Routes> = {
  [K in keyof TRoutes]: TRoutes[K] extends AnyRouter
    ? ServerSideCaller<TRoutes[K]['_def']['routes']>
    : TRoutes[K] extends AnyQuery
      ? ReturnType<TRoutes[K]['createServerSideQuery']>
      : TRoutes[K] extends AnyMutation
        ? ReturnType<TRoutes[K]['createServerSideMutation']>
        : never;
};
