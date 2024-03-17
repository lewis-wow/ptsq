import type { TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { JsonSchemaParser } from './jsonSchemaParser';
import type { AnyMiddleware } from './middleware';
import { AnyPtsqErrorShape, PtsqError } from './ptsqError';
import { AnyPtsqResponse, MiddlewareResponse } from './ptsqResponse';
import type { AnyResolveFunction } from './resolver';
import { Route } from './route';
import type {
  inferClientResolverArgs,
  inferClientResolverOutput,
} from './types';

/**
 * Query class container
 */
export class Query<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TError extends Record<string, AnyPtsqErrorShape>,
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'query',
  TArgsSchema,
  TOutputSchema,
  TError,
  TContext,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorSchema: TError;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
    response: AnyPtsqResponse;
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
  createServerSideQuery<TContext extends Context>(options: {
    ctx: TContext;
    route: string;
  }) {
    return {
      query: async (
        input: inferClientResolverArgs<TArgsSchema>,
      ): Promise<
        MiddlewareResponse<
          inferClientResolverOutput<TOutputSchema>,
          PtsqError<keyof TError extends string ? keyof TError : never>,
          TContext
        >
      > => {
        return this.call({
          ctx: options.ctx,
          meta: {
            input: input,
            type: 'query',
            route: options.route,
          },
        }) as Promise<
          MiddlewareResponse<
            inferClientResolverOutput<TOutputSchema>,
            PtsqError<keyof TError extends string ? keyof TError : never>,
            TContext
          >
        >;
      },
    };
  }
}

export type AnyQuery = Query<
  any,
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
