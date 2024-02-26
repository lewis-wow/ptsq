import { PtsqUseMutation } from './ptsqUseMutation';

export type ReactMutation<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  useMutation: PtsqUseMutation<TDefinition>;
};
