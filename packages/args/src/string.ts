import { z } from 'zod';

export type StringJSONSchema = {
  type: 'string';
};

export type StringSchema = z.ZodString & {
  getJSONSchema: () => StringJSONSchema;
};

export const stringArg = (
  ...params: Parameters<typeof z.string>
): StringSchema => {
  const zodSchema = z.string(...params) as StringSchema;

  zodSchema.getJSONSchema = () => ({
    type: 'string',
  });

  return zodSchema;
};
