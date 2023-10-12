import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import { Middleware } from './middleware';
import { z } from 'zod';

export class Mutation<
  TInput extends SerializableZodSchema = SerializableZodSchema,
  TOutput extends SerializableZodSchema = SerializableZodSchema,
  TResolveFunction extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> extends Route<'mutation', TInput, TOutput, TResolveFunction, TDataTransformer> {
  constructor(options: {
    inputValidationSchema?: TInput;
    outputValidationSchema: TOutput;
    resolveFunction: TResolveFunction;
    transformer: TDataTransformer;
    middlewares: Middleware[];
  }) {
    super({
      type: 'mutation',
      inputValidationSchema: options.inputValidationSchema ?? (z.undefined() as unknown as TInput),
      ...options,
    });
  }

  createServerSideMutation<TContext extends Context>(ctx: TContext) {
    return new ServerSideMutation({ ctx, resolveFunction: this.resolveFunction });
  }
}

export type AnyMutation = Mutation;
