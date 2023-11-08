import { ZodPipelineDef } from 'zod';
import { JsonSchema7Type, parseDef } from '../parseDef';
import { Refs } from '../Refs';
import { JsonSchema7AllOfType } from './intersection';

export const parsePipelineDef = (
  def: ZodPipelineDef<any, any>,
  refs: Refs
): JsonSchema7AllOfType | JsonSchema7Type | undefined => {
  return parseDef(def.in._def, refs);
};
