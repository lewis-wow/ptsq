import { z } from 'zod';
import { Route } from './route';
import { DataTransformer } from './transformer';

type CreateQuery<TDataTransformer extends DataTransformer> = {
  (): Route<'query', undefined, any, TDataTransformer>;

  <TQueryOutput extends z.Schema | any = any>({
    input,
    output,
  }: {
    input?: undefined;
    output?: TQueryOutput;
  }): Route<'query', undefined, TQueryOutput, TDataTransformer>;

  <TQueryInput extends z.Schema | undefined = undefined, TQueryOutput extends z.Schema | any = any>(options: {
    input?: TQueryInput;
    output?: TQueryOutput;
  }): Route<'query', TQueryInput, TQueryOutput, TDataTransformer>;
};

export type QueryDefintionFactoryArgs<TDataTransformer extends DataTransformer> = {
  dataTransformer: TDataTransformer;
};

export const queryDefinition = <TDataTransformer extends DataTransformer>({
  dataTransformer,
}: QueryDefintionFactoryArgs<TDataTransformer>): CreateQuery<TDataTransformer> => {
  return (options: any = undefined) => ({
    type: 'query' as 'query',
    input: options.input,
    output: options.output,
    nodeType: 'route' as 'route',
    dataTransformer,
  });
};
