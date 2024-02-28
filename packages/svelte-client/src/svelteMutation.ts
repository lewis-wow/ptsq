import { PtsqCreateMutation } from './ptsqCreateMutation';

export type SvelteMutation<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  createMutation: PtsqCreateMutation<TDefinition>;
};
