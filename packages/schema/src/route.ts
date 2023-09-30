import { z } from 'zod';
import { ResolverType } from './types';

export type Route<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | any = z.Schema | any,
> = {
  type: TType;
  input: TInput;
  output: TOutput;
  nodeType: 'route';
};
