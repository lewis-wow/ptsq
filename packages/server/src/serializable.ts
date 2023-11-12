import { z } from 'zod';

export type Serializable = {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  [key: string]: string | number | null | void | boolean | Serializable[] | { [key: string]: Serializable };
};

export const serializableZodSchema: z.Schema<Serializable> = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.null(),
    z.boolean(),
    z.lazy(() => serializableZodSchema.array()),
    z.lazy(() => z.record(z.string(), serializableZodSchema)),
  ])
);

export type SerializableInputZodSchema = z.Schema<any, z.ZodTypeDef, Serializable>;

export type SerializableOutputZodSchema = z.Schema<Serializable, z.ZodTypeDef, any>;
