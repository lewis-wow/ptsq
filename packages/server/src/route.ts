import { Value } from '@sinclair/typebox/value';
import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import {
  Middleware,
  MiddlewareResponse,
  type MiddlewareMeta,
} from './middleware';
import type { AnyMiddleware, AnyRawMiddlewareReponse } from './middleware';
import type {
  AnyResolveFunction,
  ResolverSchemaArgs,
  ResolverSchemaOutput,
} from './resolver';
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
  TSchemaArgs extends ResolverSchemaArgs,
  TSchemaOutput extends ResolverSchemaOutput,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> {
  type: TType;
  schemaArgs: TSchemaArgs;
  schemaOutput: TSchemaOutput;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: AnyMiddleware[];
  transformations: AnyTransformation[];
  description: TDescription;

  constructor(options: {
    type: TType;
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
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
  getJsonSchema(title: string) {
    return createSchemaRoot({
      title: `${title} route`,
      properties: {
        type: {
          type: 'string',
          enum: [this.type],
        },
        nodeType: {
          type: 'string',
          enum: [this.nodeType],
        },
        schemaArgs: this.schemaArgs,
        schemaOutput: this.schemaOutput,
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

            const parsedOutputErrors = [
              ...Value.Errors(this.schemaOutput, resolverResult),
            ];

            if (parsedOutputErrors.length)
              throw new HTTPError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Output validation error',
                info: parsedOutputErrors,
              });

            return MiddlewareResponse.createRawSuccessResponse({
              data: resolverResult,
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
  ResolverSchemaArgs,
  ResolverSchemaOutput,
  AnyResolveFunction,
  string | undefined
>;
