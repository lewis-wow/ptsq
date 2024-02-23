import {
  type StaticDecode,
  type StaticEncode,
  type TSchema,
} from '@sinclair/typebox';
import { type ValueError } from '@sinclair/typebox/value';
import type { Compiler } from './compiler';

/**
 * @internal
 */
export type SchemaParserErrorPayload = {
  ok: false;
  errors: ValueError[];
};

/**
 * @internal
 */
export type SchemaParserDecodePayload<T extends TSchema> =
  | {
      ok: true;
      data: StaticDecode<T>;
    }
  | SchemaParserErrorPayload;

/**
 * @internal
 */
export type SchemaParserEncodePayload<T extends TSchema> =
  | {
      ok: true;
      data: StaticEncode<T>;
    }
  | SchemaParserErrorPayload;

/**
 * @internal
 *
 * Parses the input and output
 * Automatically encode/decode the values
 */
export class Parser<TValidationSchema extends TSchema> {
  _def: {
    schema: TValidationSchema;
    compiler: Compiler;
  };

  constructor(compilerOptions: {
    compiler: Compiler;
    schema: TValidationSchema;
  }) {
    this._def = compilerOptions;
  }

  encode(value: unknown): SchemaParserEncodePayload<TValidationSchema> {
    const compiledSchema = this._def.compiler.compile(this._def.schema);

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
  }

  decode(value: unknown): SchemaParserDecodePayload<TValidationSchema> {
    const compiledSchema = this._def.compiler.compile(this._def.schema);

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
  }

  parse<TMode extends 'encode' | 'decode'>(parseOptions: {
    value: unknown;
    mode: TMode;
  }): TMode extends 'encode'
    ? SchemaParserEncodePayload<TValidationSchema>
    : SchemaParserDecodePayload<TValidationSchema> {
    if (parseOptions.mode === 'encode') return this.encode(parseOptions.value);
    return this.decode(parseOptions.value);
  }
}
