import { Type, type TSchema } from '@sinclair/typebox';
import { JSONSchema } from 'json-schema-to-ts';
import type { Context } from './context';
import { Endpoint } from './endpoint';
import { inferArgsFromTypeboxArgsSchema } from './inferArgs';
import { inferOutputFromTypeboxOutputSchema } from './inferOutput';
import { JsonSchemaParser } from './jsonSchemaParser';
import type { AnyMiddleware } from './middleware';
import type { AnyResolveFunction } from './resolver';

/**
 * Mutation class container
 */
export class Mutation<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Endpoint<
  TArgsSchema,
  TOutputSchema,
  TContext,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
  }) {
    super(options);
  }

  /**
   * @internal
   * Creates a callable mutation
   */
  createServerSideMutation(options: { ctx: any; route: string }) {
    return {
      mutate: async (
        input: inferArgsFromTypeboxArgsSchema<TArgsSchema>,
      ): Promise<inferOutputFromTypeboxOutputSchema<TOutputSchema>> => {
        const response = await this.call({
          ctx: options.ctx,
          meta: {
            input: input as unknown,
            type: 'mutation',
            route: options.route,
          },
        });

        if (!response.ok) throw response.error;

        return response.data as inferOutputFromTypeboxOutputSchema<TOutputSchema>;
      },
    };
  }

  /**
   * @internal
   *
   * Returns the schema of the route for the introspection query
   */
  getSchema() {
    return {
      type: 'mutation',
      nodeType: 'endpoint',
      argsSchema:
        this.argsSchema === undefined
          ? undefined
          : Type.Strict(this.argsSchema),
      outputSchema: Type.Strict(this.outputSchema),
      description: this.description,
    } satisfies MutationIntrospectionSchema;
  }
}

export type MutationIntrospectionSchema = {
  type: 'mutation';
  nodeType: 'endpoint';
  argsSchema?: JSONSchema;
  outputSchema: JSONSchema;
  description?: string;
};

export type AnyMutation = Mutation<
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
