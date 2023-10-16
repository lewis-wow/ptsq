import { z } from 'zod';
import { serializableZodSchema } from './serializable';

/**
 * validation schema for validating POST request body in format that routers work
 */
export const requestBodySchema = z
  .object({
    route: z
      .string()
      .regex(/^[a-zA-Z]+(\.?[a-zA-Z]+)*$/)
      .refine((str) => {
        const segments = str.split('.');
        const hasRoute = segments.filter((segment) => segment.length);

        return segments.length > 0 && hasRoute.length === segments.length;
      }),
    input: serializableZodSchema.optional(),
  })
  .strict();
