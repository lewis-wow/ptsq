import { PtsqClientError } from '@ptsq/client';
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

/**
 * @internal
 */
export type PtsqUseQuery<
  TDefinition extends {
    args?: any;
    output: any;
  },
> = (
  requestInput: TDefinition['args'],
  queryOptions?: PtsqUseQueryOptions,
) => UseQueryResult<TDefinition['output'], PtsqClientError>;

/**
 * @internal
 */
export type PtsqUseQueryOptions = Omit<
  UseQueryOptions,
  'queryFn' | 'queryKey'
> & {
  additionalQueryKey?: QueryKey[];
};

/**
 * @internal
 */
export type AnyPtsqUseQuery = PtsqUseQuery<{
  args: any;
  output: any;
}>;
