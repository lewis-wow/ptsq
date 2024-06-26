import type { TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { inferArgsFromTypeboxArgsSchema } from './inferArgs';
import { inferOutputFromTypeboxOutputSchema } from './inferOutput';
import { JsonSchemaParser } from './jsonSchemaParser';
import type { AnyMiddleware } from './middleware';
import type { AnyResolveFunction } from './resolver';
import { Route } from './route';

/**
 * Query class container
 */
export class Query<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'query',
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
    super({
      type: 'query',
      ...options,
    });
  }

  /**
   * @internal
   * Creates a callable query
   */
  createServerSideQuery(options: { ctx: any; route: string }) {
    return {
      query: async (
        input: inferArgsFromTypeboxArgsSchema<TArgsSchema>,
      ): Promise<inferOutputFromTypeboxOutputSchema<TOutputSchema>> => {
        const response = await this.call({
          ctx: options.ctx,
          meta: {
            input: input as unknown,
            type: 'query',
            route: options.route,
          },
        });

        if (!response.ok) throw response.error;

        return response.data as inferOutputFromTypeboxOutputSchema<TOutputSchema>;
      },
    };
  }
}

export type AnyQuery = Query<
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
