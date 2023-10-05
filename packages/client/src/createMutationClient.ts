import type { Route } from '@schema-rpc/server';
import type { z } from 'zod';

export const createMutationClient = <TMutation extends Route<'mutation'>>(
  mutation: TMutation,
  route: string
): MutationClient<TMutation> => ({
  mutate: async (input = undefined) => {
    return {
      mutation,
      route,
      input,
    } as unknown as MutationClientOutput<TMutation['output']>;
  },
});

type MutationClientOutput<TOutput> = Promise<TOutput extends z.Schema ? z.infer<TOutput> : TOutput>;

export type MutationClient<TQuery extends Route<'mutation'>> = {
  mutate: TQuery['input'] extends undefined
    ? () => MutationClientOutput<TQuery['output']>
    : (input: z.infer<Exclude<TQuery['input'], undefined>>) => MutationClientOutput<TQuery['output']>;
};
