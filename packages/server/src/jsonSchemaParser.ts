import { TSchema } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { MaybePromise } from './types';

export type JsonSchemaParser = {
  encode: (options: {
    value: unknown;
    schema: TSchema;
  }) => MaybePromise<JsonSchemaParserPayload>;
  decode: (options: {
    value: unknown;
    schema: TSchema;
  }) => MaybePromise<JsonSchemaParserPayload>;
};

export const defaultJsonSchemaParser: JsonSchemaParser = {
  encode: ({ value, schema }) => {
    const compiledSchema = TypeCompiler.Compile(schema);

    try {
      return {
        ok: true,
        data: compiledSchema.Encode(value),
      };
    } catch (error) {
      return {
        ok: false,
        errors: [...compiledSchema.Errors(value)],
      };
    }
  },
  decode: ({ value, schema }) => {
    const compiledSchema = TypeCompiler.Compile(schema);

    try {
      return {
        ok: true,
        data: compiledSchema.Decode(value),
      };
    } catch (error) {
      return {
        ok: false,
        errors: [...compiledSchema.Errors(value)],
      };
    }
  },
};

export type JsonSchemaParserSuccess = {
  ok: true;
  data: unknown;
};

export type JsonSchemaParserError = {
  ok: false;
  errors: unknown[];
};

export type JsonSchemaParserPayload =
  | JsonSchemaParserSuccess
  | JsonSchemaParserError;
