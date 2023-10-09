import { z } from 'zod';

export const expressExpectedRequestBodySchema = z.object({
  route: z.string().refine((str) => {
    const segments = str.split('.');
    const hasRoute = segments.filter((segment) => segment.length);

    return segments.length > 0 && hasRoute.length === segments.length;
  }),
  input: z.any(),
});
