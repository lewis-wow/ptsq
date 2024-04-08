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
  _def: {
    nodeType: 'route';
    type: ResolverType;
    outputSchema: any;
    argsSchema: any;
    description: string | undefined;
  };
};

export type IntrospectedRouter = {
  _def: {
    nodeType: 'router';
    routes: {
      [key: string]: IntrospectedRouter | IntrospectedRoute;
    };
  };
};

/**
 * infers description from PTSQ endpoint
 */
export type inferDescription<TRoute extends IntrospectedRoute> =
  TRoute['_def']['description'];

/**
 * infers resolver type from PTSQ endpoint
 */
export type inferResolverType<TRoute extends IntrospectedRoute> =
  TRoute['_def']['type'];

/**
 * infers JSON Schema from router
 */
export type inferPtsqJSONSchema<TRouter extends IntrospectedRouter> = {
  _def: {
    nodeType: 'router';
    routes: {
      [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends IntrospectedRouter
        ? inferPtsqJSONSchema<TRouter['_def']['routes'][K]>
        : TRouter['_def']['routes'][K] extends IntrospectedRoute
          ? {
              _def: Pick<
                TRouter['_def']['routes'][K]['_def'],
                keyof IntrospectedRoute['_def']
              >;
            }
          : never;
    };
  };
};
