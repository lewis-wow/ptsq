import { ClientRoute, type RequestOptions } from './clientRoute';

export class ClientQuery<
  TDefinition extends {
    description: string | undefined;
    args?: any;
    output: any;
  },
> extends ClientRoute {
  query(
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ): Promise<TDefinition['output']> {
    return this.fetch(requestInput, requestOptions) as Promise<
      TDefinition['output']
    >;
  }
}
