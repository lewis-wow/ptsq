import type { RequestOptions } from './createProxyClient';

export type Query<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  query: (
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ) => Promise<TDefinition['output']>;
};
