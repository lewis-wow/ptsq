import { ZodArrayDef, ZodFirstPartyTypeKind } from 'zod';
import { JsonSchema7Type, parseDef } from '../parseDef';
import { Refs } from '../Refs';

export type JsonSchema7ArrayType = {
  type: 'array';
  items?: JsonSchema7Type;
};

export function parseArrayDef(def: ZodArrayDef, refs: Refs) {
  const res: JsonSchema7ArrayType = {
    type: 'array',
  };

  if (def.type?._def?.typeName !== ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, 'items'],
    });
  }

  return res;
}
