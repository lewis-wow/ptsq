import type { PtsqClientError } from '@ptsq/client';
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
    queryOptions?: Omit<UseQueryOptions, 'queryFn' | 'queryKey'>,
  ) => UseQueryResult<TDefinition['output'], PtsqClientError>;

  useSuspenseQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<UseSuspenseQueryOptions, 'queryFn' | 'queryKey'>,
  ) => UseSuspenseQueryResult<TDefinition['output'], PtsqClientError>;
} & (TDefinition['args'] extends { pageParam: any }
  ? {
      useInfiniteQuery: (
        requestInput: Omit<TDefinition['args'], 'pageParam'>,
        queryOptions?: Omit<
          UseInfiniteQueryOptions<
            TDefinition['output'],
            PtsqClientError,
            TDefinition['output'],
            TDefinition['output'],
            QueryKey
          >,
          'queryFn' | 'queryKey'
        >,
      ) => UseInfiniteQueryResult<TDefinition['output'], PtsqClientError>;
    }
  : {});
