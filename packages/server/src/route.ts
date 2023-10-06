import { z } from 'zod';
import { ResolverType } from './types';
import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';

export class Route<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | any = z.Schema | any,
  TResolver extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> {
  type: TType;
  input: TInput;
  output: TOutput;
  resolver: TResolver;
  nodeType: 'route';
  transformer: TDataTransformer;

  constructor(options: {
    type: TType;
    input: TInput;
    output: TOutput;
    resolver: TResolver;
    nodeType: 'route';
    transformer: TDataTransformer;
  }) {
    this.type = options.type;
    this.input = options.input;
    this.output = options.output;
    this.resolver = options.resolver;
    this.nodeType = options.nodeType;
    this.transformer = options.transformer;
  }
}

export type AnyRoute = Route;
