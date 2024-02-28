import { PtsqClientError } from '@ptsq/client';
import { Simplify } from '@ptsq/server';
import {
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

/**
 * @internal
 */
export type PtsqUseInfiniteQuery<
  TDefinition extends {
    args?: any;
    output: any;
  },
> = (
  requestInput: Simplify<Omit<TDefinition['args'], 'pageParam'>>,
  queryOptions?: PtsqUseInfiniteQueryOptions<TDefinition['output']>,
) => UseInfiniteQueryResult<
  { pageParams: unknown[]; pages: TDefinition['output'][] },
  PtsqClientError
>;

/**
 * @internal
 */
export type PtsqUseInfiniteQueryOptions<TOutput> = Omit<
  UseInfiniteQueryOptions<TOutput, PtsqClientError, TOutput, TOutput>,
  'queryFn' | 'queryKey'
> & {
  additionalQueryKey?: QueryKey[];
};

/**
 * @internal
 */
export type AnyPtsqUseInfiniteQueryOptions = PtsqUseInfiniteQueryOptions<any>;

/**
 * @internal
 */
export type AnyPtsqUseInfiniteQuery = PtsqUseInfiniteQuery<{
  args: any;
  output: any;
}>;
