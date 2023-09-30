import { z } from 'zod';
import { Route } from './route';

export const mutation = <
  TMutationInput extends z.Schema | undefined = undefined,
  TMutationOutput extends z.Schema | any = any,
>(options?: {
  input?: TMutationInput;
  output?: TMutationOutput;
}): Route<'mutation', TMutationInput, TMutationOutput> => ({
  input: options?.input as TMutationInput,
  output: options?.output as TMutationOutput,
  type: 'mutation',
  nodeType: 'route',
});
