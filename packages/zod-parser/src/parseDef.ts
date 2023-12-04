import { ZodFirstPartyTypeKind, ZodTypeDef } from 'zod';
import { JsonSchema7ArrayType, parseArrayDef } from './parsers/array';
import { JsonSchema7BooleanType, parseBooleanDef } from './parsers/boolean';
import { parseEffectsDef } from './parsers/effects';
import { JsonSchema7EnumType, parseEnumDef } from './parsers/enum';
import {
  JsonSchema7AllOfType,
  parseIntersectionDef,
} from './parsers/intersection';
import { JsonSchema7LiteralType, parseLiteralDef } from './parsers/literal';
import {
  JsonSchema7NativeEnumType,
  parseNativeEnumDef,
} from './parsers/nativeEnum';
import { JsonSchema7NullType, parseNullDef } from './parsers/null';
import { JsonSchema7NullableType, parseNullableDef } from './parsers/nullable';
import { JsonSchema7NumberType, parseNumberDef } from './parsers/number';
import { JsonSchema7ObjectType, parseObjectDef } from './parsers/object';
import { JsonSchema7RecordType, parseRecordDef } from './parsers/record';
import { JsonSchema7StringType, parseStringDef } from './parsers/string';
import { JsonSchema7TupleType, parseTupleDef } from './parsers/tuple';
import {
  JsonSchema7UndefinedType,
  parseUndefinedDef,
} from './parsers/undefined';
import { JsonSchema7UnionType, parseUnionDef } from './parsers/union';
import { Refs, Seen } from './Refs';

type JsonSchema7RefType = { $ref: string };

export type JsonSchema7TypeUnion =
  | JsonSchema7StringType
  | JsonSchema7ArrayType
  | JsonSchema7NumberType
  | JsonSchema7BooleanType
  | JsonSchema7EnumType
  | JsonSchema7LiteralType
  | JsonSchema7NativeEnumType
  | JsonSchema7NullType
  | JsonSchema7NumberType
  | JsonSchema7ObjectType
  | JsonSchema7RecordType
  | JsonSchema7TupleType
  | JsonSchema7UnionType
  | JsonSchema7RefType
  | JsonSchema7AllOfType
  | JsonSchema7NullableType
  | JsonSchema7UndefinedType
  | Record<string, never>;

export type JsonSchema7Type = JsonSchema7TypeUnion & {
  description?: string;
};

export function parseDef(
  def: ZodTypeDef,
  refs: Refs,
  forceResolution = false, // Forces a new schema to be instantiated even though its def has been seen. Used for improving refs in definitions. See https://github.com/StefanTerdell/zod-to-json-schema/pull/61.
): JsonSchema7Type | undefined {
  const seenItem = refs.seen.get(def);

  if (seenItem && !forceResolution) return { $ref: get$ref(seenItem) };

  const newItem: Seen = { def, path: refs.currentPath, jsonSchema: undefined };

  refs.seen.set(def, newItem);

  const jsonSchema = parser[(def as any).typeName as ZodFirstPartyTypeKind]?.(
    def,
    refs,
  );

  jsonSchema && def.description && (jsonSchema.description = def.description);

  newItem.jsonSchema = jsonSchema;

  return jsonSchema;
}

const get$ref = (item: Seen) =>
  item.path.length === 0
    ? ''
    : item.path.length === 1
    ? `${item.path[0]}/`
    : item.path.join('/');

const parser: Partial<
  Record<
    ZodFirstPartyTypeKind,
    (def: any, refs: Refs) => JsonSchema7Type | undefined
  >
> = {
  [ZodFirstPartyTypeKind.ZodString]: parseStringDef,
  [ZodFirstPartyTypeKind.ZodNumber]: parseNumberDef,
  [ZodFirstPartyTypeKind.ZodObject]: parseObjectDef,
  [ZodFirstPartyTypeKind.ZodBoolean]: parseBooleanDef,
  [ZodFirstPartyTypeKind.ZodNull]: parseNullDef,
  [ZodFirstPartyTypeKind.ZodArray]: parseArrayDef,
  [ZodFirstPartyTypeKind.ZodUnion]: parseUnionDef,
  [ZodFirstPartyTypeKind.ZodDiscriminatedUnion]: parseUnionDef,
  [ZodFirstPartyTypeKind.ZodIntersection]: parseIntersectionDef,
  [ZodFirstPartyTypeKind.ZodTuple]: parseTupleDef,
  [ZodFirstPartyTypeKind.ZodRecord]: parseRecordDef,
  [ZodFirstPartyTypeKind.ZodLiteral]: parseLiteralDef,
  [ZodFirstPartyTypeKind.ZodEnum]: parseEnumDef,
  [ZodFirstPartyTypeKind.ZodNativeEnum]: parseNativeEnumDef,
  [ZodFirstPartyTypeKind.ZodLazy]: (def: any, refs: Refs) =>
    parseDef(def.getter()._def, refs),
  [ZodFirstPartyTypeKind.ZodEffects]: parseEffectsDef,
  [ZodFirstPartyTypeKind.ZodNullable]: (def: any, refs: Refs) =>
    parseNullableDef(def, refs),
  [ZodFirstPartyTypeKind.ZodUndefined]: parseUndefinedDef,
};
