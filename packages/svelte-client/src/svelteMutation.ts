import type { PtsqClientError } from '@ptsq/client';
import type {
  CreateMutationOptions,
  CreateMutationResult,
} from '@tanstack/svelte-query';

export type SvelteMutation<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  _def: {
    description: TDescription;
  };

  createMutation: (
    mutationOptions?: Omit<CreateMutationOptions, 'mutationFn' | 'mutationKey'>,
  ) => CreateMutationResult<
    TDefinition['output'],
    PtsqClientError,
    TDefinition['args']
  >;
};
