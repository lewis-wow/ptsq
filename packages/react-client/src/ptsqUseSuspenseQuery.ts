import { PtsqClientError } from '@ptsq/client';
import {
  QueryKey,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

/**
 * @internal
 */
export type PtsqUseSuspenseQuery<
  TDefinition extends {
    args?: any;
    output: any;
  },
> = (
  requestInput: TDefinition['args'],
  queryOptions?: PtsqUseSuspenseQueryOptions,
) => UseSuspenseQueryResult<TDefinition['output'], PtsqClientError>;

/**
 * @internal
 */
export type PtsqUseSuspenseQueryOptions = Omit<
  UseSuspenseQueryOptions,
  'queryFn' | 'queryKey'
> & {
  additionalQueryKey?: QueryKey[];
};

/**
 * @internal
 */
export type AnyPtsqUseSuspenseQuery = PtsqUseSuspenseQuery<{
  args: any;
  output: any;
}>;
