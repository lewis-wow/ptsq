import { ResolverType } from './types';
import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JsonSchema7Type } from 'zod-to-json-schema/src/parseDef';
import { ZodSchema } from 'zod';
import { createSchemaRoot } from './createSchemaRoot';

export class Route<
  TType extends ResolverType = ResolverType,
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema | unknown = unknown,
  TResolver extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> {
  type: TType;
  input?: TInput;
  output: TOutput;
  resolver: TResolver;
  nodeType: 'route' = 'route';
  transformer: TDataTransformer;

  constructor(options: {
    type: TType;
    input?: TInput;
    output: TOutput;
    resolver: TResolver;
    transformer: TDataTransformer;
  }) {
    this.type = options.type;
    this.input = options.input;
    this.output = options.output;
    this.resolver = options.resolver;
    this.transformer = options.transformer;
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
        input: this.input instanceof ZodSchema ? zodToJsonSchema(this.input) : undefined,
        output: this.output instanceof ZodSchema ? zodToJsonSchema(this.output) : {},
      },
    });
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
