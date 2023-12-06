import { zodToJsonSchema } from '@ptsq/zod-parser';
import { z } from 'zod';
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
import type { AnySerialization } from './serializable';
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
  TSchemaArgs extends ResolverSchemaArgs | undefined,
  TSchemaOutput extends ResolverSchemaOutput,
  TSerializations extends readonly AnySerialization[],
  TResolveFunction extends AnyResolveFunction,
> {
  type: TType;
  schemaArgs: TSchemaArgs;
  schemaOutput: TSchemaOutput;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: AnyMiddleware[];
  transformations: AnyTransformation[];
  serializations: TSerializations;

  constructor(options: {
    type: TType;
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    serializations: TSerializations;
  }) {
    this.type = options.type;
    this.schemaArgs = options.schemaArgs;
    this.schemaOutput = options.schemaOutput;
    this.resolveFunction = options.resolveFunction;
    this.middlewares = options.middlewares;
    this.transformations = options.transformations;
    this.serializations = options.serializations;
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
        schemaArgs: zodToJsonSchema(this.schemaArgs ?? z.undefined()),
        schemaOutput: zodToJsonSchema(this.schemaOutput),
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

            const parsedOutput = this.schemaOutput.safeParse(resolverResult);

            if (!parsedOutput.success)
              throw new HTTPError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Output validation error',
                info: parsedOutput.error,
              });

            const serializedOutput = this.serializations.reduce(
              (acc, serialization) => serialization.applySerialization(acc),
              parsedOutput.data,
            );

            return MiddlewareResponse.createRawSuccessResponse({
              data: serializedOutput,
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
  ResolverSchemaArgs | undefined,
  ResolverSchemaOutput,
  readonly AnySerialization[],
  AnyResolveFunction
>;
