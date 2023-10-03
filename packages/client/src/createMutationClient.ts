import { Route } from '@schema-rpc/schema';
import { z } from 'zod';

export const createMutationClient = <TMutation extends Route<'mutation'>>(
  mutation: TMutation,
  route: string
): MutationClient<TMutation> => ({
  mutate: async (_input = undefined) => {
    return {
      mutation,
      route,
    } as unknown as MutationClientOutput<TMutation['output']>;
  },
});

type MutationClientOutput<TOutput extends z.Schema | any = any> = Promise<
  TOutput extends z.Schema ? z.infer<TOutput> : TOutput
>;

export type MutationClient<TQuery extends Route<'mutation'>> = {
  mutate: TQuery['input'] extends undefined
    ? () => MutationClientOutput<TQuery['output']>
    : (input: z.infer<Exclude<TQuery['input'], undefined>>) => MutationClientOutput<TQuery['output']>;
};
