import { createReactClient } from '@ptsq/react-client';
import { BaseRouter } from './server/routers';

export const api = createReactClient<BaseRouter>({
  url: 'http://localhost:3000/api/ptsq',
});
