import { ClientRoute, type RequestOptions } from './clientRoute';

export class ClientMutation<
  TDefinition extends {
    description: string | undefined;
    args?: any;
    output: any;
  },
> extends ClientRoute {
  mutate(
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ): Promise<TDefinition['output']> {
    return this.fetch(requestInput, requestOptions) as Promise<
      TDefinition['output']
    >;
  }
}
