import { createProxyClient } from '@ptsq/client';
import type { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.b.query({ name: 'John' });
