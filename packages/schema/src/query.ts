import { z } from 'zod';
import { Route } from './route';
import { DataTransformer } from './transformer';

export function query<TDataTransformer extends DataTransformer>(): Route<'query', TDataTransformer, undefined, any>;
export function query<TDataTransformer extends DataTransformer, TQueryOutput extends z.Schema | any = any>({
  input,
  output,
}: {
  input?: undefined;
  output?: TQueryOutput;
}): Route<'query', TDataTransformer, undefined, TQueryOutput>;
export function query<
  TDataTransformer extends DataTransformer,
  TQueryInput extends z.Schema | undefined = undefined,
  TQueryOutput extends z.Schema | any = any,
>(options: { input?: TQueryInput; output?: TQueryOutput }): Route<'query', TDataTransformer, TQueryInput, TQueryOutput>;
export function query<
  TDataTransformer extends DataTransformer,
  TQueryInput extends z.Schema | undefined = undefined,
  TQueryOutput extends z.Schema | any = any,
>(options?: {
  input?: TQueryInput;
  output?: TQueryOutput;
}): Route<'query', TDataTransformer, TQueryInput, TQueryOutput> {
  return {
    input: options?.input as TQueryInput,
    output: options?.output as TQueryOutput,
    type: 'query',
    dataTransformer
    nodeType: 'route',
  };
}
