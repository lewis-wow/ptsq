import { z } from 'zod';
import { ResolverType } from './types';
import { DataTransformer } from './transformer';

export type Route<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | any = z.Schema | any,
  TDataTransformer extends DataTransformer = DataTransformer,
> = {
  type: TType;
  input: TInput;
  output: TOutput;
  nodeType: 'route';
  dataTransformer: TDataTransformer;
};
