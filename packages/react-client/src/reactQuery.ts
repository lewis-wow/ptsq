import type { PtsqClientError } from '@ptsq/client';
import type {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

export type ReactQuery<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  _def: {
    description: TDescription;
  };

  useQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<UseQueryOptions, 'queryFn' | 'queryKey'>,
  ) => UseQueryResult<TDefinition['output'], PtsqClientError>;

  useSuspenseQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<UseSuspenseQueryOptions, 'queryFn' | 'queryKey'>,
  ) => UseSuspenseQueryResult<TDefinition['output'], PtsqClientError>;

  useInfiniteQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<UseInfiniteQueryOptions, 'queryFn' | 'queryKey'>,
  ) => UseInfiniteQueryResult<TDefinition['output'], PtsqClientError>;
};
