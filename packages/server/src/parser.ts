import {
  TypeGuard,
  type StaticDecode,
  type StaticEncode,
  type TSchema,
} from '@sinclair/typebox';
import { type ValueError } from '@sinclair/typebox/value';
import type { Compiler } from './compiler';

export type SchemaParserErrorPayload = {
  ok: false;
  errors: ValueError[];
};

export type SchemaParserDecodePayload<T extends TSchema> =
  | {
      ok: true;
      data: StaticDecode<T>;
    }
  | SchemaParserErrorPayload;

export type SchemaParserEncodePayload<T extends TSchema> =
  | {
      ok: true;
      data: StaticEncode<T>;
    }
  | SchemaParserErrorPayload;

export class Parser<TValidationSchema extends TSchema> {
  _def: {
    schema?: TValidationSchema;
    compiler: Compiler;
  };

  constructor(compilerOptions: {
    compiler: Compiler;
    schema?: TValidationSchema;
  }) {
    this._def = compilerOptions;
  }

  encode(value: unknown): SchemaParserEncodePayload<TValidationSchema> {
    const compiledSchema = this._def.compiler.get(this._def.schema);

    if (compiledSchema === undefined)
      return {
        ok: true,
        data: value,
      };

    if (!TypeGuard.TTransform(this._def.schema)) {
      if (compiledSchema.Check(value))
        return {
          ok: true,
          data: value,
        };

      return {
        ok: false,
        errors: [...compiledSchema.Errors(value)],
      };
    }

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
    const compiledSchema = this._def.compiler.get(this._def.schema);

    if (compiledSchema === undefined)
      return {
        ok: true,
        data: value,
      };

    if (!TypeGuard.TTransform(this._def.schema)) {
      if (compiledSchema.Check(value))
        return {
          ok: true,
          data: value,
        };

      return {
        ok: false,
        errors: [...compiledSchema.Errors(value)],
      };
    }

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
