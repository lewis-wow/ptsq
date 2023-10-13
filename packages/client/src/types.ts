import type { ResolverType } from '@schema-rpc/server';

export type ClientRoute<TType extends ResolverType = ResolverType> = {
  nodeType: 'route';
  type: TType;
  inputValidationSchema?: any;
  outputValidationSchema: any;
};

export type ClientRouter = {
  nodeType: 'router';
  routes: {
    [key: string]: ClientRouter | ClientRoute;
  };
};
