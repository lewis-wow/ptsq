import {
  TypeGuard,
  type StaticDecode,
  type StaticEncode,
  type TSchema,
} from '@sinclair/typebox';
import {
  TypeCompiler,
  type TypeCheck,
  type ValueError,
} from '@sinclair/typebox/compiler';

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

export class Compiler<TValidationSchema extends TSchema> {
  _def: {
    compilationId: string | number | symbol;
    schema?: TValidationSchema;
  };

  constructor(compilerOptions: {
    schema?: TValidationSchema;
    compilationId: string | number | symbol;
  }) {
    this._def = compilerOptions;
  }

  compile() {
    if (this._def.schema === undefined) return undefined;

    if (this._def.compilationId in Compiler.cache)
      return Compiler.cache[this._def.compilationId];

    const compiledSchema = TypeCompiler.Compile(this._def.schema);

    Compiler.cache[this._def.compilationId] = compiledSchema;

    return compiledSchema;
  }

  encode(value: unknown): SchemaParserEncodePayload<TValidationSchema> {
    const compiledSchema = this.compile();

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
    const compiledSchema = this.compile();

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

  static cache: Record<string | number | symbol, TypeCheck<TSchema>> = {};
}
