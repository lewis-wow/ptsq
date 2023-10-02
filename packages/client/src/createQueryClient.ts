import { DataTransformer, Route, inferDeserializeDataTransformerOutput } from 'schema';
import { z } from 'zod';

export const createQueryClient = <TQuery extends Route<'query'>, TDataTransformer extends DataTransformer>(
  query: TQuery
): QueryClient<TQuery, TDataTransformer> => ({
  query: (_input = undefined) => {
    return query as unknown as QueryClientOutput<TQuery['output'], TDataTransformer>;
  },
});

type QueryClientOutput<TOutput extends z.Schema | any, TDataTransformer extends DataTransformer> = Promise<
  TOutput extends z.Schema
    ? inferDeserializeDataTransformerOutput<TDataTransformer['deserialize'], z.infer<TOutput>>
    : ReturnType<TDataTransformer['deserialize']>
>;

export type QueryClient<TQuery extends Route<'query'>, TDataTransformer extends DataTransformer> = {
  query: TQuery['input'] extends undefined
    ? () => QueryClientOutput<TQuery['output'], TDataTransformer>
    : (input: z.infer<Exclude<TQuery['input'], undefined>>) => QueryClientOutput<TQuery['output'], TDataTransformer>;
};
