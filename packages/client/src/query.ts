import { z } from 'zod';

export class Query<TInput extends z.Schema | undefined = undefined, TOutput extends z.Schema | undefined = undefined> {
  query(input: TInput): TOutput {
    return input as unknown as TOutput;
  }
}
