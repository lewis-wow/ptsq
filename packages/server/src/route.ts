import { ResolverType } from './types';
import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JsonSchema7Type } from 'zod-to-json-schema/src/parseDef';
import { ZodSchema } from 'zod';
import { createSchemaRoot } from './createSchemaRoot';
import { Context } from './context';
import { Middleware } from './middleware';
import { HTTPError } from './httpError';

export class Route<
  TType extends ResolverType = ResolverType,
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema = SerializableZodSchema,
  TResolveFunction extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> {
  type: TType;
  inputValidationSchema?: TInput;
  outputValidationSchema: TOutput;
  resolveFunction: TResolveFunction;
  nodeType: 'route' = 'route';
  transformer: TDataTransformer;
  middlewares: Middleware[];

  constructor(options: {
    type: TType;
    inputValidationSchema?: TInput;
    outputValidationSchema: TOutput;
    resolveFunction: TResolveFunction;
    transformer: TDataTransformer;
    middlewares: Middleware[];
  }) {
    this.type = options.type;
    this.inputValidationSchema = options.inputValidationSchema;
    this.outputValidationSchema = options.outputValidationSchema;
    this.resolveFunction = options.resolveFunction;
    this.transformer = options.transformer;
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
        input:
          this.inputValidationSchema instanceof ZodSchema ? zodToJsonSchema(this.inputValidationSchema) : undefined,
        output: zodToJsonSchema(this.outputValidationSchema),
      },
    });
  }

  call({ input, ctx }: { input: any; ctx: Context }) {
    let finalCtx = ctx;
    for (const middleware of this.middlewares) {
      finalCtx = middleware.call(ctx);
    }

    //@ts-ignore
    console.log(this.inputValidationSchema?._def.typeName);

    if (!this.inputValidationSchema) return this.resolveFunction({ input, ctx: finalCtx });

    const parsedInput = this.inputValidationSchema.safeParse(input);

    //@ts-ignore
    console.log(parsedInput.error);

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

export type AnyRoute = Route;
