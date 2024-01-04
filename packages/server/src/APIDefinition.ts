import type { TSchema } from '@sinclair/typebox';
import type { AnyMutation } from './mutation';
import type { AnyQuery } from './query';
import type { AnyRouter, Routes } from './router';
import type { ResolverType } from './types';

export type APIDefinition =
  | {
      node: 'router';
      routes: Record<string, APIDefinition>;
    }
  | {
      node: 'route';
      type: ResolverType;
      args?: TSchema;
      output: TSchema;
      description?: string;
    };

export type inferAPIDefinition<TRoutes extends Routes> = {
  [K in keyof TRoutes]: TRoutes[K] extends AnyRouter
    ? {
        node: 'router';
        routes: inferAPIDefinition<TRoutes[K]['_def']['routes']>;
      }
    : TRoutes[K] extends AnyQuery
    ? {
        type: TRoutes[K]['_def']['type'];
        node: TRoutes[K]['_def']['nodeType'];
        args: TRoutes[K]['_def']['argsSchema'];
        output: TRoutes[K]['_def']['outputSchema'];
        description: TRoutes[K]['_def']['description'];
      }
    : TRoutes[K] extends AnyMutation
    ? {
        type: TRoutes[K]['_def']['type'];
        node: TRoutes[K]['_def']['nodeType'];
        args: TRoutes[K]['_def']['argsSchema'];
        output: TRoutes[K]['_def']['outputSchema'];
        description: TRoutes[K]['_def']['description'];
      }
    : never;
};
