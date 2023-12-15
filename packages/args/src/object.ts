import { z } from 'zod';
import { AnySchema, JSONSchema } from './main';

/**
 * OBJECT<T>
 */
export type ObjectJSONSchema = {
  type: 'object';
  properties: Record<string, JSONSchema>;
  additionalProperties: boolean | JSONSchema;
  required?: string[];
};

export type RawShape = {
  [k: string]: AnySchema;
};

export type ObjectSchema<T extends RawShape> = z.ZodObject<T> & {
  getJSONSchema: () => ObjectJSONSchema;
};

export const objectArg = <T extends RawShape>(
  schema: T,
  params?: z.RawCreateParams,
): ObjectSchema<T> => {
  const zodSchema = z.object(schema, params) as ObjectSchema<T>;

  const shape = zodSchema._def.shape();

  zodSchema.getJSONSchema = () => ({
    type: 'object',
    properties: Object.keys(shape).reduce<Record<string, JSONSchema>>(
      (schema, key) => {
        const prop = shape[key];
        schema[key] = prop.getJSONSchema();
        return schema;
      },
      {},
    ),
    additionalProperties: false,
  });

  return zodSchema;
};
