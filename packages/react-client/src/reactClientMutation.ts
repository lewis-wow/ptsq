import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

export type ReactClientMutation<
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
  ) => UseMutationResult<TDefinition['output'], Error, TDefinition['args']>;
};
