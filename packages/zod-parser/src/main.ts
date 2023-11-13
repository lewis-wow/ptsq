import { ZodSchema } from 'zod';
import { JsonSchema7Type, parseDef } from './parseDef';
import { getRefs } from './Refs';

const zodToJsonSchema = (schema: unknown): JsonSchema7Type => {
  if (!(schema instanceof ZodSchema)) return {};

  const refs = getRefs();

  return parseDef(schema._def, refs, false) ?? {};
};

export { zodToJsonSchema };
