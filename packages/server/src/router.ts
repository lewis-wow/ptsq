import type { Context } from './context';
import { createSchemaRoot, type SchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import {
  type AnyRawMiddlewareReponse,
  type MiddlewareMeta,
} from './middleware';
import type { AnyMutation } from './mutation';
import type { AnyQuery } from './query';
import type { Queue } from './queue';

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
   * @internal
   *
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
          properties: Object.entries(this.routes).reduce<
            Record<string, SchemaRoot>
          >((acc, [key, node]) => {
            acc[key] = node.getJsonSchema(`${title} ${key}`);
            return acc;
          }, {}),
        }),
      },
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
    meta: MiddlewareMeta;
  }): Promise<AnyRawMiddlewareReponse> {
    const currentRoute = options.route.dequeue();

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

    if (nextNode.nodeType === 'router') return nextNode.call(options);

    if (options.route.size !== 0)
      throw new HTTPError({
        code: 'BAD_REQUEST',
        message:
          'The route continues, but should be terminated by query or mutate.',
      });

    return nextNode.call(options);
  }
}

export type AnyRouter = Router<Routes>;
