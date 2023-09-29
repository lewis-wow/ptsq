import { Route } from 'api';
import { z } from 'zod';

export function createQueryClient<TQuery extends Route<'query', undefined>>(): {
  query(): TQuery['output'] extends undefined ? unknown : z.infer<Exclude<TQuery['output'], undefined>>;
};

export function createQueryClient<TQuery extends Route<'query', z.Schema>>(): {
  query(
    input: z.infer<TQuery['input']>
  ): TQuery['output'] extends undefined ? unknown : z.infer<Exclude<TQuery['output'], undefined>>;
};

export function createQueryClient<TQuery extends Route<'query'>>() {
  return {
    query(
      input: TQuery['input'] extends undefined ? undefined : z.infer<Exclude<TQuery['input'], undefined>>
    ): TQuery['output'] extends undefined ? unknown : z.infer<Exclude<TQuery['output'], undefined>> {
      return input as unknown as TQuery['output'];
    },
  };
}

type QueryClientOutput<TOutput extends z.Schema | any> = TOutput extends z.Schema ? z.infer<TOutput> : TOutput;

export type QueryClient<TQuery extends Route<'query'>> = {
  query: TQuery['input'] extends undefined
    ? () => QueryClientOutput<TQuery['output']>
    : (input: z.infer<Exclude<TQuery['input'], undefined>>) => QueryClientOutput<TQuery['output']>;
};
