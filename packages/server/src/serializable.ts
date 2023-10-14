import type { z } from 'zod';

export type SerializableElements =
  | string
  | number
  | bigint
  | Date
  | null
  | RegExp
  | URL
  | Error
  | undefined
  | boolean
  | SerializableElements[]
  | { [key: string | number | symbol]: SerializableElements }
  | Set<SerializableElements>
  | Map<SerializableElements, SerializableElements>;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Serializable = SerializableElements | void;

export type SerializableZodSchema = z.Schema<Serializable>;
