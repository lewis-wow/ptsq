import { zodToJsonSchema } from '@ptsq/zod-parser';
import type { z } from 'zod';
import type { Context } from './context';
import { createSchemaRoot } from './createSchemaRoot';
import { HTTPError } from './httpError';
import { Middleware } from './middleware';
import type { AnyMiddleware } from './middleware';
import type {
  ResolveFunction,
  ResolverArgs,
  ResolverOutput,
  ResolverRequest,
  ResolverResponse,
} from './resolver';
import type { ArgsTransformationFunction } from './transformation';
import type { ResolverType } from './types';

/**
 * @internal
 *
 * Creates callable route.
 */
export class Route<
  TType extends ResolverType = ResolverType,
  TSchemaArgs extends ResolverArgs | z.ZodVoid = ResolverArgs | z.ZodVoid,
  TSchemaOutput extends ResolverOutput = ResolverOutput,
  TResolveFunction extends ResolveFunction<any, any> = ResolveFunction<
    any,
    any
  >,
> {
  type: TType;
  schemaArgs: TSchemaArgs;
  schemaOutput: TSchemaOutput;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: AnyMiddleware[];
  transformations: ArgsTransformationFunction<any, any, any>[];

  constructor(options: {
    type: TType;
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: ArgsTransformationFunction<any, any, any>[];
  }) {
    this.type = options.type;
    this.schemaArgs = options.schemaArgs;
    this.schemaOutput = options.schemaOutput;
    this.resolveFunction = options.resolveFunction;
    this.middlewares = options.middlewares;
    this.transformations = options.transformations;
  }

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
        args: zodToJsonSchema(this.schemaArgs),
        output: zodToJsonSchema(this.schemaOutput),
      },
    });
  }

  async call({
    ctx,
    meta,
  }: {
    ctx: Context;
    meta: ResolverRequest;
  }): Promise<ResolverResponse<Context>> {
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

            return {
              ok: true,
              data: parsedOutput.data,
              ctx: finalContext,
            };
          },
        }),
      ],
    });

    return response;
  }
}
