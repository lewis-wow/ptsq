import { type z, ZodVoid, ZodUndefined } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const zodSchemaToJsonSchema = (zodSchema?: z.Schema) => {
  if (zodSchema === undefined || zodSchema instanceof ZodUndefined || zodSchema instanceof ZodVoid) return undefined;

  return zodToJsonSchema(zodSchema);
};
