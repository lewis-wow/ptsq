import { zodToTs, printNode } from 'zod-to-ts';
import { Route } from './route';
import { Router, RouterRoutes } from './createRouterFactory';

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

export const createRouterSchema = <TRoutes extends RouterRoutes>(routes: TRoutes): RoutesSchema<TRoutes> => {
  const schema: any = {};

  for (const [path, node] of Object.entries(routes)) {
    schema[path] =
      node.nodeType === 'router'
        ? node.schema
        : {
            input: node.input ? printNode(zodToTs(node.input).node) : null,
            output: node.output ? printNode(zodToTs(node.output).node) : null,
            type: node.type,
          };
  }

  return schema;
};
