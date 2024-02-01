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
} & (TDefinition['args'] extends object
  ? 'cursor' extends keyof TDefinition['args']
    ? {
        useInfiniteQuery: (
          requestInput: Omit<TDefinition['args'], 'cursor'>,
          queryOptions?: Omit<UseInfiniteQueryOptions, 'queryFn' | 'queryKey'>,
        ) => UseInfiniteQueryResult<TDefinition['output'], PtsqClientError>;
      }
    : // eslint-disable-next-line @typescript-eslint/ban-types
      {}
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {});
