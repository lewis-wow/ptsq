import { inferResponse } from '@ptsq/server';
import { PtsqErrorShape } from '@ptsq/server/dist/ptsqError';
import type { RequestOptions } from './createProxyClient';

export type Query<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
    errorShape: PtsqErrorShape;
  },
> = {
  query: (
    requestInput: TDefinition['args'],
    requestOptions?: RequestOptions,
  ) => Promise<
    inferResponse<{
      _def: {
        nodeType: 'route';
        type: 'query';
        argsSchema: TDefinition['args'];
        outputSchema: TDefinition['output'];
        errorShape: TDefinition['errorShape'];
        description: _TDescription;
      };
    }>
  >;
};
