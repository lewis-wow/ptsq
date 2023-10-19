import type { ResolverType } from './types';
import type { ResolveFunction } from './resolver';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { JsonSchema7Type } from 'zod-to-json-schema/src/parseDef';
import { createSchemaRoot } from './createSchemaRoot';
import type { Context } from './context';
import type { Middleware } from './middleware';
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
  middlewares: Middleware[];

  constructor(options: {
    type: TType;
    inputValidationSchema: TInput;
    outputValidationSchema: TOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware[];
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

  async call({ input, ctx }: { input: z.output<TInput>; ctx: Context }): Promise<z.input<TOutput>> {
    const finalCtx = await this.middlewares.reduce(
      async (contextAcc, middleware) => await middleware.call({ ctx: await contextAcc }),
      Promise.resolve(ctx)
    );

    const parsedInput = this.inputValidationSchema.safeParse(input);

    if (!parsedInput.success)
      throw new HTTPError({ code: 'BAD_REQUEST', message: 'Input validation error', info: parsedInput.error });

    const resolverResult = this.resolveFunction({ input: parsedInput.data, ctx: finalCtx });

    const parsedOutput = this.outputValidationSchema.safeParse(resolverResult);

    if (!parsedOutput.success)
      throw new HTTPError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Output validation error',
        info: parsedOutput.error,
      });

    return parsedOutput.data;
  }
}

export type RouteSchema = {
  type: ResolverType;
  input: {
    definitions?: Record<string, JsonSchema7Type>;
    $schema?: string;
  } | null;
  output: {
    definitions?: Record<string, JsonSchema7Type>;
    $schema?: string;
  } | null;
  nodeType: 'route';
};
