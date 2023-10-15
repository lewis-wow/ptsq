import { z } from 'zod';

export type SerializableElements =
  | string
  | number
  | null
  | boolean
  | SerializableElements[]
  | { [key: string]: SerializableElements };

export const serializableZodSchema: z.Schema<SerializableElements> = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.boolean(),
  z.lazy(() => serializableZodSchema.array()),
  z.lazy(() => z.record(z.string(), serializableZodSchema)),
]);

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Serializable = SerializableElements | void;

export type SerializableInputZodSchema = z.Schema<any, z.ZodTypeDef, Serializable>;

export type SerializableOutputZodSchema = z.Schema<Serializable, z.ZodTypeDef, any>;

export type SerializableZodSchema = z.Schema<Serializable, z.ZodTypeDef, any>;
