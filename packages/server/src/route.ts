import type { ResolverType } from './types';
import type { ResolveFunction, ResolverArgs, ResolverRequest, ResolverResponse, ResolverOutput } from './resolver';
import { createSchemaRoot } from './createSchemaRoot';
import type { Context } from './context';
import { Middleware } from './middleware';
import { HTTPError } from './httpError';
import { zodSchemaToJsonSchema } from './zodSchemaToJsonSchema';
import { z } from 'zod';

export class Route<
  TType extends ResolverType = ResolverType,
  TArgs extends ResolverArgs = ResolverArgs,
  TResolverOutput extends ResolverOutput = ResolverOutput,
  TResolveFunction extends ResolveFunction<any, any> = ResolveFunction<any, any>,
> {
  type: TType;
  args: TArgs;
  output: TResolverOutput;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: Middleware<ResolverArgs, any>[];

  constructor(options: {
    type: TType;
    args: TArgs;
    output: TResolverOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware<ResolverArgs, any>[];
  }) {
    this.type = options.type;
    this.args = options.args;
    this.output = options.output;
    this.resolveFunction = options.resolveFunction;
    this.middlewares = options.middlewares;
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
        args: zodSchemaToJsonSchema(z.object(this.args)),
        output: zodSchemaToJsonSchema(this.output),
      },
    });
  }

  async call({ ctx, meta }: { ctx: Context; meta: ResolverRequest }): Promise<ResolverResponse<Context>> {
    const response = await Middleware.recursiveCall({
      ctx,
      meta,
      index: 0,
      middlewares: [
        ...this.middlewares,
        new Middleware<ResolverArgs>({
          args: this.args,
          middlewareCallback: async ({ ctx: finalContext, input, meta: finalMeta }) => {
            const resolverResult = await this.resolveFunction({
              input,
              ctx: finalContext,
              meta: finalMeta,
            });

            const parsedOutput = this.output.safeParse(resolverResult);

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
