import type { z } from 'zod';
import type { ResolverType } from './types';
import type { DataTransformer } from './transformer';
import type { AnyResolveFunction } from './resolver';

export type Route<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | undefined = z.Schema | undefined,
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
