import type { ResolverType } from './types';
import type { ResolveFunction } from './resolver';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import { createSchemaRoot } from './createSchemaRoot';
import type { Context } from './context';
import type { Middleware } from './middleware';
import { HTTPError } from './httpError';
import { zodSchemaToJsonSchema } from './zodSchemaToJsonSchema';
import type { z } from 'zod';
import type { AuthorizeFunction } from './authorize';

export class Route<
  TType extends ResolverType = ResolverType,
  TInput extends SerializableInputZodSchema = SerializableInputZodSchema,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  TResolveFunction extends ResolveFunction<z.output<TInput>, z.input<TOutput>> = ResolveFunction<
    z.output<TInput>,
    z.input<TOutput>
  >,
  TAuthorizeFunction extends AuthorizeFunction<z.output<TInput>> = AuthorizeFunction<z.output<TInput>>,
> {
  type: TType;
  inputValidationSchema: TInput;
  outputValidationSchema: TOutput;
  authorizeFunction?: TAuthorizeFunction;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route' as const;
  middlewares: Middleware[];

  constructor(options: {
    type: TType;
    inputValidationSchema: TInput;
    outputValidationSchema: TOutput;
    authorizeFunction?: TAuthorizeFunction;
    resolveFunction: TResolveFunction;
    middlewares: Middleware[];
  }) {
    this.type = options.type;
    this.inputValidationSchema = options.inputValidationSchema;
    this.outputValidationSchema = options.outputValidationSchema;
    this.authorizeFunction = options.authorizeFunction;
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
