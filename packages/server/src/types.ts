import { TSchema } from '@sinclair/typebox';
import { JSONSchema } from 'json-schema-to-ts';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

const ErrorSymbol: unique symbol = Symbol('PTSQ_ERROR_SYMBOL');

/**
 * @internal
 */
export type ErrorMessage<TMessage extends string> = TMessage & {
  __: typeof ErrorSymbol;
};

/**
 * @internal
 */
export type ShallowMerge<T extends object, U extends object> = {
  [K in keyof T]: K extends keyof U ? U[K] : T[K];
} & U;

/**
 * @internal
 *
 * Simplify the object structure for readability in IDE
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Simplify<T> = T extends any[] | Date ? T : { [K in keyof T]: T[K] };

export type IntrospectedRoute = {
  nodeType: 'route';
  type: ResolverType;
  outputSchema: TSchema | JSONSchema;
  argsSchema?: TSchema | JSONSchema;
  description?: string;
};

export type IntrospectedRouter = {
  nodeType: 'router';
  routes: Record<string, IntrospectedRouter | IntrospectedRoute>;
};

/**
 * infers description from PTSQ endpoint
 */
export type inferDescription<TRoute extends IntrospectedRoute> =
  'description' extends keyof TRoute ? TRoute['description'] : undefined;

/**
 * infers resolver type from PTSQ endpoint
 */
export type inferResolverType<TRoute extends IntrospectedRoute> =
  TRoute['type'];

/**
 * infers PTSQ schema from router
 */
export type inferPtsqSchema<TRouter extends IntrospectedRouter> = {
  nodeType: 'router';
  routes: {
    [K in keyof TRouter['routes']]: TRouter['routes'][K] extends IntrospectedRouter
      ? inferPtsqSchema<TRouter['routes'][K]>
      : TRouter['routes'][K] extends IntrospectedRoute
        ? Pick<TRouter['routes'][K], keyof IntrospectedRoute>
        : never;
  };
};
