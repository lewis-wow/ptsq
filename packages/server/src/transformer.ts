import type { AnyArgsTransformationFunction } from './transformation';

export type ArgsTransformer<
  TTransformer extends AnyArgsTransformationFunction,
> = TTransformer;
