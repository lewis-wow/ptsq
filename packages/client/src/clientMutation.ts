import { type RequestOptions } from './client';

export type ClientMutation<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  _def: {
    description: TDescription;
  };

  mutate: (
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ) => Promise<TDefinition['output']>;
};
