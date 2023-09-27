import { z } from 'zod';
import { Route } from './router';
import { HTTPErrorCode } from 'error';

export const query = <
  TQueryInput extends z.Schema | undefined = undefined,
  TQueryOutput extends Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>> | undefined = undefined,
>(options?: {
  input?: TQueryInput;
  output?: TQueryOutput;
}): Route<
  'query',
  TQueryInput extends undefined ? undefined : TQueryInput,
  TQueryOutput extends undefined ? undefined : TQueryOutput
> =>
  ({
    input: options?.input,
    output: options?.input,
    type: 'query',
  }) as Route<
    'query',
    TQueryInput extends undefined ? undefined : TQueryInput,
    TQueryOutput extends undefined ? undefined : TQueryOutput
  >;
