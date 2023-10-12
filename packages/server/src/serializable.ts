import { z } from 'zod';

export type Serializable =
  | string
  | number
  | BigInt
  | Date
  | null
  | RegExp
  | URL
  | Error
  | undefined
  | boolean
  | Serializable[]
  | { [key: string | number | symbol]: Serializable }
  | Set<Serializable>
  | Map<Serializable, Serializable>;

export type SerializableZodSchema = z.Schema<Serializable>;
