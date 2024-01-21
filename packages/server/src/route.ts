import { Type, type TSchema } from '@sinclair/typebox';
import type { Compiler } from './compiler';
import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { Middleware, type MiddlewareMeta } from './middleware';
import type { AnyMiddleware, AnyMiddlewareResponse } from './middleware';
import { PtsqError } from './ptsqError';
import type { AnyResolveFunction } from './resolver';
import type { inferStaticInput, ResolverType } from './types';

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
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> {
  _def: {
    type: TType;
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    resolveFunction: TResolveFunction;
    nodeType: 'route';
    middlewares: AnyMiddleware[];
    description: TDescription;
    compiler: Compiler;
  };

  constructor(options: {
    type: TType;
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    compiler: Compiler;
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
          compiler: this._def.compiler,
          middlewareFunction: async (resolveFunctionParams) => {
            const resolverResult = await this._def.resolveFunction({
              input: resolveFunctionParams.input,
              ctx: resolveFunctionParams.ctx,
              meta: resolveFunctionParams.meta,
            });

            const compiledParser = this._def.compiler.getParser(
              this._def.outputSchema,
            );

            const parseResult = compiledParser.encode(resolverResult);

            if (!parseResult.ok)
              throw new PtsqError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Output validation error',
                info: parseResult.errors,
              });

            const response = Middleware.createSuccessResponse({
              data: parseResult.data,
              ctx: resolveFunctionParams.ctx,
            });

            return response;
          },
        }),
      ],
    });
  }

  resolve(resolveFunctionOptions: {
    ctx: TContext;
    input: inferStaticInput<TArgsSchema>;
    meta: MiddlewareMeta;
  }): ReturnType<TResolveFunction> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._def.resolveFunction(resolveFunctionOptions);
  }
}

export type AnyRoute = Route<
  ResolverType,
  TSchema | undefined,
  TSchema,
  any,
  AnyResolveFunction,
  string | undefined
>;
