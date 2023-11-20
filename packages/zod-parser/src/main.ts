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

  return parseDef(schema._def, refs, false) ?? {};
};

export { zodToJsonSchema };
