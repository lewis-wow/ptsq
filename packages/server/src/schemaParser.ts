import {
  TypeGuard,
  type Static,
  type StaticDecode,
  type StaticEncode,
  type TSchema,
} from '@sinclair/typebox';
import { Value, type ValueError } from '@sinclair/typebox/value';

export type SchemaParserErrorPayload = {
  ok: false;
  errors: ValueError[];
};

export type SchemaParserPayload<T extends TSchema> =
  | {
      ok: true;
      data: Static<T>;
    }
  | SchemaParserErrorPayload;

export type SchemaParserInputPayload<T extends TSchema> =
  | {
      ok: true;
      data: StaticDecode<T>;
    }
  | SchemaParserErrorPayload;

export type SchemaParserOutputPayload<T extends TSchema> =
  | {
      ok: true;
      data: StaticEncode<T>;
    }
  | SchemaParserErrorPayload;

export const SchemaParser = {
  safeParseInput: <T extends TSchema>(parseOptions: {
    schema?: T;
    value: unknown;
  }): SchemaParserInputPayload<T> =>
    SchemaParser.safeParse({
      ...parseOptions,
      mode: 'input',
    }),
  safeParseOutput: <T extends TSchema>(parseOptions: {
    schema?: T;
    value: unknown;
  }): SchemaParserOutputPayload<T> =>
    SchemaParser.safeParse({
      ...parseOptions,
      mode: 'output',
    }),
  createSafeParseError: <T extends TSchema>(parseOptions: {
    schema: T;
    value: unknown;
  }): SchemaParserErrorPayload => {
    const errorResult = [
      ...Value.Errors(parseOptions.schema, parseOptions.value),
    ];

    return {
      ok: false,
      errors: errorResult,
    };
  },
  safeParse: <T extends TSchema, TMode extends 'input' | 'output'>({
    schema,
    value,
    mode,
  }: {
    schema?: T;
    value: unknown;
    mode?: TMode;
  }): SchemaParserPayload<T> => {
    if (schema === undefined)
      return {
        ok: true,
        data: value,
      };

    if (mode === undefined || !TypeGuard.TTransform(schema)) {
      if (Value.Check(schema, value))
        return {
          ok: true,
          data: value,
        };

      return SchemaParser.createSafeParseError({ schema, value });
    }

    try {
      const result =
        mode === 'input'
          ? Value.Decode(schema, value)
          : Value.Encode(schema, value);

      return {
        ok: true,
        data: result,
      };
    } catch (error) {
      return SchemaParser.createSafeParseError({ schema, value });
    }
  },
};
