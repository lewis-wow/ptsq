import { createSvelteClient } from '@ptsq/svelte-client';
import type { BaseRouter } from '../routes/api/ptsq/baseRouter';

export const client = createSvelteClient<BaseRouter>({
  url: 'http://localhost:5173/api/ptsq',
});