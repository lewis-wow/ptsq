import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    GITHUB_ID: z.string(),
    GITHUB_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_PTSQ_URL: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_PTSQ_URL: process.env.NEXT_PUBLIC_PTSQ_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
