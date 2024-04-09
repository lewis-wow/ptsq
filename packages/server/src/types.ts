export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

/**
 * @internal
 */
export type ErrorMessage<TMessage extends string> = TMessage & TypeError;

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
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

export type IntrospectedRoute = {
  nodeType: 'route';
  type: ResolverType;
  outputSchema: any;
  argsSchema?: any;
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
