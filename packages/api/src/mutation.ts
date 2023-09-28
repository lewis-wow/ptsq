import { z } from 'zod';
import { Route } from './types';

export const mutation = <
  TMutationInput extends z.Schema | undefined = undefined,
  TMutationOutput extends z.Schema | undefined = undefined,
>(options?: {
  input?: TMutationInput;
  output?: TMutationOutput;
}): Route<'mutation', TMutationInput, TMutationOutput> =>
  ({
    input: options?.input,
    output: options?.output,
    type: 'mutation',
    nodeType: 'route',
  }) as Route<'mutation', TMutationInput, TMutationOutput>;
