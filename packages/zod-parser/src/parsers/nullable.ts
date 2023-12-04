import { ZodNullableDef } from 'zod';
import { JsonSchema7Type, parseDef } from '../parseDef.js';
import { Refs } from '../Refs.js';
import { JsonSchema7NullType } from './null.js';
import { primitiveMappings } from './union.js';

export type JsonSchema7NullableType =
  | {
      anyOf: [JsonSchema7Type, JsonSchema7NullType];
    }
  | {
      type: [string, 'null'];
    };

export function parseNullableDef(
  def: ZodNullableDef,
  refs: Refs,
): JsonSchema7NullableType | undefined {
  if (
    ['ZodString', 'ZodNumber', 'ZodBigInt', 'ZodBoolean', 'ZodNull'].includes(
      def.innerType._def.typeName,
    ) &&
    (!def.innerType._def.checks || !def.innerType._def.checks.length)
  )
    return {
      type: [
        primitiveMappings[
          def.innerType._def.typeName as keyof typeof primitiveMappings
        ],
        'null',
      ],
    };

  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, 'anyOf', '0'],
  });

  return base && { anyOf: [base, { type: 'null' }] };
}
