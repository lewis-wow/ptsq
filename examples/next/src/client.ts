import { createProxyClient } from '@ptsq/client';
import { BaseRouter } from './server/routes/root';

export const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:3000/api/ptsq',
});
