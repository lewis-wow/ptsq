import { z } from 'zod';

export type NumberJSONSchema = {
  type: 'number';
};

export type NumberSchema = z.ZodNumber & {
  getJSONSchema: () => NumberJSONSchema;
};

export const numberArg = (
  ...params: Parameters<typeof z.number>
): NumberSchema => {
  const zodSchema = z.number(...params) as NumberSchema;

  zodSchema.getJSONSchema = () => ({
    type: 'number',
  });

  return zodSchema;
};
