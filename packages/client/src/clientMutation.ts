import { ClientRoute, type RequestOptions } from './clientRoute';

export abstract class ClientMutation<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> extends ClientRoute {
  abstract description: TDescription;

  abstract mutate(
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ): Promise<TDefinition['output']>;
}
