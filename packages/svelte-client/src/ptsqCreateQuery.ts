import { PtsqClientError } from '@ptsq/client';
import {
  CreateQueryOptions,
  CreateQueryResult,
  QueryKey,
} from '@tanstack/svelte-query';

export type PtsqCreateQuery<
  TDefinition extends {
    args?: any;
    output: any;
  },
> = (
  requestInput: TDefinition['args'],
  queryOptions?: PtsqCreateQueryOptions,
) => CreateQueryResult<TDefinition['output'], PtsqClientError>;

/**
 * @internal
 */
export type PtsqCreateQueryOptions = Omit<
  CreateQueryOptions,
  'queryFn' | 'queryKey'
> & {
  additionalQueryKey?: QueryKey[];
};
