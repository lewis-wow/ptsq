import { z } from 'zod';
import { Route } from './types';

export const query = <
  TQueryInput extends z.Schema | undefined = undefined,
  TQueryOutput extends z.Schema | undefined = undefined,
>(options?: {
  input?: TQueryInput;
  output?: TQueryOutput;
}): Route<'query', TQueryInput, TQueryOutput> =>
  ({
    input: options?.input,
    output: options?.output,
    type: 'query',
    nodeType: 'route',
  }) as Route<'query', TQueryInput, TQueryOutput>;
