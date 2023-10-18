import type { ResolverType } from '@ptsq/server';

/**
 * more general route type than in server package, because of introspection result
 */
export type ClientRoute<TType extends ResolverType = ResolverType> = {
  nodeType: 'route';
  type: TType;
  inputValidationSchema?: any;
  outputValidationSchema: any;
};

/**
 * more general router type than in server package, because of introspection result
 */
export type ClientRouter = {
  nodeType: 'router';
  routes: {
    [key: string]: ClientRouter | ClientRoute;
  };
};
