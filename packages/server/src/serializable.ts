import { z } from 'zod';

export type Serializable = string | number | null | boolean | Serializable[] | { [key: string]: Serializable }; // eslint-disable-line @typescript-eslint/no-invalid-void-type

export const serializableZodSchema: z.Schema<Serializable> = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.boolean(),
  z.lazy(() => serializableZodSchema.array()),
  z.lazy(() => z.record(z.string(), serializableZodSchema)),
]);

export type SerializableInputZodSchema = z.Schema<any, z.ZodTypeDef, Serializable>;

export type SerializableOutputZodSchema = z.Schema<Serializable, z.ZodTypeDef, any>;
