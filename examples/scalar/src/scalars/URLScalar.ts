import { scalar } from '@ptsq/server';
import { z } from 'zod';

export const URLScalar = scalar({
  parse: {
    schema: z.instanceof(URL), // used to validate parsed value
    value: (arg) => new URL(arg),
  },
  serialize: {
    schema: z.string().url(), // used to validate requst and response
    value: (arg) => arg.toString(),
  },
  description: 'String format of url', // used to describe scalar input for schema
});
