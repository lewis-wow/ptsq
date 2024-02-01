import type { PtsqClientError } from '@ptsq/client';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

export type ReactMutation<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  useMutation: (
    mutationOptions?: Omit<UseMutationOptions, 'mutationFn' | 'mutationKey'>,
  ) => UseMutationResult<
    TDefinition['output'],
    PtsqClientError,
    TDefinition['args']
  >;
};
