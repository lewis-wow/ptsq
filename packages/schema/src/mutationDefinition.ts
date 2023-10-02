import { z } from 'zod';
import { Route } from './route';
import { DataTransformer } from './transformer';

type CreateMutation<TDataTransformer extends DataTransformer> = {
  (): Route<'mutation', undefined, any, TDataTransformer>;

  <TQueryOutput extends z.Schema | any = any>({
    input,
    output,
  }: {
    input?: undefined;
    output?: TQueryOutput;
  }): Route<'mutation', undefined, TQueryOutput, TDataTransformer>;

  <TQueryInput extends z.Schema | undefined = undefined, TQueryOutput extends z.Schema | any = any>(options: {
    input?: TQueryInput;
    output?: TQueryOutput;
  }): Route<'mutation', TQueryInput, TQueryOutput, TDataTransformer>;
};

export type MutationDefintionFactoryArgs<TDataTransformer extends DataTransformer> = {
  dataTransformer: TDataTransformer;
};

export const mutationDefinition = <TDataTransformer extends DataTransformer>({
  dataTransformer,
}: MutationDefintionFactoryArgs<TDataTransformer>): CreateMutation<TDataTransformer> => {
  return (options: any = undefined) => ({
    type: 'mutation' as 'mutation',
    input: options.input,
    output: options.output,
    nodeType: 'route' as 'route',
    dataTransformer,
  });
};
