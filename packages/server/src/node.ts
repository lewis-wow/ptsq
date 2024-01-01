import type { AnyMutation } from './mutation';
import type { AnyQuery } from './query';
import type { AnyRoute } from './route';
import type { AnyRouter } from './router';
import type { Simplify } from './types';

export type Node = {
  route: AnyRoute;
  router: AnyRouter;
};

export type NodeType = Simplify<keyof Node>;

export type AnyNode = Node[keyof Node];

export type ResolverEndpoint = {
  query: AnyQuery;
  mutation: AnyMutation;
};

export type AnyResolverEndpoint = ResolverEndpoint[keyof ResolverEndpoint];

export type ResolverType = Simplify<keyof ResolverEndpoint>;

export type AnyRouteType = AnyRouter | AnyResolverEndpoint;
