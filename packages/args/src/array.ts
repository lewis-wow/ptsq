import { z } from 'zod';
import { AnySchema, JSONSchema } from './main';

/**
 * ARRAY<T>
 */
export type ArrayJSONSchema = {
  type: 'array';
  items?: JSONSchema;
};

export type ArraySchema<T extends AnySchema> = z.ZodArray<T> & {
  getJSONSchema: () => ArrayJSONSchema;
};

export const arrayArg = <T extends AnySchema>(
  schema: T,
  params?: z.RawCreateParams,
): ArraySchema<T> => {
  const zodSchema = z.array(schema, params) as ArraySchema<T>;

  zodSchema.getJSONSchema = () => ({
    type: 'array',
    items: zodSchema._def.type.getJSONSchema(),
  });

  return zodSchema;
};
