import { JsonSchemaParser, TSchema } from '@ptsq/server';
import { TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler';

export type CreateCachedJsonSchemaParserPayload = {
  parser: JsonSchemaParser;
  cache: Map<TSchema, TypeCheck<TSchema>>;
  hits: number;
};

export const createCachedJsonSchemaParser = (
  cache = new Map<TSchema, TypeCheck<TSchema>>(),
): CreateCachedJsonSchemaParserPayload => ({
  cache,
  get hits() {
    return cache.size;
  },
  parser: {
    encode: ({ value, schema }) => {
      let compiledSchema = cache.get(schema);

      if (!compiledSchema) {
        compiledSchema = TypeCompiler.Compile(schema);
        cache.set(schema, compiledSchema);
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
    },
    decode: ({ value, schema }) => {
      let compiledSchema = cache.get(schema);

      if (!compiledSchema) {
        compiledSchema = TypeCompiler.Compile(schema);
        cache.set(schema, compiledSchema);
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
    },
  },
});
