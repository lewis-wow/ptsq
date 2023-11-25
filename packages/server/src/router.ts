import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import type { AnyMutation } from './mutation';
import type { AnyQuery } from './query';
import type { Queue } from './queue';
import type { ResolverRequest, ResolverResponse } from './resolver';

export type Routes = {
  [Key: string]: AnyQuery | AnyMutation | AnyRouter;
};

/**
 * @internal
 *
 * Creates a router that can be nested.
 */
export class Router<TRoutes extends Routes> {
  routes: TRoutes;
  nodeType: 'router' = 'router' as const;

  constructor({ routes }: { routes: TRoutes }) {
    this.routes = routes;
  }

  /**
   * Gets the json schema of the whole router recursivelly
   */
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

  /**
   * Call the router and shift a route path
   */
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

    if (!currentRoute)
      throw new HTTPError({
        code: 'BAD_REQUEST',
        message:
          'The route was terminated by query or mutate but should continue.',
      });

    if (!(currentRoute in this.routes))
      throw new HTTPError({
        code: 'BAD_REQUEST',
        message: 'The route was invalid.',
      });

    const nextNode = this.routes[currentRoute];

    if (nextNode.nodeType === 'router')
      return nextNode.call({ route, ctx, meta });

    if (route.size !== 0)
      throw new HTTPError({
        code: 'BAD_REQUEST',
        message:
          'The route continues, but should be terminated by query or mutate.',
      });

    return nextNode.call({ meta, ctx });
  }
}

export type AnyRouter = Router<Routes>;
