import type { PtsqClientError } from '@ptsq/client';
import { Simplify } from '@ptsq/server';
import type {
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  CreateQueryOptions,
  CreateQueryResult,
} from '@tanstack/svelte-query';

export type SvelteQuery<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  createQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<CreateQueryOptions, 'queryFn' | 'queryKey'>,
  ) => CreateQueryResult<TDefinition['output'], PtsqClientError>;
} & (TDefinition['args'] extends { pageParam: any }
  ? {
      createInfiniteQuery: (
        requestInput: Simplify<Omit<TDefinition['args'], 'pageParam'>>,
        queryOptions?: Omit<
          CreateInfiniteQueryOptions<
            TDefinition['output'],
            PtsqClientError,
            TDefinition['output'],
            TDefinition['output']
          >,
          'queryFn' | 'queryKey'
        >,
      ) => CreateInfiniteQueryResult<TDefinition['output'], PtsqClientError>;
    }
  : {});
