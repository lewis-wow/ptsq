import type { PtsqClientError } from '@ptsq/client';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

export type ReactMutation<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  _def: {
    description: TDescription;
  };

  useMutation: (
    mutationOptions?: Omit<UseMutationOptions, 'mutationFn' | 'mutationKey'>,
  ) => UseMutationResult<
    TDefinition['output'],
    PtsqClientError,
    TDefinition['args']
  >;
};
