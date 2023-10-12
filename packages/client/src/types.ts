import type { ResolverType } from '@schema-rpc/server';

export type ClientRoute<TType extends ResolverType = ResolverType> = {
  nodeType: 'route';
  type: TType;
  inputValidationSchema?: unknown;
  outputValidationSchema: unknown;
};

export type ClientRouter = {
  nodeType: 'router';
  routes: {
    [key: string]: ClientRouter | ClientRoute;
  };
};
