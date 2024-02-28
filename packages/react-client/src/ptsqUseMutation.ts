import { PtsqClientError } from '@ptsq/client';
import {
  MutationKey,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

/**
 * @internal
 */
export type PtsqUseMutation<
  TDefinition extends {
    args?: any;
    output: any;
  },
> = (
  mutationOptions?: PtsqUseMutationOptions,
) => UseMutationResult<
  TDefinition['output'],
  PtsqClientError,
  TDefinition['args']
>;

/**
 * @internal
 */
export type PtsqUseMutationOptions = Omit<
  UseMutationOptions,
  'mutationFn' | 'mutationKey'
> & {
  additionalMutationKey?: MutationKey[];
};

/**
 * @internal
 */
export type AnyPtsqUseMutation = PtsqUseMutation<{
  args: any;
  output: any;
}>;
