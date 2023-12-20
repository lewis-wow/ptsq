import { ClientRoute, type RequestOptions } from './clientRoute';

export abstract class ClientQuery<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> extends ClientRoute {
  abstract description: TDescription;

  abstract query(
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ): Promise<TDefinition['output']>;
}
