import { Output, RequestInput } from './args';
import type { RequestOptions } from './createProxyClient';

export type Query<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  query: <
    TRequestInput extends RequestInput<
      TDefinition['args'],
      TDefinition['output']
    >,
  >(
    requestInput: TRequestInput,
    requestOptions?: RequestOptions,
  ) => Promise<Output<TDefinition['output'], TRequestInput>>;
};
