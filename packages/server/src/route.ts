import type { ResolverType } from './types';
import type { ResolveFunction, ResolverRequest } from './resolver';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import { createSchemaRoot } from './createSchemaRoot';
import type { Context } from './context';
import { Middleware } from './middleware';
import { HTTPError } from './httpError';
import { zodSchemaToJsonSchema } from './zodSchemaToJsonSchema';
import type { z } from 'zod';

export class Route<
  TType extends ResolverType = ResolverType,
  TInput extends SerializableInputZodSchema = SerializableInputZodSchema,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  TResolveFunction extends ResolveFunction<z.output<TInput>, z.input<TOutput>> = ResolveFunction<
    z.output<TInput>,
    z.input<TOutput>
  >,
> {
  type: TType;
  inputValidationSchema: TInput;
  outputValidationSchema: TOutput;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: Middleware<any, any>[];

  constructor(options: {
    type: TType;
    inputValidationSchema: TInput;
    outputValidationSchema: TOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware<any, any>[];
  }) {
    this.type = options.type;
    this.inputValidationSchema = options.inputValidationSchema;
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

  async call({ ctx, meta }: { ctx: Context; meta: ResolverRequest }): Promise<z.input<TOutput>> {
    const response = await Middleware.recursiveCall({
      ctx,
      meta,
      middlewares: [
        ...this.middlewares,
        new Middleware(async ({ ctx: finalContext, meta: finalMeta }) => {
          const parsedInput = this.inputValidationSchema.safeParse(finalMeta.input);

          if (!parsedInput.success)
            throw new HTTPError({ code: 'BAD_REQUEST', message: 'Input validation error', info: parsedInput.error });

          const resolverResult = await this.resolveFunction({
            input: parsedInput.data,
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
        }),
      ],
      index: 0,
    });

    return response;
  }
}
