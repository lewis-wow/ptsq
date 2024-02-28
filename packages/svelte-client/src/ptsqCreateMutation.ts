import { PtsqClientError } from '@ptsq/client';
import {
  CreateMutationOptions,
  CreateMutationResult,
  MutationKey,
} from '@tanstack/svelte-query';

/**
 * @internal
 */
export type PtsqCreateMutation<
  TDefinition extends {
    args?: any;
    output: any;
  },
> = (
  mutationOptions?: PtsqCreateMutationOptions,
) => CreateMutationResult<
  TDefinition['output'],
  PtsqClientError,
  TDefinition['args']
>;

/**
 * @internal
 */
export type PtsqCreateMutationOptions = Omit<
  CreateMutationOptions,
  'mutationFn' | 'mutationKey'
> & {
  additionalMutationKey?: MutationKey[];
};
