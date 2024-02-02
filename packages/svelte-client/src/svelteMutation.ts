import type { PtsqClientError } from '@ptsq/client';
import type {
  CreateMutationOptions,
  CreateMutationResult,
} from '@tanstack/svelte-query';

export type SvelteMutation<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  createMutation: (
    mutationOptions?: Omit<CreateMutationOptions, 'mutationFn' | 'mutationKey'>,
  ) => CreateMutationResult<
    TDefinition['output'],
    PtsqClientError,
    TDefinition['args']
  >;
};
