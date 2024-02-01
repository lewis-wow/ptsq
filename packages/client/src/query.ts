import type { RequestOptions } from './createProxyClient';

export type Query<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  _def: {
    description: TDescription;
  };

  query: (
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ) => Promise<TDefinition['output']>;
};
