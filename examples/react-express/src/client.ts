import { createReactClient } from '@ptsq/react-client';
import type { BaseRouter } from './server/main';

export const client = createReactClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});
