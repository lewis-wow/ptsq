import type { RequestOptions } from './createProxyClient';

export type Mutation<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  mutate: (
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ) => Promise<TDefinition['output']>;
};
