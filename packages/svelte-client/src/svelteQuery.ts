import type { PtsqClientError } from '@ptsq/client';
import type {
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  CreateQueryOptions,
  CreateQueryResult,
} from '@tanstack/svelte-query';

export type SvelteQuery<
  TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  _def: {
    description: TDescription;
  };

  createQuery: (
    requestInput: TDefinition['args'],
    queryOptions?: Omit<CreateQueryOptions, 'queryFn' | 'queryKey'>,
  ) => CreateQueryResult<TDefinition['output'], PtsqClientError>;
} & (TDefinition['args'] extends object
  ? 'cursor' extends keyof TDefinition['args']
    ? {
        createInfiniteQuery: (
          requestInput: Omit<TDefinition['args'], 'cursor'>,
          queryOptions?: Omit<
            CreateInfiniteQueryOptions,
            'queryFn' | 'queryKey'
          >,
        ) => CreateInfiniteQueryResult<TDefinition['output'], PtsqClientError>;
      }
    : // eslint-disable-next-line @typescript-eslint/ban-types
      {}
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {});
