import { ClientRoute, type RequestOptions } from './clientRoute';

export abstract class ClientAttachment<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> extends ClientRoute {
  abstract descriptions: TDescription;

  abstract attach(
    files: File | Blob | FileList,
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ): Promise<TDefinition['output']>;
}
