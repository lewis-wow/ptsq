import { z } from 'zod';

export class Mutation<
  TInput extends z.Schema | undefined = undefined,
  TOutput extends z.Schema | undefined = undefined,
> {
  mutate(input: TInput): TOutput {
    return input as unknown as TOutput;
  }
}
