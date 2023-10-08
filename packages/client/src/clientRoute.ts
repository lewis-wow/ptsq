import type { ResolverType } from '@schema-rpc/server';

export type ClientRoute<TType extends ResolverType = ResolverType> = {
  nodeType: 'route';
  type: TType;
  input?: any;
  output: any;
};
