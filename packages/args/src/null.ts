import { z } from 'zod';

export type NullJSONSchema = {
  type: 'null';
};

export type NullSchema = z.ZodNull & { getJSONSchema: () => NullJSONSchema };

export const nullArg = (...params: Parameters<typeof z.null>): NullSchema => {
  const zodSchema = z.null(...params) as NullSchema;

  zodSchema.getJSONSchema = () => ({
    type: 'null',
  });

  return zodSchema;
};
