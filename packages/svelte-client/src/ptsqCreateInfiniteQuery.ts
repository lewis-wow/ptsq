import { PtsqClientError } from '@ptsq/client';
import { Simplify } from '@ptsq/server';
import {
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  QueryKey,
} from '@tanstack/svelte-query';

export type PtsqCreateInfiniteQuery<
  TDefinition extends {
    args?: any;
    output: any;
  },
> = (
  requestInput: Simplify<Omit<TDefinition['args'], 'pageParam'>>,
  queryOptions?: PtsqCreateInfiniteQueryOptions<TDefinition['output']>,
) => CreateInfiniteQueryResult<
  { pageParams: unknown[]; pages: TDefinition['output'][] },
  PtsqClientError
>;

/**
 * @internal
 */
export type PtsqCreateInfiniteQueryOptions<TOutput> = Omit<
  CreateInfiniteQueryOptions<TOutput, PtsqClientError, TOutput, TOutput>,
  'queryFn' | 'queryKey'
> & {
  additionalQueryKey?: QueryKey[];
};

/**
 * @internal
 */
export type AnyPtsqCreateInfiniteQueryOptions =
  PtsqCreateInfiniteQueryOptions<any>;
