import type { PtsqClientError } from '@ptsq/client';
import { Simplify } from '@ptsq/server';
import type {
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

export type ReactQuery<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  useQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<UseQueryOptions, 'queryFn' | 'queryKey'> & {
      queryKey?: QueryKey[];
    },
  ) => UseQueryResult<TDefinition['output'], PtsqClientError>;

  useSuspenseQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<UseSuspenseQueryOptions, 'queryFn' | 'queryKey'> & {
      queryKey?: QueryKey[];
    },
  ) => UseSuspenseQueryResult<TDefinition['output'], PtsqClientError>;
} & (TDefinition['args'] extends { pageParam: any }
  ? {
      useInfiniteQuery: (
        requestInput: Simplify<Omit<TDefinition['args'], 'pageParam'>>,
        queryOptions?: Omit<
          UseInfiniteQueryOptions<
            TDefinition['output'],
            PtsqClientError,
            TDefinition['output'],
            TDefinition['output']
          >,
          'queryFn' | 'queryKey'
        > & {
          queryKey?: QueryKey[];
        },
      ) => UseInfiniteQueryResult<
        { pageParams: unknown[]; pages: TDefinition['output'][] },
        PtsqClientError
      >;
    }
  : {});
