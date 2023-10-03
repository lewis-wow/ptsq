import { z } from 'zod';
import { Route } from './route';
import { DataTransformer } from './transformer';

export type CreateMutation<TDataTransformer extends DataTransformer> = {
  (): Route<'mutation', undefined, any, TDataTransformer>;

  <TMutationOutput extends z.Schema | any = any>({
    input,
    output,
  }: {
    input?: undefined;
    output?: TMutationOutput;
  }): Route<'mutation', undefined, TMutationOutput, TDataTransformer>;

  <TMutationInput extends z.Schema | undefined = undefined, TMutationOutput extends z.Schema | any = any>(options: {
    input?: TMutationInput;
    output?: TMutationOutput;
  }): Route<'mutation', TMutationInput, TMutationOutput, TDataTransformer>;
};

export type MutationDefintionFactoryArgs<TDataTransformer extends DataTransformer> = {
  dataTransformer: TDataTransformer;
};

export const mutationDefinition = <TDataTransformer extends DataTransformer>({
  dataTransformer,
}: MutationDefintionFactoryArgs<TDataTransformer>): CreateMutation<TDataTransformer> => {
  return (options?: any) => ({
    type: 'mutation' as 'mutation',
    input: options?.input,
    output: options?.output,
    nodeType: 'route' as 'route',
    dataTransformer,
  });
};
