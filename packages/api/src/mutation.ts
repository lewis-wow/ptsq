import { z } from 'zod';
import { Route } from './router';
import { HTTPErrorCode } from 'error';

export const mutation = <
  TQueryInput extends z.Schema | undefined = undefined,
  TQueryOutput extends Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>> | undefined = undefined,
>(options?: {
  input?: TQueryInput;
  output?: TQueryOutput;
}): Route<
  'mutation',
  TQueryInput extends undefined ? undefined : TQueryInput,
  TQueryOutput extends undefined ? undefined : TQueryOutput
> =>
  ({
    input: options?.input,
    output: options?.input,
    type: 'mutation',
  }) as Route<
    'mutation',
    TQueryInput extends undefined ? undefined : TQueryInput,
    TQueryOutput extends undefined ? undefined : TQueryOutput
  >;
