import { ZodSchema } from 'zod';
import { JsonSchema7Type, parseDef } from './parseDef';
import { getRefs } from './Refs';

/**
 * @internal
 *
 * Creates a json schema from a Zod schema
 */
const zodToJsonSchema = (schema: ZodSchema<any>): JsonSchema7Type => {
  const refs = getRefs();

  const main =
    parseDef(
      schema._def, refs
      false,
    );

  const combined = definitions
    ? {
        ...main,
        [refs.definitionPath]: definitions,
      }
    : main;

  return parseDef(schema._def, refs, false) ?? {};
};

export { zodToJsonSchema };
