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

export type SimpleRoute = {
  _def: {
    nodeType: 'route';
    type: ResolverType;
    outputSchema: any;
    argsSchema: any;
    description: string | undefined;
  };
};

export type SimpleRouter = {
  _def: {
    nodeType: 'router';
    routes: {
      [key: string]: SimpleRouter | SimpleRoute;
    };
  };
};

/**
 * DESCRIPTION
 */
export type inferDescription<TRoute extends SimpleRoute> =
  TRoute['_def']['description'];

/**
 * RESOLVER TYPE
 */
export type inferResolverType<TRoute extends SimpleRoute> =
  TRoute['_def']['type'];
