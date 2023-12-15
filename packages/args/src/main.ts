import { ArrayJSONSchema, ArraySchema } from './array';
import { NullJSONSchema, NullSchema } from './null';
import { NumberJSONSchema, NumberSchema } from './number';
import { ObjectJSONSchema, ObjectSchema } from './object';
import { StringJSONSchema, StringSchema } from './string';

export type JSONSchema =
  | StringJSONSchema
  | NumberJSONSchema
  | NullJSONSchema
  | ArrayJSONSchema
  | ObjectJSONSchema;

export type AnySchema =
  | StringSchema
  | NumberSchema
  | NullSchema
  | ArraySchema<any>
  | ObjectSchema<any>;
