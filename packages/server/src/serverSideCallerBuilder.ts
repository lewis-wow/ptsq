import { AnyMutation } from './mutation';
import { AnyQuery } from './query';
import { AnyRouter, inferContextFromRouter } from './router';

/**
 * @internal
 *
 * Creates a server side caller for the given router
 */
export class ServerSideCallerBuilder<TRouter extends AnyRouter> {
  _def: {
    router: TRouter;
  };

  constructor(router: TRouter) {
    this._def = {
      router,
    };
  }

  create(ctx: inferContextFromRouter<TRouter>) {
    return createServerSideCaller({
      router: this._def.router,
      ctx,
      route: [],
    });
  }
}

/**
 * @internal
 */
const createServerSideCaller = <TRouter extends AnyRouter>(options: {
  router: TRouter;
  ctx: inferContextFromRouter<TRouter>;
  route: string[];
}): ServerSideCaller<TRouter> => {
  return new Proxy(options.router.routes, {
    get: (target, prop: string) => {
      const node = target[prop];

      if (node.nodeType === 'router')
        return createServerSideCaller({
          router: node as AnyRouter,
          ctx: options.ctx,
          route: [...options.route, prop],
        });

      if (node.type === 'query')
        return (node as AnyQuery).createServerSideQuery({
          ctx: options.ctx,
          route: [...options.route, prop].join('.'),
        });

      return (node as AnyMutation).createServerSideMutation({
        ctx: options.ctx,
        route: [...options.route, prop].join('.'),
      });
    },
  }) as ServerSideCaller<TRouter>;
};

/**
 * @internal
 */
export type ServerSideCaller<TRouter extends AnyRouter> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends AnyRouter
    ? ServerSideCaller<TRouter['routes'][K]>
    : TRouter['routes'][K] extends AnyQuery
      ? ReturnType<TRouter['routes'][K]['createServerSideQuery']>
      : TRouter['routes'][K] extends AnyMutation
        ? ReturnType<TRouter['routes'][K]['createServerSideMutation']>
        : never;
};
