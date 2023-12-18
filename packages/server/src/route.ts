import { Type, type TSchema } from '@sinclair/typebox';
import { safeParseArgs } from './args';
import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import {
  Middleware,
  MiddlewareResponse,
  type MiddlewareMeta,
} from './middleware';
import type { AnyMiddleware, AnyRawMiddlewareReponse } from './middleware';
import type { AnyResolveFunction } from './resolver';
import type { AnyTransformation } from './transformation';
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
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> {
  type: TType;
  schemaArgs: TArgsSchema;
  schemaOutput: TOutputSchema;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: AnyMiddleware[];
  transformations: AnyTransformation[];
  description: TDescription;

  constructor(options: {
    type: TType;
    schemaArgs: TArgsSchema;
    schemaOutput: TOutputSchema;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description: TDescription;
  }) {
    this.type = options.type;
    this.schemaArgs = options.schemaArgs;
    this.schemaOutput = options.schemaOutput;
    this.resolveFunction = options.resolveFunction;
    this.middlewares = options.middlewares;
    this.transformations = options.transformations;
    this.description = options.description;
  }

  /**
   * @internal
   *
   * Gets the json schema of the route for the introspection query
   */
  getJsonSchema() {
    return createSchemaRoot({
      properties: {
        type: {
          type: 'string',
          enum: [this.type],
        },
        nodeType: {
          type: 'string',
          enum: [this.nodeType],
        },
        schemaArgs:
          this.schemaArgs === undefined
            ? undefined
            : Type.Strict(this.schemaArgs),
        schemaOutput: Type.Strict(this.schemaOutput),
      },
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
  }): Promise<AnyRawMiddlewareReponse> {
    const response = await Middleware.recursiveCall({
      ctx,
      meta,
      index: 0,
      middlewares: [
        ...this.middlewares,
        new Middleware({
          schemaArgs: this.schemaArgs,
          transformations: this.transformations,
          middlewareFunction: async ({
            ctx: finalContext,
            input,
            meta: finalMeta,
          }) => {
            const resolverResult = await this.resolveFunction({
              input,
              ctx: finalContext,
              meta: finalMeta,
            });

            const parseResult = safeParseArgs({
              schema: this.schemaOutput,
              value: resolverResult,
            });

            if (!parseResult.ok)
              throw new HTTPError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Output validation error',
                info: parseResult.errors,
              });

            return MiddlewareResponse.createRawSuccessResponse({
              data: parseResult.data,
              ctx: finalContext,
            });
          },
        }),
      ],
    });

    return response;
  }
}

export type AnyRoute = Route<
  ResolverType,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
