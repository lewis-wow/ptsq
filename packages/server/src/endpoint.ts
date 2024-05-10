import { type TSchema } from '@sinclair/typebox';
import type { JSONSchema } from 'json-schema-to-ts';
import type { Context } from './context';
import { inferArgsFromTypeboxArgsSchema } from './inferArgs';
import { JsonSchemaParser } from './jsonSchemaParser';
import { Middleware, type MiddlewareMeta } from './middleware';
import type { AnyMiddleware, AnyMiddlewareResponse } from './middleware';
import { Node } from './node';
import { PtsqError } from './ptsqError';
import type { AnyResolveFunction } from './resolver';

/**
 * @internal
 *
 * Mutation and query class container. Both mutation and query extends Route.
 *
 * Creates callable route.
 */
export abstract class Endpoint<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Node {
  argsSchema: TArgsSchema;
  outputSchema: TOutputSchema;
  description: TDescription;

  _def: {
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    parser: JsonSchemaParser;
  };

  constructor(options: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
  }) {
    super();

    this._def = {
      resolveFunction: options.resolveFunction,
      middlewares: options.middlewares,
      parser: options.parser,
    };

    this.argsSchema = options.argsSchema;
    this.outputSchema = options.outputSchema;
    this.description = options.description;
  }

  /**
   * @internal
   *
   * call the route with input and context
   */
  async call({
    ctx,
    meta,
  }: {
    ctx: Context;
    meta: MiddlewareMeta;
  }): Promise<AnyMiddlewareResponse> {
    return Middleware.recursiveCall({
      ctx,
      meta,
      index: 0,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: this.argsSchema,
          parser: this._def.parser,
          middlewareFunction: async (resolveFunctionParams) => {
            const resolverResult = await this._def.resolveFunction({
              input: resolveFunctionParams.input,
              ctx: resolveFunctionParams.ctx,
              meta: resolveFunctionParams.meta,
            });

            const parseResult = await this._def.parser.encode({
              value: resolverResult,
              schema: this.outputSchema,
            });

            if (!parseResult.ok)
              throw new PtsqError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Output validation error',
                cause: parseResult.errors,
              });

            const response = Middleware.createSuccessResponse({
              data: parseResult.data,
            });

            return response;
          },
        }),
      ],
    });
  }

  /**
   * Calls the route resolve function without calling any middleware or validation connected to this route
   */
  resolve(resolveFunctionOptions: {
    ctx: TContext;
    input: inferArgsFromTypeboxArgsSchema<TArgsSchema>;
    meta: MiddlewareMeta;
  }): ReturnType<TResolveFunction> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._def.resolveFunction(resolveFunctionOptions);
  }
}

export type EndpointType = 'query' | 'mutation';

export type EndpointIntrospectionSchema = {
  type: EndpointType;
  nodeType: 'endpoint';
  argsSchema?: JSONSchema;
  outputSchema: JSONSchema;
  description?: string;
};

export type AnyEndpoint = Endpoint<
  TSchema | undefined,
  TSchema,
  any,
  AnyResolveFunction,
  string | undefined
>;
