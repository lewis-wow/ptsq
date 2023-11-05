import type { ResolverType } from './types';
import type { ResolveFunction, ResolverArgs, ResolverRequest, ResolverResponse } from './resolver';
import type { SerializableOutputZodSchema } from './serializable';
import { createSchemaRoot } from './createSchemaRoot';
import type { Context } from './context';
import { Middleware } from './middleware';
import { HTTPError } from './httpError';
import { zodSchemaToJsonSchema } from './zodSchemaToJsonSchema';
import { type ZodObject, z } from 'zod';

export class Route<
  TType extends ResolverType = ResolverType,
  TArgs extends ResolverArgs = ResolverArgs,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  TResolveFunction extends ResolveFunction<any, any> = ResolveFunction<any, any>,
> {
  type: TType;
  args: TArgs;
  outputValidationSchema: TOutput;
  inputValidationSchema: ZodObject<TArgs, 'strict'>;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: Middleware<any, any>[];

  constructor(options: {
    type: TType;
    args: TArgs;
    outputValidationSchema: TOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware<any, any>[];
  }) {
    this.type = options.type;
    this.args = options.args;
    this.inputValidationSchema = z.object(this.args).strict();
    this.outputValidationSchema = options.outputValidationSchema;
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
        inputValidationSchema: zodSchemaToJsonSchema(this.inputValidationSchema),
        outputValidationSchema: zodSchemaToJsonSchema(this.outputValidationSchema),
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
        new Middleware({
          argsValidationSchema: this.inputValidationSchema,
          middlewareCallback: async ({ ctx: finalContext, input, meta: finalMeta }) => {
            const resolverResult = await this.resolveFunction({
              input,
              ctx: finalContext,
              meta: finalMeta,
            });

            const parsedOutput = this.outputValidationSchema.safeParse(resolverResult);

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
