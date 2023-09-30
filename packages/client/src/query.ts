import { Route } from 'api';
import { z } from 'zod';

export const createQueryClient = <TQuery extends Route<'query'>>(): QueryClient<TQuery> => ({
  query: (_input = undefined) => {
    return null as unknown as QueryClientOutput<TQuery['output']>;
  },
});

type QueryClientOutput<TOutput extends z.Schema | any = any> = TOutput extends z.Schema ? z.infer<TOutput> : TOutput;

export type QueryClient<TQuery extends Route<'query'>> = {
  query: TQuery['input'] extends undefined
    ? () => QueryClientOutput<TQuery['output']>
    : (input: z.infer<Exclude<TQuery['input'], undefined>>) => QueryClientOutput<TQuery['output']>;
};
