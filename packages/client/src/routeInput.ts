import type { SerializableZodSchema } from '@schema-rpc/server/src/serializable';
import type { z } from 'zod';

export type RouteInput<TInput> = TInput extends SerializableZodSchema ? z.infer<TInput> : TInput;
