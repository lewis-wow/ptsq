import { Type, type TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { JsonSchemaParser } from './jsonSchemaParser';
import { Middleware, type MiddlewareMeta } from './middleware';
import type { AnyMiddleware } from './middleware';
import { omitUndefinedProperties } from './omitUndefinedProperties';
import { PtsqErrorShape } from './ptsqError';
import { AnyMiddlewareResponse, AnyPtsqResponse } from './ptsqResponse';
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
  TErrorShape extends PtsqErrorShape,
  _TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> {
  _def: {
    type: TType;
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorShape: TErrorShape;
    resolveFunction: TResolveFunction;
    nodeType: 'route';
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
    response: AnyPtsqResponse;
  };

  constructor(options: {
    type: TType;
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorShape: TErrorShape;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
    response: AnyPtsqResponse;
  }) {
    this._def = { ...options, nodeType: 'route' };
  }

  /**
   * @internal
   *
   * Gets the json schema of the route for the introspection query
   */
  getJsonSchema() {
    return Type.Strict(
      Type.Object(
        {
          _def: Type.Strict(
            Type.Object(
              omitUndefinedProperties({
                type: Type.Strict(Type.Literal(this._def.type)),
                nodeType: Type.Strict(Type.Literal(this._def.nodeType)),
                argsSchema:
                  this._def.argsSchema === undefined
                    ? undefined
                    : Type.Strict(this._def.argsSchema),
                outputSchema: Type.Strict(this._def.outputSchema),
                errorShape: Type.Strict(
                  Type.Union(
                    Object.keys(this._def.errorShape).map((errorCode) =>
                      Type.Literal(errorCode),
                    ),
                  ),
                ),
                description:
                  this._def.description === undefined
                    ? undefined
                    : Type.Literal(this._def.description),
              }) as Record<string, TSchema>,
              { additionalProperties: false },
            ),
          ),
        },
        { additionalProperties: false },
      ),
    );
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
              response: this._def.response,
            });

            const parseResult = await this._def.parser.encode({
              value: resolverResult,
              schema: this._def.outputSchema,
            });

            if (!parseResult.ok)
              return this._def.response.error({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Output validation error',
                cause: parseResult.errors,
              });

            const response = this._def.response.data(parseResult.data);

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
  PtsqErrorShape,
  any,
  AnyResolveFunction,
  string | undefined
>;
