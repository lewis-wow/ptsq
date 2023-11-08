import { ZodEffectsDef } from 'zod';
import { JsonSchema7Type, parseDef } from '../parseDef';
import { Refs } from '../Refs';

export function parseEffectsDef(_def: ZodEffectsDef, refs: Refs): JsonSchema7Type | undefined {
  return parseDef(_def.schema._def, refs);
}
