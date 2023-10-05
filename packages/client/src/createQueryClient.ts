import type { Route } from '@schema-rpc/server';
import type { z } from 'zod';

export const createQueryClient = <TQuery extends Route<'query'>>(
  query: TQuery,
  route: string
): QueryClient<TQuery> => ({
  query: async (input = undefined) => {
    return {
      query,
      route,
      input,
    } as unknown as QueryClientOutput<TQuery['output']>;
  },
});

type QueryClientOutput<TOutput> = Promise<TOutput extends z.Schema ? z.infer<TOutput> : Exclude<TOutput, z.Schema>>;

export type QueryClient<TQuery extends Route<'query'>> = {
  query: TQuery['input'] extends undefined
    ? () => QueryClientOutput<TQuery['output']>
    : (input: z.infer<Exclude<TQuery['input'], undefined>>) => QueryClientOutput<TQuery['output']>;
};
