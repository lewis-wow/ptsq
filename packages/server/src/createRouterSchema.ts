import { zodToTs, printNode } from 'zod-to-ts';
import type { Route } from './route';
import type { Router, RouterRoutes } from './createRouterFactory';
import type { DataTransformer } from './transformer';
import type { ZodAny } from 'zod';

export type RouteSchema<TRoute extends Route> = {
  input: TRoute['input'];
  output: TRoute['output'];
  type: TRoute['type'];
};

export type RoutesSchema<TRoutes extends RouterRoutes> = {
  [K in keyof TRoutes]: TRoutes[K] extends Route
    ? RouteSchema<TRoutes[K]>
    : TRoutes[K] extends Router
    ? RoutesSchema<TRoutes[K]['routes']>
    : never;
};

export const createRouterSchema = <
  TDataTransformer extends DataTransformer,
  TRoutes extends RouterRoutes<TDataTransformer>,
>(
  routes: TRoutes
): RoutesSchema<TRoutes> => {
  const schema: Record<string, unknown> = {};

  for (const [path, node] of Object.entries(routes)) {
    schema[path] =
      node.nodeType === 'router'
        ? node.schema
        : {
            input: node.input ? printNode(zodToTs(node.input).node) : null,
            output: node.output ? printNode(zodToTs(node.output as ZodAny).node) : null,
            type: node.type,
          };
  }

  return schema as unknown as RoutesSchema<TRoutes>;
};
