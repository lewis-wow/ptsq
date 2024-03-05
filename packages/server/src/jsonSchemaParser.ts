import { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
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
    try {
      return {
        ok: true,
        data: Value.Encode(schema, value),
      };
    } catch (error) {
      return {
        ok: false,
        errors: [...Value.Errors(schema, value)],
      };
    }
  },
  decode: ({ value, schema }) => {
    try {
      return {
        ok: true,
        data: Value.Decode(schema, value),
      };
    } catch (error) {
      return {
        ok: false,
        errors: [...Value.Errors(schema, value)],
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
