import { z } from 'zod';
import { ResolverType } from './types';
import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';

export type Route<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | any = z.Schema | any,
  TResolver extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> = {
  type: TType;
  input: TInput;
  output: TOutput;
  resolver: TResolver;
  nodeType: 'route';
  dataTransformer: TDataTransformer;
};

export type AnyRoute = Route;
