import { Type, type TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { JsonSchemaParser } from './jsonSchemaParser';
import { Middleware, type MiddlewareMeta } from './middleware';
import type { AnyMiddleware } from './middleware';
import { PtsqError } from './ptsqError';
import type { AnyResolveFunction } from './resolver';
import type { ResolverType } from './types';

/**
 * @internal
 *
 * Mutation and query class container. Both mutation and query extends Route.
 *
 * Creates callable route.
 */
export class Route<
  TType extends ResolverType,
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TError extends Record<string, AnyPtsqErrorShape>,
  _TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> {
  _def: {
    type: TType;
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorSchema: TError;
    resolveFunction: TResolveFunction;
    nodeType: 'route';
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
  };

  constructor(options: {
    type: TType;
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorSchema: TError;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
  }) {
    this._def = { ...options, nodeType: 'route' };
  }

  /**
   * @internal
   *
   * Gets the json schema of the route for the introspection query
   */
  getJsonSchema() {
    return createSchemaRoot({
      _def: createSchemaRoot({
        type: {
          type: 'string',
          enum: [this._def.type],
        },
        nodeType: {
          type: 'string',
          enum: [this._def.nodeType],
        },
        argsSchema:
          this._def.argsSchema === undefined
            ? undefined
            : Type.Strict(this._def.argsSchema),
        outputSchema: Type.Strict(this._def.outputSchema),
        description:
          this._def.description === undefined
            ? undefined
            : {
                type: 'string',
                enum: [this._def.description],
              },
      }),
    });
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
          argsSchema: this._def.argsSchema,
          parser: this._def.parser,
          middlewareFunction: async (resolveFunctionParams) => {
            const resolverResult = await this._def.resolveFunction({
              input: resolveFunctionParams.input,
              ctx: resolveFunctionParams.ctx,
              meta: resolveFunctionParams.meta,
            });

            const parseResult = await this._def.parser.encode({
              value: resolverResult,
              schema: this._def.outputSchema,
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
}

export type AnyRoute = Route<
  ResolverType,
  TSchema | undefined,
  TSchema,
  TSchema | undefined,
  any,
  AnyResolveFunction,
  string | undefined
>;
